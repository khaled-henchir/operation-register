/**
 * Tests for OperationService
 *
 * This file contains unit tests for the OperationService class.
 */
import OperationService from "../OperationService"
import OfflineService from "../OfflineService"
import { mockOperations } from "../../mock/mockOperations"

// Mock the fetch API
global.fetch = jest.fn()

// Mock the OfflineService
jest.mock("../OfflineService", () => ({
  cacheOperations: jest.fn(),
  getCachedOperations: jest.fn(),
  queueOperationForSync: jest.fn(),
  getPendingOperations: jest.fn(),
  removePendingOperation: jest.fn(),
  hasPendingOperations: jest.fn(),
}))

describe("OperationService", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Reset navigator.onLine
    Object.defineProperty(navigator, "onLine", { value: true, writable: true })
  })

  describe("getOperations", () => {
    it("should fetch operations from API when online", async () => {
      // Mock successful API response
      const mockResponse = { data: mockOperations }
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockResponse),
      })

      const result = await OperationService.getOperations()

      expect(global.fetch).toHaveBeenCalledWith(`${OperationService.apiUrl}/operations`)
      expect(result).toEqual(mockResponse)
      expect(OfflineService.cacheOperations).toHaveBeenCalledWith(mockOperations)
    })

    it("should use cached operations when offline", async () => {
      // Set navigator.onLine to false
      Object.defineProperty(navigator, "onLine", { value: false })

      // Mock cached operations
      ;(OfflineService.getCachedOperations as jest.Mock).mockResolvedValueOnce(mockOperations)

      const result = await OperationService.getOperations()

      expect(global.fetch).not.toHaveBeenCalled()
      expect(result).toEqual({ data: mockOperations })
    })

    it("should handle API errors and try to use cached data", async () => {
      // Mock API error
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error("Network error"))

      // Mock cached operations
      ;(OfflineService.getCachedOperations as jest.Mock).mockResolvedValueOnce(mockOperations)

      const result = await OperationService.getOperations()

      expect(global.fetch).toHaveBeenCalledWith(`${OperationService.apiUrl}/operations`)
      expect(result).toEqual({ data: mockOperations })
    })

    it("should retry failed requests with exponential backoff", async () => {
      // Mock first two requests to fail, third to succeed
      const mockResponse = { data: mockOperations }
      ;(global.fetch as jest.Mock)
        .mockRejectedValueOnce(new Error("Network error"))
        .mockRejectedValueOnce(new Error("Network error"))
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValueOnce(mockResponse),
        })

      const result = await OperationService.getOperations()

      expect(global.fetch).toHaveBeenCalledTimes(3)
      expect(result).toEqual(mockResponse)
    })
  })

  describe("createOperation", () => {
    const newOperation = {
      commercialName: "Test Operation",
      companyId: "comp-001",
      address: "123 Test Street",
      deliveryDate: "2023-12-31",
      availableLots: 10,
    }

    it("should create an operation via API when online", async () => {
      // Mock successful API response
      const mockResponse = {
        data: {
          id: "op-123",
          ...newOperation,
          reservedLots: 0,
        },
      }
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockResponse),
      })

      const result = await OperationService.createOperation(newOperation)

      expect(global.fetch).toHaveBeenCalledWith(
        `${OperationService.apiUrl}/operations`,
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            commercialName: newOperation.commercialName,
            companyId: newOperation.companyId,
            deliveryDate: newOperation.deliveryDate,
            address: newOperation.address,
            totalLots: newOperation.availableLots,
            reservedLots: 0,
          }),
        }),
      )
      expect(result).toEqual(mockResponse.data)
    })

    it("should queue operation for sync when offline", async () => {
      // Set navigator.onLine to false
      Object.defineProperty(navigator, "onLine", { value: false })

      // Mock queueOperationForSync
      const pendingId = "pending-123"
      ;(OfflineService.queueOperationForSync as jest.Mock).mockResolvedValueOnce(pendingId)

      const result = await OperationService.createOperation(newOperation)

      expect(global.fetch).not.toHaveBeenCalled()
      expect(OfflineService.queueOperationForSync).toHaveBeenCalledWith(newOperation)
      expect(result).toEqual({
        id: pendingId,
        ...newOperation,
        reservedLots: 0,
        isPending: true,
      })
    })

    it("should handle validation errors from API", async () => {
      // Mock API validation error
      const errorMessage = "Le nom d'une opération ne doit pas dépasser 24 caractères"
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: jest.fn().mockResolvedValueOnce({ error: errorMessage }),
      })

      await expect(OperationService.createOperation(newOperation)).rejects.toThrow(errorMessage)
      expect(global.fetch).toHaveBeenCalledTimes(1) // Should not retry validation errors
    })

    it("should handle company not found errors from API", async () => {
      // Mock API company not found error
      const errorMessage = "La société rattachée n'existe pas"
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: jest.fn().mockResolvedValueOnce({ error: errorMessage }),
      })

      await expect(OperationService.createOperation(newOperation)).rejects.toThrow(errorMessage)
      expect(global.fetch).toHaveBeenCalledTimes(1) // Should not retry validation errors
    })

    it("should handle duplicate name errors from API", async () => {
      // Mock API duplicate name error
      const errorMessage = "Une opération portant le même nom existe déjà"
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: jest.fn().mockResolvedValueOnce({ error: errorMessage }),
      })

      await expect(OperationService.createOperation(newOperation)).rejects.toThrow(errorMessage)
      expect(global.fetch).toHaveBeenCalledTimes(1) // Should not retry validation errors
    })
  })
})

