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

