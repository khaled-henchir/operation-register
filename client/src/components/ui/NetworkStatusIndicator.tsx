/**
 * Composant Indicateur de Statut Réseau
 *
 * Affiche l'état de la connexion réseau et fournit des informations
 * sur le mode hors ligne.
 */
import React from "react"
import { useState, useEffect } from "react"

interface NetworkStatusIndicatorProps {
  className?: string
}

const NetworkStatusIndicator: React.FC<NetworkStatusIndicatorProps> = ({ className = "" }) => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine)
  const [showDetails, setShowDetails] = useState<boolean>(false)

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

  if (isOnline) {
    return null // Ne rien afficher si en ligne
  }

  return (
    <div className={`network-status-indicator ${className}`} role="alert" aria-live="polite">
      <div className="network-status-content">
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
          <line x1="1" y1="1" x2="23" y2="23"></line>
          <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"></path>
          <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"></path>
          <path d="M10.71 5.05A16 16 0 0 1 22.58 9"></path>
          <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"></path>
          <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
          <line x1="12" y1="20" x2="12.01" y2="20"></line>
        </svg>
        <span>Mode hors ligne</span>
        <button
          className="network-status-details-button"
          onClick={() => setShowDetails(!showDetails)}
          aria-expanded={showDetails}
        >
          {showDetails ? "Masquer les détails" : "Afficher les détails"}
        </button>
      </div>

      {showDetails && (
        <div className="network-status-details">
          <p>Vous êtes actuellement hors ligne. Certaines fonctionnalités sont limitées :</p>
          <ul>
            <li>Les nouvelles opérations seront enregistrées localement</li>
            <li>Les opérations existantes sont disponibles en lecture seule</li>
            <li>Les modifications seront synchronisées automatiquement lorsque vous serez à nouveau en ligne</li>
          </ul>
          <p>Vérifiez votre connexion internet et rafraîchissez la page une fois reconnecté.</p>
        </div>
      )}
    </div>
  )
}

export default NetworkStatusIndicator

