/**
 * Composant Erreur
 *
 * Affiche un message d'erreur à l'utilisateur avec une icône d'avertissement.
 * Utilisé dans toute l'application pour afficher les états d'erreur de manière cohérente.
 *
 * @component
 * @param {ErrorProps} props - Props du composant contenant le message d'erreur
 */
import type { FC } from "react"
import type { ErrorProps } from "../types"
import React from "react"

const Error: FC<ErrorProps> = ({ message }) => (
  <div className="error" role="alert" aria-live="assertive">
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
      className="error-icon"
    >
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
      <line x1="12" y1="9" x2="12" y2="13"></line>
      <line x1="12" y1="17" x2="12.01" y2="17"></line>
    </svg>
    <p>{message}</p>
  </div>
)

export default Error

