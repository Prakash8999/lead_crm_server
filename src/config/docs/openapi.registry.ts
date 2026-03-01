import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';

/**
 * 🗂️ Global OpenAPI Registry
 *
 * This is the single instance used across the entire application.
 * Every module registers its schemas and routes HERE so the generator
 * can build the full OpenAPI spec automatically from Zod definitions.
 *
 * Usage in any module:
 *   import { registry } from '../../config/docs/openapi.registry';
 *   registry.register('MySchema', MyZodSchema);        // register a component schema
 *   registry.registerPath({ method: 'get', ... });     // register an API route
 */
export const registry = new OpenAPIRegistry();
