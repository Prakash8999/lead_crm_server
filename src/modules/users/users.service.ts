import { Op, WhereOptions } from 'sequelize';
import bcrypt from 'bcryptjs';
import {
    UserAttributes,
    UserCreationAttributes,
    UpdateUserAttributes,
    UserQuery,
    User,
} from './users.model';
import userRepository from './users.repository';
import { paginateAndSort } from '../../shared/utils/pagination';
import companiesRepository from '../companies/companies.repository';

// --------------------
// 📦 Service Result Types
// --------------------
export type ServiceResult<T> =
    | { success: true; data: T; meta?: any }
    | { success: false; message: string; statusCode: number };

// --------------------
// 👤 User Service
// --------------------
export class UserService {

    /**
     * Get paginated list of users with optional filters and sort.
     * sort_by and sort_order are already validated by UserQuerySchema.
     * Boolean fields (admin, is_active) are already coerced — no manual casting needed.
     */
    async getAllUsers(
        page: number,
        limit: number,
        sort_by: UserQuery['sort_by'],
        sort_order: UserQuery['sort_order'],
        filters: Omit<UserQuery, 'page' | 'limit' | 'sort_by' | 'sort_order'>,
    ): Promise<ServiceResult<User[]>> {
        try {
            const { search, is_active, admin, name, email, mobile, company_id, id } = filters;

            // Build where clause — all values already the correct types (coerced by Zod)
            const where: WhereOptions<UserAttributes> = {};

            // Exact field filters
            if (is_active !== undefined) where.is_active = is_active;
            if (admin !== undefined) where.admin = admin;
            if (name) where.name = name;
            if (email) where.email = email;
            if (mobile) where.mobile = mobile;
            if (company_id) where.company_id = company_id;
            if (id) where.id = id;

            // Full-text search — OR LIKE across all searchable text columns
            // Works alongside field filters: e.g. is_active=true AND search='rahul'
            if (search) {
                const term = `%${search}%`;
                (where as any)[Op.or] = [
                    { name: { [Op.like]: term } },
                    { email: { [Op.like]: term } },
                    { mobile: { [Op.like]: term } },
                ];
            }

            const result = await paginateAndSort(
                User,
                where,
                page,
                limit,
                [[sort_by, sort_order]],
            );

            return { success: true, data: result.data as unknown as User[], meta: result.meta };
        } catch (err) {
            return { success: false, message: 'Failed to fetch users', statusCode: 500 };
        }
    }

    /**
     * Get a single user by id.
     */
    async getUserById(id: number): Promise<ServiceResult<User>> {
        try {
            const user = await userRepository.findById(id);
            if (!user) {
                return { success: false, message: 'User not found', statusCode: 404 };
            }
            return { success: true, data: user };
        } catch (err) {
            return { success: false, message: 'Failed to fetch user', statusCode: 500 };
        }
    }

    /**
     * Create a new user. Checks for duplicate email.
     */
    async createUser(data: UserCreationAttributes): Promise<ServiceResult<User>> {
        try {
            const existing = await userRepository.findByEmail(data.email);
            if (existing) {
                return {
                    success: false,
                    message: `A user with the email '${data.email}' already exists`,
                    statusCode: 409,
                };
            }

            const ifCompanyExists = await companiesRepository.findById(data.company_id);
            if (!ifCompanyExists) {
                return {
                    success: false,
                    message: `A company with the id '${data.company_id}' does not exist`,
                    statusCode: 404,
                };
            }


            // Hash password before saving
            data.password = await bcrypt.hash(data.password, 10);

            const user = await userRepository.create(data);
            return { success: true, data: user };
        } catch (err) {
            return { success: false, message: 'Failed to create user', statusCode: 500 };
        }
    }

    /**
     * Update an existing user by id.
     * If email is being changed, checks for duplicates across other users.
     */
    async updateUser(id: number, data: UpdateUserAttributes): Promise<ServiceResult<User>> {
        try {
            // Check user exists
            const existing = await userRepository.findById(id);
            if (!existing) {
                return { success: false, message: 'User not found', statusCode: 404 };
            }

            // If email is being updated, ensure it's not taken by another user
            if (data.email && data.email !== existing.email) {
                const emailConflict = await userRepository.findByEmailExcludingId(data.email, id);
                if (emailConflict) {
                    return {
                        success: false,
                        message: `A user with the email '${data.email}' already exists`,
                        statusCode: 409,
                    };
                }
            }

            const updated = await userRepository.update(id, data);
            if (!updated) {
                return { success: false, message: 'User not found', statusCode: 404 };
            }

            return { success: true, data: updated };
        } catch (err) {
            return { success: false, message: 'Failed to update user', statusCode: 500 };
        }
    }

    /**
     * Soft-delete a user (sets is_active = false).
     */
    async deleteUser(id: number): Promise<ServiceResult<{ id: number }>> {
        try {
            const user = await userRepository.findById(id);
            if (!user) {
                return { success: false, message: 'User not found', statusCode: 404 };
            }

            if (!user.is_active) {
                return { success: false, message: 'User is already inactive', statusCode: 409 };
            }

            await userRepository.softDelete(id);
            return { success: true, data: { id } };
        } catch (err) {
            return { success: false, message: 'Failed to delete user', statusCode: 500 };
        }
    }
}

export default new UserService();
