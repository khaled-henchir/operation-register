/**
 * Validator for Operation data.
 */
export class OperationValidator {
    /**
     * Validates the operation data.
     * @param data - Data to validate.
     */
    static validate(data: {
      commercialName: string;
      availableLots: number;
    }): void {
      if (data.commercialName.length > 24) {
        throw new Error('Le nom d’une opération ne doit pas dépasser 24 caractères');
      }
      if (data.availableLots < 0) {
        throw new Error('Le nombre de lots doit être positif');
      }
    }
  }