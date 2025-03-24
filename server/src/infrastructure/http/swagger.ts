import swaggerJSDoc from "swagger-jsdoc"
import swaggerUi from "swagger-ui-express"
import type { Express } from "express"

/**
 * Setup Swagger for API documentation.
 * @param app The Express app instance
 */
export const setupSwagger = (app: Express): void => {
  // Swagger definition
  const swaggerOptions = {
    swaggerDefinition: {
      openapi: "3.0.0",
      info: {
        title: "API de Gestion des Opérations Immobilières",
        version: "1.0.0",
        description:
          "API pour la gestion des opérations immobilières, permettant la création et la consultation des opérations.",
        contact: {
          name: "Développeur",
          email: "khaled.henchir@enciar.ucar.tn",
        },
        license: {
          name: "MIT",
          url: "https://opensource.org/licenses/MIT",
        },
      },
      servers: [
        {
          url: "http://localhost:3000",
          description: "Serveur de développement",
        },
        {
          url: "https://api.example.com",
          description: "Serveur de production",
        },
      ],
      components: {
        schemas: {
          Operation: {
            type: "object",
            required: ["id", "commercialName", "companyId", "deliveryDate", "address", "availableLots", "reservedLots"],
            properties: {
              id: {
                type: "string",
                description: "Identifiant unique de l'opération",
                example: "op-123456",
              },
              commercialName: {
                type: "string",
                description: "Nom commercial de l'opération (max 24 caractères)",
                maxLength: 24,
                example: "Résidence Les Jardins",
              },
              companyId: {
                type: "string",
                description: "Identifiant de la société rattachée",
                example: "comp-001",
              },
              deliveryDate: {
                type: "string",
                format: "date",
                description: "Date de livraison prévue",
                example: "2025-06-15",
              },
              address: {
                type: "string",
                description: "Adresse de l'opération",
                example: "123 Avenue des Fleurs, 75001 Paris",
              },
              availableLots: {
                type: "integer",
                description: "Nombre total de lots disponibles",
                minimum: 0,
                example: 24,
              },
              reservedLots: {
                type: "integer",
                description: "Nombre de lots réservés",
                minimum: 0,
                default: 0,
                example: 0,
              },
            },
          },
          CreateOperationRequest: {
            type: "object",
            required: ["commercialName", "companyId", "deliveryDate", "address", "availableLots"],
            properties: {
              commercialName: {
                type: "string",
                description: "Nom commercial de l'opération (max 24 caractères)",
                maxLength: 24,
                example: "Résidence Les Jardins",
              },
              companyId: {
                type: "string",
                description: "Identifiant de la société rattachée",
                example: "comp-001",
              },
              deliveryDate: {
                type: "string",
                format: "date",
                description: "Date de livraison prévue",
                example: "2025-06-15",
              },
              address: {
                type: "string",
                description: "Adresse de l'opération",
                example: "123 Avenue des Fleurs, 75001 Paris",
              },
              availableLots: {
                type: "integer",
                description: "Nombre total de lots disponibles",
                minimum: 0,
                example: 24,
              },
            },
          },
          ErrorResponse: {
            type: "object",
            properties: {
              error: {
                type: "string",
                description: "Message d'erreur",
                example: "La société rattachée n'existe pas",
              },
            },
          },
          SuccessResponse: {
            type: "object",
            properties: {
              message: {
                type: "string",
                description: "Message de succès",
                example: "Nouvelle opération enregistrée",
              },
            },
          },
          OperationsResponse: {
            type: "object",
            properties: {
              data: {
                type: "array",
                items: {
                  $ref: "#/components/schemas/Operation",
                },
              },
            },
          },
        },
      },
    },
    apis: ["./src/infrastructure/http/routes/*.ts"],
  }

  const swaggerDocs = swaggerJSDoc(swaggerOptions)

  // Serve Swagger UI
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocs, {
      explorer: true,
      customCss: ".swagger-ui .topbar { display: none }",
      customSiteTitle: "API Documentation - Gestion des Opérations Immobilières",
    }),
  )
}

