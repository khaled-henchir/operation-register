/**
 * Service d'Opération
 *
 * Classe de service pour gérer les opérations API liées aux données d'opérations.
 * Fournit des méthodes pour récupérer et créer des opérations.
 * Intègre la gestion hors ligne et les stratégies de retry.
 *
 * @class
 */
import type { Operation, OperationFormData } from "../types"
import { fetchMockOperations, createMockOperation } from "../mock/mockOperations"
import OfflineService from "./OfflineService"
import ValidationService from "./ValidationService"

class OperationService {
  /**
   * URL de base de l'API à partir des variables d'environnement, avec repli vers localhost
   */
  static apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000"

  /**
   * Indicateur pour déterminer si nous devons utiliser des données fictives (pour le développement)
   */
  static useMockData = false // Set to false to use real API

  /**
   * Nombre maximum de tentatives pour les requêtes réseau
   */
  static maxRetries = 3

  /**
   * Délai de base pour le backoff exponentiel (en ms)
   */
  static baseRetryDelay = 1000

  /**
   * Effectue une requête avec retry et backoff exponentiel
   * @param {Function} requestFn - Fonction effectuant la requête
   * @param {number} retries - Nombre de tentatives restantes
   * @returns {Promise<any>} Résultat de la requête
   * @throws {Error} Si toutes les tentatives échouent
   */
  static async fetchWithRetry(requestFn: () => Promise<any>, retries = this.maxRetries): Promise<any> {
    try {
      return await requestFn()
    } catch (error) {
      // Ne pas retenter si nous sommes hors ligne
      if (!navigator.onLine) {
        throw new Error("Vous êtes hors ligne. Veuillez vous reconnecter et réessayer.")
      }

      // Ne pas retenter s'il n'y a plus de tentatives ou si l'erreur est une erreur de validation
      if (
        retries <= 0 ||
        (error instanceof Error &&
          (error.message.includes("n'existe pas") ||
            error.message.includes("existe déjà") ||
            error.message.includes("ne doit pas dépasser")))
      ) {
        throw error
      }

      // Calculer le délai avec backoff exponentiel et jitter
      const delay = this.baseRetryDelay * Math.pow(2, this.maxRetries - retries) * (0.5 + Math.random() * 0.5)

      console.log(`Tentative échouée. Nouvelle tentative dans ${Math.round(delay)}ms...`)
      await new Promise((resolve) => setTimeout(resolve, delay))

      // Retenter la requête
      return this.fetchWithRetry(requestFn, retries - 1)
    }
  }

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
      // Vérifier si nous sommes en ligne
      if (!navigator.onLine) {
        console.log("Mode hors ligne détecté, utilisation des données en cache")
        const cachedOperations = await OfflineService.getCachedOperations()

        if (cachedOperations.length > 0) {
          return { data: cachedOperations }
        }

        throw new Error("Vous êtes hors ligne et aucune donnée n'est disponible en cache.")
      }

      // Effectuer la requête avec retry
      const response = await this.fetchWithRetry(() =>
        fetch(`${this.apiUrl}/operations`).then((response) => {
          if (!response.ok) {
            return response.json().then((errorData) => {
              throw new Error(errorData?.error || `Échec de la requête: ${response.status} ${response.statusText}`)
            })
          }
          return response.json()
        }),
      )

      // Mettre en cache les opérations pour un accès hors ligne
      if (response.data) {
        await OfflineService.cacheOperations(response.data)
      }

      return response
    } catch (error) {
      console.error("Erreur dans getOperations:", error)

      // Essayer de récupérer les données en cache même si nous sommes en ligne
      // mais que la requête a échoué
      try {
        const cachedOperations = await OfflineService.getCachedOperations()

        if (cachedOperations.length > 0) {
          return { data: cachedOperations }
        }
      } catch (cacheError) {
        console.warn("Impossible de récupérer les données en cache:", cacheError)
      }

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
      if (navigator.onLine) {
        const response = await this.getOperations()
        existingOperations = response.data.map((op) => ({
          commercialName: op.commercialName,
          deliveryDate: op.deliveryDate,
        }))
      } else {
        const cachedOperations = await OfflineService.getCachedOperations()
        existingOperations = cachedOperations.map((op) => ({
          commercialName: op.commercialName,
          deliveryDate: op.deliveryDate,
        }))
      }
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

    // Vérifier si nous sommes hors ligne
    if (!navigator.onLine) {
      console.log("Mode hors ligne détecté, mise en file d'attente de l'opération")

      // Stocker l'opération pour synchronisation ultérieure
      const pendingId = await OfflineService.queueOperationForSync(operationData)

      // Créer une opération temporaire avec un ID local
      return {
        id: pendingId,
        commercialName: operationData.commercialName,
        companyId: operationData.companyId,
        address: operationData.address,
        deliveryDate: operationData.deliveryDate,
        availableLots: operationData.availableLots,
        reservedLots: operationData.reservedLots || 0,
        isPending: true, // Marquer comme en attente
      }
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

      // Effectuer la requête avec retry
      const response = await this.fetchWithRetry(() =>
        fetch(`${this.apiUrl}/operations`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestData),
        }).then((response) => {
          if (!response.ok) {
            return response.json().then((errorData) => {
              throw new Error(errorData?.error || `Échec de la création: ${response.status} ${response.statusText}`)
            })
          }
          return response.json()
        }),
      )

      return response.data || response
    } catch (error) {
      console.error("Erreur dans createOperation:", error)
      throw error instanceof Error ? error : new Error("Échec de la création de l'opération")
    }
  }
}

export default OperationService

