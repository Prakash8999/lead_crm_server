import { Express } from 'express';
import swaggerUi from 'swagger-ui-express';
import { generateOpenApiDocument } from './openapi.generator';

// ── Import all module doc registrations here ──────────────────────────────────
// Each file registers its schemas + routes into the global registry.
// Add a new line here whenever you create a new module docs file.
import '../../modules/companies/companies.docs';
import '../../modules/users/users.docs';

/**
 * 🚀 Sets up the Swagger UI at /api-docs
 *
 * Call setupSwagger(app) in server.ts BEFORE starting the server.
 * The document is generated lazily on first request (fast startup).
 */
export function setupSwagger(app: Express): void {
    // Generate the OpenAPI spec from all registered Zod schemas
    const spec = generateOpenApiDocument();

    app.use(
        '/api-docs',
        swaggerUi.serve,
        swaggerUi.setup(spec, {
            customSiteTitle: 'Lead CRM API Docs',
            swaggerOptions: {
                persistAuthorization: true,
                displayRequestDuration: true,
                filter: true,
                docExpansion: 'list',
            },
        })
    );

    console.log('📄 Swagger docs available at /api-docs');
}
