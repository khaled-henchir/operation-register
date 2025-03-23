/**
 * Operation Container Component
 *
 * Acts as a container for the operations list, handling the data fetching logic
 * and displaying appropriate loading or error states.
 *
 * @component
 */
import { useOperations } from "../hooks/useOperations"
import OperationList from "./OperationList"
import Loader from "./Loader"
import Error from "./Error"
import React from "react"

const OperationContainer: React.FC = () => {
  const { data: operations, loading, error, lastUpdated, fetchOperations } = useOperations()

  // manual refresh
  const handleRefresh = () => {
    fetchOperations()
  }

  if (loading) {
    return <Loader />
  }

  return (
    <div className="operation-container card">
      {error && (
        <div className="operation-error-container">
          <Error message={error} />
        </div>
      )}

      <div className="operation-header-actions">
        {lastUpdated && <div className="last-updated">Mise à jour: {lastUpdated.toLocaleTimeString()}</div>}
        <button onClick={handleRefresh} className="refresh-button" aria-label="Rafraîchir les données">
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
            className="refresh-icon"
          >
            <path d="M21 2v6h-6"></path>
            <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
            <path d="M3 22v-6h6"></path>
            <path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path>
          </svg>
          Rafraîchir
        </button>
      </div>

      <OperationList operations={operations} />
    </div>
  )
}

export default OperationContainer

