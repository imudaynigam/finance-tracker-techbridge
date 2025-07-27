import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user: {
    userId: number;
    email: string;
    role: string;
  };
}

// Extend the global Express namespace
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: number;
        email: string;
        role: string;
      };
    }
  }
} 