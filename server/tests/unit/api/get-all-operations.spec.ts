import { GetAllOperationsUseCase } from "../../../src/application/use-cases/get-all-operations"
import type { OperationRepository } from "../../../src/domain/repositories/operation-repository"
import { Operation } from "../../../src/domain/entities/operations"
import { describe, beforeEach, it, expect, jest } from "@jest/globals"

jest.mock("../../../src/domain/repositories/operation-repository")
jest.mock("../../../src/domain/factories/operation-factory")

describe("GetAllOperationsUseCase", () => {
  let getAllOperationsUseCase: GetAllOperationsUseCase
  let operationRepository: jest.Mocked<OperationRepository>

  beforeEach(() => {
    operationRepository = {
      getAll: jest.fn(),
      save: jest.fn(),
      companyExists: jest.fn(),
      existsByNameAndDateRange: jest.fn(),
    } as jest.Mocked<OperationRepository>
    getAllOperationsUseCase = new GetAllOperationsUseCase(operationRepository)
  })

  it("should return an empty array if no operations are found", async () => {
    // Arrange
    operationRepository.getAll.mockResolvedValue([])

    // Act
    const result = await getAllOperationsUseCase.execute()

    // Assert
    expect(result).toEqual([])
  })

  it("should fetch operations successfully", async () => {
    // Arrange
    const mockOperations: Operation[] = [
      new Operation("op-1", "Opération 1", "company-id-1", new Date(), "123 Street", 5, 0),
      new Operation("op-2", "Opération 2", "company-id-2", new Date(), "456 Avenue", 10, 0),
    ]

    operationRepository.getAll.mockResolvedValue(mockOperations)

    // Act
    const result = await getAllOperationsUseCase.execute()

    // Assert
    expect(result).toEqual(mockOperations)
  })

  it("should throw an error if there is an error fetching operations", async () => {
    // Arrange
    const errorMessage = "Database error"
    operationRepository.getAll.mockRejectedValue(new Error(errorMessage))

    // Act and Assert
    await expect(getAllOperationsUseCase.execute()).rejects.toThrow(`Error fetching operations: ${errorMessage}`)
  })
})

