import { registry } from '../../config/docs/openapi.registry';
import {
    CompanySchema,
    CreateCompanySchema,
    UpdateCompanySchema,
} from './companies.model';

// ── Register component schemas ─────────────────────────────────────────────────
// These become reusable $ref components in the generated spec.

registry.register('Company', CompanySchema);
registry.register('CreateCompanyInput', CreateCompanySchema);
registry.register('UpdateCompanyInput', UpdateCompanySchema);

// ── Register API paths ─────────────────────────────────────────────────────────
// Each registerPath() call auto-generates a full Swagger path entry
// from the Zod schemas — no YAML or JSDoc needed.

registry.registerPath({
    method: 'get',
    path: '/companies',
    tags: ['Companies'],
    summary: 'List all companies',
    description: 'Returns a paginated list of all registered companies.',
    responses: {
        200: {
            description: 'A list of companies',
            content: {
                'application/json': {
                    schema: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Company' },
                    },
                },
            },
        },
    },
});

registry.registerPath({
    method: 'get',
    path: '/companies/{id}',
    tags: ['Companies'],
    summary: 'Get a company by ID',
    request: {
        params: CompanySchema.pick({ id: true }),
    },
    responses: {
        200: {
            description: 'The requested company',
            content: {
                'application/json': {
                    schema: { $ref: '#/components/schemas/Company' },
                },
            },
        },
        404: { description: 'Company not found' },
    },
});

registry.registerPath({
    method: 'post',
    path: '/companies',
    tags: ['Companies'],
    summary: 'Create a new company',
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
                    schema: { $ref: '#/components/schemas/Company' },
                },
            },
        },
        400: { description: 'Validation error' },
    },
});

registry.registerPath({
    method: 'patch',
    path: '/companies/{id}',
    tags: ['Companies'],
    summary: 'Update a company',
    request: {
        params: CompanySchema.pick({ id: true }),
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
                    schema: { $ref: '#/components/schemas/Company' },
                },
            },
        },
        400: { description: 'Validation error' },
        404: { description: 'Company not found' },
    },
});

registry.registerPath({
    method: 'delete',
    path: '/companies/{id}',
    tags: ['Companies'],
    summary: 'Delete a company',
    request: {
        params: CompanySchema.pick({ id: true }),
    },
    responses: {
        204: { description: 'Company deleted successfully' },
        404: { description: 'Company not found' },
    },
});
