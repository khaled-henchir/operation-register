import { CreateOperationUseCase } from '../../../../src/application/use-cases/create-operation';
import { OperationRepository } from '../../../../src/domain/repositories/operation-repository';
import { OperationFactory } from '../../../../src/domain/factories/operation-factory';
import { Operation } from '../../../../src/domain/entities/operations';
import { OperationValidator } from '../../../../src/domain/validators/operation-validator';

// Mock dependencies
jest.mock('../../../../src/domain/factories/operation-factory');
jest.mock('../../../../src/domain/validators/operation-validator');

describe('CreateOperationUseCase', () => {
  let createOperationUseCase: CreateOperationUseCase;
  let mockOperationRepository: jest.Mocked<OperationRepository>;
  
  const validOperationData = {
    commercialName: 'Test Operation',
    companyId: 'company-123',
    deliveryDate: new Date('2025-05-01'),
    address: '123 Test Street',
    totalLots: 10
  };
  
  const mockOperation = new Operation(
    'operation-123',
    validOperationData.commercialName,
    validOperationData.companyId,
    validOperationData.deliveryDate,
    validOperationData.address,
    validOperationData.totalLots
  );

  beforeEach(() => {
    // Create mock repository
    mockOperationRepository = {
      save: jest.fn().mockResolvedValue(undefined),
      companyExists: jest.fn().mockResolvedValue(true),
      existsByNameAndDateRange: jest.fn().mockResolvedValue(false),
      getAll: jest.fn()
    };
    
    // Create use case with mock repository
    createOperationUseCase = new CreateOperationUseCase(mockOperationRepository);
    
    // Mock factory create method
    (OperationFactory.create as jest.Mock).mockReturnValue(mockOperation);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully create an operation when all validations pass', async () => {
    // Act
    const result = await createOperationUseCase.execute(validOperationData);
    
    // Assert
    expect(OperationValidator.validate).toHaveBeenCalledWith({
      commercialName: validOperationData.commercialName,
      totalLots: validOperationData.totalLots
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

  it('should throw error when company does not exist', async () => {
    // Arrange
    mockOperationRepository.companyExists.mockResolvedValue(false);
    
    // Act & Assert
    await expect(createOperationUseCase.execute(validOperationData))
      .rejects
      .toThrow("La société rattachée n’existe pas");
    
    // Verify save was not called
    expect(mockOperationRepository.save).not.toHaveBeenCalled();
  });

  it('should throw error when operation with same name already exists', async () => {
    // Arrange
    mockOperationRepository.existsByNameAndDateRange.mockResolvedValue(true);
    
    // Act & Assert
    await expect(createOperationUseCase.execute(validOperationData))
      .rejects
      .toThrow('Une opération portant le même nom existe déjà');
    
    // Verify save was not called
    expect(mockOperationRepository.save).not.toHaveBeenCalled();
  });

  it('should propagate validation errors from OperationValidator', async () => {
    // Arrange
    const validationError = new Error('Validation error');
    (OperationValidator.validate as jest.Mock).mockImplementation(() => {
      throw validationError;
    });
    
    // Act & Assert
    await expect(createOperationUseCase.execute(validOperationData))
      .rejects
      .toThrow(validationError);
    
    // Verify subsequent methods were not called
    expect(mockOperationRepository.companyExists).not.toHaveBeenCalled();
    expect(mockOperationRepository.save).not.toHaveBeenCalled();
  });
});
