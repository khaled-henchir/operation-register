/**
 * Composant Chargement
 *
 * Affiche un indicateur de chargement avec un spinner et un message.
 * Utilisé dans toute l'application pour indiquer les états de chargement.
 *
 * @component
 */
import React from "react"

const Loader: React.FC = () => (
  <div className="loader" role="status" aria-live="polite">
    <div className="spinner" aria-hidden="true"></div>
    <p>Chargement en cours...</p>
  </div>
)

export default Loader

