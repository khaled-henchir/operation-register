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
      }))

      setData(formattedOperations)
      setLastUpdated(new Date())
    } catch (error) {
      console.error("Erreur lors de la récupération des opérations:", error)

      // Si aucune donnée n'est disponible, utiliser les données de démonstration
      const formattedMockOperations = mockOperations.map((op) => ({
        id: op.id,
        title: op.commercialName,
        address: op.address,
        date: op.deliveryDate,
        lots: `${op.reservedLots || 0}/${op.availableLots}`,
        companyId: op.companyId,
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

