import { Operation } from '../entities/operations';

/**
 * Interface for Operation repository.
 */
export interface OperationRepository {
  save(operation: Operation): Promise<void>;
  existsByNameAndDateRange(
    commercialName: string,
    deliveryDate: Date
  ): Promise<boolean>;
  companyExists(companyId: string): Promise<boolean>;
  getAll(): Promise<Operation[]>;
}

