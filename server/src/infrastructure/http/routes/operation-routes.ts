import { Router } from "express"
import type { OperationController } from "../controllers/operation-controller"

/**
 * Sets up routes for operations.
 * @param operationController The OperationController instance
 * @returns An Express router with operation routes
 */
export function setupOperationRoutes(operationController: OperationController): Router {
  const router = Router()

  /**
   * @swagger
   * /operations:
   *   post:
   *     summary: Créer une nouvelle opération
   *     description: |
   *       Crée une nouvelle opération immobilière avec les informations fournies.
   *
   *       ### Règles métier
   *       - L'identifiant de la société rattachée doit correspondre à une société immatriculée
   *       - Le nom commercial de l'opération ne doit pas dépasser 24 caractères
   *       - Le nom commercial doit être unique parmi toutes les opérations dont la date de livraison se situe dans un intervalle de 10 ans avant ou après la date de livraison de l'opération
   *       - Une nouvelle opération contient 0 lots réservés et X lots disponibles
   *     tags:
   *       - Opérations
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CreateOperationRequest'
   *           examples:
   *             validOperation:
   *               summary: Exemple d'opération valide
   *               value:
   *                 commercialName: "Résidence Les Jardins"
   *                 companyId: "comp-001"
   *                 deliveryDate: "2025-06-15"
   *                 address: "123 Avenue des Fleurs, 75001 Paris"
   *                 totalLots: 24
   *     responses:
   *       201:
   *         description: Opération créée avec succès
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/SuccessResponse'
   *       400:
   *         description: Erreur de validation ou règle métier non respectée
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *             examples:
   *               companyNotFound:
   *                 summary: Société inexistante
   *                 value:
   *                   error: "La société rattachée n'existe pas"
   *               nameTooLong:
   *                 summary: Nom trop long
   *                 value:
   *                   error: "Le nom d'une opération ne doit pas dépasser 24 caractères"
   *               duplicateName:
   *                 summary: Nom en double
   *                 value:
   *                   error: "Une opération portant le même nom existe déjà"
   */
  router.post("/operations", (req, res) => operationController.create(req, res))

  /**
   * @swagger
   * /operations:
   *   get:
   *     summary: Récupérer toutes les opérations
   *     description: |
   *       Récupère la liste de toutes les opérations immobilières.
   *       Les opérations sont retournées avec toutes leurs informations, y compris
   *       le nombre de lots disponibles et réservés.
   *     tags:
   *       - Opérations
   *     responses:
   *       200:
   *         description: Liste des opérations récupérée avec succès
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/OperationsResponse'
   *       404:
   *         description: Aucune opération trouvée
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *             example:
   *               error: "No operations found"
   *       400:
   *         description: Erreur lors de la récupération des opérations
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  router.get("/operations", (req, res) => operationController.getAll(req, res))

  return router
}

