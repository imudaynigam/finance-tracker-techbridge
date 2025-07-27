import rateLimit from 'express-rate-limit';

// Auth endpoints: 20 requests per 15 minutes (increased for development)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 requests per window (increased from 5)
  message: {
    error: 'Too many authentication attempts. Please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    console.log(`Rate limit exceeded for auth endpoint: ${req.ip} - ${req.method} ${req.path}`);
    res.status(429).json({
      error: 'Too many authentication attempts. Please try again later.',
      retryAfter: Math.ceil(15 * 60 / 1000) // 15 minutes in seconds
    });
  }
});

// Transaction endpoints: 100 requests per hour
export const transactionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100, // 100 requests per window
  message: {
    error: 'Too many transaction requests. Please try again later.',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    console.log(`Rate limit exceeded for transaction endpoint: ${req.ip} - ${req.method} ${req.path}`);
    res.status(429).json({
      error: 'Too many transaction requests. Please try again later.',
      retryAfter: Math.ceil(60 * 60 / 1000) // 1 hour in seconds
    });
  }
});

// Analytics endpoints: 50 requests per hour
export const analyticsLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // 50 requests per window
  message: {
    error: 'Too many analytics requests. Please try again later.',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    console.log(`Rate limit exceeded for analytics endpoint: ${req.ip} - ${req.method} ${req.path}`);
    res.status(429).json({
      error: 'Too many analytics requests. Please try again later.',
      retryAfter: Math.ceil(60 * 60 / 1000) // 1 hour in seconds
    });
  }
});

// Admin endpoints: 200 requests per hour
export const adminLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 200, // 200 requests per window
  message: {
    error: 'Too many admin requests. Please try again later.',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    console.log(`Rate limit exceeded for admin endpoint: ${req.ip} - ${req.method} ${req.path}`);
    res.status(429).json({
      error: 'Too many admin requests. Please try again later.',
      retryAfter: Math.ceil(60 * 60 / 1000) // 1 hour in seconds
    });
  }
});

// General API limiter: 1000 requests per hour
export const generalLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 1000, // 1000 requests per window
  message: {
    error: 'Too many requests. Please try again later.',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    console.log(`General rate limit exceeded: ${req.ip} - ${req.method} ${req.path}`);
    res.status(429).json({
      error: 'Too many requests. Please try again later.',
      retryAfter: Math.ceil(60 * 60 / 1000) // 1 hour in seconds
    });
  }
}); 