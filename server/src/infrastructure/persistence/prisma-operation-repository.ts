import { PrismaClient } from '@prisma/client';
import { Operation } from '../../domain/entities/operations';
import { OperationRepository } from '../../domain/repositories/operation-repository';

/**
 * Prisma implementation of OperationRepository.
 */
export class PrismaOperationRepository implements OperationRepository {
  constructor(private prisma: PrismaClient) {}

  async save(operation: Operation): Promise<void> {
    await this.prisma.operation.create({
      data: {
        id: operation.id,
        commercialName: operation.commercialName,
        companyId: operation.companyId,
        deliveryDate: operation.deliveryDate,
        address: operation.address,
        availableLots: operation.availableLots,
        reservedLots: operation.reservedLots,
      },
    });
  }

  async existsByNameAndDateRange(
    commercialName: string,
    deliveryDate: Date
  ): Promise<boolean> {
    const tenYears = 10 * 365 * 24 * 60 * 60 * 1000;
    const count = await this.prisma.operation.count({
      where: {
        commercialName,
        deliveryDate: {
          gte: new Date(deliveryDate.getTime() - tenYears),
          lte: new Date(deliveryDate.getTime() + tenYears),
        },
      },
    });
    return count > 0;
  }

  async companyExists(companyId: string): Promise<boolean> {
    const count = await this.prisma.company.count({
      where: { id: companyId },
    });
    return count > 0;
  }

  async getAll(): Promise<Operation[]> {
    return this.prisma.operation.findMany();  
  }
}