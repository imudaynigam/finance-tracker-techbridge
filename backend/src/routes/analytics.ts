import express from 'express';
import { AnalyticsController } from '../controllers/analyticsController';
import { authenticateToken } from '../middleware/auth';
import { requireAnyRole } from '../middleware/rbac';
import { analyticsLimiter } from '../middleware/rateLimiter';

const router = express.Router();

// Apply rate limiting to all analytics routes
router.use(analyticsLimiter);

// Apply authentication to all routes
router.use(authenticateToken);

// Apply role-based access control to all routes
router.use(requireAnyRole);

// Get user analytics
router.get('/transactions', AnalyticsController.getUserAnalytics);

// Get monthly trends
router.get('/monthly', AnalyticsController.getMonthlyTrends);

// Get yearly overview
router.get('/yearly', AnalyticsController.getYearlyOverview);

// Get category breakdown
router.get('/categories', AnalyticsController.getCategoryBreakdown);

export default router; 