import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../models/User';

export const requireRole = (allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    
    if (!user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    next();
  };
};

export const requireAdmin = requireRole([UserRole.ADMIN]);
export const requireUserOrAdmin = requireRole([UserRole.USER, UserRole.ADMIN]);
export const requireAnyRole = requireRole([UserRole.ADMIN, UserRole.USER, UserRole.READ_ONLY]); 