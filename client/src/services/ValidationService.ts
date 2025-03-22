/**
 * Service de Validation
 *
 * Ce service fournit des fonctions de validation pour les données d'opération.
 * Il centralise la logique de validation pour assurer la cohérence dans toute l'application.
 */
import type { OperationFormData } from "../types"

class ValidationService {
  /**
   * Valide le nom commercial d'une opération
   * @param name Nom commercial à valider
   * @returns Message d'erreur ou undefined si valide
   */
  static validateCommercialName(name: string): string | undefined {
    if (!name.trim()) {
      return "Le nom commercial est requis"
    }

    if (name.length > 24) {
      return "Le nom d'une opération ne doit pas dépasser 24 caractères"
    }

    return undefined
  }

  /**
   * Valide l'identifiant de la société
   * @param companyId Identifiant de la société à valider
   * @returns Message d'erreur ou undefined si valide
   */
  static validateCompanyId(companyId: string): string | undefined {
    if (!companyId.trim()) {
      return "L'identifiant de la société est requis"
    }

    return undefined
  }

  /**
   * Valide l'adresse d'une opération
   * @param address Adresse à valider
   * @returns Message d'erreur ou undefined si valide
   */
  static validateAddress(address: string): string | undefined {
    if (!address.trim()) {
      return "L'adresse est requise"
    }

    // Minimum length validation
    if (address.trim().length < 5) {
      return "L'adresse doit contenir au moins 5 caractères"
    }

    return undefined
  }

  /**
   * Valide la date de livraison d'une opération
   * @param deliveryDate Date de livraison à valider
   * @returns Message d'erreur ou undefined si valide
   */
  static validateDeliveryDate(deliveryDate: string): string | undefined {
    if (!deliveryDate) {
      return "La date de livraison est requise"
    }

    const date = new Date(deliveryDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Normaliser à minuit pour comparer uniquement les dates

    if (isNaN(date.getTime())) {
      return "Format de date invalide"
    }

    if (date < today) {
      return "La date de livraison doit être dans le futur"
    }

    return undefined
  }

  /**
   * Valide le nombre de lots disponibles
   * @param availableLots Nombre de lots à valider
   * @returns Message d'erreur ou undefined si valide
   */
  static validateAvailableLots(availableLots: number): string | undefined {
    if (availableLots === undefined || availableLots === null) {
      return "Le nombre de lots disponibles est requis"
    }

    if (availableLots <= 0) {
      return "Le nombre de lots disponibles doit être supérieur à 0"
    }

    if (!Number.isInteger(availableLots)) {
      return "Le nombre de lots doit être un nombre entier"
    }

    return undefined
  }

  /**
   * Vérifie si un nom commercial est unique dans la période de 10 ans
   * Cette fonction est une simulation côté client et devrait être utilisée
   * en complément de la validation côté serveur
   *
   * @param name Nom commercial à vérifier
   * @param deliveryDate Date de livraison de l'opération
   * @param existingOperations Liste des opérations existantes
   * @returns Message d'erreur ou undefined si valide
   */
  static validateNameUniqueness(
    name: string,
    deliveryDate: string,
    existingOperations: Array<{ commercialName: string; deliveryDate: string }>,
  ): string | undefined {
    if (!name.trim() || !deliveryDate) {
      return undefined // Autres validations géreront ces cas
    }

    const date = new Date(deliveryDate)
    if (isNaN(date.getTime())) {
      return undefined // La validation de date gérera ce cas
    }

    // Calculer la période de 10 ans avant et après
    const tenYearsInMs = 10 * 365 * 24 * 60 * 60 * 1000
    const minDate = new Date(date.getTime() - tenYearsInMs)
    const maxDate = new Date(date.getTime() + tenYearsInMs)

    // Vérifier si le nom existe déjà dans la période
    const conflictingOperation = existingOperations.find((op) => {
      const opDate = new Date(op.deliveryDate)
      return op.commercialName.toLowerCase() === name.toLowerCase() && opDate >= minDate && opDate <= maxDate
    })

    if (conflictingOperation) {
      return "Une opération portant le même nom existe déjà dans la période de livraison spécifiée"
    }

    return undefined
  }

  /**
   * Valide l'ensemble des données d'une opération
   * @param data Données de l'opération à valider
   * @param existingOperations Liste des opérations existantes (optionnel)
   * @returns Objet contenant les erreurs de validation
   */
  static validateOperation(
    data: OperationFormData,
    existingOperations: Array<{ commercialName: string; deliveryDate: string }> = [],
  ): Record<string, string | undefined> {
    const errors: Record<string, string | undefined> = {
      commercialName: this.validateCommercialName(data.commercialName),
      companyId: this.validateCompanyId(data.companyId),
      address: this.validateAddress(data.address),
      deliveryDate: this.validateDeliveryDate(data.deliveryDate),
      availableLots: this.validateAvailableLots(data.availableLots),
    }

    // Add uniqueness validation if we have existing operations
    if (existingOperations.length > 0) {
      const uniquenessError = this.validateNameUniqueness(data.commercialName, data.deliveryDate, existingOperations)

      if (uniquenessError) {
        errors.commercialName = uniquenessError
      }
    }

    return errors
  }
}

export default ValidationService

