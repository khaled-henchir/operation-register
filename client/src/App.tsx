"use client"

/**
 * Composant Principal de l'Application
 *
 * Ce composant sert de point d'entrée pour l'application Tableau de Bord des Opérations.
 * Il organise la mise en page et les composants principaux, y compris le formulaire
 * d'opération et le conteneur de liste des opérations.
 *
 * @component
 */
import { useState, useEffect } from "react"
import OperationContainer from "./components/OperationContainer"
import { useOperations } from "./hooks/useOperations"
import OperationForm from "./components/OperationForm"
import ToastContainer from "./components/ToastContainer"
import SyncIndicator from "./components/SyncIndicator"
import NetworkStatusIndicator from "./components/ui/NetworkStatusIndicator"
import "./App.css"
import type { Operation } from "./types"

function App() {
  // We're not using loading and error from useOperations here anymore
  // as OperationContainer will handle that internally
  const { createOperation, fetchOperations } = useOperations()
  const [isInitialLoad, setIsInitialLoad] = useState<boolean>(true)

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => {
      // Refresh data when coming back online
      fetchOperations()
    }

    window.addEventListener("online", handleOnline)

    return () => {
      window.removeEventListener("online", handleOnline)
    }
  }, [fetchOperations])

  // Set initial load flag
  useEffect(() => {
    if (isInitialLoad) {
      setIsInitialLoad(false)
    }
  }, [isInitialLoad])

  /**
   * Gère la création d'une nouvelle opération
   * @param {Operation} newOperation - L'objet opération nouvellement créé
   */
  const handleOperationCreated = (newOperation: Operation) => {
    createOperation(newOperation)
      .then(() => {
        // Refresh the operations list
        fetchOperations()
      })
      .catch((err: Error) => {
        console.error("Error creating operation:", err)
      })
  }

  // Update the container class to use full viewport height
  return (
    <div className="container full-height">
      <header className="app-header">
        <h1 className="app-title">Mes Opérations</h1>
        <p className="app-description">
          Gérez et suivez toutes vos opérations immobilières en un seul endroit. Créez de nouvelles opérations,
          consultez les opérations existantes et suivez leur état.
        </p>
        <NetworkStatusIndicator />
        <SyncIndicator />
      </header>

      <div className="dashboard">
        <div className="form-container card">
          <OperationForm onOperationCreated={handleOperationCreated} />
        </div>

        <div className="operation-list-container">
          <OperationContainer />
        </div>
      </div>

      <ToastContainer />
    </div>
  )
}

export default App

