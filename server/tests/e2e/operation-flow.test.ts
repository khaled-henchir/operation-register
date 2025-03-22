import { chromium, type Browser, type Page } from "playwright"
import { PrismaClient } from "@prisma/client"
import { createServer } from "../../src/infrastructure/http/app"
import { CompanyFactory } from "../../src/domain/factories/company-factory"
import type http from "http"
import { expect, it } from "@jest/globals"

describe("Operation Flow End-to-End Tests", () => {
  let browser: Browser
  let page: Page
  let server: http.Server
  let prisma: PrismaClient
  const PORT = 3001
  const BASE_URL = `http://localhost:${PORT}`

  beforeAll(async () => {
    // Démarrer le serveur
    const app = createServer()
    server = app.listen(PORT)

    // Initialiser la base de données
    prisma = new PrismaClient()

    // Nettoyer la base de données
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

    // Lancer le navigateur
    browser = await chromium.launch()
  })

  afterAll(async () => {
    // Nettoyer et fermer
    await prisma.operation.deleteMany()
    await prisma.company.deleteMany()
    await prisma.$disconnect()
    await browser.close()
    server.close()
  })

  beforeEach(async () => {
    page = await browser.newPage()
  })

  afterEach(async () => {
    await page.close()
  })

  it("should create a new operation and display it in the list", async () => {
    // Accéder à l'application
    await page.goto(`${BASE_URL}/client`)

    // Remplir le formulaire
    await page.fill("#commercialName", "Test E2E Operation")
    await page.fill("#companyId", "test-company")
    await page.fill("#address", "123 E2E Test Street")

    // Définir la date de livraison (demain)
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const formattedDate = tomorrow.toISOString().split("T")[0]
    await page.fill("#deliveryDate", formattedDate)

    // Définir le nombre de lots
    await page.fill("#availableLots", "15")

    // Soumettre le formulaire
    await page.click('button[type="submit"]')

    // Attendre que le toast de succès apparaisse
    await page.waitForSelector(".toast-success", { timeout: 5000 })

    // Vérifier que le message de succès est affiché
    const toastText = await page.textContent(".toast-success")
    expect(toastText).toContain("Test E2E Operation")
    expect(toastText).toContain("enregistrée avec succès")

    // Attendre que l'opération apparaisse dans la liste
    await page.waitForSelector(".operation-item", { timeout: 5000 })

    // Vérifier que l'opération est dans la liste
    const operationTitle = await page.textContent(".operation-title")
    expect(operationTitle).toContain("Test E2E Operation")

    // Vérifier les détails de l'opération
    const operationAddress = await page.textContent(".operation-address")
    expect(operationAddress).toContain("123 E2E Test Street")

    const operationLots = await page.textContent(".operation-lots-value")
    expect(operationLots).toContain("0/15")
  })

  it("should show error when creating operation with non-existent company", async () => {
    // Accéder à l'application
    await page.goto(`${BASE_URL}/client`)

    // Remplir le formulaire avec une société inexistante
    await page.fill("#commercialName", "Invalid Company Test")
    await page.fill("#companyId", "non-existent-company")
    await page.fill("#address", "456 Error Test Street")

    // Définir la date de livraison (demain)
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const formattedDate = tomorrow.toISOString().split("T")[0]
    await page.fill("#deliveryDate", formattedDate)

    // Définir le nombre de lots
    await page.fill("#availableLots", "10")

    // Soumettre le formulaire
    await page.click('button[type="submit"]')

    // Attendre que le toast d'erreur apparaisse
    await page.waitForSelector(".toast-error", { timeout: 5000 })

    // Vérifier que le message d'erreur est affiché
    const toastText = await page.textContent(".toast-error")
    expect(toastText).toContain("La société")
    expect(toastText).toContain("n'existe pas")
  })

  it("should show error when creating operation with name exceeding 24 characters", async () => {
    // Accéder à l'application
    await page.goto(`${BASE_URL}/client`)

    // Remplir le formulaire avec un nom trop long
    await page.fill("#commercialName", "This is a very long operation name that exceeds the limit")
    await page.fill("#companyId", "test-company")
    await page.fill("#address", "789 Long Name Street")

    // Définir la date de livraison (demain)
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const formattedDate = tomorrow.toISOString().split("T")[0]
    await page.fill("#deliveryDate", formattedDate)

    // Définir le nombre de lots
    await page.fill("#availableLots", "5")

    // Soumettre le formulaire
    await page.click('button[type="submit"]')

    // Vérifier que le message d'erreur est affiché dans le formulaire
    const errorText = await page.textContent("#commercialName-error")
    expect(errorText).toContain("ne doit pas dépasser 24 caractères")
  })
})

