import { GetAllOperationsUseCase } from "../../../../src/application/use-cases/get-all-operations"
import type { OperationRepository } from "../../../../src/domain/repositories/operation-repository"
import { Operation } from "../../../../src/domain/entities/operations"
import { afterEach, beforeEach, describe, expect, it, jest } from "@jest/globals"

describe("GetAllOperationsUseCase", () => {
  let getAllOperationsUseCase: GetAllOperationsUseCase
  let mockOperationRepository: jest.Mocked<OperationRepository>

  // Sample operations for testing
  const sampleOperations: Operation[] = [
    new Operation("op-1", "Operation 1", "company-1", new Date("2025-04-15"), "123 Main St", 5, 2),
    new Operation("op-2", "Operation 2", "company-2", new Date("2025-05-20"), "456 Second Ave", 10, 0),
  ]

  beforeEach(() => {
    // Create mock repository
    mockOperationRepository = {
      getAll: jest.fn(),
      save: jest.fn(),
      companyExists: jest.fn(),
      existsByNameAndDateRange: jest.fn(),
    }

    // Create use case with mock repository
    getAllOperationsUseCase = new GetAllOperationsUseCase(mockOperationRepository)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it("should return operations when they exist", async () => {
    // Arrange
    mockOperationRepository.getAll.mockResolvedValue(sampleOperations)

    // Act
    const result = await getAllOperationsUseCase.execute()

    // Assert
    expect(mockOperationRepository.getAll).toHaveBeenCalled()
    expect(result).toEqual(sampleOperations)
    expect(result.length).toBe(2)
  })

  it("should return empty array when no operations exist", async () => {
    // Arrange
    mockOperationRepository.getAll.mockResolvedValue([])

    // Act
    const result = await getAllOperationsUseCase.execute()

    // Assert
    expect(result).toEqual([])
    expect(mockOperationRepository.getAll).toHaveBeenCalled()
  })

  it("should propagate and wrap repository errors", async () => {
    // Arrange
    const repositoryError = new Error("Database connection failed")
    mockOperationRepository.getAll.mockRejectedValue(repositoryError)

    // Act & Assert
    await expect(getAllOperationsUseCase.execute()).rejects.toThrow(
      "Error fetching operations: Database connection failed",
    )

    expect(mockOperationRepository.getAll).toHaveBeenCalled()
  })

  it("should handle errors without messages", async () => {
    // Arrange
    mockOperationRepository.getAll.mockRejectedValue("Some non-error rejection")

    // Act & Assert
    await expect(getAllOperationsUseCase.execute()).rejects.toThrow("Error fetching operations: undefined")

    expect(mockOperationRepository.getAll).toHaveBeenCalled()
  })
})

