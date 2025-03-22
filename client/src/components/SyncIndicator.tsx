/**
 * Composant Indicateur de Synchronisation
 *
 * Affiche l'état de synchronisation et permet de synchroniser manuellement
 * les opérations créées en mode hors ligne.
 */
import React from "react"
import { useSyncService } from "../hooks/useSyncService"

const SyncIndicator: React.FC = () => {
  const { syncStatus, pendingCount, isOnline, syncPendingOperations } = useSyncService()

  if (!pendingCount && syncStatus !== "syncing") {
    return null
  }

  return (
    <div className={`sync-indicator ${syncStatus}`}>
      <div className="sync-content">
        {syncStatus === "syncing" ? (
          <>
            <div className="spinner-small" aria-hidden="true"></div>
            <span>Synchronisation en cours...</span>
          </>
        ) : (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M21 2v6h-6"></path>
              <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
              <path d="M3 22v-6h6"></path>
              <path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path>
            </svg>
            <span>{pendingCount} opération(s) en attente de synchronisation</span>
          </>
        )}
      </div>
      {isOnline && pendingCount > 0 && syncStatus !== "syncing" && (
        <button
          onClick={() => syncPendingOperations()}
          className="sync-button"
          aria-label="Synchroniser les opérations en attente"
        >
          Synchroniser
        </button>
      )}
    </div>
  )
}

export default SyncIndicator

