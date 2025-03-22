/**
 * Type Definitions
 *
 * This file contains TypeScript interfaces and types used throughout the application.
 * Centralizing types helps maintain consistency and makes refactoring easier.
 */

/**
 * Represents an operation as returned from the API
 */
export interface Operation {
  id: string
  commercialName: string
  companyId: string
  address: string
  deliveryDate: string
  availableLots: number
  reservedLots?: number
  isPending?: boolean // Indique si l'opération est en attente de synchronisation
}

/**
 * Represents an operation formatted for display in the UI
 */
export interface OperationFormatted {
  id: string
  title: string
  address: string
  date: string
  lots: string
  companyId: string
  isPending?: boolean // Indique si l'opération est en attente de synchronisation
}

/**
 * Represents the data required to create a new operation
 */
export interface OperationFormData {
  commercialName: string
  companyId: string
  address: string
  deliveryDate: string
  availableLots: number
}

/**
 * Represents the service context type for dependency injection
 */
export interface ServiceContextType {
  operationService: {
    getOperations: () => Promise<{ data: Operation[] }>
    createOperation: (operationData: OperationFormData & { reservedLots?: number }) => Promise<Operation>
  }
}

/**
 * Props for the OperationForm component
 */
export interface OperationFormProps {
  onOperationCreated: (newOperation: Operation) => void
}

/**
 * Props for the OperationList component
 */
export interface OperationListProps {
  operations: OperationFormatted[]
}

/**
 * Props for the Error component
 */
export interface ErrorProps {
  message: string
}

/**
 * Represents the status of a network request with retry
 */
export interface RequestStatus {
  isLoading: boolean
  error: string | null
  retryCount: number
  lastRetryTime: number | null
}

/**
 * Represents the result of a synchronization operation
 */
export interface SyncResult {
  success: boolean
  message: string
  details?: {
    successCount: number
    errorCount: number
    errors?: Array<{ id: string; error: string }>
  }
}

