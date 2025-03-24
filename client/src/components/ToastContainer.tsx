/**
 * Composant Conteneur de Toast
 *
 * Gère l'affichage et la gestion des notifications toast dans l'application.
 * Centralise la logique de toast pour éviter la duplication dans les composants.
 */
import React from "react"
import { useState, createContext, useContext, useEffect } from "react"
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

// Context for toast management
export const ToastContext = createContext<ToastContextType>({
  showToast: () => {},
  hideToast: () => {},
})

// Hook to use toast functionality
export const useToast = () => useContext(ToastContext)

interface ToastContainerProps {
  initialToast: { message: string; type: "success" | "error" } | null
}

const ToastContainer: React.FC<ToastContainerProps> = ({ initialToast }) => {
  const [toasts, setToasts] = useState<ToastProps[]>([])

  // Effect to handle initialToast prop changes
  useEffect(() => {
    if (initialToast) {
      const id = Date.now()
      setToasts((prevToasts) => [...prevToasts, { ...initialToast, id }])
    }
  }, [initialToast])

  /**
   * Affiche un message toast
   * @param {string} message - Le message à afficher
   * @param {"success" | "error"} type - Le type de toast (succès ou erreur)
   */
  const showToast = (message: string, type: "success" | "error") => {
    const id = Date.now()
    setToasts((prevToasts) => [...prevToasts, { message, type, id }])
  }

  /**
   * Masque un toast spécifique
   * @param {number} id - L'identifiant du toast à masquer
   */
  const hideToast = (id?: number) => {
    if (id) {
      setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id))
    }
  }

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => hideToast(toast.id)} />
      ))}
    </div>
  )
}

export default ToastContainer

