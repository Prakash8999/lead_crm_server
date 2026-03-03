import { DataTypes, Model, Sequelize } from 'sequelize';
import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import sequelize from '../../config/db/db_connection';
import { PaginationQuerySchema } from '../../shared/schemas/pagination.schema';

extendZodWithOpenApi(z);

// --------------------
// 🧩 Zod Schema
// --------------------
export const UserSchema = z
    .object({
        id: z.number().int().openapi({
            example: 1,
            description: 'Unique identifier for the user',
        }),
        name: z.string().min(1).max(255).openapi({
            example: 'Rahul Sharma',
            description: 'Full name of the user',
        }),
        email: z.email().openapi({
            example: 'rahul.sharma@abc.com',
            description: 'Email address of the user (used for login)',
        }),
        mobile: z.string().min(5).max(20).openapi({
            example: '+91-9876543210',
            description: 'Mobile phone number of the user',
        }),
        company_id: z.number().int().openapi({
            example: 7,
            description: 'ID of the company this user belongs to',
        }),
        admin: z.boolean().default(false).openapi({
            example: false,
            description: 'Indicates whether this user has admin privileges within their company',
        }),
        password: z.string().min(1).openapi({
            example: 'MyPassWord123',
            description: 'Bcrypt hash of the user password',
        }),
        is_active: z.boolean().default(true).openapi({
            example: true,
            description: 'Indicates whether the user account is active',
        }),
        created_at: z.date().openapi({
            type: 'string',
            format: 'date-time',
            example: '2025-10-08T09:00:00Z',
            description: 'Timestamp when the user was created',
        }),
        updated_at: z.date().openapi({
            type: 'string',
            format: 'date-time',
            example: '2025-10-08T09:10:00Z',
            description: 'Timestamp when the user was last updated',
        }),
    })
    .openapi({
        title: 'User',
        description: 'Represents a user account within a company in the system',
    });

// --------------------
// 🧩 Derived Schemas
// --------------------
export const CreateUserSchema = UserSchema.omit({
    id: true,
    created_at: true,
    updated_at: true,
    admin: true,
    is_active: true,
}).strict().openapi({ title: 'CreateUserInput' });

export const UpdateUserSchema = UserSchema.partial().omit({
    id: true,
    created_at: true,
    password: true,
}).strict().openapi({ title: 'UpdateUserInput' });

// Validates :id route param — must be a numeric string representing a positive integer
export const UserIdParamSchema = z.object({
    id: z
        .string()
        .regex(/^[1-9]\d*$/, 'id must be a positive integer')
        .transform(Number),
});

// Validates and whitelists all allowed query params for GET /users.
// Extends the shared pagination base with user-specific sort columns and filters.
const userSortableColumns = [
    'id', 'name', 'email', 'mobile', 'company_id', 'admin', 'is_active', 'created_at', 'updated_at',
] as const;

export const UserQuerySchema = PaginationQuerySchema.extend({
    // Lock sort_by to valid user columns only
    sort_by: z
        .enum(userSortableColumns)
        .default('id'),

    // Filterable fields — all optional
    name: z.string().min(1).max(255).optional(),
    email: z.email().optional(),
    mobile: z.string().min(5).max(20).optional(),
    company_id: z
        .string()
        .regex(/^[1-9]\d*$/, 'company_id must be a positive integer')
        .transform(Number)
        .optional(),
    admin: z
        .enum(['true', 'false'])
        .transform((v) => v === 'true')
        .optional(),
    is_active: z
        .enum(['true', 'false'])
        .transform((v) => v === 'true')
        .optional(),
    // strip: unknown query params are silently dropped — never reach service/DB
}).strip();

// --------------------
// 🧩 Types
// --------------------
export type UserAttributes = z.infer<typeof UserSchema>;
export type UserCreationAttributes = z.infer<typeof CreateUserSchema>;
export type UpdateUserAttributes = z.infer<typeof UpdateUserSchema>;
export type UserQuery = z.infer<typeof UserQuerySchema>;

// --------------------
// 🧩 Sequelize Model
// --------------------
export class User
    extends Model<UserAttributes, UserCreationAttributes>
    implements UserAttributes {
    public id!: number;
    public name!: string;
    public email!: string;
    public mobile!: string;
    public company_id!: number;
    public admin!: boolean;
    public password!: string;
    public is_active!: boolean;
    public created_at!: Date;
    public updated_at!: Date;
}

User.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true,
            },
        },
        mobile: {
            type: DataTypes.STRING(20),
            allowNull: false,
        },
        company_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        admin: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        password: {
            type: DataTypes.STRING(512),
            allowNull: false,
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
        updated_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
    },
    {
        sequelize,
        timestamps: false,
        tableName: 'users',
    }
);

export default User;
