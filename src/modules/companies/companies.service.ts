import { Op, WhereOptions } from 'sequelize';
import {
    CompanyAttributes,
    CompanyCreationAttributes,
    UpdateCompanyAttributes,
    CompanyQuery,
} from './companies.model';
import companyRepository from './companies.repository';
import { paginateAndSort } from '../../shared/utils/pagination';
import { Company } from './companies.model';

// --------------------
// 📦 Service Result Types
// --------------------
export type ServiceResult<T> =
    | { success: true; data: T; meta?: any }
    | { success: false; message: string; statusCode: number };

// --------------------
// 🏢 Company Service
// --------------------
export class CompanyService {

    /**
     * Get paginated list of companies with optional filters and sort.
     * sort_by and sort_order are already validated by CompanyQuerySchema.
     * is_active is already a boolean. No manual coercion needed here.
     */
    async getAllCompanies(
        page: number,
        limit: number,
        sort_by: CompanyQuery['sort_by'],
        sort_order: CompanyQuery['sort_order'],
        filters: Omit<CompanyQuery, 'page' | 'limit' | 'sort_by' | 'sort_order'>,
    ): Promise<ServiceResult<Company[]>> {
        try {
            const { search, is_active, name, contact_email, contact_phone } = filters;

            // Build where clause — all values already the correct types (coerced by Zod)
            const where: WhereOptions<CompanyAttributes> = {};

            // Exact field filters
            if (is_active !== undefined) where.is_active = is_active;
            if (name) where.name = name;
            if (contact_email) where.contact_email = contact_email;
            if (contact_phone) where.contact_phone = contact_phone;

            // Full-text search — OR LIKE across all searchable text columns
            // Works alongside field filters: e.g. is_active=true AND search='abc'
            if (search) {
                const term = `%${search}%`;
                (where as any)[Op.or] = [
                    { name: { [Op.like]: term } },
                    { contact_email: { [Op.like]: term } },
                    { contact_phone: { [Op.like]: term } },
                    { address: { [Op.like]: term } },
                ];
            }

            const result = await paginateAndSort(
                Company,
                where,
                page,
                limit,
                [[sort_by, sort_order]],
            );

            return { success: true, data: result.data as unknown as Company[], meta: result.meta };
        } catch (err) {
            return { success: false, message: 'Failed to fetch companies', statusCode: 500 };
        }
    }


    /**
     * Get a single company by id.
     */
    async getCompanyById(id: number): Promise<ServiceResult<Company>> {
        try {
            const company = await companyRepository.findById(id);
            if (!company) {
                return { success: false, message: 'Company not found', statusCode: 404 };
            }
            return { success: true, data: company };
        } catch (err) {
            return { success: false, message: 'Failed to fetch company', statusCode: 500 };
        }
    }

    /**
     * Create a new company. Checks for duplicate contact email.
     */
    async createCompany(data: CompanyCreationAttributes): Promise<ServiceResult<Company>> {
        try {
            const existing = await companyRepository.findByEmail(data.contact_email);
            if (existing) {
                return {
                    success: false,
                    message: `A company with the email '${data.contact_email}' already exists`,
                    statusCode: 409,
                };
            }

            const company = await companyRepository.create(data);
            return { success: true, data: company };
        } catch (err) {
            return { success: false, message: 'Failed to create company', statusCode: 500 };
        }
    }

    /**
     * Update an existing company by id.
     * If contact_email is being changed, checks for duplicates.
     */
    async updateCompany(id: number, data: UpdateCompanyAttributes): Promise<ServiceResult<Company>> {
        try {
            // Check company exists
            const existing = await companyRepository.findById(id);
            if (!existing) {
                return { success: false, message: 'Company not found', statusCode: 404 };
            }

            // If email is being updated, ensure it's not taken by another company
            if (data.contact_email && data.contact_email !== existing.contact_email) {
                const emailConflict = await companyRepository.findByEmailExcludingId(data.contact_email, id);
                if (emailConflict) {
                    return {
                        success: false,
                        message: `A company with the email '${data.contact_email}' already exists`,
                        statusCode: 409,
                    };
                }
            }

            const updated = await companyRepository.update(id, data);
            if (!updated) {
                return { success: false, message: 'Company not found', statusCode: 404 };
            }

            return { success: true, data: updated };
        } catch (err) {
            return { success: false, message: 'Failed to update company', statusCode: 500 };
        }
    }

    /**
     * Soft-delete a company (sets is_active = false).
     */
    async deleteCompany(id: number): Promise<ServiceResult<{ id: number }>> {
        try {
            const company = await companyRepository.findById(id);
            if (!company) {
                return { success: false, message: 'Company not found', statusCode: 404 };
            }

            if (!company.is_active) {
                return { success: false, message: 'Company is already inactive', statusCode: 409 };
            }

            await companyRepository.softDelete(id);
            return { success: true, data: { id } };
        } catch (err) {
            return { success: false, message: 'Failed to delete company', statusCode: 500 };
        }
    }
}

export default new CompanyService();
