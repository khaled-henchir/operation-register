import { Operation } from '../entities/operations';
import crypto from 'crypto';


/**
 * Factory for creating Operation instances.
 */
export class OperationFactory {
  /**
   * Creates a new Operation instance.
   * @param operationData - Data for the operation.
   * @param idGenerator - UUID generator for testing.
   */
  static create(
    operationData: {
      commercialName: string;
      companyId: string;
      deliveryDate: Date;
      address: string;
      availableLots: number;
    },
    idGenerator: () => string = crypto.randomUUID
  ): Operation {
    const id = idGenerator();
    return new Operation(
      id,
      operationData.commercialName,
      operationData.companyId,
      operationData.deliveryDate,
      operationData.address,
      operationData.availableLots
    );
  }
}