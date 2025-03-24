import { OperationRepository } from '../../../../src/domain/repositories/operation-repository';
import { Operation } from '../../../../src/domain/entities/operations';

// Create a mock implementation of the interface for testing
class MockOperationRepository implements OperationRepository {
  private operations: Operation[] = [];
  private companies: Set<string> = new Set(['company-1', 'company-2']);

  async save(operation: Operation): Promise<void> {
    this.operations.push(operation);
  }

  async existsByNameAndDateRange(
    commercialName: string,
    deliveryDate: Date
  ): Promise<boolean> {
    // Check if operation exists within the same month
    return this.operations.some(op => 
      op.commercialName === commercialName && 
      op.deliveryDate.getMonth() === deliveryDate.getMonth() &&
      op.deliveryDate.getFullYear() === deliveryDate.getFullYear()
    );
  }

  async companyExists(companyId: string): Promise<boolean> {
    return this.companies.has(companyId);
  }

  async getAll(): Promise<Operation[]> {
    return [...this.operations];
  }
}

describe('OperationRepository Interface', () => {
  let repository: OperationRepository;
  
  const sampleOperation = new Operation(
    'op-1',
    'Test Operation',
    'company-1',
    new Date('2025-05-15'),
    '123 Test St',
    10,
    0
  );

  beforeEach(() => {
    repository = new MockOperationRepository();
  });

  it('should save an operation', async () => {
    // Act
    await repository.save(sampleOperation);
    const operations = await repository.getAll();
    
    // Assert
    expect(operations).toHaveLength(1);
    expect(operations[0]).toEqual(sampleOperation);
  });

  it('should check if a company exists', async () => {
    // Act & Assert
    expect(await repository.companyExists('company-1')).toBe(true);
    expect(await repository.companyExists('non-existent')).toBe(false);
  });

  it('should check if operation exists by name and date range', async () => {
    // Arrange
    await repository.save(sampleOperation);
    
    // Act & Assert - Same month
    expect(await repository.existsByNameAndDateRange(
      'Test Operation',
      new Date('2025-05-20')
    )).toBe(true);
    
    // Act & Assert - Different month
    expect(await repository.existsByNameAndDateRange(
      'Test Operation',
      new Date('2025-06-15')
    )).toBe(false);
    
    // Act & Assert - Different name
    expect(await repository.existsByNameAndDateRange(
      'Different Operation',
      new Date('2025-05-15')
    )).toBe(false);
  });

  it('should retrieve all operations', async () => {
    // Arrange
    const operation1 = sampleOperation;
    const operation2 = new Operation(
      'op-2',
      'Another Operation',
      'company-2',
      new Date('2025-06-10'),
      '456 Other St',
      5,
      1
    );
    
    await repository.save(operation1);
    await repository.save(operation2);
    
    // Act
    const operations = await repository.getAll();
    
    // Assert
    expect(operations).toHaveLength(2);
    expect(operations).toContainEqual(operation1);
    expect(operations).toContainEqual(operation2);
  });
});