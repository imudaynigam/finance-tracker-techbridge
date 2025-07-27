import express from 'express';
import { AuthController } from '../controllers/authController';
import { authLimiter } from '../middleware/rateLimiter';

const router = express.Router();

// Apply rate limiting to all auth routes
router.use(authLimiter);

// Auth routes
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/logout', AuthController.logout);
router.get('/me', AuthController.getCurrentUser);

export default router; 