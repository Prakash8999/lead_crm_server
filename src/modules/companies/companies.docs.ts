import { z } from 'zod';
import { registry } from '../../config/docs/openapi.registry';
import {
    SuccessEnvelope,
    ErrorEnvelope,
    ValidationErrorEnvelope,
} from '../../config/docs/openapi.helpers';
import {
    CompanySchema,
    CreateCompanySchema,
    UpdateCompanySchema,
    CompanyIdParamSchema,
    CompanyQuerySchema,
} from './companies.model';

// ── Register component schemas ─────────────────────────────────────────────────
// These become reusable $ref components in the generated spec.

registry.register('Company', CompanySchema);
registry.register('CreateCompanyInput', CreateCompanySchema);
registry.register('UpdateCompanyInput', UpdateCompanySchema);

// ── GET /companies ─────────────────────────────────────────────────────────────
registry.registerPath({
    method: 'get',
    path: '/companies',
    tags: ['Companies'],
    summary: 'List all companies',
    description:
        'Returns a paginated, sorted, and optionally filtered list of companies. ' +
        'All query params are validated against `CompanyQuerySchema`. ' +
        'Unknown query params are silently stripped — they never reach the database.',
    request: {
        // CompanyQuerySchema extends PaginationQuerySchema, so every allowed field
        // (page, limit, sort_order, sort_by, search + company filters) is captured here.
        query: CompanyQuerySchema,
    },
    responses: {
        200: {
            description: 'Paginated list of companies',
            content: {
                'application/json': {
                    schema: SuccessEnvelope(z.array(CompanySchema), true).openapi({
                        example: {
                            status: 'success',
                            code: 200,
                            error: false,
                            message: 'Companies fetched successfully',
                            data: [
                                {
                                    id: 1,
                                    name: 'ABC Pvt Ltd',
                                    contact_email: 'contact@abc.com',
                                    contact_phone: '+91-9876543210',
                                    address: 'Mumbai, Maharashtra, India',
                                    is_active: true,
                                    created_at: '2025-10-08T09:00:00Z',
                                    updated_at: '2025-10-08T09:10:00Z',
                                },
                            ],
                            meta: { total: 42, page: 1, limit: 20, totalPages: 3 },
                        },
                    }),
                },
            },
        },
        422: {
            description: 'Invalid query parameter(s)',
            content: {
                'application/json': {
                    schema: ValidationErrorEnvelope,
                },
            },
        },
    },
});

// ── GET /companies/{id} ────────────────────────────────────────────────────────
registry.registerPath({
    method: 'get',
    path: '/companies/{id}',
    tags: ['Companies'],
    summary: 'Get a company by ID',
    description: 'Returns a single company record. The `id` param must be a positive integer.',
    request: {
        params: CompanyIdParamSchema,
    },
    responses: {
        200: {
            description: 'The requested company',
            content: {
                'application/json': {
                    schema: SuccessEnvelope(CompanySchema).openapi({
                        example: {
                            status: 'success',
                            code: 200,
                            error: false,
                            message: 'Company fetched successfully',
                            data: {
                                id: 1,
                                name: 'ABC Pvt Ltd',
                                contact_email: 'contact@abc.com',
                                contact_phone: '+91-9876543210',
                                address: 'Mumbai, Maharashtra, India',
                                is_active: true,
                                created_at: '2025-10-08T09:00:00Z',
                                updated_at: '2025-10-08T09:10:00Z',
                            },
                        },
                    }),
                },
            },
        },
        404: {
            description: 'Company not found',
            content: {
                'application/json': {
                    schema: ErrorEnvelope('Company not found', 404),
                },
            },
        },
        422: {
            description: 'Invalid `id` param (must be a positive integer)',
            content: {
                'application/json': {
                    schema: ValidationErrorEnvelope,
                },
            },
        },
    },
});

// ── POST /companies ────────────────────────────────────────────────────────────
registry.registerPath({
    method: 'post',
    path: '/companies',
    tags: ['Companies'],
    summary: 'Create a new company',
    description:
        'Creates a new company record. Unknown fields in the request body are rejected (strict mode).',
    request: {
        body: {
            required: true,
            content: {
                'application/json': {
                    schema: CreateCompanySchema,
                },
            },
        },
    },
    responses: {
        201: {
            description: 'Company created successfully',
            content: {
                'application/json': {
                    schema: SuccessEnvelope(CompanySchema).openapi({
                        example: {
                            status: 'success',
                            code: 201,
                            error: false,
                            message: 'Company created successfully',
                            data: {
                                id: 5,
                                name: 'ABC Pvt Ltd',
                                contact_email: 'contact@abc.com',
                                contact_phone: '+91-9876543210',
                                address: 'Mumbai, Maharashtra, India',
                                is_active: true,
                                created_at: '2025-10-08T09:00:00Z',
                                updated_at: '2025-10-08T09:00:00Z',
                            },
                        },
                    }),
                },
            },
        },
        422: {
            description: 'Validation error — missing or invalid body fields',
            content: {
                'application/json': {
                    schema: ValidationErrorEnvelope,
                },
            },
        },
    },
});

// ── PATCH /companies/{id} ──────────────────────────────────────────────────────
registry.registerPath({
    method: 'patch',
    path: '/companies/{id}',
    tags: ['Companies'],
    summary: 'Partially update a company',
    description:
        'Updates one or more fields of an existing company. ' +
        'Unknown fields in the body are rejected (strict mode). ' +
        'Sending an empty body returns a 400 error.',
    request: {
        params: CompanyIdParamSchema,
        body: {
            required: true,
            content: {
                'application/json': {
                    schema: UpdateCompanySchema,
                },
            },
        },
    },
    responses: {
        200: {
            description: 'Company updated successfully',
            content: {
                'application/json': {
                    schema: SuccessEnvelope(CompanySchema).openapi({
                        example: {
                            status: 'success',
                            code: 200,
                            error: false,
                            message: 'Company updated successfully',
                            data: {
                                id: 1,
                                name: 'Updated Corp',
                                contact_email: 'contact@abc.com',
                                contact_phone: '+91-9876543210',
                                address: 'Mumbai, Maharashtra, India',
                                is_active: true,
                                created_at: '2025-10-08T09:00:00Z',
                                updated_at: '2025-10-08T10:00:00Z',
                            },
                        },
                    }),
                },
            },
        },
        400: {
            description: 'Empty body — no fields provided to update',
            content: {
                'application/json': {
                    schema: ErrorEnvelope('No fields provided to update', 400),
                },
            },
        },
        404: {
            description: 'Company not found',
            content: {
                'application/json': {
                    schema: ErrorEnvelope('Company not found', 404),
                },
            },
        },
        422: {
            description: 'Validation error — invalid body fields or invalid `id`',
            content: {
                'application/json': {
                    schema: ValidationErrorEnvelope,
                },
            },
        },
    },
});

// ── DELETE /companies/{id} ─────────────────────────────────────────────────────
registry.registerPath({
    method: 'delete',
    path: '/companies/{id}',
    tags: ['Companies'],
    summary: 'Soft-delete a company',
    description:
        'Soft-deletes a company by setting `is_active = false`. ' +
        'The record is retained in the database.',
    request: {
        params: CompanyIdParamSchema,
    },
    responses: {
        200: {
            description: 'Company soft-deleted successfully',
            content: {
                'application/json': {
                    schema: SuccessEnvelope(CompanySchema).openapi({
                        example: {
                            status: 'success',
                            code: 200,
                            error: false,
                            message: 'Company deleted successfully',
                            data: {
                                id: 1,
                                name: 'ABC Pvt Ltd',
                                contact_email: 'contact@abc.com',
                                contact_phone: '+91-9876543210',
                                address: 'Mumbai, Maharashtra, India',
                                is_active: false,
                                created_at: '2025-10-08T09:00:00Z',
                                updated_at: '2025-10-08T11:00:00Z',
                            },
                        },
                    }),
                },
            },
        },
        404: {
            description: 'Company not found',
            content: {
                'application/json': {
                    schema: ErrorEnvelope('Company not found', 404),
                },
            },
        },
        422: {
            description: 'Invalid `id` param (must be a positive integer)',
            content: {
                'application/json': {
                    schema: ValidationErrorEnvelope,
                },
            },
        },
    },
});
