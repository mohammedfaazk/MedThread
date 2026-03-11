import rateLimit from 'express-rate-limit';

// General API rate limiter
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 1000 : 100, // Higher limit in development
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for localhost in development
    if (process.env.NODE_ENV === 'development') {
      const ip = req.ip || req.connection.remoteAddress;
      return ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1';
    }
    return false;
  }
});

// Strict rate limiter for authentication endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 50 : 5, // Higher limit in development
  message: 'Too many login attempts, please try again after 15 minutes.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
  skip: (req) => {
    // Skip rate limiting for localhost in development
    if (process.env.NODE_ENV === 'development') {
      const ip = req.ip || req.connection.remoteAddress;
      return ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1';
    }
    return false;
  }
});

// Rate limiter for password reset
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 password reset requests per hour
  message: 'Too many password reset attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for file uploads
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // Limit each IP to 20 uploads per hour
  message: 'Too many upload requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for creating posts/comments
export const createContentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 30, // Limit each IP to 30 posts/comments per hour
  message: 'Too many posts created, please slow down.',
  standardHeaders: true,
  legacyHeaders: false,
});
