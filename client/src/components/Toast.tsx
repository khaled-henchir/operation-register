/**
 * @description Composant React pour afficher des notifications toast temporaires.
 * @component
 * 
 */

import React, { type FC, useEffect, useState } from "react"

interface ToastProps {
  message: string
  type: "success" | "error"
  onClose: () => void
}

const Toast: FC<ToastProps> = ({ message, type, onClose }) => {
  const [isVisible, setIsVisible] = useState(true)
  const [isLeaving, setIsLeaving] = useState(false)

  // Disparaît automatiquement après 5 secondes
  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose()
    }, 5000)

    return () => clearTimeout(timer)
  }, [])

  const handleClose = () => {
    setIsLeaving(true)
    setTimeout(() => {
      setIsVisible(false)
      if (onClose) {
        onClose()
      }
    }, 300)
  }

  if (!isVisible) return null

  const toastClass = `toast ${type === "success" ? "toast-success" : "toast-error"} ${isLeaving ? "toast-leaving" : ""}`
  const iconName = type === "success" ? "check-circle" : "alert-circle"

  return (
    <div
      className={toastClass}
      role="alert"
      aria-live={type === "error" ? "assertive" : "polite"}
      data-testid={`toast-${type}`}
    >
      <div className="toast-content">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className="toast-icon"
        >
          {type === "success" ? (
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          ) : (
            <circle cx="12" cy="12" r="10"></circle>
          )}
          {type === "success" ? (
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          ) : (
            <>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </>
          )}
        </svg>
        <span className="toast-message">{message}</span>
      </div>
      <button
        className="toast-close"
        onClick={handleClose}
        aria-label="Fermer la notification"
        data-testid="toast-close-button"
      >
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
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
  )
}

export default Toast
