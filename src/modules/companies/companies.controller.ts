import { Request, Response } from 'express';
import { successHandler, errorHandler } from '../../shared/utils/response';
import { CompanyQuery } from './companies.model';
import companyService from './companies.service';

// --------------------
// 🎮 Company Controller
// Note: All request validation is handled by middleware in companies.routes.ts
//       before any handler here is invoked.
// --------------------

/**
 * GET /companies
 * Fetch all companies with pagination, sorting and filters.
 * req.query is pre-validated and transformed by validateQuery(CompanyQuerySchema).
 */
export const getAllCompanies = async (req: Request, res: Response): Promise<void> => {
    // req.parsedQuery is set by validateQuery(CompanyQuerySchema) middleware.
    // Single cast — no double `as unknown as` needed.
    const { page, limit, sort_by, sort_order, ...filters } = req.parsedQuery as CompanyQuery;

    const result = await companyService.getAllCompanies(
        page,
        limit,
        sort_by,
        sort_order,
        filters,
    );

    if (!result.success) {
        errorHandler(res, result.message, result.statusCode);
        return;
    }

    successHandler(res, 'Companies fetched successfully', 200, result.data, result.meta);
};

/**
 * GET /companies/:id
 * Fetch a single company by id.
 * — req.params.id is already validated and transformed to a number by validateParams middleware.
 */
export const getCompanyById = async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as unknown as number;

    const result = await companyService.getCompanyById(id);

    if (!result.success) {
        errorHandler(res, result.message, result.statusCode);
        return;
    }

    successHandler(res, 'Company fetched successfully', 200, result.data);
};

/**
 * POST /companies
 * Create a new company.
 * — req.body is already validated & stripped of unknown fields by validateBody middleware.
 */
export const createCompany = async (req: Request, res: Response): Promise<void> => {
    const result = await companyService.createCompany(req.body);

    if (!result.success) {
        errorHandler(res, result.message, result.statusCode);
        return;
    }

    successHandler(res, 'Company created successfully', 201, result.data);
};

/**
 * PATCH /companies/:id
 * Partially update a company.
 * — req.params.id validated & transformed; req.body validated & stripped by middleware.
 */
export const updateCompany = async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as unknown as number;

    if (Object.keys(req.body).length === 0) {
        errorHandler(res, 'No fields provided to update', 400);
        return;
    }

    const result = await companyService.updateCompany(id, req.body);

    if (!result.success) {
        errorHandler(res, result.message, result.statusCode);
        return;
    }

    successHandler(res, 'Company updated successfully', 200, result.data);
};

/**
 * DELETE /companies/:id
 * Soft-delete a company (sets is_active = false).
 * — req.params.id validated & transformed by validateParams middleware.
 */
export const deleteCompany = async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as unknown as number;

    const result = await companyService.deleteCompany(id);

    if (!result.success) {
        errorHandler(res, result.message, result.statusCode);
        return;
    }

    successHandler(res, 'Company deleted successfully', 200, result.data);
};
