/**
 * Service de Gestion Hors Ligne
 *
 * Ce service gère le stockage et la synchronisation des données en mode hors ligne.
 * Il utilise IndexedDB pour un stockage plus robuste que localStorage.
 */
import { openDB, type DBSchema, type IDBPDatabase } from "idb"
import type { Operation, OperationFormData } from "../types"

interface OperationsDB extends DBSchema {
  operations: {
    key: string
    value: Operation
    indexes: { "by-date": Date }
  }
  pendingOperations: {
    key: string
    value: OperationFormData & { id: string; timestamp: number }
  }
}

class OfflineService {
  private db: Promise<IDBPDatabase<OperationsDB>>

  constructor() {
    this.db = this.initDatabase()
  }

  /**
   * Initialise la base de données IndexedDB
   */
  private initDatabase(): Promise<IDBPDatabase<OperationsDB>> {
    return openDB<OperationsDB>("operations-db", 1, {
      upgrade(db) {
        // Store for cached operations
        const operationsStore = db.createObjectStore("operations", { keyPath: "id" })
        operationsStore.createIndex("by-date", "deliveryDate")

        // Store for operations created while offline
        db.createObjectStore("pendingOperations", { keyPath: "id" })
      },
    })
  }

  /**
   * Stocke les opérations dans IndexedDB
   * @param operations Liste des opérations à stocker
   */
  async cacheOperations(operations: Operation[]): Promise<void> {
    const db = await this.db
    const tx = db.transaction("operations", "readwrite")

    // Clear existing operations
    await tx.objectStore("operations").clear()

    // Add all operations
    for (const operation of operations) {
      await tx.objectStore("operations").add(operation)
    }

    await tx.done
  }

  /**
   * Récupère les opérations stockées
   * @returns Liste des opérations en cache
   */
  async getCachedOperations(): Promise<Operation[]> {
    const db = await this.db
    return db.getAll("operations")
  }

  /**
   * Stocke une opération créée en mode hors ligne pour synchronisation ultérieure
   * @param operation Données de l'opération à stocker
   */
  async queueOperationForSync(operation: OperationFormData): Promise<string> {
    const db = await this.db
    const id = `pending-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    await db.add("pendingOperations", {
      ...operation,
      id,
      timestamp: Date.now(),
    })

    return id
  }

  /**
   * Récupère les opérations en attente de synchronisation
   * @returns Liste des opérations en attente
   */
  async getPendingOperations(): Promise<Array<OperationFormData & { id: string; timestamp: number }>> {
    const db = await this.db
    return db.getAll("pendingOperations")
  }

  /**
   * Supprime une opération en attente après synchronisation réussie
   * @param id Identifiant de l'opération à supprimer
   */
  async removePendingOperation(id: string): Promise<void> {
    const db = await this.db
    await db.delete("pendingOperations", id)
  }

  /**
   * Vérifie s'il y a des opérations en attente de synchronisation
   * @returns Vrai s'il y a des opérations en attente
   */
  async hasPendingOperations(): Promise<boolean> {
    const db = await this.db
    const count = await db.count("pendingOperations")
    return count > 0
  }
}

export default new OfflineService()

