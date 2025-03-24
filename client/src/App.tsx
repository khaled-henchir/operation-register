/**
 * Composant Principal de l'Application
 *
 * Ce composant sert de point d'entrée pour l'application Tableau de Bord des Opérations.
 * Il organise la mise en page et les composants principaux, y compris le formulaire
 * d'opération et le conteneur de liste des opérations.
 *
 * @component
 */
import React, { useState } from "react"
import OperationContainer from "./components/OperationContainer"
import { useOperations } from "./hooks/useOperations"
import OperationForm from "./components/OperationForm"
import ToastContainer, { ToastContext }  from "./components/ToastContainer"
import "./App.css"
import type { Operation } from "./types"

function App() {
  const { createOperation, fetchOperations } = useOperations()
  const [toastMessage, setToastMessage] = useState<{ message: string; type: "success" | "error" } | null>(null)

  /**
   * Gère la création d'une nouvelle opération
   * @param {Operation} newOperation - L'objet opération nouvellement créé
   */
  const handleOperationCreated = (newOperation: Operation) => {
    createOperation(newOperation)
      .then(() => {
        fetchOperations()
        setToastMessage({
          message: `Opération "${newOperation.commercialName}" créée avec succès`,
          type: "success",
        })
      })
      .catch((err: Error) => {
        console.error("Error creating operation:", err)
      })
  }

  return (
    <ToastContext.Provider
      value={{
        showToast: (message, type) => setToastMessage({ message, type }),
        hideToast: () => setToastMessage(null),
      }}
    >
      <div className="container full-height">
        <header className="app-header">
          <h1 className="app-title">Mes Opérations</h1>
          <p className="app-description">
            Gérez et suivez toutes vos opérations immobilières en un seul endroit. Créez de nouvelles opérations,
            consultez les opérations existantes et suivez leur état.
          </p>
        </header>

        <div className="dashboard">
          <div className="form-container card">
            <OperationForm onOperationCreated={handleOperationCreated} />
          </div>

          <div className="operation-list-container">
            <OperationContainer />
          </div>
        </div>

        <ToastContainer initialToast={toastMessage} />
      </div>
    </ToastContext.Provider>
  )
}

export default App
