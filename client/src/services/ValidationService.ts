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
   * Vérifie si un nom commercial est unique dans la période de 10 ans
   * Cette fonction est une simulation côté client et elle est utilisée
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

