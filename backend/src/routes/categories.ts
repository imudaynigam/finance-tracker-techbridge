import { Router } from 'express';
import { CategoryController } from '../controllers/categoryController';
import { authenticateToken } from '../middleware/auth';
import { requireAdmin, requireAnyRole } from '../middleware/rbac';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// GET /api/categories - Get all categories (all roles can view)
router.get('/', requireAnyRole, CategoryController.getAll);

// POST /api/categories - Create category (admin only)
router.post('/', requireAdmin, CategoryController.create);

// PUT /api/categories/:id - Update category (admin only)
router.put('/:id', requireAdmin, CategoryController.update);

// DELETE /api/categories/:id - Delete category (admin only)
router.delete('/:id', requireAdmin, CategoryController.delete);

export default router; 