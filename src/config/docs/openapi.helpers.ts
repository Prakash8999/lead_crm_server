import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

// ─────────────────────────────────────────────────────────────────────────────
// 📦 Shared OpenAPI Response Envelope Helpers
//
// These mirror the SuccessResponse<T> / ErrorResponse shapes defined in
// shared/utils/response.ts.
//
// Usage in any module's .docs.ts:
//
//   import {
//       SuccessEnvelope,
//       ErrorEnvelope,
//       ValidationErrorEnvelope,
//   } from '../../config/docs/openapi.helpers';
//
//   // Single object response
//   schema: SuccessEnvelope(MySchema)
//
//   // Paginated list response  (adds meta: { total, page, limit, totalPages })
//   schema: SuccessEnvelope(z.array(MySchema), true)
//
//   // Error response
//   schema: ErrorEnvelope('Company not found', 404)
//
//   // Validation error response  (422)
//   schema: ValidationErrorEnvelope
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Wraps any data schema in the standard success envelope:
 * { status, code, error, message, data, meta? }
 *
 * @param dataSchema  - The Zod schema for the `data` field.
 * @param withMeta    - When true, appends a `meta` object for paginated lists.
 */
export const SuccessEnvelope = (dataSchema: z.ZodTypeAny, withMeta = false) =>
    z.object({
        status: z.literal('success').openapi({ example: 'success' }),
        code: z.number().int().openapi({ example: 200 }),
        error: z.literal(false).openapi({ example: false }),
        message: z.string().openapi({ example: 'Operation successful' }),
        data: dataSchema,
        ...(withMeta
            ? {
                meta: z
                    .object({
                        total: z.number().int().openapi({ example: 42 }),
                        page: z.number().int().openapi({ example: 1 }),
                        limit: z.number().int().openapi({ example: 20 }),
                        totalPages: z.number().int().openapi({ example: 3 }),
                    })
                    .optional(),
            }
            : {}),
    });

/**
 * Produces a standard error envelope schema:
 * { status: 'failed', code, error: true, message }
 *
 * @param example  - Example error message shown in Swagger UI.
 * @param code     - HTTP status code shown in the schema example.
 */
export const ErrorEnvelope = (example: string, code: number) =>
    z.object({
        status: z.literal('failed').openapi({ example: 'failed' }),
        code: z.number().int().openapi({ example: code }),
        error: z.literal(true).openapi({ example: true }),
        message: z.string().openapi({ example }),
    });

/**
 * Standard 422 Validation Error envelope schema.
 * { status: 'failed', code: 422, error: true, message, validationErrors? }
 *
 * Re-use as-is — no parameters needed.
 */
export const ValidationErrorEnvelope = z.object({
    status: z.literal('failed').openapi({ example: 'failed' }),
    code: z.number().int().openapi({ example: 422 }),
    error: z.literal(true).openapi({ example: true }),
    message: z.string().openapi({ example: 'Validation errors' }),
    validationErrors: z
        .array(
            z.object({
                path: z.string().openapi({ example: 'name' }),
                message: z
                    .string()
                    .openapi({ example: 'String must contain at least 1 character(s)' }),
            }),
        )
        .optional(),
});
