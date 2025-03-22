/**
 * Represents an Operation entity.
 */
export class Operation {
    constructor(
      public readonly id: string,
      public readonly commercialName: string,
      public readonly companyId: string,
      public readonly deliveryDate: Date,
      public readonly address: string,
      public readonly availableLots: number,
      public readonly reservedLots: number = 0
    ) {}
  }