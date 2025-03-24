import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import type { Request, Response } from 'express';
import { OperationController } from '../../../../src/infrastructure/http/controllers/operation-controller';

describe('OperationController', () => {
  let operationController: OperationController;
  let mockCreateOperationUseCase: any;
  let mockGetAllOperationsUseCase: any;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    // Create mock implementations
    mockCreateOperationUseCase = {
      execute: jest.fn()
    };

    mockGetAllOperationsUseCase = {
      execute: jest.fn()
    };

    // Create controller with mocked dependencies
    operationController = new OperationController(
      mockCreateOperationUseCase,
      mockGetAllOperationsUseCase
    );

    // Set up request and response mocks
    jsonMock = jest.fn().mockReturnThis();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    
    mockRequest = {};
    mockResponse = {
      status: statusMock,
      json: jsonMock,
    };
  });

  describe('create', () => {
    it('should create a new operation and return status 201', async () => {
      // Arrange
      const mockRequestBody = {
        commercialName: 'Test Operation',
        companyId: 'company-123',
        deliveryDate: '2025-04-01T00:00:00.000Z',
        address: '123 Test Street',
        availableLots: '10',
      };

      const expectedArgs = {
        commercialName: 'Test Operation',
        companyId: 'company-123',
        deliveryDate: new Date('2025-04-01T00:00:00.000Z'),
        address: '123 Test Street',
        availableLots: 10,
      };

      mockRequest.body = mockRequestBody;
      mockCreateOperationUseCase.execute.mockResolvedValue('Operation created successfully');

      // Act
      await operationController.create(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockCreateOperationUseCase.execute).toHaveBeenCalledWith(expectedArgs);
      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith({ message: 'Operation created successfully' });
    });

    it('should handle validation errors and return status 400', async () => {
      // Arrange
      mockRequest.body = {
        // Invalid or missing data
        commercialName: '', // Empty name
        companyId: 'company-123',
      };
      
      const errorMessage = 'Commercial name is required';
      mockCreateOperationUseCase.execute.mockRejectedValue(new Error(errorMessage));

      // Act
      await operationController.create(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ error: errorMessage });
    });
  });

  describe('getAll', () => {
    it('should return all operations with status 200', async () => {
      // Arrange
      const mockOperations = [
        {
          id: 'op-1',
          commercialName: 'Operation 1',
          companyId: 'company-123',
          deliveryDate: new Date('2025-04-01'),
          address: '123 Test Street',
          availableLots: 10,
          reservedLots: 0,
        },
        {
          id: 'op-2',
          commercialName: 'Operation 2',
          companyId: 'company-456',
          deliveryDate: new Date('2025-04-15'),
          address: '456 Test Avenue',
          availableLots: 5,
          reservedLots: 2,
        },
      ];

      mockGetAllOperationsUseCase.execute.mockResolvedValue(mockOperations);

      // Act
      await operationController.getAll(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockGetAllOperationsUseCase.execute).toHaveBeenCalled();
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({ data: mockOperations });
    });

    it('should return empty array when no operations exist', async () => {
      // Arrange
      mockGetAllOperationsUseCase.execute.mockResolvedValue([]);

      // Act
      await operationController.getAll(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({ data: [] });
    });

    it('should handle database errors and return status 500', async () => {
      // Arrange
      const errorMessage = 'Database connection failed';
      mockGetAllOperationsUseCase.execute.mockRejectedValue(new Error(errorMessage));

      // Act
      await operationController.getAll(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({ error: errorMessage });
    });
  });
});