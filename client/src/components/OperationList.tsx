/**
 * Composant Liste d'Opérations
 *
 * Affiche une liste d'opérations dans une mise en page basée sur des cartes.
 * Gère l'affichage de l'état vide lorsqu'aucune opération n'est disponible.
 *
 * @component
 * @param {OperationListProps} props - Props du composant contenant le tableau d'opérations
 */
import type { FC } from "react"
import type { OperationListProps } from "../types"
import { formatDate } from "../utils/dateUtils"
import React from "react"

const OperationList: FC<OperationListProps> = ({ operations }) => {
  // Afficher l'état vide lorsqu'aucune opération n'est disponible
  if (operations.length === 0) {
    return (
      <div className="empty-state" role="status">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
          <line x1="3" x2="21" y1="9" y2="9"></line>
          <path d="M9 16H9.01"></path>
          <path d="M12 16H12.01"></path>
          <path d="M15 16H15.01"></path>
        </svg>
        <h3 className="empty-state-title">Aucune opération trouvée</h3>
        <p className="empty-state-description">
          Utilisez le formulaire à gauche pour créer votre première opération immobilière.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="operation-list-header">
        <div className="operation-list-title">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
            <rect width="8" height="4" x="8" y="2" rx="1" ry="1"></rect>
            <path d="M12 11h4"></path>
            <path d="M12 16h4"></path>
            <path d="M8 11h.01"></path>
            <path d="M8 16h.01"></path>
          </svg>
          <h2>Liste des opérations ({operations.length})</h2>
        </div>
      </div>
      <div className="operation-list-scroll-container">
        <ul className="operation-list" aria-label="Liste des opérations">
          {operations.map((op) => {
            const lotsMatch = op.lots.match(/(\d+)\/(\d+)/)
            const reservedLots = lotsMatch ? Number.parseInt(lotsMatch[1]) : 0
            const totalLots = lotsMatch ? Number.parseInt(lotsMatch[2]) : 0
            const availableLots = totalLots - reservedLots
            const availablePercentage = totalLots > 0 ? (reservedLots / totalLots) * 100 : 0

            let statusClass = "status-new"
            let statusText = "Nouveau"

            if (reservedLots === totalLots && totalLots > 0) {
              statusClass = "status-complete"
              statusText = "Complet"
            } else if (reservedLots > 0) {
              statusClass = "status-in-progress"
              statusText = "En cours"
            }

            return (
              <li key={op.id} className="operation-item">
                <div className={`operation-status ${statusClass}`}>{statusText}</div>
                <h3 className="operation-title">{op.title}</h3>

                <div className="operation-details">
                  <div className="operation-address">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    {op.address}
                  </div>

                  <div className="operation-meta-row">
                    <div className="operation-company">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                        <polyline points="9 22 9 12 15 12 15 22"></polyline>
                      </svg>
                      <span className="company-id">{op.companyId}</span>
                    </div>

                    <div className="operation-meta">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
                        <line x1="16" x2="16" y1="2" y2="6"></line>
                        <line x1="8" x2="8" y1="2" y2="6"></line>
                        <line x1="3" x2="21" y1="10" y2="10"></line>
                      </svg>
                      {formatDate(op.date)}
                    </div>
                  </div>
                </div>

                <div className="operation-lots">
                  <div className="operation-lots-header">
                    <span className="operation-lots-label">Lots Réservés</span>
                    <span className="operation-lots-value">{op.lots}</span>
                  </div>
                  <div className="operation-progress-container">
                    <div
                      className="operation-progress-bar"
                      style={{ width: `${availablePercentage}%` }}
                      aria-valuenow={reservedLots}
                      aria-valuemin={0}
                      aria-valuemax={totalLots}
                      role="progressbar"
                      aria-label={`${reservedLots} lots réservés sur ${totalLots}`}
                    ></div>
                  </div>
                  <div className="operation-lots-detail">
                    <div className="lots-reserved">
                      <span className="lots-indicator reserved-indicator"></span>
                      <span>Réservés: {reservedLots}</span>
                    </div>
                    <div className="lots-available">
                      <span className="lots-indicator available-indicator"></span>
                      <span>Disponibles: {availableLots}</span>
                    </div>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </>
  )
}

export default OperationList

