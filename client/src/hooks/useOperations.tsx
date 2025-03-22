/**
 * Hook useOperations
 *
 * Hook React personnalisé pour gérer les données des opérations.
 * Gère la récupération, l'état et les opérations CRUD pour les opérations.
 *
 * @hook
 * @returns {Object} Objet contenant les données des opérations, l'état de chargement, l'état d'erreur et les fonctions CRUD
 */
import { useState, useEffect, useContext, useCallback } from "react"
import { ServiceContext } from "../context/ServiceContext"
import type { Operation, OperationFormData, OperationFormatted } from "../types"
import { mockOperations } from "../mock/mockOperations"

export function useOperations() {
  const [data, setData] = useState<OperationFormatted[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const { operationService } = useContext(ServiceContext)

  /**
   * Récupère les données des opérations depuis l'API
   */
  const fetchOperations = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Check if we're online
      if (!navigator.onLine) {
        throw new Error("Vous êtes hors ligne. Affichage des données en cache.")
      }

      const response = await operationService.getOperations()

      // Accéder aux données des opérations en toute sécurité avec repli vers un tableau vide
      const operations = response?.data || []

      // Transformer les données de l'API au format nécessaire pour l'UI
      const formattedOperations = operations.map((op) => ({
        id: op.id,
        title: op.commercialName,
        address: op.address,
        date: op.deliveryDate,
        lots: `${op.reservedLots || 0}/${op.availableLots}`,
        companyId: op.companyId,
        isPending: op.isPending,
      }))

      setData(formattedOperations)
      setLastUpdated(new Date())

      // Store in localStorage for offline access
      try {
        localStorage.setItem("operations", JSON.stringify(formattedOperations))
        localStorage.setItem("operationsLastUpdated", new Date().toISOString())
      } catch (storageError) {
        console.warn("Impossible de stocker les données en cache:", storageError)
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des opérations:", error)

      // Try to get data from localStorage if we're offline
      if (!navigator.onLine) {
        try {
          const cachedData = localStorage.getItem("operations")
          const lastUpdatedStr = localStorage.getItem("operationsLastUpdated")

          if (cachedData) {
            const parsedData = JSON.parse(cachedData)
            setData(parsedData)

            if (lastUpdatedStr) {
              setLastUpdated(new Date(lastUpdatedStr))
            }

            setError("Vous êtes hors ligne. Affichage des données en cache.")
            setLoading(false)
            return
          }
        } catch (storageError) {
          console.warn("Impossible de récupérer les données en cache:", storageError)
        }
      }

      // Si aucune donnée n'est disponible (ni en ligne ni en cache), utiliser les données de démonstration
      const formattedMockOperations = mockOperations.map((op) => ({
        id: op.id,
        title: op.commercialName,
        address: op.address,
        date: op.deliveryDate,
        lots: `${op.reservedLots || 0}/${op.availableLots}`,
        companyId: op.companyId,
        isPending: false,
      }))

      setData(formattedMockOperations)
      setError("Impossible de charger les données depuis l'API. Affichage des données de démonstration.")
    } finally {
      setLoading(false)
    }
  }, [operationService])

  /**
   * Récupère les données des opérations depuis l'API au montage du composant
   */
  useEffect(() => {
    fetchOperations()

    // Set up event listeners for online/offline status
    const handleOnline = () => {
      // Refresh data when coming back online
      fetchOperations()
    }

    window.addEventListener("online", handleOnline)

    return () => {
      window.removeEventListener("online", handleOnline)
    }
  }, [fetchOperations])

  /**
   * Crée une nouvelle opération et met à jour l'état local
   * @param {OperationFormData} newOperationData - Les données de l'opération à créer
   * @returns {Promise<Operation>} L'opération créée depuis l'API
   */
  const createOperation = async (
    newOperationData: OperationFormData & { reservedLots?: number },
  ): Promise<Operation> => {
    try {
      // Check if we're online
      if (!navigator.onLine) {
        throw new Error("Impossible de créer une opération en mode hors ligne")
      }

      // S'assurer que reservedLots est défini à 0
      const operationToCreate = {
        ...newOperationData,
        reservedLots: newOperationData.reservedLots || 0,
      }

      const createdOperation = await operationService.createOperation(operationToCreate)

      // Refresh the operations list
      fetchOperations()

      return createdOperation
    } catch (error) {
      console.error("Erreur lors de la création de l'opération:", error)
      throw error
    }
  }

  return {
    data,
    loading,
    error,
    createOperation,
    fetchOperations,
    lastUpdated,
  }
}

