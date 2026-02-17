import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from './auth';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  Object.keys(store).forEach(key => {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  });
}, 5 * 60 * 1000);

/**
 * Rate limiting middleware
 * @param windowMs - Time window in milliseconds
 * @param maxRequests - Maximum number of requests allowed in the window
 */
export const rateLimit = (windowMs: number, maxRequests: number) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    // Use userId if authenticated, otherwise use IP address
    const identifier = req.userId || req.ip || 'unknown';
    const key = `${identifier}:${req.path}`;
    const now = Date.now();

    // Initialize or get existing rate limit data
    if (!store[key] || store[key].resetTime < now) {
      store[key] = {
        count: 1,
        resetTime: now + windowMs,
      };
      return next();
    }

    // Increment request count
    store[key].count++;

    // Check if limit exceeded
    if (store[key].count > maxRequests) {
      const retryAfter = Math.ceil((store[key].resetTime - now) / 1000);
      
      res.setHeader('Retry-After', retryAfter.toString());
      res.setHeader('X-RateLimit-Limit', maxRequests.toString());
      res.setHeader('X-RateLimit-Remaining', '0');
      res.setHeader('X-RateLimit-Reset', new Date(store[key].resetTime).toISOString());

      return res.status(429).json({
        success: false,
        error: 'Too many requests, please try again later',
        retryAfter,
      });
    }

    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', maxRequests.toString());
    res.setHeader('X-RateLimit-Remaining', (maxRequests - store[key].count).toString());
    res.setHeader('X-RateLimit-Reset', new Date(store[key].resetTime).toISOString());

    next();
  };
};

// Preset rate limiters
export const notificationRateLimit = rateLimit(60 * 1000, 60); // 60 requests per minute
export const strictRateLimit = rateLimit(60 * 1000, 10); // 10 requests per minute
export const generalRateLimit = rateLimit(60 * 1000, 100); // 100 requests per minute
