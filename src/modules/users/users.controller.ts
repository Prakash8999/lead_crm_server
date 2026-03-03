import { Request, Response } from 'express';
import { successHandler, errorHandler } from '../../shared/utils/response';
import { UserQuery } from './users.model';
import userService from './users.service';

// --------------------
// 🎮 User Controller
// Note: All request validation is handled by middleware in users.routes.ts
//       before any handler here is invoked.
// --------------------

/**
 * GET /users
 * Fetch all users with pagination, sorting and filters.
 * req.parsedQuery is pre-validated and transformed by validateQuery(UserQuerySchema).
 */
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
    const { page, limit, sort_by, sort_order, ...filters } = req.parsedQuery as UserQuery;

    const result = await userService.getAllUsers(
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

    successHandler(res, 'Users fetched successfully', 200, result.data, result.meta);
};

/**
 * GET /users/:id
 * Fetch a single user by id.
 * — req.params.id is already validated and transformed to a number by validateParams middleware.
 */
export const getUserById = async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as unknown as number;

    const result = await userService.getUserById(id);

    if (!result.success) {
        errorHandler(res, result.message, result.statusCode);
        return;
    }

    successHandler(res, 'User fetched successfully', 200, result.data);
};

/**
 * POST /users
 * Create a new user.
 * — req.body is already validated & stripped of unknown fields by validateBody middleware.
 */
export const createUser = async (req: Request, res: Response): Promise<void> => {
    const result = await userService.createUser(req.body);

    if (!result.success) {
        errorHandler(res, result.message, result.statusCode);
        return;
    }

    successHandler(res, 'User created successfully', 201, result.data);
};

/**
 * PATCH /users/:id
 * Partially update a user.
 * — req.params.id validated & transformed; req.body validated & stripped by middleware.
 */
export const updateUser = async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as unknown as number;

    if (Object.keys(req.body).length === 0) {
        errorHandler(res, 'No fields provided to update', 400);
        return;
    }

    const result = await userService.updateUser(id, req.body);

    if (!result.success) {
        errorHandler(res, result.message, result.statusCode);
        return;
    }

    successHandler(res, 'User updated successfully', 200, result.data);
};

/**
 * DELETE /users/:id
 * Soft-delete a user (sets is_active = false).
 * — req.params.id validated & transformed by validateParams middleware.
 */
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as unknown as number;

    const result = await userService.deleteUser(id);

    if (!result.success) {
        errorHandler(res, result.message, result.statusCode);
        return;
    }

    successHandler(res, 'User deleted successfully', 200, result.data);
};
