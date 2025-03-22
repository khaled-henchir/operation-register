import { CreateOperationUseCase } from '../../../src/application/use-cases/create-operation';
import { OperationRepository } from '../../../src/domain/repositories/operation-repository';
import { OperationValidator } from '../../../src/domain/validators/operation-validator';
import { OperationFactory } from '../../../src/domain/factories/operation-factory';

jest.mock('../../../src/domain/repositories/operation-repository');
jest.mock('../../../src/domain/validators/operation-validator'); 
jest.mock('../../../src/domain/factories/operation-factory');

describe('CreateOperationUseCase', () => {
    let createOperationUseCase: CreateOperationUseCase; 
    let operationRepository: jest.Mocked<OperationRepository>; 
    
    beforeEach(() => {
        operationRepository = {
            save: jest.fn(),
            companyExists: jest.fn(),
            existsByNameAndDateRange: jest.fn(),
            getAll: jest.fn()
        } as jest.Mocked<OperationRepository>;

        createOperationUseCase = new CreateOperationUseCase(operationRepository);
    });

    it('should throw an error if the company does not exist', async () => {
        // Arrange 
        const operationData = {
            commercialName: 'Opération 1',
            companyId: 'non-existing-company',
            deliveryDate: new Date(),
            address: '123 Street',
            totalLots: 10,
        };

        (operationRepository.companyExists as jest.Mock).mockResolvedValue(false);

        // Act and Assert 
        await expect(createOperationUseCase.execute(operationData))
            .rejects
            .toThrow('La société rattachée n’existe pas');
    });
    
    it('should throw an error if an operation with the same name and date exists', async () => {
        // Arrange
        const operationData = {
            commercialName: 'Opération 1',
            companyId: 'existing-company', 
            deliveryDate: new Date(),
            address: '123 Street',
            totalLots: 10,
        };
        
        (operationRepository.companyExists as jest.Mock).mockResolvedValue(true);
        (operationRepository.existsByNameAndDateRange as jest.Mock).mockResolvedValue(true);
        
        // Act and Assert
        await expect(createOperationUseCase.execute(operationData))
            .rejects
            .toThrow('Une opération portant le même nom existe déjà');
    });

    it('should successfully create a new operation and save it', async () => {
        // Arrange
        const operationData = {
            commercialName: 'Opération 1',
            companyId: 'existing-company', 
            deliveryDate: new Date(),
            address: '123 Street',
            totalLots: 10,
        };

        (operationRepository.companyExists as jest.Mock).mockResolvedValue(true);
        (operationRepository.existsByNameAndDateRange as jest.Mock).mockResolvedValue(false);
        (OperationFactory.create as jest.Mock).mockReturnValue({}); // Mock the operation created by the factory
        (operationRepository.save as jest.Mock).mockResolvedValue(undefined);

        // Act
        const result = await createOperationUseCase.execute(operationData);

        // Assert
        expect(result).toBe('Nouvelle opération enregistrée');
        expect(operationRepository.save).toHaveBeenCalled();
        expect(OperationFactory.create).toHaveBeenCalledWith(operationData);
    });

    it('should validate the operation data correctly', async () => {
        // Arrange
        const operationData = {
            commercialName: 'Opération 1',
            companyId: 'existing-company',
            deliveryDate: new Date(),
            address: '123 Street',
            totalLots: 10,
        };

        (operationRepository.companyExists as jest.Mock).mockResolvedValue(true);
        (operationRepository.existsByNameAndDateRange as jest.Mock).mockResolvedValue(false);

        // Mock the validate method to simply track calls
        const validateMock = jest.spyOn(OperationValidator, 'validate').mockImplementation(() => {});

        // Act
        await createOperationUseCase.execute(operationData);

        // Assert
        expect(validateMock).toHaveBeenCalledWith({
            commercialName: operationData.commercialName,
            totalLots: operationData.totalLots,
        });
    });
});
