import rateLimit from 'express-rate-limit';

// Auth endpoints: 50 requests per 15 minutes (increased for testing)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 requests per windowMs (increased from 5)
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Transaction endpoints: 100 requests per hour
export const transactionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many transaction requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Analytics endpoints: 50 requests per hour
export const analyticsLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // limit each IP to 50 requests per windowMs
  message: 'Too many analytics requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
}); 