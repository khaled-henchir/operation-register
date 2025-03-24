/**
 * Service d'Opération
 *
 * Classe de service pour gérer les opérations API liées aux données d'opérations.
 * Fournit des méthodes pour récupérer et créer des opérations.
 *
 * @class
 */
import type { Operation, OperationFormData } from "../types";
import { fetchMockOperations, createMockOperation } from "../mock/mockOperations";
import ValidationService from "./ValidationService";

class OperationService {
  static apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
  static useMockData = false; // Set to false to use real API

  /**
   * Fetches operations from the API or mock data.
   */
  static async getOperations(): Promise<{ data: Operation[] }> {
    return this.useMockData ? fetchMockOperations() : this.fetchData("/operations");
  }

  /**
   * Creates a new operation via the API or mock data.
   */
  static async createOperation(operationData: OperationFormData & { reservedLots?: number }): Promise<Operation> {
    await this.validateOperationData(operationData);
    return this.useMockData
      ? createMockOperation(operationData)
      : this.fetchData("/operations", {
          method: "POST",
          body: JSON.stringify({
            commercialName: operationData.commercialName,
            companyId: operationData.companyId,
            deliveryDate: operationData.deliveryDate,
            address: operationData.address,
            availableLots: operationData.availableLots,
            reservedLots: operationData.reservedLots || 0,
          }),
        });
  }

  /**
   * Validates operation data using ValidationService.
   */
  private static async validateOperationData(operationData: OperationFormData): Promise<void> {
    const existingOperations = (await this.getOperations()).data.map((op) => ({
      commercialName: op.commercialName,
      deliveryDate: op.deliveryDate,
    }));

    const errors = ValidationService.validateOperation(operationData, existingOperations);
    const errorMessages = Object.values(errors).filter(Boolean);
    if (errorMessages.length > 0) throw new Error(errorMessages[0]);
  }

  /**
   * Generic fetch utility for API calls.
   */
  private static async fetchData(endpoint: string, options?: RequestInit): Promise<any> {
    try {
      const response = await fetch(`${this.apiUrl}${endpoint}`, {
        headers: { "Content-Type": "application/json" },
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.error || `Request failed: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error in fetchData (${endpoint}):`, error);
      throw error instanceof Error ? error : new Error("Network request failed");
    }
  }
}

export default OperationService;