import { PrismaClient } from '@prisma/client';
import { CompanyFactory } from '../src/domain/factories/company-factory';
import { OperationFactory } from '../src/domain/factories/operation-factory'; // Import the OperationFactory

const prisma = new PrismaClient();

async function main() {
  const companies = [
    CompanyFactory.create({ id: "SocieteA", name: 'Societe A' }),
    CompanyFactory.create({ id: "SocieteB", name: 'Societe B' }),
    CompanyFactory.create({ id: "SocieteC", name: 'Societe C' }),
  ];

  for (const company of companies) {
    const existingCompany = await prisma.company.findUnique({
      where: { id: company.id },
    });

    if (!existingCompany) {
      await prisma.company.create({
        data: {
          id: company.id,
          name: company.name,
        },
      });
      console.log(`Company ${company.name} created!`);
    } else {
      console.log(`Company with id ${company.id} already exists.`);
    }
  }

  console.log('Sample companies have been created!');

  const operations = [
    OperationFactory.create({
      commercialName: 'Opération A',
      companyId: "SocieteA", // Linking to Societe A
      deliveryDate: new Date(),
      address: '123 Rue A',
      availableLots: 5,
    }),
    OperationFactory.create({
      commercialName: 'Opération B',
      companyId: "SocieteB", // Linking to Societe B
      deliveryDate: new Date(),
      address: '456 Rue B',
      availableLots: 10,
    }),
    OperationFactory.create({
      commercialName: 'Opération C',
      companyId: "SocieteA", // Linking to Societe A ( Two operations can be linked with one company )
      deliveryDate: new Date(),
      address: '789 Rue C',
      availableLots: 7,
    }),
  ];

  // Create operations and link them to the companies
  for (const operation of operations) {
    const existingCompany = await prisma.company.findUnique({
      where: { id: operation.companyId },
    });

    if (existingCompany) {
      await prisma.operation.create({
        data: {
          commercialName: operation.commercialName,
          companyId: operation.companyId,
          deliveryDate: operation.deliveryDate,
          address: operation.address,
          availableLots: operation.availableLots,
        },
      });
      console.log(`Operation ${operation.commercialName} linked to company ${existingCompany.name}`);
    } else {
      console.log(`Company with id ${operation.companyId} not found. Operation ${operation.commercialName} not created.`);
    }
  }

  console.log('Sample operations have been created and linked to companies!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
