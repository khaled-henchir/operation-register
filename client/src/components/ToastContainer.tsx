/**
 * Composant Conteneur de Toast
 *
 * Gère l'affichage et la gestion des notifications toast dans l'application.
 * Centralise la logique de toast pour éviter la duplication dans les composants.
 */
import React from "react"
import { useState, useEffect, createContext, useContext } from "react"
import Toast from "./Toast"

interface ToastProps {
  message: string
  type: "success" | "error"
  id: number
}

interface ToastContextType {
  showToast: (message: string, type: "success" | "error") => void
  hideToast: (id: number) => void
}

// Create context for toast management
export const ToastContext = createContext<ToastContextType>({
  showToast: () => {},
  hideToast: () => {},
})

// Hook to use toast functionality
export const useToast = () => useContext(ToastContext)

const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastProps[]>([])

  /**
   * Affiche un message toast
   * @param {string} message - Le message à afficher
   * @param {"success" | "error"} type - Le type de toast (succès ou erreur)
   */
  const showToast = (message: string, type: "success" | "error") => {
    const id = Date.now()
    setToasts((prevToasts) => [...prevToasts, { message, type, id }])

    // Supprimer le toast après 5 secondes
    setTimeout(() => {
      setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id))
    }, 5000)
  }

  /**
   * Masque un toast spécifique
   * @param {number} id - L'identifiant du toast à masquer
   */
  const hideToast = (id: number) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id))
  }

  // Listen for online/offline events to show appropriate toasts
  useEffect(() => {
    const handleOnline = () => {
      showToast("Connexion rétablie.", "success")
    }

    const handleOffline = () => {
      showToast("Vous êtes actuellement hors ligne. Certaines fonctionnalités peuvent être limitées.", "error")
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      <div className="toast-container">
        {toasts.map((toast) => (
          <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => hideToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export default ToastContainer

