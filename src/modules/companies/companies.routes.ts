import { Router } from 'express';
import { validateBody, validateParams, validateQuery } from '../../shared/middleware/validation.middleware';
import {
    CreateCompanySchema,
    UpdateCompanySchema,
    CompanyIdParamSchema,
    CompanyQuerySchema,
} from './companies.model';
import {
    getAllCompanies,
    getCompanyById,
    createCompany,
    updateCompany,
    deleteCompany,
} from './companies.controller';

const router = Router();

// --------------------
// 🏢 Company Routes
// --------------------

// GET /companies  — paginated list (query validated + stripped)
router.get('/', validateQuery(CompanyQuerySchema), getAllCompanies);

// GET /companies/:id  — single record
router.get(
    '/:id',
    validateParams(CompanyIdParamSchema),
    getCompanyById,
);

// POST /companies  — create (strict: rejects unknown fields)
router.post(
    '/',
    validateBody(CreateCompanySchema),
    createCompany,
);

// PATCH /companies/:id  — partial update (strict: rejects unknown fields)
router.patch(
    '/:id',
    validateParams(CompanyIdParamSchema),
    validateBody(UpdateCompanySchema),
    updateCompany,
);

// DELETE /companies/:id  — soft delete
router.delete(
    '/:id',
    validateParams(CompanyIdParamSchema),
    deleteCompany,
);

export default router;
