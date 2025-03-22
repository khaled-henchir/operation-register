/**
 * Hook de Service de Synchronisation
 *
 * Ce hook gère la synchronisation des données entre le mode hors ligne et en ligne.
 * Il tente de synchroniser les opérations en attente lorsque la connexion est rétablie.
 */
import { useState, useEffect, useContext, useCallback } from "react"
import { ServiceContext } from "../context/ServiceContext"
import OfflineService from "../services/OfflineService"
import type { OperationFormData } from "../types"

type SyncStatus = "idle" | "syncing" | "success" | "error"

export function useSyncService() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("idle")
  const [pendingCount, setPendingCount] = useState<number>(0)
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine)
  const { operationService } = useContext(ServiceContext)

  // Mettre à jour le statut en ligne
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  // Vérifier les opérations en attente
  const checkPendingOperations = useCallback(async () => {
    const pendingOps = await OfflineService.getPendingOperations()
    setPendingCount(pendingOps.length)
    return pendingOps.length > 0
  }, [])

  // Synchroniser les opérations en attente
  const syncPendingOperations = useCallback(async () => {
    if (!isOnline) {
      return { success: false, message: "Hors ligne. Impossible de synchroniser." }
    }

    try {
      setSyncStatus("syncing")
      const pendingOps = await OfflineService.getPendingOperations()

      if (pendingOps.length === 0) {
        setSyncStatus("idle")
        return { success: true, message: "Aucune opération en attente." }
      }

      let successCount = 0
      let errorCount = 0

      // Utiliser Promise.allSettled pour traiter toutes les opérations, même si certaines échouent
      const results = await Promise.allSettled(
        pendingOps.map(async (op) => {
          try {
            // Préparer les données pour l'API
            const operationData: OperationFormData & { reservedLots: number } = {
              commercialName: op.commercialName,
              companyId: op.companyId,
              address: op.address,
              deliveryDate: op.deliveryDate,
              availableLots: op.availableLots,
              reservedLots: 0,
            }

            // Tenter de créer l'opération
            await operationService.createOperation(operationData)

            // Si réussi, supprimer de la file d'attente
            await OfflineService.removePendingOperation(op.id)
            successCount++
            return { success: true, id: op.id }
          } catch (error) {
            errorCount++
            return { success: false, id: op.id, error }
          }
        }),
      )

      // Mettre à jour le compteur
      await checkPendingOperations()

      // Définir le statut final
      if (errorCount === 0) {
        setSyncStatus("success")
        return {
          success: true,
          message: `${successCount} opération(s) synchronisée(s) avec succès.`,
        }
      } else {
        setSyncStatus("error")
        return {
          success: false,
          message: `${successCount} synchronisée(s), ${errorCount} échec(s). Certaines opérations n'ont pas pu être synchronisées.`,
        }
      }
    } catch (error) {
      setSyncStatus("error")
      return {
        success: false,
        message: `Erreur lors de la synchronisation: ${error instanceof Error ? error.message : "Erreur inconnue"}`,
      }
    }
  }, [isOnline, operationService, checkPendingOperations])

  // Vérifier les opérations en attente au chargement
  useEffect(() => {
    checkPendingOperations()
  }, [checkPendingOperations])

  // Tenter de synchroniser lorsque la connexion est rétablie
  useEffect(() => {
    if (isOnline) {
      const attemptSync = async () => {
        const hasPending = await checkPendingOperations()
        if (hasPending) {
          await syncPendingOperations()
        }
      }

      attemptSync()
    }
  }, [isOnline, checkPendingOperations, syncPendingOperations])

  return {
    syncStatus,
    pendingCount,
    isOnline,
    syncPendingOperations,
    checkPendingOperations,
  }
}

