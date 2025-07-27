import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../index';
import { User } from '../models/User';

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret';
    const decoded = jwt.verify(token, jwtSecret) as any;
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { id: decoded.userId } });

    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    // Use type assertion to add user to request
    (req as any).user = {
      userId: user.id,
      email: user.email,
      role: user.role
    };
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(403).json({ message: 'Invalid token' });
  }
}; 