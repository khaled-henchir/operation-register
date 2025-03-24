import { PrismaClient } from '@prisma/client';
import { Operation } from '../../../../src/domain/entities/operations';
import { PrismaOperationRepository } from '../../../../src/infrastructure/persistence/prisma-operation-repository';
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';

describe('PrismaOperationRepository', () => {
  let prismaMock: DeepMockProxy<PrismaClient>;
  let repository: PrismaOperationRepository;

  const mockOperation: Operation = {
    id: '1',
    commercialName: 'Test Operation',
    companyId: 'company-1',
    deliveryDate: new Date('2023-01-01'),
    address: '123 Test St',
    availableLots: 10,
    reservedLots: 2,
  };

  beforeEach(() => {
    prismaMock = mockDeep<PrismaClient>();
    repository = new PrismaOperationRepository(prismaMock);
  });

  afterEach(() => {
    mockReset(prismaMock);
  });

  describe('save', () => {
    it('should save an operation successfully', async () => {
      prismaMock.operation.create.mockResolvedValue(mockOperation);

      await repository.save(mockOperation);

      expect(prismaMock.operation.create).toHaveBeenCalledWith({
        data: {
          id: mockOperation.id,
          commercialName: mockOperation.commercialName,
          companyId: mockOperation.companyId,
          deliveryDate: mockOperation.deliveryDate,
          address: mockOperation.address,
          availableLots: mockOperation.availableLots,
          reservedLots: mockOperation.reservedLots,
        },
      });
    });

    it('should throw error when prisma fails', async () => {
      prismaMock.operation.create.mockRejectedValue(new Error('DB Error'));

      await expect(repository.save(mockOperation)).rejects.toThrow('DB Error');
    });
  });

  describe('existsByNameAndDateRange', () => {
    it('should return true when operation exists within date range', async () => {
      const testDate = new Date('2023-01-01');
      prismaMock.operation.count.mockResolvedValue(1);

      const result = await repository.existsByNameAndDateRange('Test Operation', testDate);

      expect(result).toBe(true);
      expect(prismaMock.operation.count).toHaveBeenCalledWith({
        where: {
          commercialName: 'Test Operation',
          deliveryDate: {
            gte: new Date(testDate.getTime() - 10 * 365 * 24 * 60 * 60 * 1000),
            lte: new Date(testDate.getTime() + 10 * 365 * 24 * 60 * 60 * 1000),
          },
        },
      });
    });

    it('should return false when operation does not exist', async () => {
      prismaMock.operation.count.mockResolvedValue(0);

      const result = await repository.existsByNameAndDateRange('Non-existent', new Date());

      expect(result).toBe(false);
    });
  });

  describe('companyExists', () => {
    it('should return true when company exists', async () => {
      prismaMock.company.count.mockResolvedValue(1);

      const result = await repository.companyExists('existing-company');

      expect(result).toBe(true);
      expect(prismaMock.company.count).toHaveBeenCalledWith({
        where: { id: 'existing-company' },
      });
    });

    it('should return false when company does not exist', async () => {
      prismaMock.company.count.mockResolvedValue(0);

      const result = await repository.companyExists('non-existent-company');

      expect(result).toBe(false);
    });
  });

  describe('getAll', () => {
    it('should return all operations', async () => {
      const mockOperations = [mockOperation, mockOperation];
      prismaMock.operation.findMany.mockResolvedValue(mockOperations);

      const result = await repository.getAll();

      expect(result).toEqual(mockOperations);
      expect(prismaMock.operation.findMany).toHaveBeenCalled();
    });

    it('should return empty array when no operations exist', async () => {
      prismaMock.operation.findMany.mockResolvedValue([]);

      const result = await repository.getAll();

      expect(result).toEqual([]);
    });
  });
});