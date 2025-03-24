import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import type { Request, Response } from 'express';
import { OperationController } from '../../../src/infrastructure/http/controllers/operation-controller';
import { CreateOperationUseCase } from '../../../src/application/use-cases/create-operation';
import { GetAllOperationsUseCase } from '../../../src/application/use-cases/get-all-operations';

// Mock implementations
jest.mock('../../../src/application/use-cases/create-operation');
jest.mock('../../../src/application/use-cases/get-all-operations');

describe('OperationController', () => {
  let operationController: OperationController;
  let mockCreateOperationUseCase: jest.Mocked<CreateOperationUseCase>;
  let mockGetAllOperationsUseCase: jest.Mocked<GetAllOperationsUseCase>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    // Reset mocks
    mockCreateOperationUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<CreateOperationUseCase>;

    mockGetAllOperationsUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<GetAllOperationsUseCase>;

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

    it('should handle errors and return status 400', async () => {
      // Arrange
      mockRequest.body = {
        // Invalid or missing data
      };
      const errorMessage = 'Required fields are missing';
      mockCreateOperationUseCase.execute.mockRejectedValue(new Error(errorMessage));

      // Act
      await operationController.create(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ error: errorMessage });
    });
  });

  describe('getAll', () => {
    it('should return all operations with status 200 when operations exist', async () => {
      // Arrange
      const mockOperations = [
        {
          id: 'op-1',
          commercialName: 'Operation 1',
          companyId: 'company-123',
          deliveryDate: new Date('2025-04-01'),
          address: '123 Test Street',
          totalLots: 10,
        },
        {
          id: 'op-2',
          commercialName: 'Operation 2',
          companyId: 'company-456',
          deliveryDate: new Date('2025-04-15'),
          address: '456 Test Avenue',
          totalLots: 5,
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

    it('should return empty array with status 200 when no operations exist', async () => {
      // Arrange
      mockGetAllOperationsUseCase.execute.mockResolvedValue([]);

      // Act
      await operationController.getAll(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockGetAllOperationsUseCase.execute).toHaveBeenCalled();
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({ data: [], count: 0 });
    });

    it('should handle errors and return status 400', async () => {
      // Arrange
      const errorMessage = 'Database connection error';
      mockGetAllOperationsUseCase.execute.mockRejectedValue(new Error(errorMessage));

      // Act
      await operationController.getAll(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ error: errorMessage });
    });
  });
});
