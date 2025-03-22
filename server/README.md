# Operation Project

This project is a Node.js application using TypeScript and Prisma, following Clean Architecture principles. It allows creating operations with validation and database persistence.

## Setup Instructions

1. Install dependencies: `npm install`
2. Configure the database in `.env`
3. Run migrations: `npm run migrate`
4. Start the server: `npm start`

## Architecture Overview

The project is structured into three layers:
- **Domain**: Contains entities, factories, validators, and repository interfaces.
- **Application**: Houses use cases that orchestrate business logic.
- **Infrastructure**: Manages persistence and HTTP concerns.

## Usage

Send a POST request to `/operations` with the following JSON body:
```json
{
  "commercialName": "Opération Test",
  "companyId": "company-id-here",
  "deliveryDate": "2024-12-31",
  "address": "123 Rue Example",
  "totalLots": 10
}