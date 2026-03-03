import { DataTypes, Model, Sequelize } from 'sequelize';
import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import sequelize from '../../config/db/db_connection';
import { PaginationQuerySchema } from '../../shared/schemas/pagination.schema';

extendZodWithOpenApi(z);

// --------------------
// 🧩 Zod Schema
// --------------------
export const CompanySchema = z
    .object({
        id: z.number().int().openapi({
            example: 1,
            description: 'Unique identifier for the company',
        }),
        name: z.string().min(1).max(255).openapi({
            example: 'ABC Pvt Ltd',
            description: 'Name of the company',
        }),

        contact_email: z.email().openapi({
            example: 'contact@abc.com',
            description: 'Official contact email of the company',
        }),
        contact_phone: z.string().min(5).max(20).openapi({
            example: '+91-9876543210',
            description: 'Contact phone number of the company',
        }),
        address: z.string().min(1).openapi({
            example: 'Mumbai, Maharashtra, India',
            description: 'Registered address of the company',
        }),
        is_active: z.boolean().default(true).openapi({
            example: true,
            description: 'Indicates whether the company is active',
        }),
        created_at: z.date().openapi({
            type: 'string',
            format: 'date-time',
            example: '2025-10-08T09:00:00Z',
            description: 'Timestamp when the company was created',
        }),
        updated_at: z.date().openapi({
            type: 'string',
            format: 'date-time',
            example: '2025-10-08T09:10:00Z',
            description: 'Timestamp when the company was last updated',
        }),
    })
    .openapi({
        title: 'Company',
        description: 'Represents a registered company in the system',
    });

// --------------------
// 🧩 Derived Schemas
// --------------------
export const CreateCompanySchema = CompanySchema.omit({
    id: true,
    created_at: true,
    is_active: true,
    updated_at: true,
}).strict().openapi({ title: 'CreateCompanyInput' });

export const UpdateCompanySchema = CompanySchema.partial().omit({
    id: true,
    created_at: true,
}).strict().openapi({ title: 'UpdateCompanyInput' });

// Validates :id route param — must be a numeric string representing a positive integer
export const CompanyIdParamSchema = z.object({
    id: z
        .string()
        .regex(/^[1-9]\d*$/, 'id must be a positive integer')
        .transform(Number),
});

// Validates and whitelists all allowed query params for GET /companies.
// Extends the shared pagination base with company-specific sort columns and filters.
// Unknown keys are stripped silently — bad filters are simply ignored.
const companySortableColumns = [
    'id', 'name', 'contact_email', 'contact_phone', 'is_active', 'created_at', 'updated_at',
] as const;

export const CompanyQuerySchema = PaginationQuerySchema.extend({
    // Lock sort_by to valid company columns only
    sort_by: z
        .enum(companySortableColumns)
        .default('id'),

    // Filterable fields — all optional
    name: z.string().min(1).max(255).optional(),
    contact_email: z.email().optional(),
    contact_phone: z.string().min(5).max(20).optional(),
    is_active: z
        .enum(['true', 'false'])
        .transform((v) => v === 'true')
        .optional(),
    // strip: unknown query params are silently dropped — never reach service/DB
}).strip();

// --------------------
// 🧩 Types
// --------------------
export type CompanyAttributes = z.infer<typeof CompanySchema>;
export type CompanyCreationAttributes = z.infer<typeof CreateCompanySchema>;
export type UpdateCompanyAttributes = z.infer<typeof UpdateCompanySchema>;
export type CompanyQuery = z.infer<typeof CompanyQuerySchema>;

// --------------------
// 🧩 Sequelize Model
// --------------------
export class Company
    extends Model<CompanyAttributes, CompanyCreationAttributes>
    implements CompanyAttributes {
    public id!: number;
    public name!: string;
    public contact_email!: string;
    public contact_phone!: string;
    public address!: string;
    public is_active!: boolean;
    public created_at!: Date;
    public updated_at!: Date;
}

Company.init(
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
        contact_email: {
            type: DataTypes.STRING(255),
            allowNull: false,
            validate: {
                isEmail: true,
            },
        },
        contact_phone: {
            type: DataTypes.STRING(20),
            allowNull: false,
        },
        address: {
            type: DataTypes.TEXT,
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
        tableName: 'companies'
    }
);

export default Company;