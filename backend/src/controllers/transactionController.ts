import { Request, Response } from 'express';
import { AppDataSource } from '../index';
import { Transaction } from '../models/Transaction';
import { User } from '../models/User';
import { cacheService } from '../utils/cache';

const transactionRepository = AppDataSource.getRepository(Transaction);
const userRepository = AppDataSource.getRepository(User);

export class TransactionController {
  // Get all transactions for the authenticated user
  static async getTransactions(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      const userRole = (req as any).user?.role;
      
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      
      const { page = 1, limit = 10, type, categoryId, startDate, endDate } = req.query;

      const queryBuilder = transactionRepository
        .createQueryBuilder('transaction')
        .leftJoinAndSelect('transaction.category', 'category');

      // Read-only users can see all transactions, others see only their own
      if (userRole === 'read-only') {
        // No userId filter for read-only users - they can see all transactions
      } else {
        queryBuilder.where('transaction.userId = :userId', { userId });
      }

      // Apply filters
      if (type) {
        queryBuilder.andWhere('transaction.type = :type', { type });
      }

      if (categoryId) {
        queryBuilder.andWhere('transaction.categoryId = :categoryId', { categoryId });
      }

      if (startDate) {
        queryBuilder.andWhere('transaction.date >= :startDate', { startDate });
      }

      if (endDate) {
        queryBuilder.andWhere('transaction.date <= :endDate', { endDate });
      }

      // Get total count
      const total = await queryBuilder.getCount();

      // Get paginated results
      const transactions = await queryBuilder
        .orderBy('transaction.date', 'DESC')
        .skip((parseInt(page as string) - 1) * parseInt(limit as string))
        .take(parseInt(limit as string))
        .getMany();

      res.json({
        transactions,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          pages: Math.ceil(total / parseInt(limit as string))
        }
      });
    } catch (error) {
      console.error('Error fetching transactions:', error);
      res.status(500).json({ error: 'Failed to fetch transactions' });
    }
  }

  // Get a specific transaction
  static async getTransaction(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      const userRole = (req as any).user?.role;
      
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      
      const { id } = req.params;

      let transaction;
      if (userRole === 'read-only') {
        // Read-only users can view any transaction
        transaction = await transactionRepository.findOne({
          where: { id: parseInt(id) },
          relations: ['category']
        });
      } else {
        // Other users can only view their own transactions
        transaction = await transactionRepository.findOne({
          where: { id: parseInt(id), userId },
          relations: ['category']
        });
      }

      if (!transaction) {
        return res.status(404).json({ error: 'Transaction not found' });
      }

      res.json(transaction);
    } catch (error) {
      console.error('Error fetching transaction:', error);
      res.status(500).json({ error: 'Failed to fetch transaction' });
    }
  }

  // Create a new transaction
  static async createTransaction(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      
      const { type, amount, categoryId, description, date } = req.body;

      const transaction = transactionRepository.create({
        userId,
        type,
        amount: parseFloat(amount),
        categoryId: parseInt(categoryId),
        description,
        date: new Date(date)
      });

      const savedTransaction = await transactionRepository.save(transaction);

      // Invalidate user cache
      await cacheService.invalidateUserCache(userId);
      console.log('Invalidated cache for user:', userId);

      res.status(201).json({
        message: 'Transaction created successfully',
        transaction: savedTransaction
      });
    } catch (error) {
      console.error('Error creating transaction:', error);
      res.status(500).json({ error: 'Failed to create transaction' });
    }
  }

  // Update a transaction
  static async updateTransaction(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      
      const { id } = req.params;
      const { type, amount, categoryId, description, date } = req.body;

      const transaction = await transactionRepository.findOne({
        where: { id: parseInt(id), userId }
      });

      if (!transaction) {
        return res.status(404).json({ error: 'Transaction not found' });
      }

      // Update transaction
      transaction.type = type;
      transaction.amount = parseFloat(amount);
      transaction.categoryId = parseInt(categoryId);
      transaction.description = description;
      transaction.date = new Date(date);

      const updatedTransaction = await transactionRepository.save(transaction);

      // Invalidate user cache
      await cacheService.invalidateUserCache(userId);
      console.log('Invalidated cache for user:', userId);

      res.json({
        message: 'Transaction updated successfully',
        transaction: updatedTransaction
      });
    } catch (error) {
      console.error('Error updating transaction:', error);
      res.status(500).json({ error: 'Failed to update transaction' });
    }
  }

  // Delete a transaction
  static async deleteTransaction(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      
      const { id } = req.params;

      const transaction = await transactionRepository.findOne({
        where: { id: parseInt(id), userId }
      });

      if (!transaction) {
        return res.status(404).json({ error: 'Transaction not found' });
      }

      await transactionRepository.remove(transaction);

      // Invalidate user cache
      await cacheService.invalidateUserCache(userId);
      console.log('Invalidated cache for user:', userId);

      res.json({ message: 'Transaction deleted successfully' });
    } catch (error) {
      console.error('Error deleting transaction:', error);
      res.status(500).json({ error: 'Failed to delete transaction' });
    }
  }
} 