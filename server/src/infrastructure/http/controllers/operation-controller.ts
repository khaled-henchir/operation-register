import type { Request, Response } from "express"
import type { CreateOperationUseCase } from "../../../application/use-cases/create-operation"
import type { GetAllOperationsUseCase } from "../../../application/use-cases/get-all-operations"

/**
 * Controller for operation-related HTTP requests.
 */
export class OperationController {
  constructor(
    private readonly createOperationUseCase: CreateOperationUseCase,
    private readonly getAllOperationsUseCase: GetAllOperationsUseCase,
  ) {}

  // Create a new operation
  async create(req: Request, res: Response): Promise<void> {
    try {
      const { commercialName, companyId, deliveryDate, address, availableLots } = req.body

      const result = await this.createOperationUseCase.execute({
        commercialName,
        companyId,
        deliveryDate: new Date(deliveryDate),
        address,
        availableLots: Number(availableLots),
      })

      res.status(201).json({ message: result })
    } catch (error: any) {
      res.status(400).json({ error: error.message })
    }
  }

  // Get all operations
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const operations = await this.getAllOperationsUseCase.execute()

      if (operations && operations.length > 0) {
        res.status(200).json({ data: operations })
      } else {
        res.status(200).json({ data: [], count: 0 }) 
      }
      
    } catch (error: any) {
      res.status(400).json({ error: error.message })
    }
  }
}



