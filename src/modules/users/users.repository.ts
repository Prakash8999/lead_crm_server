import { Op, WhereOptions } from 'sequelize';
import { User, UserAttributes, UserCreationAttributes, UpdateUserAttributes } from './users.model';

// --------------------
// 🗄️ User Repository
// --------------------
export class UserRepository {

    /**
     * Find a single user by its primary key (id).
     */
    async findById(id: number): Promise<User | null> {
        return User.findOne({ where: { id } });
    }

    /**
     * Find a single user by their email address.
     */
    async findByEmail(email: string): Promise<User | null> {
        return User.findOne({ where: { email } });
    }

    /**
     * Find a single user by email, excluding a specific id.
     * Useful for update uniqueness checks.
     */
    async findByEmailExcludingId(email: string, excludeId: number): Promise<User | null> {
        return User.findOne({
            where: {
                email,
                id: { [Op.ne]: excludeId },
            },
        });
    }

    /**
     * Create a new user record.
     */
    async create(data: UserCreationAttributes): Promise<User> {
        return User.create(data);
    }

    /**
     * Update a user by id. Returns the updated record or null if not found.
     */
    async update(id: number, data: UpdateUserAttributes): Promise<User | null> {
        const user = await this.findById(id);
        if (!user) return null;
        return user.update(data);
    }

    /**
     * Soft-delete (deactivate) a user by setting is_active = false.
     */
    async softDelete(id: number): Promise<User | null> {
        const user = await this.findById(id);
        if (!user) return null;
        return user.update({ is_active: false });
    }

    /**
     * Hard-delete a user record from the database.
     */
    async hardDelete(id: number): Promise<boolean> {
        const deleted = await User.destroy({ where: { id } });
        return deleted > 0;
    }

    /**
     * Find and count all users with optional filters.
     */
    async findAndCountAll(
        filters: WhereOptions<UserAttributes>,
        limit: number,
        offset: number,
        order: [string, string][],
    ): Promise<{ count: number; rows: User[] }> {
        return User.findAndCountAll({
            where: filters,
            limit,
            offset,
            order,
            distinct: true,
        });
    }
}

export default new UserRepository();
