import { Operation } from '../../../../src/domain/entities/operations';

describe('Operation Entity', () => {
  it('should create an operation with all required properties', () => {
    // Arrange
    const id = '123';
    const commercialName = 'Test Operation';
    const companyId = 'company-456';
    const deliveryDate = new Date('2025-05-01');
    const address = '123 Test Street, City';
    const totalLots = 10;
    const reservedLots = 2;

    // Act
    const operation = new Operation(
      id,
      commercialName,
      companyId,
      deliveryDate,
      address,
      totalLots,
      reservedLots
    );

    // Assert
    expect(operation).toBeInstanceOf(Operation);
    expect(operation.id).toBe(id);
    expect(operation.commercialName).toBe(commercialName);
    expect(operation.companyId).toBe(companyId);
    expect(operation.deliveryDate).toBe(deliveryDate);
    expect(operation.address).toBe(address);
    expect(operation.totalLots).toBe(totalLots);
    expect(operation.reservedLots).toBe(reservedLots);
  });

  it('should set reservedLots to 0 by default if not provided', () => {
    // Arrange
    const id = '123';
    const commercialName = 'Test Operation';
    const companyId = 'company-456';
    const deliveryDate = new Date('2025-05-01');
    const address = '123 Test Street, City';
    const totalLots = 10;

    // Act
    const operation = new Operation(
      id,
      commercialName,
      companyId,
      deliveryDate,
      address,
      totalLots
    );

    // Assert
    expect(operation.reservedLots).toBe(0);
  });
});
