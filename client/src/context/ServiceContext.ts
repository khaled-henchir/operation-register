/**
 * Contexte de Service
 *
 * Fournit un contexte React pour accéder aux instances de service dans toute l'application.
 * Cela permet aux composants d'accéder aux services sans avoir à passer les props.
 *
 * @context
 */
import { createContext } from "react"
import OperationService from "../services/OperationService"
import type { ServiceContextType } from "../types"

/**
 * Contexte de service avec valeur par défaut utilisant OperationService
 */
export const ServiceContext = createContext<ServiceContextType>({
  operationService: OperationService,
})

