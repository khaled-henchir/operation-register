import { Company } from '../entities/company';

/**
 * Factory for creating Company instances.
 */
export class CompanyFactory {
  /**
   * Creates a new Company instance.
   * @param companyData - Data for the company, including a manual `id`.
   */
  static create(companyData: { id: string; name: string }): Company {
    return new Company(
      companyData.id, 
      companyData.name
    );
  }
}
