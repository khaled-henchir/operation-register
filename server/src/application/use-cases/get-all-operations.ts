import type { OperationRepository } from "../../domain/repositories/operation-repository"
import type { Operation } from "../../domain/entities/operations"

/**
 * Use case for getting all operations.
 */
export class GetAllOperationsUseCase {
  constructor(private readonly operationRepository: OperationRepository) {}

  async execute(): Promise<Operation[]> {
    try {
      const operations = await this.operationRepository.getAll()
      
      // Ne pas lancer d'erreur si aucune opération n'est trouvée
      return operations
    } catch (error: any) {
      const errorMessage = error.message || "undefined"
      throw new Error(`Error fetching operations: ${errorMessage}`)
    }
  }
}

