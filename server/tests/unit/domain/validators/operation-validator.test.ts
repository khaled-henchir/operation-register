import { OperationValidator } from '../../../../src/domain/validators/operation-validator';

describe('OperationValidator', () => {
  describe('validate', () => {
    it('should not throw error for valid operation data', () => {
      // Arrange
      const validData = {
        commercialName: 'Valid Operation',
        totalLots: 10
      };

      // Act & Assert
      expect(() => OperationValidator.validate(validData)).not.toThrow();
    });

    it('should throw error when commercialName exceeds 24 characters', () => {
      // Arrange
      const invalidData = {
        commercialName: 'This is a very long operation name that exceeds the limit',
        totalLots: 10
      };

      // Act & Assert
      expect(() => OperationValidator.validate(invalidData))
        .toThrow("Le nom d’une opération ne doit pas dépasser 24 caractères");
    });

    it('should throw error when available lots is negative', () => {
      // Arrange
      const invalidData = {
        commercialName: 'Valid Operation',
        totalLots: -5
      };

      // Act & Assert
      expect(() => OperationValidator.validate(invalidData))
        .toThrow('Le nombre de lots doit être positif');
    });

    it('should accept zero lots', () => {
      // Arrange
      const validData = {
        commercialName: 'Valid Operation',
        totalLots: 0
      };

      // Act & Assert
      expect(() => OperationValidator.validate(validData)).not.toThrow();
    });

    it('should handle exactly 24 characters for commercialName', () => {
      // Arrange
      const validData = {
        commercialName: 'Exactly24CharactersName',  // Exactly 24 characters
        totalLots: 10
      };

      // Act & Assert
      expect(() => OperationValidator.validate(validData)).not.toThrow();
    });
  });
});