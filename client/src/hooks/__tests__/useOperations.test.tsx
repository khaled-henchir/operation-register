/**
 * Tests for useOperations hook
 *
 * This file contains unit tests for the useOperations custom hook.
 */
import { renderHook, act } from "@testing-library/react-hooks"
import { ServiceContext } from "../../context/ServiceContext"
import { useOperations } from "../useOperations"
import type React from "react"

// Mock data
const mockOperations = [
  {
    id: "op-001",
    commercialName: "Test Operation 1",
    companyId: "comp-001",
    address: "123 Test Street",
    deliveryDate: "2023-12-31",
    availableLots: 10,
    reservedLots: 0,
  },
  {
    id: "op-002",
    commercialName: "Test Operation 2",
    companyId: "comp-002",
    address: "456 Test Avenue",
    deliveryDate: "2024-06-30",
    availableLots: 20,
    reservedLots: 5,
  },
]

// Mock formatted operations
const mockFormattedOperations = [
  {
    id: "op-001",
    title: "Test Operation 1",
    address: "123 Test Street",
    date: "2023-12-31",
    lots: "0/10",
    companyId: "comp-001",
    isPending: false,
  },
  {
    id: "op-002",
    title: "Test Operation 2",
    address: "456 Test Avenue",
    date: "2024-06-30",
    lots: "5/20",
    companyId: "comp-002",
    isPending: false,
  },
]

// Mock service
const mockOperationService = {
  getOperations: jest.fn(),
  createOperation: jest.fn(),
}

// Mock wrapper component
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ServiceContext.Provider value={{ operationService: mockOperationService }}>{children}</ServiceContext.Provider>
)

describe("useOperations", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Reset localStorage mock
    const getItemMock = jest.spyOn(Storage.prototype, "getItem")
    getItemMock.mockImplementation(() => null)
    const setItemMock = jest.spyOn(Storage.prototype, "setItem")
    setItemMock.mockImplementation(() => {})
    // Reset navigator.onLine
    Object.defineProperty(navigator, "onLine", { value: true, writable: true })
  })

  it("should fetch operations on mount", async () => {
    // Mock successful API response
    mockOperationService.getOperations.mockResolvedValueOnce({ data: mockOperations })

    const { result, waitForNextUpdate } = renderHook(() => useOperations(), { wrapper })

    // Initial state
    expect(result.current.loading).toBe(true)
    expect(result.current.data).toEqual([])
    expect(result.current.error).toBeNull()

    // Wait for the API call to resolve
    await waitForNextUpdate()

    // Updated state
    expect(result.current.loading).toBe(false)
    expect(result.current.data).toEqual(mockFormattedOperations)
    expect(result.current.error).toBeNull()
    expect(mockOperationService.getOperations).toHaveBeenCalledTimes(1)
  })

  it("should handle API errors", async () => {
    // Mock API error
    const errorMessage = "Failed to fetch operations"
    mockOperationService.getOperations.mockRejectedValueOnce(new Error(errorMessage))

    const { result, waitForNextUpdate } = renderHook(() => useOperations(), { wrapper })

    // Wait for the API call to reject
    await waitForNextUpdate()

    // Updated state with error
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBe(
      "Impossible de charger les données depuis l'API. Affichage des données de démonstration.",
    )
    expect(mockOperationService.getOperations).toHaveBeenCalledTimes(1)
  })

  it("should create a new operation", async () => {
    // Mock successful API responses
    mockOperationService.getOperations.mockResolvedValueOnce({ data: mockOperations })

    const newOperation = {
      commercialName: "New Operation",
      companyId: "comp-001",
      address: "789 New Street",
      deliveryDate: "2024-12-31",
      availableLots: 15,
    }

    const createdOperation = {
      id: "op-003",
      ...newOperation,
      reservedLots: 0,
    }

    mockOperationService.createOperation.mockResolvedValueOnce(createdOperation)
    mockOperationService.getOperations.mockResolvedValueOnce({
      data: [...mockOperations, createdOperation],
    })

    const { result, waitForNextUpdate } = renderHook(() => useOperations(), { wrapper })

    // Wait for initial fetch
    await waitForNextUpdate()

    // Create new operation
    await act(async () => {
      await result.current.createOperation(newOperation)
    })

    // Verify createOperation was called
    expect(mockOperationService.createOperation).toHaveBeenCalledWith(newOperation)

    // Verify fetchOperations was called to refresh the list
    expect(mockOperationService.getOperations).toHaveBeenCalledTimes(2)
  })

  it("should handle offline mode with cached data", async () => {
    // Set navigator.onLine to false
    Object.defineProperty(navigator, "onLine", { value: false })

    // Mock localStorage with cached data
    const getItemMock = jest.spyOn(Storage.prototype, "getItem")
    getItemMock.mockImplementation((key) => {
      if (key === "operations") {
        return JSON.stringify(mockFormattedOperations)
      }
      if (key === "operationsLastUpdated") {
        return new Date().toISOString()
      }
      return null
    })

    // Mock API error due to offline
    mockOperationService.getOperations.mockRejectedValueOnce(new Error("Network error"))

    const { result, waitForNextUpdate } = renderHook(() => useOperations(), { wrapper })

    // Wait for the hook to process
    await waitForNextUpdate()

    // Should use cached data
    expect(result.current.loading).toBe(false)
    expect(result.current.data).toEqual(mockFormattedOperations)
    expect(result.current.error).toBe("Vous êtes hors ligne. Affichage des données en cache.")
  })
})

