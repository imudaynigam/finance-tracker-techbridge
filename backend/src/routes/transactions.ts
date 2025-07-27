import express from 'express';
import { TransactionController } from '../controllers/transactionController';
import { authenticateToken } from '../middleware/auth';
import { requireUserOrAdmin } from '../middleware/rbac';
import { transactionLimiter } from '../middleware/rateLimiter';

const router = express.Router();

// Apply rate limiting to all transaction routes
router.use(transactionLimiter);

// Apply authentication to all routes
router.use(authenticateToken);

// Get all transactions for the authenticated user
router.get('/', TransactionController.getTransactions);

// Get a specific transaction
router.get('/:id', TransactionController.getTransaction);

// Create a new transaction (admin and user only)
router.post('/', requireUserOrAdmin, TransactionController.createTransaction);

// Update a transaction (admin and user only)
router.put('/:id', requireUserOrAdmin, TransactionController.updateTransaction);

// Delete a transaction (admin and user only)
router.delete('/:id', requireUserOrAdmin, TransactionController.deleteTransaction);

export default router; 