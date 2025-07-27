import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../index';
import { User } from '../models/User';

const userRepository = AppDataSource.getRepository(User);

export class AuthController {
  // Register new user
  static async register(req: Request, res: Response) {
    try {
      const { email, password, firstName, lastName, role = 'user' } = req.body;

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
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create new user
      const user = userRepository.create({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role
      });

      await userRepository.save(user);

      // Generate JWT token
      const jwtSecret = process.env.JWT_SECRET || 'fallback-secret';
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        jwtSecret,
        { expiresIn: '1d' }
      );

      // Return user data (without password) and token
      const { password: _, ...userWithoutPassword } = user;
      res.status(201).json({
        message: 'User registered successfully',
        user: userWithoutPassword,
        token
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Login user
  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }

      // Find user by email
      const user = await userRepository.findOne({ where: { email } });
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Generate JWT token
      const jwtSecret = process.env.JWT_SECRET || 'fallback-secret';
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        jwtSecret,
        { expiresIn: '1d' }
      );

      // Return user data (without password) and token
      const { password: _, ...userWithoutPassword } = user;
      res.json({
        message: 'Login successful',
        user: userWithoutPassword,
        token
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Logout user (client-side token removal)
  static async logout(req: Request, res: Response) {
    try {
      // Since JWT tokens are stateless, logout is handled client-side
      // This endpoint can be used for logging purposes or future token blacklisting
      res.json({ message: 'Logout successful' });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Get current user profile
  static async getCurrentUser(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      
      const user = await userRepository.findOne({ where: { id: userId } });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Return user data without password
      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      console.error('Get current user error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Get current user profile (alias for getCurrentUser)
  static async getProfile(req: any, res: Response) {
    try {
      const userId = req.user.id;
      const user = await userRepository.findOne({ where: { id: userId } });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Return user data without password
      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
} 