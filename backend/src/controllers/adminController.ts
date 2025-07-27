import { Request, Response } from 'express';
import { AppDataSource } from '../index';
import { User, UserRole } from '../models/User';
import { Transaction } from '../models/Transaction';
import { Category } from '../models/Category';
import bcrypt from 'bcryptjs';

const userRepository = AppDataSource.getRepository(User);
const transactionRepository = AppDataSource.getRepository(Transaction);
const categoryRepository = AppDataSource.getRepository(Category);

export class AdminController {
  // Get system overview statistics
  static async getSystemOverview(req: Request, res: Response) {
    try {
      console.log('Admin overview requested');
      
      // Fetch all users and transactions at the top
      const allUsers = await userRepository.find();
      const allTransactions = await transactionRepository.find();

      // Basic counts
      const totalUsers = allUsers.length;
      console.log('Total users:', totalUsers);
      
      const totalTransactions = allTransactions.length;
      console.log('Total transactions:', totalTransactions);
      
      const totalCategories = await categoryRepository.count();
      console.log('Total categories:', totalCategories);
      
      // Simple user roles (avoid complex query for now)
      const userRoles = [
        { role: 'admin', count: allUsers.filter(u => u.role === 'admin').length },
        { role: 'user', count: allUsers.filter(u => u.role === 'user').length }
      ];
      console.log('User roles:', userRoles);

      // Calculate recent activity (show last 5 transactions as recent for now)
      const recentTransactions = Math.min(allTransactions.length, 5);
      const newUsers = Math.min(allUsers.length, 3);
      
      console.log('Recent transactions count:', recentTransactions);
      console.log('New users count:', newUsers);

      // Simple financial metrics (avoid complex queries for now)
      const totalIncome = allTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0);
      const totalExpenses = allTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0);
      const netAmount = totalIncome - totalExpenses;
      
      console.log('Financial stats:', { totalIncome, totalExpenses, netAmount });

      const response = {
        overview: {
          totalUsers,
          totalTransactions,
          totalCategories,
          recentTransactions,
          newUsers,
          totalIncome,
          totalExpenses,
          netAmount
        },
        userRoles,
        recentActivity: {
          transactions: recentTransactions,
          newUsers
        }
      };
      
      console.log('Sending response:', response);
      res.json(response);
    } catch (error) {
      console.error('Get system overview error:', error);
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }

  // Get all users with their statistics
  static async getAllUsers(req: Request, res: Response) {
    try {
      const users = await userRepository.find({
        order: { createdAt: 'DESC' }
      });

      // Get user statistics
      const usersWithStats = await Promise.all(
        users.map(async (user) => {
          const userTransactions = await transactionRepository.count({
            where: { userId: user.id }
          });

          const userIncome = await transactionRepository
            .createQueryBuilder('transaction')
            .select('SUM(transaction.amount)', 'total')
            .where('transaction.userId = :userId', { userId: user.id })
            .andWhere('transaction.type = :incomeType', { incomeType: 'income' })
            .getRawOne();

          const userExpenses = await transactionRepository
            .createQueryBuilder('transaction')
            .select('SUM(transaction.amount)', 'total')
            .where('transaction.userId = :userId', { userId: user.id })
            .andWhere('transaction.type = :expenseType', { expenseType: 'expense' })
            .getRawOne();

          const totalIncome = Number(userIncome?.total || 0);
          const totalExpenses = Number(userExpenses?.total || 0);

          return {
            ...user,
            password: undefined, // Don't send password
            stats: {
              totalTransactions: userTransactions,
              totalIncome,
              totalExpenses,
              netAmount: totalIncome - totalExpenses
            }
          };
        })
      );

      res.json({ users: usersWithStats });
    } catch (error) {
      console.error('Get all users error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Create new user
  static async createUser(req: Request, res: Response) {
    try {
      const { email, password, firstName, lastName, role } = req.body;

      // Validate input
      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }

      // Check if user already exists
      const existingUser = await userRepository.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ message: 'User with this email already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = userRepository.create({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: role || UserRole.USER
      });

      await userRepository.save(user);

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      res.status(201).json({
        message: 'User created successfully',
        user: userWithoutPassword
      });
    } catch (error) {
      console.error('Create user error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Update user
  static async updateUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { email, firstName, lastName, role, password } = req.body;

      const user = await userRepository.findOne({ where: { id: parseInt(id) } });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Update fields
      if (email !== undefined) user.email = email;
      if (firstName !== undefined) user.firstName = firstName;
      if (lastName !== undefined) user.lastName = lastName;
      if (role !== undefined) user.role = role;

      // Update password if provided
      if (password) {
        user.password = await bcrypt.hash(password, 10);
      }

      await userRepository.save(user);

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      res.json({
        message: 'User updated successfully',
        user: userWithoutPassword
      });
    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Delete user
  static async deleteUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = parseInt(id);
      const currentUserId = (req as any).user?.userId;

      // Prevent admin from deleting themselves
      if (currentUserId && userId === currentUserId) {
        return res.status(400).json({ message: 'Cannot delete your own account' });
      }

      const user = await userRepository.findOne({ where: { id: userId } });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Delete user's transactions first
      await transactionRepository.delete({ userId });

      // Delete user
      await userRepository.delete({ id: userId });

      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Get user activity and transactions
  static async getUserDetails(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = parseInt(id);

      const user = await userRepository.findOne({ where: { id: userId } });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Get user's transactions
      const transactions = await transactionRepository.find({
        where: { userId },
        relations: ['category'],
        order: { createdAt: 'DESC' },
        take: 50 // Limit to recent 50 transactions
      });

      // Get transaction statistics
      const transactionStats = await transactionRepository
        .createQueryBuilder('transaction')
        .select('transaction.type', 'type')
        .addSelect('COUNT(*)', 'count')
        .addSelect('SUM(transaction.amount)', 'total')
        .where('transaction.userId = :userId', { userId })
        .groupBy('transaction.type')
        .getRawMany();

      // Get category breakdown
      const categoryBreakdown = await transactionRepository
        .createQueryBuilder('transaction')
        .leftJoin('transaction.category', 'category')
        .select('category.name', 'category')
        .addSelect('COUNT(*)', 'count')
        .addSelect('SUM(transaction.amount)', 'total')
        .where('transaction.userId = :userId', { userId })
        .groupBy('category.name')
        .orderBy('total', 'DESC')
        .getRawMany();

      // Remove password from user object
      const { password: _, ...userWithoutPassword } = user;

      res.json({
        user: userWithoutPassword,
        transactions,
        stats: {
          transactionStats,
          categoryBreakdown
        }
      });
    } catch (error) {
      console.error('Get user details error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Get system analytics
  static async getSystemAnalytics(req: Request, res: Response) {
    try {
      const { period = '30' } = req.query;
      const days = parseInt(period as string);

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Get transaction trends
      const transactionTrends = await transactionRepository
        .createQueryBuilder('transaction')
        .select('DATE(transaction.createdAt)', 'date')
        .addSelect('COUNT(*)', 'count')
        .addSelect('SUM(CASE WHEN transaction.type = :incomeType THEN transaction.amount ELSE 0 END)', 'income')
        .addSelect('SUM(CASE WHEN transaction.type = :expenseType THEN transaction.amount ELSE 0 END)', 'expenses')
        .where('transaction.createdAt >= :startDate', { startDate })
        .setParameter('incomeType', 'income')
        .setParameter('expenseType', 'expense')
        .groupBy('DATE(transaction.createdAt)')
        .orderBy('date', 'ASC')
        .getRawMany();

      // Get user registration trends
      const userTrends = await userRepository
        .createQueryBuilder('user')
        .select('DATE(user.createdAt)', 'date')
        .addSelect('COUNT(*)', 'count')
        .where('user.createdAt >= :startDate', { startDate })
        .groupBy('DATE(user.createdAt)')
        .orderBy('date', 'ASC')
        .getRawMany();

      // Get category usage statistics
      const categoryUsage = await transactionRepository
        .createQueryBuilder('transaction')
        .leftJoin('transaction.category', 'category')
        .select('category.name', 'category')
        .addSelect('COUNT(*)', 'count')
        .addSelect('SUM(transaction.amount)', 'total')
        .where('transaction.createdAt >= :startDate', { startDate })
        .groupBy('category.name')
        .orderBy('count', 'DESC')
        .getRawMany();

      // Get top users by transaction count
      const topUsers = await transactionRepository
        .createQueryBuilder('transaction')
        .leftJoin('transaction.user', 'user')
        .select('user.email', 'email')
        .addSelect('user.firstName', 'firstName')
        .addSelect('user.lastName', 'lastName')
        .addSelect('COUNT(*)', 'transactionCount')
        .addSelect('SUM(transaction.amount)', 'totalAmount')
        .where('transaction.createdAt >= :startDate', { startDate })
        .groupBy('user.id')
        .orderBy('transactionCount', 'DESC')
        .limit(10)
        .getRawMany();

      res.json({
        transactionTrends,
        userTrends,
        categoryUsage,
        topUsers
      });
    } catch (error) {
      console.error('Get system analytics error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
} 