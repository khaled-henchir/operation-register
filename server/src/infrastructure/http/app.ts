import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { PrismaOperationRepository } from '../persistence/prisma-operation-repository';
import { CreateOperationUseCase } from '../../application/use-cases/create-operation';
import { GetAllOperationsUseCase } from '../../application/use-cases/get-all-operations';
import { OperationController } from './controllers/operation-controller';
import { setupSwagger } from './swagger';
import { setupOperationRoutes } from './routes/operation-routes';

/**
 * Creates and configures the Express server.
 */
export function createServer(): express.Application {
  const app = express();
  app.use(cors());
  app.use(express.json());

  const prisma = new PrismaClient();
  const operationRepository = new PrismaOperationRepository(prisma);
  
  const createOperationUseCase = new CreateOperationUseCase(operationRepository);
  const getAllOperationsUseCase = new GetAllOperationsUseCase(operationRepository);

  const operationController = new OperationController(createOperationUseCase, getAllOperationsUseCase);

  app.use(setupOperationRoutes(operationController));

  setupSwagger(app);
  return app;
}
