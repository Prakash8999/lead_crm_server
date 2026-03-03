import { Router } from 'express';
import { validateBody, validateParams, validateQuery } from '../../shared/middleware/validation.middleware';
import {
    CreateUserSchema,
    UpdateUserSchema,
    UserIdParamSchema,
    UserQuerySchema,
} from './users.model';
import {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
} from './users.controller';

const router = Router();

// --------------------
// 👤 User Routes
// --------------------

// GET /users  — paginated list (query validated + stripped)
router.get('/', validateQuery(UserQuerySchema), getAllUsers);

// GET /users/:id  — single record
router.get(
    '/:id',
    validateParams(UserIdParamSchema),
    getUserById,
);

// POST /users  — create (strict: rejects unknown fields)
router.post(
    '/',
    validateBody(CreateUserSchema),
    createUser,
);

// PATCH /users/:id  — partial update (strict: rejects unknown fields)
router.patch(
    '/:id',
    validateParams(UserIdParamSchema),
    validateBody(UpdateUserSchema),
    updateUser,
);

// DELETE /users/:id  — soft delete
router.delete(
    '/:id',
    validateParams(UserIdParamSchema),
    deleteUser,
);

export default router;
