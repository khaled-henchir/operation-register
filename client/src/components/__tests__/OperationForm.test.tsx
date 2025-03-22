import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import OperationForm from "../OperationForm"
import { ServiceContext } from "../../context/ServiceContext"

// Mock service
const mockOperationService = {
  createOperation: jest.fn(),
  getOperations: jest.fn(),
}

// Mock onOperationCreated callback
const mockOnOperationCreated = jest.fn()

describe("OperationForm", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const renderComponent = () => {
    return render(
      <ServiceContext.Provider value={{ operationService: mockOperationService }}>
        <OperationForm onOperationCreated={mockOnOperationCreated} />
      </ServiceContext.Provider>,
    )
  }

  it("renders the form with all required fields", () => {
    renderComponent()

    // Check for form title
    expect(screen.getByText("Créer une Nouvelle Opération")).toBeInTheDocument()

    // Check for all required fields
    expect(screen.getByLabelText(/Nom Commercial/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Identifiant Société/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Adresse/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Date de Livraison/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Lots Disponibles/i)).toBeInTheDocument()

    // Check for submit button
    expect(screen.getByRole("button", { name: /Créer l'Opération/i })).toBeInTheDocument()
  })

  it("validates required fields on submission", async () => {
    renderComponent()

    // Submit the form without filling any fields
    fireEvent.click(screen.getByRole("button", { name: /Créer l'Opération/i }))

    // Check for validation error messages
    await waitFor(() => {
      expect(screen.getByText("Le nom commercial est requis")).toBeInTheDocument()
      expect(screen.getByText("L'identifiant de la société est requis")).toBeInTheDocument()
      expect(screen.getByText("L'adresse est requise")).toBeInTheDocument()
      expect(screen.getByText("La date de livraison est requise")).toBeInTheDocument()
      expect(screen.getByText("Le nombre de lots disponibles est requis")).toBeInTheDocument()
    })

    // Verify that the service was not called
    expect(mockOperationService.createOperation).not.toHaveBeenCalled()
  })

  it("validates commercial name length", async () => {
    renderComponent()

    // Enter a commercial name that exceeds 24 characters
    const nameInput = screen.getByLabelText(/Nom Commercial/i)
    fireEvent.change(nameInput, { target: { value: "This is a very long commercial name that exceeds 24 characters" } })
    fireEvent.blur(nameInput)

    // Check for validation error message
    await waitFor(() => {
      expect(screen.getByText("Le nom d'une opération ne doit pas dépasser 24 caractères")).toBeInTheDocument()
    })
  })

  it("validates delivery date is in the future", async () => {
    renderComponent()

    // Enter a past date
    const dateInput = screen.getByLabelText(/Date de Livraison/i)
    fireEvent.change(dateInput, { target: { value: "2020-01-01" } })
    fireEvent.blur(dateInput)

    // Check for validation error message
    await waitFor(() => {
      expect(screen.getByText("La date de livraison doit être dans le futur")).toBeInTheDocument()
    })
  })

  it("validates available lots is a positive number", async () => {
    renderComponent()

    // Enter zero for available lots
    const lotsInput = screen.getByLabelText(/Lots Disponibles/i)
    fireEvent.change(lotsInput, { target: { value: "0" } })
    fireEvent.blur(lotsInput)

    // Check for validation error message
    await waitFor(() => {
      expect(screen.getByText("Le nombre de lots disponibles doit être supérieur à 0")).toBeInTheDocument()
    })
  })

  it("submits the form with valid data", async () => {
    // Mock successful operation creation
    const createdOperation = {
      id: "op-123",
      commercialName: "Test Operation",
      companyId: "comp-001",
      address: "123 Test Street",
      deliveryDate: "2023-12-31",
      availableLots: 10,
      reservedLots: 0,
    }
    mockOperationService.createOperation.mockResolvedValueOnce(createdOperation)

    renderComponent()

    // Fill in all required fields
    userEvent.type(screen.getByLabelText(/Nom Commercial/i), "Test Operation")
    userEvent.type(screen.getByLabelText(/Identifiant Société/i), "comp-001")
    userEvent.type(screen.getByLabelText(/Adresse/i), "123 Test Street")

    // Set a future date
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const futureDate = tomorrow.toISOString().split("T")[0]
    fireEvent.change(screen.getByLabelText(/Date de Livraison/i), { target: { value: futureDate } })

    userEvent.type(screen.getByLabelText(/Lots Disponibles/i), "10")

    // Submit the form
    fireEvent.click(screen.getByRole("button", { name: /Créer l'Opération/i }))

    // Wait for the form submission to complete
    await waitFor(() => {
      expect(mockOperationService.createOperation).toHaveBeenCalledWith({
        commercialName: "Test Operation",
        companyId: "comp-001",
        address: "123 Test Street",
        deliveryDate: futureDate,
        availableLots: 10,
        reservedLots: 0,
      })
      expect(mockOnOperationCreated).toHaveBeenCalledWith(createdOperation)
    })
  })

  it("displays error message when company does not exist", async () => {
    // Mock error for non-existent company
    const errorMessage = "La société rattachée n'existe pas"
    mockOperationService.createOperation.mockRejectedValueOnce(new Error(errorMessage))

    renderComponent()

    // Fill in all required fields
    userEvent.type(screen.getByLabelText(/Nom Commercial/i), "Test Operation")
    userEvent.type(screen.getByLabelText(/Identifiant Société/i), "invalid-comp")
    userEvent.type(screen.getByLabelText(/Adresse/i), "123 Test Street")

    // Set a future date
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const futureDate = tomorrow.toISOString().split("T")[0]
    fireEvent.change(screen.getByLabelText(/Date de Livraison/i), { target: { value: futureDate } })

    userEvent.type(screen.getByLabelText(/Lots Disponibles/i), "10")

    // Submit the form
    fireEvent.click(screen.getByRole("button", { name: /Créer l'Opération/i }))

    // Wait for the error to be displayed
    await waitFor(() => {
      expect(screen.getByText("La société rattachée n'existe pas")).toBeInTheDocument()
    })
  })

  it("displays error message when operation name already exists", async () => {
    // Mock error for duplicate name
    const errorMessage = "Une opération portant le même nom existe déjà"
    mockOperationService.createOperation.mockRejectedValueOnce(new Error(errorMessage))

    renderComponent()

    // Fill in all required fields
    userEvent.type(screen.getByLabelText(/Nom Commercial/i), "Existing Operation")
    userEvent.type(screen.getByLabelText(/Identifiant Société/i), "comp-001")
    userEvent.type(screen.getByLabelText(/Adresse/i), "123 Test Street")

    // Set a future date
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const futureDate = tomorrow.toISOString().split("T")[0]
    fireEvent.change(screen.getByLabelText(/Date de Livraison/i), { target: { value: futureDate } })

    userEvent.type(screen.getByLabelText(/Lots Disponibles/i), "10")

    // Submit the form
    fireEvent.click(screen.getByRole("button", { name: /Créer l'Opération/i }))

    // Wait for the error to be displayed
    await waitFor(() => {
      expect(screen.getByText("Une opération portant le même nom existe déjà")).toBeInTheDocument()
    })
  })
})

