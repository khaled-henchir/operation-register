import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import { CreateOperationUseCase } from '../../../../src/application/use-cases/create-operation';
import { OperationRepository } from '../../../../src/domain/repositories/operation-repository';
import { OperationFactory } from '../../../../src/domain/factories/operation-factory';
import { OperationValidator } from '../../../../src/domain/validators/operation-validator';

// Mock the dependencies
jest.mock('../../../../src/domain/factories/operation-factory');
jest.mock('../../../../src/domain/validators/operation-validator');
jest.mock('../../../../src/domain/repositories/operation-repository');

describe('CreateOperationUseCase', () => {
  let createOperationUseCase: CreateOperationUseCase;
  let mockOperationRepository: jest.Mocked<OperationRepository>;
  
  const validOperationData = {
    commercialName: 'Test Operation',
    companyId: 'company-123',
    deliveryDate: new Date('2025-04-01'),
    address: '123 Test Street',
    availableLots: 10,
  };
  
  const mockOperation = {
    id: 'op-123',
    ...validOperationData,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Setup repository mock
    mockOperationRepository = {
      companyExists: jest.fn(),
      existsByNameAndDateRange: jest.fn(),
      save: jest.fn(),
    } as unknown as jest.Mocked<OperationRepository>;
    
    // Setup factory mock
    (OperationFactory.create as jest.Mock).mockReturnValue(mockOperation);
    
    // Create use case instance with mocked repository
    createOperationUseCase = new CreateOperationUseCase(mockOperationRepository);
  });

  it('should create an operation successfully', async () => {
    // Arrange
    mockOperationRepository.companyExists.mockResolvedValue(true);
    mockOperationRepository.existsByNameAndDateRange.mockResolvedValue(false);
    mockOperationRepository.save.mockResolvedValue(undefined);
    
    // Act
    const result = await createOperationUseCase.execute(validOperationData);
    
    // Assert
    expect(OperationValidator.validate).toHaveBeenCalledWith({
      commercialName: validOperationData.commercialName,
      availableLots: validOperationData.availableLots,
    });
    expect(mockOperationRepository.companyExists).toHaveBeenCalledWith(validOperationData.companyId);
    expect(mockOperationRepository.existsByNameAndDateRange).toHaveBeenCalledWith(
      validOperationData.commercialName,
      validOperationData.deliveryDate
    );
    expect(OperationFactory.create).toHaveBeenCalledWith(validOperationData);
    expect(mockOperationRepository.save).toHaveBeenCalledWith(mockOperation);
    expect(result).toBe('Nouvelle opération enregistrée');
  });

  it('should throw an error if operation validation fails', async () => {
    // Arrange
    const validationError = new Error('Validation failed');
    (OperationValidator.validate as jest.Mock).mockImplementation(() => {
      throw validationError;
    });
    
    // Act & Assert
    await expect(createOperationUseCase.execute(validOperationData))
      .rejects.toThrow(validationError);
      
    expect(mockOperationRepository.companyExists).not.toHaveBeenCalled();
    expect(mockOperationRepository.existsByNameAndDateRange).not.toHaveBeenCalled();
    expect(OperationFactory.create).not.toHaveBeenCalled();
    expect(mockOperationRepository.save).not.toHaveBeenCalled();
  });

  it('should throw an error if company does not exist', async () => {
    // Arrange
    mockOperationRepository.companyExists.mockResolvedValue(false);
    
    // Act & Assert
    await expect(createOperationUseCase.execute(validOperationData))
      .rejects.toThrow("La société rattachée n'existe pas");
      
    expect(OperationValidator.validate).toHaveBeenCalled();
    expect(mockOperationRepository.companyExists).toHaveBeenCalled();
    expect(mockOperationRepository.existsByNameAndDateRange).not.toHaveBeenCalled();
    expect(OperationFactory.create).not.toHaveBeenCalled();
    expect(mockOperationRepository.save).not.toHaveBeenCalled();
  });

  it('should throw an error if operation with same name already exists in date range', async () => {
    // Arrange
    mockOperationRepository.companyExists.mockResolvedValue(true);
    mockOperationRepository.existsByNameAndDateRange.mockResolvedValue(true);
    
    // Act & Assert
    await expect(createOperationUseCase.execute(validOperationData))
      .rejects.toThrow('Une opération portant le même nom existe déjà');
      
    expect(OperationValidator.validate).toHaveBeenCalled();
    expect(mockOperationRepository.companyExists).toHaveBeenCalled();
    expect(mockOperationRepository.existsByNameAndDateRange).toHaveBeenCalled();
    expect(OperationFactory.create).not.toHaveBeenCalled();
    expect(mockOperationRepository.save).not.toHaveBeenCalled();
  });

  it('should propagate repository save errors', async () => {
    // Arrange
    const saveError = new Error('Database error');
    mockOperationRepository.companyExists.mockResolvedValue(true);
    mockOperationRepository.existsByNameAndDateRange.mockResolvedValue(false);
    mockOperationRepository.save.mockRejectedValue(saveError);
    
    // Act & Assert
    await expect(createOperationUseCase.execute(validOperationData))
      .rejects.toThrow(saveError);
      
    expect(OperationValidator.validate).toHaveBeenCalled();
    expect(mockOperationRepository.companyExists).toHaveBeenCalled();
    expect(mockOperationRepository.existsByNameAndDateRange).toHaveBeenCalled();
    expect(OperationFactory.create).toHaveBeenCalled();
    expect(mockOperationRepository.save).toHaveBeenCalled();
  });
});
