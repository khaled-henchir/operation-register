import { OperationFactory } from '../../domain/factories/operation-factory';
import { OperationRepository } from '../../domain/repositories/operation-repository';
import { OperationValidator } from '../../domain/validators/operation-validator';

/**
 * Use case for creating an operation.
 */
export class CreateOperationUseCase {
    constructor(private readonly operationRepository: OperationRepository) { }

    async execute(operationData: {
        commercialName: string;
        companyId: string;
        deliveryDate: Date;
        address: string;
        availableLots: number;
    }): Promise<string> {
        OperationValidator.validate({
            commercialName: operationData.commercialName,
            availableLots: operationData.availableLots,
        });

        const companyExists = await this.operationRepository.companyExists(operationData.companyId);
        if (!companyExists) {
            throw new Error("La société rattachée n'existe pas");
        }

        const nameExists = await this.operationRepository.existsByNameAndDateRange(
            operationData.commercialName,
            operationData.deliveryDate
        );
        if (nameExists) {
            throw new Error('Une opération portant le même nom existe déjà');
        }

        const operation = OperationFactory.create(operationData);
        await this.operationRepository.save(operation);

        return 'Nouvelle opération enregistrée';
    }
}