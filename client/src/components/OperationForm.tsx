/**
 * Composant de Formulaire d'Opération
 *
 * Fournit une interface de formulaire pour créer de nouvelles opérations.
 * Gère l'état du formulaire, la validation et la soumission à l'API.
 *
 * @component
 * @param {OperationFormProps} props - Props du composant, incluant le callback pour quand une opération est créée
 */
import React, { type FC, useState, useContext, type ChangeEvent, type FormEvent, useRef, useEffect } from "react"
import { ServiceContext } from "../context/ServiceContext"
import { useToast } from "./ToastContainer"
import type { OperationFormProps, OperationFormData } from "../types"
import type Error from "./Error"
import ValidationService from "../services/ValidationService"
import { useOperations } from "../hooks/useOperations"

interface FormErrors {
  commercialName?: string
  companyId?: string
  address?: string
  deliveryDate?: string
  availableLots?: string
  general?: string
}

const OperationForm: FC<OperationFormProps> = ({ onOperationCreated }) => {
  // Initialisation de l'état du formulaire
  const [formData, setFormData] = useState<OperationFormData>({
    commercialName: "",
    companyId: "",
    address: "",
    deliveryDate: "",
    availableLots: 0,
  })
  const [loading, setLoading] = useState<boolean>(false)
  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const { operationService } = useContext(ServiceContext)
  const { data: existingOperations } = useOperations()
  const { showToast } = useToast()

  // Référence pour le focus après soumission
  const commercialNameRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const [formSubmitted, setFormSubmitted] = useState<boolean>(false)
  const [announcementMessage, setAnnouncementMessage] = useState<string>("")


  useEffect(() => {
    if (announcementMessage) {
      const timer = setTimeout(() => {
        setAnnouncementMessage("")
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [announcementMessage])

  // Effet pour remettre le focus après soumission réussie
  useEffect(() => {
    if (formSubmitted) {
      commercialNameRef.current?.focus()
      setFormSubmitted(false)
    }
  }, [formSubmitted])

  /**
   * Valide les données du formulaire selon les règles métier
   * @returns {FormErrors} Object containing validation errors
   */
  const validateForm = (): FormErrors => {
    // Utiliser le service de validation pour valider toutes les données
    const validationErrors = ValidationService.validateOperation(
      formData,
      existingOperations.map((op) => ({
        commercialName: op.title,
        deliveryDate: op.date,
      })),
    )

    // Convertir en FormErrors
    const errors: FormErrors = {}
    Object.entries(validationErrors).forEach(([key, value]) => {
      if (value) {
        errors[key as keyof FormErrors] = value
      }
    })

    return errors
  }

  /**
   * Validates a single field
   * @param {string} field - The field name to validate
   * @returns {string|undefined} Error message or undefined if valid
   */
  const validateField = (field: string): string | undefined => {
    switch (field) {
      case "commercialName":
        return ValidationService.validateCommercialName(formData.commercialName)
      case "companyId":
        return ValidationService.validateCompanyId(formData.companyId)
      case "adress":
        return ValidationService.validateAddress(formData.address)
      case "deliveryDate":
        return ValidationService.validateCompanyId(formData.deliveryDate)
      case "availbaleLots":
        return ValidationService.validateAvailableLots(formData.availableLots)
      default:
        return undefined
    }
  }

  /**
   * Gère la soumission du formulaire, valide les entrées et appelle l'API
   * @param {FormEvent<HTMLFormElement>} e - Événement de soumission du formulaire
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const allTouched = Object.keys(formData).reduce(
      (acc, key) => {
        acc[key] = true
        return acc
      },
      {} as Record<string, boolean>,
    )
    setTouched(allTouched)

    const errors = validateForm()
    setFormErrors(errors)

    if (Object.keys(errors).length > 0) {
      setAnnouncementMessage("Le formulaire contient des erreurs. Veuillez les corriger avant de soumettre.")
      showToast("Le formulaire contient des erreurs. Veuillez les corriger avant de soumettre.", "error")

      const firstErrorField = Object.keys(errors)[0]
      const errorElement = document.getElementById(firstErrorField)
      errorElement?.focus()

      return
    }

    setLoading(true)
    setFormErrors({})

    try {
      const operationToCreate = {
        ...formData,
        reservedLots: 0,
      }

      const createdOperation = await operationService.createOperation(operationToCreate)
      onOperationCreated(createdOperation)

      setAnnouncementMessage(`Opération ${formData.commercialName} créée avec succès.`)
      showToast(`Opération ${formData.commercialName} créée avec succès.`, "success")

      // Réinitialiser le formulaire après une soumission réussie
      setFormData({
        commercialName: "",
        companyId: "",
        address: "",
        deliveryDate: "",
        availableLots: 0,
      })
      setTouched({})

      // Indiquer que le formulaire a été soumis avec succès pour remettre le focus
      setFormSubmitted(true)
    } catch (error) {
      console.error("Erreur lors de la création de l'opération:", error)

      // Handle specific error messages from the API
      const errorMessage = (error as Error).message

      // Determine if this is a field-specific error or a general error
      if (errorMessage.includes("société rattachée n'existe pas")) {
        setFormErrors({ companyId: "La société rattachée n'existe pas" })
      } else if (errorMessage.includes("même nom existe déjà")) {
        setFormErrors({ commercialName: "Une opération portant le même nom existe déjà" })
      } else if (errorMessage.includes("ne doit pas dépasser 24 caractères")) {
        setFormErrors({ commercialName: "Le nom d'une opération ne doit pas dépasser 24 caractères" })
      } else {
        showToast(`Erreur lors de la création de l'opération: ${errorMessage}`, "error")
      }

      setAnnouncementMessage(`Erreur lors de la création de l'opération: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Gère les changements d'entrée et met à jour l'état du formulaire
   * @param {ChangeEvent<HTMLInputElement | HTMLSelectElement>} e - Événement de changement d'entrée
   */
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target

    // Update form data
    setFormData({
      ...formData,
      [id]: id === "availableLots" ? Number.parseInt(value) || 0 : value,
    })

    // Mark field as touched
    setTouched({
      ...touched,
      [id]: true,
    })

    // Validate the field if it's been touched
    if (touched[id]) {
      const fieldError = validateField(id)
      setFormErrors((prev) => ({
        ...prev,
        [id]: fieldError,
      }))
    }
  }

  /**
   * Handle blur event to validate field when user leaves it
   * @param {React.FocusEvent<HTMLInputElement | HTMLSelectElement>} e - Blur event
   */
  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id } = e.target


    setTouched({
      ...touched,
      [id]: true,
    })

 
  
    const fieldError = validateField(id)
    setFormErrors((prev) => ({
      ...prev,
      [id]: fieldError,
    }))
  }

  // Helper function to determine if a field has an error
  const hasError = (field: string): boolean => {
    return touched[field] && !!formErrors[field as keyof FormErrors]
  }

  // Helper function to get field class based on validation state
  const getFieldClass = (field: string): string => {
    if (!touched[field]) return ""
    return hasError(field) ? "field-error" : "field-valid"
  }

  return (
    <>
      <div className="form-title">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 5v14"></path>
          <path d="M5 12h14"></path>
        </svg>
        <h3 id="form-heading">Créer une Nouvelle Opération</h3>
      </div>

      <div className="form-scroll-container">
        <form ref={formRef} onSubmit={handleSubmit} aria-labelledby="form-heading" noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="commercialName">
              Nom Commercial{" "}
              <span className="required-indicator" aria-hidden="true">
                *
              </span>
            </label>
            <div className="input-wrapper">
              <input
                ref={commercialNameRef}
                id="commercialName"
                type="text"
                placeholder="Entrez le nom commercial"
                value={formData.commercialName}
                onChange={handleChange}
                onBlur={handleBlur}
                //maxLength={24} ( if we want to not let the user type more than 24 characters )
                required
                aria-required="true"
                className={getFieldClass("commercialName")}
                aria-invalid={hasError("commercialName")}
                aria-describedby={`commercialName-hint ${hasError("commercialName") ? "commercialName-error" : ""}`}
              />
              {formData.commercialName && (
                <span className="character-count" aria-hidden="true">
                  {formData.commercialName.length}/24
                </span>
              )}
            </div>
            <span className="form-hint" id="commercialName-hint">
              Le nom officiel de l'opération (24 caractères max)
            </span>
            {hasError("commercialName") && (
              <span className="form-error" id="commercialName-error" role="alert">
                {formErrors.commercialName}
              </span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="companyId">
              Identifiant Société{" "}
              <span className="required-indicator" aria-hidden="true">
                *
              </span>
            </label>
            <input
              id="companyId"
              type="text"
              placeholder="Entrez l'identifiant de la société"
              value={formData.companyId}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              aria-required="true"
              className={getFieldClass("companyId")}
              aria-invalid={hasError("companyId")}
              aria-describedby={`companyId-hint ${hasError("companyId") ? "companyId-error" : ""}`}
            />
            <span className="form-hint" id="companyId-hint">
              L'identifiant de la société rattachée à l'opération
            </span>
            {hasError("companyId") && (
              <span className="form-error" id="companyId-error" role="alert">
                {formErrors.companyId}
              </span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="address">
              Adresse{" "}
              <span className="required-indicator" aria-hidden="true">
                *
              </span>
            </label>
            <input
              id="address"
              type="text"
              placeholder="Entrez l'adresse complète"
              value={formData.address}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              aria-required="true"
              className={getFieldClass("address")}
              aria-invalid={hasError("address")}
              aria-describedby={`address-hint ${hasError("address") ? "address-error" : ""}`}
            />
            <span className="form-hint" id="address-hint">
              Emplacement de l'opération
            </span>
            {hasError("address") && (
              <span className="form-error" id="address-error" role="alert">
                {formErrors.address}
              </span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="deliveryDate">
              Date de Livraison{" "}
              <span className="required-indicator" aria-hidden="true">
                *
              </span>
            </label>
            <input
              id="deliveryDate"
              type="date"
              value={formData.deliveryDate}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              aria-required="true"
              className={getFieldClass("deliveryDate")}
              aria-invalid={hasError("deliveryDate")}
              aria-describedby={`deliveryDate-hint ${hasError("deliveryDate") ? "deliveryDate-error" : ""}`}
              //min={new Date().toISOString().split("T")[0]} // if we want to make past dates not clickable
            />
            <span className="form-hint" id="deliveryDate-hint">
              Date prévue de livraison
            </span>
            {hasError("deliveryDate") && (
              <span className="form-error" id="deliveryDate-error" role="alert">
                {formErrors.deliveryDate}
              </span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="availableLots">
              Lots Disponibles{" "}
              <span className="required-indicator" aria-hidden="true">
                *
              </span>
            </label>
            <input
              id="availableLots"
              type="number"
              placeholder="Entrez le nombre de lots"
              value={formData.availableLots || ""}
              onChange={handleChange}
              onBlur={handleBlur}
              min="1"
              step="1"
              required
              aria-required="true"
              className={getFieldClass("availableLots")}
              aria-invalid={hasError("availableLots")}
              aria-describedby={`availableLots-hint ${hasError("availableLots") ? "availableLots-error" : ""}`}
            />
            <span className="form-hint" id="availableLots-hint">
              Nombre total de lots disponibles 
            </span>
            {hasError("availableLots") && (
              <span className="form-error" id="availableLots-error" role="alert">
                {formErrors.availableLots}
              </span>
            )}
          </div>

          <div className="form-actions">
            <button type="submit" disabled={loading} aria-busy={loading} className={loading ? "loading-button" : ""}>
              {loading ? (
                <>
                  <span className="spinner-small" aria-hidden="true"></span>
                  <span>Création en cours...</span>
                </>
              ) : (
                "Créer l'Opération"
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}

export default OperationForm

