import { z } from 'zod';
import { registry } from '../../config/docs/openapi.registry';
import {
    SuccessEnvelope,
    ErrorEnvelope,
    ValidationErrorEnvelope,
} from '../../config/docs/openapi.helpers';
import {
    UserSchema,
    CreateUserSchema,
    UpdateUserSchema,
    UserIdParamSchema,
    UserQuerySchema,
} from './users.model';

// ── Register component schemas ─────────────────────────────────────────────────
// These become reusable $ref components in the generated spec.

registry.register('User', UserSchema);
registry.register('CreateUserInput', CreateUserSchema);
registry.register('UpdateUserInput', UpdateUserSchema);

// ── GET /users ─────────────────────────────────────────────────────────────────
registry.registerPath({
    method: 'get',
    path: '/users',
    tags: ['Users'],
    summary: 'List all users',
    description:
        'Returns a paginated, sorted, and optionally filtered list of users. ' +
        'All query params are validated against `UserQuerySchema`. ' +
        'Unknown query params are silently stripped — they never reach the database.',
    request: {
        // UserQuerySchema extends PaginationQuerySchema, so every allowed field
        // (page, limit, sort_order, sort_by, search + user filters) is captured here.
        query: UserQuerySchema,
    },
    responses: {
        200: {
            description: 'Paginated list of users',
            content: {
                'application/json': {
                    schema: SuccessEnvelope(z.array(UserSchema), true).openapi({
                        example: {
                            status: 'success',
                            code: 200,
                            error: false,
                            message: 'Users fetched successfully',
                            data: [
                                {
                                    id: 1,
                                    name: 'Rahul Sharma',
                                    email: 'rahul.sharma@abc.com',
                                    mobile: '+91-9876543210',
                                    company_id: 7,
                                    admin: false,
                                    password: '$2b$10$EixZaYVK1fsbw1Zfbx3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW',
                                    is_active: true,
                                    created_at: '2025-10-08T09:00:00Z',
                                    updated_at: '2025-10-08T09:10:00Z',
                                },
                            ],
                            meta: { total: 10, page: 1, limit: 20, totalPages: 1 },
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

// ── GET /users/{id} ────────────────────────────────────────────────────────────
registry.registerPath({
    method: 'get',
    path: '/users/{id}',
    tags: ['Users'],
    summary: 'Get a user by ID',
    description: 'Returns a single user record. The `id` param must be a positive integer.',
    request: {
        params: UserIdParamSchema,
    },
    responses: {
        200: {
            description: 'The requested user',
            content: {
                'application/json': {
                    schema: SuccessEnvelope(UserSchema).openapi({
                        example: {
                            status: 'success',
                            code: 200,
                            error: false,
                            message: 'User fetched successfully',
                            data: {
                                id: 1,
                                name: 'Rahul Sharma',
                                email: 'rahul.sharma@abc.com',
                                mobile: '+91-9876543210',
                                company_id: 7,
                                admin: false,
                                password: '$2b$10$EixZaYVK1fsbw1Zfbx3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW',
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
            description: 'User not found',
            content: {
                'application/json': {
                    schema: ErrorEnvelope('User not found', 404),
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

// ── POST /users ────────────────────────────────────────────────────────────────
registry.registerPath({
    method: 'post',
    path: '/users',
    tags: ['Users'],
    summary: 'Create a new user',
    description:
        'Creates a new user record. Unknown fields in the request body are rejected (strict mode).',
    request: {
        body: {
            required: true,
            content: {
                'application/json': {
                    schema: CreateUserSchema,
                },
            },
        },
    },
    responses: {
        201: {
            description: 'User created successfully',
            content: {
                'application/json': {
                    schema: SuccessEnvelope(UserSchema).openapi({
                        example: {
                            status: 'success',
                            code: 201,
                            error: false,
                            message: 'User created successfully',
                            data: {
                                id: 3,
                                name: 'Rahul Sharma',
                                email: 'rahul.sharma@abc.com',
                                mobile: '+91-9876543210',
                                company_id: 7,
                                admin: false,
                                password: '$2b$10$EixZaYVK1fsbw1Zfbx3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW',
                                is_active: true,
                                created_at: '2025-10-08T09:00:00Z',
                                updated_at: '2025-10-08T09:00:00Z',
                            },
                        },
                    }),
                },
            },
        },
        409: {
            description: 'Email already in use by another user',
            content: {
                'application/json': {
                    schema: ErrorEnvelope("A user with the email 'rahul@abc.com' already exists", 409),
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

// ── PATCH /users/{id} ──────────────────────────────────────────────────────────
registry.registerPath({
    method: 'patch',
    path: '/users/{id}',
    tags: ['Users'],
    summary: 'Partially update a user',
    description:
        'Updates one or more fields of an existing user. ' +
        'Unknown fields in the body are rejected (strict mode). ' +
        'Sending an empty body returns a 400 error. ' +
        'Note: `password` cannot be changed through this endpoint.',
    request: {
        params: UserIdParamSchema,
        body: {
            required: true,
            content: {
                'application/json': {
                    schema: UpdateUserSchema,
                },
            },
        },
    },
    responses: {
        200: {
            description: 'User updated successfully',
            content: {
                'application/json': {
                    schema: SuccessEnvelope(UserSchema).openapi({
                        example: {
                            status: 'success',
                            code: 200,
                            error: false,
                            message: 'User updated successfully',
                            data: {
                                id: 1,
                                name: 'Rahul Kumar',
                                email: 'rahul.sharma@abc.com',
                                mobile: '+91-9876543210',
                                company_id: 7,
                                admin: true,
                                password: '$2b$10$EixZaYVK1fsbw1Zfbx3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW',
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
            description: 'User not found',
            content: {
                'application/json': {
                    schema: ErrorEnvelope('User not found', 404),
                },
            },
        },
        409: {
            description: 'Email already in use by another user',
            content: {
                'application/json': {
                    schema: ErrorEnvelope("A user with the email 'rahul@abc.com' already exists", 409),
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

// ── DELETE /users/{id} ─────────────────────────────────────────────────────────
registry.registerPath({
    method: 'delete',
    path: '/users/{id}',
    tags: ['Users'],
    summary: 'Soft-delete a user',
    description:
        'Soft-deletes a user by setting `is_active = false`. ' +
        'The record is retained in the database.',
    request: {
        params: UserIdParamSchema,
    },
    responses: {
        200: {
            description: 'User soft-deleted successfully',
            content: {
                'application/json': {
                    schema: SuccessEnvelope(z.object({ id: z.number() })).openapi({
                        example: {
                            status: 'success',
                            code: 200,
                            error: false,
                            message: 'User deleted successfully',
                            data: { id: 1 },
                        },
                    }),
                },
            },
        },
        404: {
            description: 'User not found',
            content: {
                'application/json': {
                    schema: ErrorEnvelope('User not found', 404),
                },
            },
        },
        409: {
            description: 'User is already inactive',
            content: {
                'application/json': {
                    schema: ErrorEnvelope('User is already inactive', 409),
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
