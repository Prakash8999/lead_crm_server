import { z } from 'zod';

// --------------------
// 📄 Base Pagination & Sort Query Schema
// Shared across ALL list endpoints in every module.
// Extend this in each model's query schema and add model-specific filters.
// --------------------

export const PaginationQuerySchema = z.object({
    // Page number — must be a positive integer string, defaults to '1'
    id: z
        .string()
        .regex(/^[1-9]\d*$/, 'id must be a positive integer')
        .optional()
        .transform(Number),
    page: z
        .string()
        .regex(/^[1-9]\d*$/, 'page must be a positive integer')
        .default('1')
        .transform(Number),

    // Page size — capped at 100 to prevent DB abuse
    limit: z
        .string()
        .regex(/^[1-9]\d*$/, 'limit must be a positive integer')
        .default('20')
        .transform((v) => Math.min(Number(v), 100)),

    // Sort direction
    sort_order: z
        .enum(['ASC', 'DESC', 'asc', 'desc'])
        .default('DESC')
        .transform((v) => v.toUpperCase() as 'ASC' | 'DESC'),

    // Full-text search — when present, service does an OR LIKE across searchable columns
    search: z
        .string()
        .min(1, 'search must not be empty')
        .trim()
        .optional(),
});

export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;
