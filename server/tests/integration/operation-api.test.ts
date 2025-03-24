import request from "supertest"
import { createServer } from "../../src/infrastructure/http/app"
import { PrismaClient } from "@prisma/client"
import { CompanyFactory } from "../../src/domain/factories/company-factory"
import { describe, beforeAll, afterAll, it, expect } from "@jest/globals"


describe("Operation API Integration Tests", () => {
  let app: ReturnType<typeof createServer>
  let prisma: PrismaClient

  beforeAll(async () => {
    app = createServer()
    prisma = new PrismaClient()

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

  describe("POST /operations", () => {
    it("should create a new operation successfully", async () => {
      const operationData = {
        commercialName: "Test Operation",
        companyId: "test-company",
        deliveryDate: new Date().toISOString(),
        address: "123 Test Street",
        totalLots: 10,
      }

      const response = await request(app).post("/operations").send(operationData).expect(201)

      expect(response.body).toHaveProperty("message", "Nouvelle opération enregistrée")
    })

    it("should return 400 when company does not exist", async () => {
      const operationData = {
        commercialName: "Test Operation",
        companyId: "non-existent-company",
        deliveryDate: new Date().toISOString(),
        address: "123 Test Street",
        totalLots: 10,
      }

      const response = await request(app).post("/operations").send(operationData).expect(400)

      expect(response.body).toHaveProperty("error", "La société rattachée n'existe pas")
    })

    it("should return 400 when name exceeds 24 characters", async () => {
      const operationData = {
        commercialName: "This is a very long operation name that exceeds the limit",
        companyId: "test-company",
        deliveryDate: new Date().toISOString(),
        address: "123 Test Street",
        totalLots: 10,
      }

      const response = await request(app).post("/operations").send(operationData).expect(400)

      expect(response.body).toHaveProperty("error", "Le nom d'une opération ne doit pas dépasser 24 caractères")
    })

    it("should return 400 when operation with same name exists in date range", async () => {
      // First create an operation
      const operationData = {
        commercialName: "Duplicate Test",
        companyId: "test-company",
        deliveryDate: new Date().toISOString(),
        address: "123 Test Street",
        totalLots: 10,
      }

      await request(app).post("/operations").send(operationData).expect(201)

      // Try to create another with the same name
      const response = await request(app).post("/operations").send(operationData).expect(400)

      expect(response.body).toHaveProperty("error", "Une opération portant le même nom existe déjà")
    })
  })

  describe("GET /operations", () => {
    it("should return all operations", async () => {
      // Ensure we have at least one operation
      const operationData = {
        commercialName: "Get Test Operation",
        companyId: "test-company",
        deliveryDate: new Date().toISOString(),
        address: "123 Test Street",
        totalLots: 10,
      }

      await request(app).post("/operations").send(operationData).expect(201)

      // Get all operations
      const response = await request(app).get("/operations").expect(200)

      expect(response.body).toHaveProperty("data")
      expect(Array.isArray(response.body.data)).toBe(true)
      expect(response.body.data.length).toBeGreaterThan(0)

      // Check if our test operation is in the results
      const testOperation = response.body.data.find((op: any) => op.commercialName === operationData.commercialName)

      expect(testOperation).toBeDefined()
      expect(testOperation.commercialName).toBe(operationData.commercialName)
      expect(testOperation.companyId).toBe(operationData.companyId)
    })
  })
})

