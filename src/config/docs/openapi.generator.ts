import { OpenApiGeneratorV31 } from '@asteasolutions/zod-to-openapi';
import { registry } from './openapi.registry';

/**
 * 🏗️ OpenAPI Document Generator
 *
 * Call generateOpenApiDocument() AFTER all module registrations have been
 * imported (i.e., after all `import '…/companies.docs'` lines run).
 * It reads everything registered in the global registry and builds the
 * full OpenAPI 3.1 spec object — no YAML, no JSDoc comments needed.
 */
export function generateOpenApiDocument() {
    const generator = new OpenApiGeneratorV31(registry.definitions);

    return generator.generateDocument({
        openapi: '3.1.0',
        info: {
            title: 'Lead CRM API',
            description: 'Auto-generated API documentation powered by Zod schemas.',
            version: '1.0.0',
            contact: {
                name: 'Lead CRM Team',
            },
        },
        servers: [
            {
                url: '/api/v1',
                description: 'Local development server',
            },
        ],
    });
}
