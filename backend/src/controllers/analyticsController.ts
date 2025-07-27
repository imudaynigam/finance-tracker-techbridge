import { Request, Response } from 'express';
import { AppDataSource } from '../index';
import { Transaction } from '../models/Transaction';
import { User } from '../models/User';
import { cacheService } from '../utils/cache';

const transactionRepository = AppDataSource.getRepository(Transaction);
const userRepository = AppDataSource.getRepository(User);

export class AnalyticsController {
  // Get user analytics with caching
  static async getUserAnalytics(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      const userRole = (req as any).user?.role;
      
      console.log('Analytics request - User ID:', userId, 'Role:', userRole);
      
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      
      // For read-only users, clear any existing cache to ensure fresh data
      if (userRole === 'read-only') {
        console.log('Clearing cache for read-only user');
        await cacheService.invalidateUserCache(userId);
      }
      
      // Try to get from cache first
      const cachedData = await cacheService.getCachedAnalytics(userId);
      if (cachedData) {
        console.log('Serving analytics from cache for user:', userId);
        return res.json(cachedData);
      }

      // If not in cache, fetch from database
      let transactions;
      if (userRole === 'read-only') {
        console.log('Read-only user - fetching all transactions');
        // Read-only users can see all transactions
        transactions = await transactionRepository.find({
          relations: ['category'],
          order: { date: 'DESC' }
        });
        console.log('Read-only user - found transactions:', transactions.length);
      } else {
        console.log('Regular user - fetching user-specific transactions');
        // Other users see only their own transactions
        transactions = await transactionRepository.find({
          where: { userId },
          relations: ['category'],
          order: { date: 'DESC' }
        });
        console.log('Regular user - found transactions:', transactions.length);
      }

      const analytics = {
        totalTransactions: transactions.length,
        totalIncome: transactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + Number(t.amount), 0),
        totalExpenses: transactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + Number(t.amount), 0),
        transactions: transactions
      };

      console.log('Analytics calculated:', analytics);

      // Cache the result for 15 minutes
      await cacheService.cacheAnalytics(userId, analytics);
      console.log('Cached analytics for user:', userId);

      res.json(analytics);
    } catch (error) {
      console.error('Error fetching user analytics:', error);
      res.status(500).json({ error: 'Failed to fetch analytics' });
    }
  }

  // Get monthly trends
  static async getMonthlyTrends(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      const userRole = (req as any).user?.role;
      
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      
      const { year } = req.query;
      const currentYear = year ? parseInt(year as string) : new Date().getFullYear();

      const cacheKey = `monthly_trends:${userId}:${currentYear}`;
      const cachedData = await cacheService.get(cacheKey);
      if (cachedData) {
        return res.json(cachedData);
      }

      const startDate = new Date(currentYear, 0, 1);
      const endDate = new Date(currentYear, 11, 31);

      const queryBuilder = transactionRepository
        .createQueryBuilder('transaction')
        .leftJoinAndSelect('transaction.category', 'category')
        .andWhere('transaction.date >= :startDate', { startDate })
        .andWhere('transaction.date <= :endDate', { endDate });

      // Read-only users can see all transactions, others see only their own
      if (userRole !== 'read-only') {
        queryBuilder.andWhere('transaction.userId = :userId', { userId });
      }

      const transactions = await queryBuilder.getMany();

      const monthlyData = Array.from({ length: 12 }, (_, month) => {
        const monthTransactions = transactions.filter(t => {
          const transactionDate = new Date(t.date);
          return transactionDate.getMonth() === month;
        });

        const income = monthTransactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + Number(t.amount), 0);
        
        const expenses = monthTransactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + Number(t.amount), 0);

        return {
          month: new Date(currentYear, month).toLocaleString('default', { month: 'short' }),
          income,
          expenses,
          net: income - expenses
        };
      });

      const result = { monthlyData, year: currentYear };
      
      // Cache for 15 minutes
      await cacheService.set(cacheKey, result, 15 * 60);
      
      res.json(result);
    } catch (error) {
      console.error('Error fetching monthly trends:', error);
      res.status(500).json({ error: 'Failed to fetch monthly trends' });
    }
  }

  // Get yearly overview
  static async getYearlyOverview(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      const userRole = (req as any).user?.role;
      
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      
      const { year } = req.query;
      const currentYear = year ? parseInt(year as string) : new Date().getFullYear();

      const cacheKey = `yearly_overview:${userId}:${currentYear}`;
      const cachedData = await cacheService.get(cacheKey);
      if (cachedData) {
        return res.json(cachedData);
      }

      const startDate = new Date(currentYear, 0, 1);
      const endDate = new Date(currentYear, 11, 31);

      const queryBuilder = transactionRepository
        .createQueryBuilder('transaction')
        .leftJoinAndSelect('transaction.category', 'category')
        .andWhere('transaction.date >= :startDate', { startDate })
        .andWhere('transaction.date <= :endDate', { endDate });

      // Read-only users can see all transactions, others see only their own
      if (userRole !== 'read-only') {
        queryBuilder.andWhere('transaction.userId = :userId', { userId });
      }

      const transactions = await queryBuilder.getMany();

      const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0);
      
      const totalExpenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const result = {
        year: currentYear,
        totalIncome,
        totalExpenses,
        netAmount: totalIncome - totalExpenses,
        transactionCount: transactions.length
      };

      // Cache for 15 minutes
      await cacheService.set(cacheKey, result, 15 * 60);
      
      res.json(result);
    } catch (error) {
      console.error('Error fetching yearly overview:', error);
      res.status(500).json({ error: 'Failed to fetch yearly overview' });
    }
  }

  // Get category breakdown
  static async getCategoryBreakdown(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      const userRole = (req as any).user?.role;
      
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      
      const { month, year } = req.query;
      
      const currentDate = new Date();
      const currentMonth = month ? parseInt(month as string) - 1 : currentDate.getMonth();
      const currentYear = year ? parseInt(year as string) : currentDate.getFullYear();

      const cacheKey = `category_breakdown:${userId}:${currentYear}:${currentMonth}`;
      const cachedData = await cacheService.get(cacheKey);
      if (cachedData) {
        return res.json(cachedData);
      }

      const startDate = new Date(currentYear, currentMonth, 1);
      const endDate = new Date(currentYear, currentMonth + 1, 0);

      const queryBuilder = transactionRepository
        .createQueryBuilder('transaction')
        .leftJoinAndSelect('transaction.category', 'category')
        .andWhere('transaction.type = :type', { type: 'expense' })
        .andWhere('transaction.date >= :startDate', { startDate })
        .andWhere('transaction.date <= :endDate', { endDate });

      // Read-only users can see all transactions, others see only their own
      if (userRole !== 'read-only') {
        queryBuilder.andWhere('transaction.userId = :userId', { userId });
      }

      const transactions = await queryBuilder.getMany();

      const categoryBreakdown = transactions.reduce((acc, transaction) => {
        const categoryName = transaction.category?.name || 'Uncategorized';
        acc[categoryName] = (acc[categoryName] || 0) + Number(transaction.amount);
        return acc;
      }, {} as Record<string, number>);

      const result = {
        categoryBreakdown,
        month: new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long' }),
        year: currentYear,
        totalExpenses: Object.values(categoryBreakdown).reduce((sum, amount) => sum + amount, 0)
      };

      // Cache for 15 minutes
      await cacheService.set(cacheKey, result, 15 * 60);
      
      res.json(result);
    } catch (error) {
      console.error('Error fetching category breakdown:', error);
      res.status(500).json({ error: 'Failed to fetch category breakdown' });
    }
  }
} 