import { PrismaClient } from "@prisma/client"
import { PrismaOperationRepository } from "../../src/infrastructure/persistence/prisma-operation-repository"
import { OperationFactory } from "../../src/domain/factories/operation-factory"
import { CompanyFactory } from "../../src/domain/factories/company-factory"
import { describe, beforeAll, afterAll, it, expect } from "@jest/globals"

describe("PrismaOperationRepository Integration Tests", () => {
  let prisma: PrismaClient
  let repository: PrismaOperationRepository

  beforeAll(async () => {
    prisma = new PrismaClient()
    repository = new PrismaOperationRepository(prisma)

    // Nettoyer la base de données avant les tests
    await prisma.operation.deleteMany()
    await prisma.company.deleteMany()

    // Créer une société de test
    const testCompany = CompanyFactory.create({ id: "test-company", name: "Test Company" })
    await prisma.company.create({
      data: {
        id: testCompany.id,
        name: testCompany.name,
      },
    })
  })

  afterAll(async () => {
    // Nettoyer et fermer la connexion à la base de données
    await prisma.operation.deleteMany()
    await prisma.company.deleteMany()
    await prisma.$disconnect()
  })

  it("should save an operation", async () => {
    // Créer une opération
    const operation = OperationFactory.create({
      commercialName: "Test Operation",
      companyId: "test-company",
      deliveryDate: new Date(),
      address: "123 Test Street",
      availableLots: 10,
    })

    // Sauvegarder l'opération
    await repository.save(operation)

    // Vérifier que l'opération a été sauvegardée
    const savedOperation = await prisma.operation.findUnique({
      where: { id: operation.id },
    })

    expect(savedOperation).not.toBeNull()
    expect(savedOperation?.commercialName).toBe(operation.commercialName)
    expect(savedOperation?.companyId).toBe(operation.companyId)
  })

  it("should check if company exists", async () => {
    // Vérifier une société existante
    const exists = await repository.companyExists("test-company")
    expect(exists).toBe(true)

    // Vérifier une société inexistante
    const notExists = await repository.companyExists("non-existent-company")
    expect(notExists).toBe(false)
  })

  it("should check if operation exists by name and date range", async () => {
    // Créer une opération
    const operation = OperationFactory.create({
      commercialName: "Unique Operation",
      companyId: "test-company",
      deliveryDate: new Date(),
      address: "123 Test Street",
      availableLots: 10,
    })

    // Sauvegarder l'opération
    await repository.save(operation)

    // Vérifier si une opération avec le même nom existe dans la plage de dates
    const exists = await repository.existsByNameAndDateRange("Unique Operation", new Date())
    expect(exists).toBe(true)

    // Vérifier si une opération avec un nom différent existe
    const notExists = await repository.existsByNameAndDateRange("Different Operation", new Date())
    expect(notExists).toBe(false)
  })

  it("should get all operations", async () => {
    // Créer plusieurs opérations
    const operation1 = OperationFactory.create({
      commercialName: "Operation 1",
      companyId: "test-company",
      deliveryDate: new Date(),
      address: "123 Test Street",
      availableLots: 10,
    })

    const operation2 = OperationFactory.create({
      commercialName: "Operation 2",
      companyId: "test-company",
      deliveryDate: new Date(),
      address: "456 Test Avenue",
      availableLots: 5,
    })

    // Sauvegarder les opérations
    await repository.save(operation1)
    await repository.save(operation2)

    // Récupérer toutes les opérations
    const operations = await repository.getAll()

    // Vérifier que les opérations sont récupérées
    expect(operations.length).toBeGreaterThanOrEqual(2)

    // Vérifier que nos opérations de test sont présentes
    const op1 = operations.find((op) => op.id === operation1.id)
    const op2 = operations.find((op) => op.id === operation2.id)

    expect(op1).toBeDefined()
    expect(op2).toBeDefined()
    expect(op1?.commercialName).toBe(operation1.commercialName)
    expect(op2?.commercialName).toBe(operation2.commercialName)
  })
})

