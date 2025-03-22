import type { Request, Response } from "express"
import { OperationController } from "../../../src/infrastructure/http/controllers/operation-controller"
import type { CreateOperationUseCase } from "../../../src/application/use-cases/create-operation"
import type { GetAllOperationsUseCase } from "../../../src/application/use-cases/get-all-operations"
import { Operation } from "../../../src/domain/entities/operations"

describe("OperationController", () => {
  let operationController: OperationController
  let mockCreateOperationUseCase: jest.Mocked<CreateOperationUseCase>
  let mockGetAllOperationsUseCase: jest.Mocked<GetAllOperationsUseCase>
  let mockRequest: Partial<Request>
  let mockResponse: Partial<Response>
  let jsonSpy: jest.Mock
  let statusSpy: jest.Mock

  beforeEach(() => {
    // Create mock use cases
    mockCreateOperationUseCase = { execute: jest.fn() } as unknown as jest.Mocked<CreateOperationUseCase>
    mockGetAllOperationsUseCase = { execute: jest.fn() } as unknown as jest.Mocked<GetAllOperationsUseCase>

    // Create controller with mock use cases
    operationController = new OperationController(mockCreateOperationUseCase, mockGetAllOperationsUseCase)

    // Set up mock request and response
    jsonSpy = jest.fn().mockReturnValue({})
    statusSpy = jest.fn().mockReturnThis()

    mockRequest = {}
    mockResponse = {
      json: jsonSpy,
      status: statusSpy,
    }
  })

  describe("create", () => {
    const validRequestBody = {
      commercialName: "Test Operation",
      companyId: "company-123",
      deliveryDate: "2025-05-15",
      address: "123 Test St",
      availableLots: "10", // Passed as string, will be converted
    }

    it("should create an operation successfully", async () => {
      // Arrange
      mockRequest.body = validRequestBody
      mockCreateOperationUseCase.execute.mockResolvedValue("Nouvelle opération enregistrée")

      // Act
      await operationController.create(mockRequest as Request, mockResponse as Response)

      // Assert
      expect(mockCreateOperationUseCase.execute).toHaveBeenCalledWith({
        commercialName: "Test Operation",
        companyId: "company-123",
        deliveryDate: expect.any(Date),
        address: "123 Test St",
        availableLots: 10, // Ensure the conversion from string to number
      })
      expect(statusSpy).toHaveBeenCalledWith(201)
      expect(jsonSpy).toHaveBeenCalledWith({ message: "Nouvelle opération enregistrée" })
    })

    it("should handle errors and return 400 status", async () => {
      // Arrange
      mockRequest.body = validRequestBody
      const error = new Error("Validation error")
      mockCreateOperationUseCase.execute.mockRejectedValue(error)

      // Act
      await operationController.create(mockRequest as Request, mockResponse as Response)

      // Assert
      expect(statusSpy).toHaveBeenCalledWith(400)
      expect(jsonSpy).toHaveBeenCalledWith({ error: "Validation error" })
    })
  })

  describe("getAll", () => {
    const sampleOperations = [
      new Operation("op-1", "Operation 1", "company-1", new Date("2025-04-15"), "123 Main St", 5, 2),
      new Operation("op-2", "Operation 2", "company-2", new Date("2025-05-20"), "456 Second Ave", 10, 0),
    ]

    it("should return all operations with 200 status", async () => {
      // Arrange
      mockGetAllOperationsUseCase.execute.mockResolvedValue(sampleOperations)

      // Act
      await operationController.getAll(mockRequest as Request, mockResponse as Response)

      // Assert
      expect(mockGetAllOperationsUseCase.execute).toHaveBeenCalled()
      expect(statusSpy).toHaveBeenCalledWith(200)
      expect(jsonSpy).toHaveBeenCalledWith({ data: sampleOperations }) // ✅ Corrected response format
    })

    it("should return empty array with 200 status when no operations are found", async () => {
      // Arrange
      mockGetAllOperationsUseCase.execute.mockResolvedValue([])

      // Act
      await operationController.getAll(mockRequest as Request, mockResponse as Response)

      // Assert
      expect(statusSpy).toHaveBeenCalledWith(200)
      expect(jsonSpy).toHaveBeenCalledWith({ data: [] }) // ✅ Matches the controller's response
    })

    it("should handle errors and return 400 status", async () => {
      // Arrange
      const error = new Error("Database error")
      mockGetAllOperationsUseCase.execute.mockRejectedValue(error)

      // Act
      await operationController.getAll(mockRequest as Request, mockResponse as Response)

      // Assert
      expect(statusSpy).toHaveBeenCalledWith(400)
      expect(jsonSpy).toHaveBeenCalledWith({ error: "Database error" })
    })
  })
})
