import { NextFunction } from 'express-serve-static-core';
import { z } from 'zod';
import { Request, Response } from 'express';
import { errorHandler } from '../utils/response';

//validateBody as production ready
export function validateBody(schema: z.ZodType) {
    return (req: Request, res: Response, next: NextFunction): void => {
        console.log('Validating body:', req.body);

        const result = schema.safeParse(req.body);
        console.log("result in parse", result);
        if (!result.success) {
            const formattedErrors = result.error.issues.map((issue: z.core.$ZodIssue) => ({
                field: issue.path.join('.'),
                message: issue.message
            }));
            errorHandler(
                res,
                'Validation failed',
                400,
                formattedErrors
            );
            return;
        }
        req.body = result.data;
        next();
    };
}
//validateParams as production ready
export function validateParams(schema: z.ZodType) {
    return (req: Request, res: Response, next: NextFunction): void => {
        const result = schema.safeParse(req.params);
        if (!result.success) {
            const formattedErrors = result.error.issues.map((issue: z.core.$ZodIssue) => ({
                field: issue.path.join('.'),
                message: issue.message
            }));
            errorHandler(
                res,
                'Validation failed',
                400,
                formattedErrors
            );
            return;
        }
        req.params = result.data as import('express-serve-static-core').ParamsDictionary;
        next();
    };
}

// validateQuery — validates req.query against a Zod schema.
// Unknown query params are stripped silently by default (use .strict() on the schema to reject them instead).
// After validation, req.query is replaced with the clean, transformed output.
export function validateQuery(schema: z.ZodType) {
    return (req: Request, res: Response, next: NextFunction): void => {
        const result = schema.safeParse(req.query);
        if (!result.success) {
            const formattedErrors = result.error.issues.map((issue: z.core.$ZodIssue) => ({
                field: issue.path.join('.'),
                message: issue.message,
            }));
            errorHandler(
                res,
                'Invalid query parameters',
                400,
                formattedErrors
            );
            return;
        }
        // Attach to req.parsedQuery — keeps req.query untouched (avoids type fight),
        // controllers read from req.parsedQuery with a single typed cast.
        req.parsedQuery = result.data as Record<string, any>;
        next();
    };
}
