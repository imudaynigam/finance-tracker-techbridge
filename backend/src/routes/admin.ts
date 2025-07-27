import express from 'express';
import { AdminController } from '../controllers/adminController';
import { authenticateToken } from '../middleware/auth';
import { requireAdmin } from '../middleware/rbac';
import { adminLimiter } from '../middleware/rateLimiter';

const router = express.Router();

// Apply rate limiting to all admin routes
router.use(adminLimiter);

// Apply authentication to all routes
router.use(authenticateToken);

// Apply admin-only access control to all routes
router.use(requireAdmin);

// Get system overview
router.get('/overview', AdminController.getSystemOverview);

// Get all users
router.get('/users', AdminController.getAllUsers);

// Get system analytics
router.get('/analytics', AdminController.getSystemAnalytics);

export default router; 