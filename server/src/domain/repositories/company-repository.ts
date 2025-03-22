import { Company} from '../entities/company';

/**
 * Interface for Company repository.
 */

export interface CompanyRepository {
    findById(id: string): Promise<Company | null>;
}