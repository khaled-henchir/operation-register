/**
 * Service d'Opération
 *
 * Classe de service pour gérer les opérations API liées aux données d'opérations.
 * Fournit des méthodes pour récupérer et créer des opérations.
 *
 * @class
 */
import type { Operation, OperationFormData } from "../types"
import { fetchMockOperations, createMockOperation } from "../mock/mockOperations"
import ValidationService from "./ValidationService"

class OperationService {
  /**
   * URL de base de l'API à partir des variables d'environnement, avec repli vers localhost
   */
  static apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000"

  /**
   * Indicateur pour déterminer si nous devons utiliser des données fictives (pour le développement)
   */
  static useMockData = true // Set to false to use real API

  /**
   * Récupère toutes les opérations depuis l'API
   * @returns {Promise<{data: Operation[]}>} Promesse résolvant vers un objet contenant les données des opérations
   * @throws {Error} Si la requête réseau échoue
   */
  static async getOperations(): Promise<{ data: Operation[] }> {
    // Utiliser des données fictives si l'indicateur est défini (pour le développement)
    if (this.useMockData) {
      return fetchMockOperations()
    }

    try {
      const response = await fetch(`${this.apiUrl}/operations`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData?.error || `Échec de la requête: ${response.status} ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Erreur dans getOperations:", error)
      throw error instanceof Error ? error : new Error("Échec de la connexion au réseau")
    }
  }

  /**
   * Valide les données d'une opération côté client avant de les envoyer à l'API
   * @param {OperationFormData} operationData - Les données de l'opération à valider
   * @throws {Error} Si les données sont invalides
   */
  static async validateOperationData(operationData: OperationFormData): Promise<void> {
    // Récupérer les opérations existantes pour la validation d'unicité
    let existingOperations: Array<{ commercialName: string; deliveryDate: string }> = []

    try {
      const response = await this.getOperations()
      existingOperations = response.data.map((op) => ({
        commercialName: op.commercialName,
        deliveryDate: op.deliveryDate,
      }))
    } catch (error) {
      console.warn("Impossible de récupérer les opérations existantes pour la validation:", error)
    }

    // Valider les données
    const errors = ValidationService.validateOperation(operationData, existingOperations)

    // S'il y a des erreurs, lancer une exception
    const errorMessages = Object.values(errors).filter(Boolean)
    if (errorMessages.length > 0) {
      throw new Error(errorMessages[0])
    }
  }

  /**
   * Crée une nouvelle opération via l'API
   * @param {OperationFormData} operationData - Les données de l'opération à créer
   * @returns {Promise<Operation>} Promesse résolvant vers l'opération créée
   * @throws {Error} Si la requête de création échoue
   */
  static async createOperation(operationData: OperationFormData & { reservedLots?: number }): Promise<Operation> {
    // Valider les données côté client avant de les envoyer
    await this.validateOperationData(operationData)

    // Utiliser des données fictives si l'indicateur est défini (pour le développement)
    if (this.useMockData) {
      return createMockOperation(operationData)
    }

    try {
      // Préparer l'objet pour l'API
      const requestData = {
        commercialName: operationData.commercialName,
        companyId: operationData.companyId,
        deliveryDate: operationData.deliveryDate,
        address: operationData.address,
        availableLots: operationData.availableLots,
        reservedLots: operationData.reservedLots || 0,
      }

      const response = await fetch(`${this.apiUrl}/operations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData?.error || `Échec de la création: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()
      return result.data || result
    } catch (error) {
      console.error("Erreur dans createOperation:", error)
      throw error instanceof Error ? error : new Error("Échec de la création de l'opération")
    }
  }
}

export default OperationService

