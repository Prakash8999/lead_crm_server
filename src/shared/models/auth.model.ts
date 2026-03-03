import { DataTypes, Model, Sequelize } from 'sequelize';
import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import sequelize from '../../config/db/db_connection';

extendZodWithOpenApi(z);

// --------------------
// 🧩 Zod Schema
// --------------------
export const AuthSessionSchema = z
    .object({
        id: z.number().int().openapi({
            example: 1,
            description: 'Unique identifier for the auth session',
        }),
        user_id: z.number().int().openapi({
            example: 42,
            description: 'ID of the user this session belongs to',
        }),
        company_id: z.number().int().openapi({
            example: 7,
            description: 'ID of the company associated with this session',
        }),
        refresh_token_hash: z.string().min(1).openapi({
            example: '$2b$10$EixZaYVK1fsbw1Zfbx3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW',
            description: 'Bcrypt hash of the refresh token',
        }),
        device_type: z.enum(['crm', 'mobile']).openapi({
            example: 'crm',
            description: 'Type of device/client that initiated the session',
        }),
        is_active: z.boolean().default(true).openapi({
            example: true,
            description: 'Indicates whether this session is currently active',
        }),
        expires_at: z.date().openapi({
            type: 'string',
            format: 'date-time',
            example: '2025-12-31T23:59:59Z',
            description: 'Timestamp when this session expires',
        }),
        ip_address: z.string().max(45).nullable().openapi({
            example: '192.168.1.100',
            description: 'IP address from which the session was created (supports IPv4 and IPv6)',
        }),
        user_agent: z.string().max(512).nullable().openapi({
            example: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            description: 'User-agent string of the client that created the session',
        }),
        created_at: z.date().openapi({
            type: 'string',
            format: 'date-time',
            example: '2025-10-08T09:00:00Z',
            description: 'Timestamp when the session was created',
        }),
        last_used_at: z.date().openapi({
            type: 'string',
            format: 'date-time',
            example: '2025-10-08T09:30:00Z',
            description: 'Timestamp when the session was last used/accessed',
        }),
    })
    .openapi({
        title: 'AuthSession',
        description: 'Represents an active authentication session for a user',
    });

// --------------------
// 🧩 Derived Schemas
// --------------------
export const CreateAuthSessionSchema = AuthSessionSchema.omit({
    id: true,
    created_at: true,
    last_used_at: true,
    is_active: true,
}).openapi({ title: 'CreateAuthSessionInput' });

export const UpdateAuthSessionSchema = AuthSessionSchema.partial().omit({
    id: true,
    created_at: true,
}).openapi({ title: 'UpdateAuthSessionInput' });

// --------------------
// 🧩 Types
// --------------------
export type AuthSessionAttributes = z.infer<typeof AuthSessionSchema>;
export type AuthSessionCreationAttributes = z.infer<typeof CreateAuthSessionSchema>;
export type UpdateAuthSessionAttributes = z.infer<typeof UpdateAuthSessionSchema>;

// --------------------
// 🧩 Sequelize Model
// --------------------
export class AuthSession
    extends Model<AuthSessionAttributes, AuthSessionCreationAttributes>
    implements AuthSessionAttributes {
    public id!: number;
    public user_id!: number;
    public company_id!: number;
    public refresh_token_hash!: string;
    public device_type!: 'crm' | 'mobile';
    public is_active!: boolean;
    public expires_at!: Date;
    public ip_address!: string | null;
    public user_agent!: string | null;
    public created_at!: Date;
    public last_used_at!: Date;
}

AuthSession.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        company_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        refresh_token_hash: {
            type: DataTypes.STRING(512),
            allowNull: false,
        },
        device_type: {
            type: DataTypes.ENUM('crm', 'mobile'),
            allowNull: false,
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
        expires_at: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        ip_address: {
            type: DataTypes.STRING(45),
            allowNull: true,
            defaultValue: null,
        },
        user_agent: {
            type: DataTypes.STRING(512),
            allowNull: true,
            defaultValue: null,
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
        last_used_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
    },
    {
        sequelize,
        tableName: 'auth_sessions',
    }
);

export default AuthSession;
