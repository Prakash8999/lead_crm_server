import { Op, WhereOptions } from 'sequelize';
import { Company, CompanyAttributes, CompanyCreationAttributes, UpdateCompanyAttributes } from './companies.model';

// --------------------
// 🗄️ Company Repository
// --------------------
export class CompanyRepository {

    /**
     * Find a single company by its primary key (id).
     */
    async findById(id: number): Promise<Company | null> {
        return Company.findOne({ where: { id } });
    }

    /**
     * Find a single company by its contact email.
     */
    async findByEmail(email: string): Promise<Company | null> {
        return Company.findOne({ where: { contact_email: email } });
    }

    /**
     * Find a single company by its contact email, excluding a specific id.
     * Useful for update uniqueness checks.
     */
    async findByEmailExcludingId(email: string, excludeId: number): Promise<Company | null> {
        return Company.findOne({
            where: {
                contact_email: email,
                id: { [Op.ne]: excludeId },
            },
        });
    }

    /**
     * Create a new company record.
     */
    async create(data: CompanyCreationAttributes): Promise<Company> {
        return Company.create(data);
    }

    /**
     * Update a company by id. Returns the updated record or null if not found.
     */
    async update(id: number, data: UpdateCompanyAttributes): Promise<Company | null> {
        const company = await this.findById(id);
        if (!company) return null;
        return company.update(data);
    }

    /**
     * Soft-delete (deactivate) a company by setting is_active = false.
     */
    async softDelete(id: number): Promise<Company | null> {
        const company = await this.findById(id);
        if (!company) return null;
        return company.update({ is_active: false });
    }

    /**
     * Hard-delete a company record from the database.
     */
    async hardDelete(id: number): Promise<boolean> {
        const deleted = await Company.destroy({ where: { id } });
        return deleted > 0;
    }

    /**
     * Find and count all companies with optional filters.
     */
    async findAndCountAll(
        filters: WhereOptions<CompanyAttributes>,
        limit: number,
        offset: number,
        order: [string, string][],
    ): Promise<{ count: number; rows: Company[] }> {
        return Company.findAndCountAll({
            where: filters,
            limit,
            offset,
            order,
            distinct: true,
        });
    }
}

export default new CompanyRepository();
