/**
 * Application Entry Point
 *
 * This is the main entry point for the React application.
 * It renders the root component and sets up the service context provider.
 */
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { ServiceContext } from "./context/ServiceContext"
import OperationService from "./services/OperationService"
import App from "./App"
import "./index.css"

// Find the root element in the DOM
const rootElement = document.getElementById("root")

if (rootElement) {
  // Create a React root and render the application
  createRoot(rootElement).render(
    <StrictMode>
      <ServiceContext.Provider value={{ operationService: OperationService }}>
        <App />
      </ServiceContext.Provider>
    </StrictMode>,
  )
} else {
  console.error("Élément racine introuvable dans le DOM")
}

