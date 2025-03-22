/**
 * Mock Operations Data
 *
 * This file provides mock data for development and testing purposes.
 * It can be used when the API is not available or for UI development.
 */
import type { Operation } from "../types"

/**
 * Array of mock operations for development and testing
 */
export const mockOperations: Operation[] = [
  {
    id: "op-001",
    commercialName: "Résidence Les Jardins",
    companyId: "comp-001",
    address: "123 Avenue des Fleurs, 75001 Paris",
    deliveryDate: "2023-12-15",
    availableLots: 24,
    reservedLots: 12,
  },
  {
    id: "op-002",
    commercialName: "Le Clos des Vignes",
    companyId: "comp-001",
    address: "45 Rue du Château, 69002 Lyon",
    deliveryDate: "2024-03-20",
    availableLots: 18,
    reservedLots: 5,
  },
  {
    id: "op-003",
    commercialName: "Les Terrasses de la Mer",
    companyId: "comp-002",
    address: "8 Boulevard Maritime, 06000 Nice",
    deliveryDate: "2024-06-10",
    availableLots: 32,
    reservedLots: 0,
  },
]

/**
 * Mock function to simulate fetching operations from an API
 * @returns {Promise<{data: Operation[]}>} Promise resolving to mock operations data
 */
export const fetchMockOperations = (): Promise<{ data: Operation[] }> => {
  return new Promise((resolve) => {
    // Simulate network delay
    setTimeout(() => {
      resolve({ data: mockOperations })
    }, 800)
  })
}

/**
 * Mock function to simulate creating a new operation
 * @param {Partial<Operation>} operationData - The operation data to create
 * @returns {Promise<Operation>} Promise resolving to the created operation
 */
export const createMockOperation = (operationData: Partial<Operation>): Promise<Operation> => {
  return new Promise((resolve) => {
    // Simulate network delay
    setTimeout(() => {
      const newOperation: Operation = {
        id: `op-${Math.floor(Math.random() * 1000)}`,
        companyId: "comp-001",
        commercialName: operationData.commercialName || "Nouvelle Opération",
        address: operationData.address || "Adresse non spécifiée",
        deliveryDate: operationData.deliveryDate || new Date().toISOString().split("T")[0],
        availableLots: operationData.availableLots || 0,
        reservedLots: 0,
      }

      resolve(newOperation)
    }, 800)
  })
}

