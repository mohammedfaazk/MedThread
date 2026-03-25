import { Request, Response, NextFunction } from 'express';
import { cache } from '../utils/simpleCache';

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  message?: string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (req: Request) => string;
}

interface RateLimitInfo {
  count: number;
  resetTime: number;
  firstRequest: number;
}

class RateLimiter {
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = {
      message: 'Too many requests, please try again later.',
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
      keyGenerator: (req) => req.ip || 'unknown',
      ...config
    };
  }

  middleware() {
    return async (req: Request, res: Response, next: NextFunction) => {
      const key = `rate_limit:${this.config.keyGenerator!(req)}`;
      const now = Date.now();
      const windowStart = now - this.config.windowMs;

      try {
        // Get current rate limit info
        let rateLimitInfo = await cache.get<RateLimitInfo>(key);

        if (!rateLimitInfo || rateLimitInfo.resetTime <= now) {
          // Initialize new window
          rateLimitInfo = {
            count: 0,
            resetTime: now + this.config.windowMs,
            firstRequest: now
          };
        }

        // Check if limit exceeded
        if (rateLimitInfo.count >= this.config.maxRequests) {
          const remainingTime = Math.ceil((rateLimitInfo.resetTime - now) / 1000);
          
          res.set({
            'X-RateLimit-Limit': this.config.maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimitInfo.resetTime.toString(),
            'Retry-After': remainingTime.toString()
          });

          return res.status(429).json({
            error: this.config.message,
            retryAfter: remainingTime
          });
        }

        // Increment counter
        rateLimitInfo.count++;
        
        // Store updated info
        await cache.set(key, rateLimitInfo, this.config.windowMs);

        // Set rate limit headers
        res.set({
          'X-RateLimit-Limit': this.config.maxRequests.toString(),
          'X-RateLimit-Remaining': (this.config.maxRequests - rateLimitInfo.count).toString(),
          'X-RateLimit-Reset': rateLimitInfo.resetTime.toString()
        });

        // Handle response to potentially skip counting
        if (this.config.skipSuccessfulRequests || this.config.skipFailedRequests) {
          const originalSend = res.send;
          const self = this;
          res.send = function(data) {
            const shouldSkip = 
              (res.statusCode < 400 && self.config.skipSuccessfulRequests) ||
              (res.statusCode >= 400 && self.config.skipFailedRequests);

            if (shouldSkip) {
              // Decrement counter
              rateLimitInfo!.count--;
              cache.set(key, rateLimitInfo!, self.config.windowMs);
            }

            return originalSend.call(this, data);
          };
        }

        next();
      } catch (error) {
        console.error('[RateLimiter] Error:', error);
        // On error, allow the request to proceed
        next();
      }
    };
  }
}

// Predefined rate limiters
export const rateLimiters = {
  // General API rate limiting - more lenient for development
  general: new RateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: process.env.NODE_ENV === 'production' ? 100 : 1000,
    message: 'Too many requests from this IP, please try again later.'
  }),

  // Strict rate limiting for authentication endpoints - more lenient for development
  auth: new RateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: process.env.NODE_ENV === 'production' ? 5 : 50,
    message: 'Too many authentication attempts, please try again later.',
    skipSuccessfulRequests: true
  }),

  // Rate limiting for posting content - more lenient for development
  posting: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: process.env.NODE_ENV === 'production' ? 5 : 50,
    message: 'Too many posts created, please wait before posting again.',
    keyGenerator: (req) => `${req.ip}:${req.userId || 'anonymous'}`
  }),

  // Rate limiting for search endpoints - more lenient for development
  search: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: process.env.NODE_ENV === 'production' ? 30 : 300,
    message: 'Too many search requests, please slow down.'
  }),

  // Rate limiting for medical AI endpoints - more lenient for development
  medicalAI: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: process.env.NODE_ENV === 'production' ? 10 : 100,
    message: 'Too many AI requests, please wait before trying again.',
    keyGenerator: (req) => `${req.ip}:${req.userId || 'anonymous'}`
  }),

  // Rate limiting for file uploads - more lenient for development
  upload: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: process.env.NODE_ENV === 'production' ? 3 : 30,
    message: 'Too many file uploads, please wait before uploading again.',
    keyGenerator: (req) => `${req.ip}:${req.userId || 'anonymous'}`
  }),

  // Rate limiting for password reset - more lenient for development
  passwordReset: new RateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: process.env.NODE_ENV === 'production' ? 3 : 30,
    message: 'Too many password reset attempts, please try again later.',
    keyGenerator: (req) => req.body?.email || req.ip
  }),

  // Rate limiting for email verification - more lenient for development
  emailVerification: new RateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: process.env.NODE_ENV === 'production' ? 5 : 50,
    message: 'Too many verification emails sent, please check your inbox.',
    keyGenerator: (req) => req.body?.email || req.ip
  }),

  // Rate limiting for report submissions - more lenient for development
  reporting: new RateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: process.env.NODE_ENV === 'production' ? 10 : 100,
    message: 'Too many reports submitted, please wait before reporting again.',
    keyGenerator: (req) => `${req.ip}:${req.userId || 'anonymous'}`
  })
};

// Advanced rate limiter with sliding window
export class SlidingWindowRateLimiter {
  private windowMs: number;
  private maxRequests: number;
  private keyGenerator: (req: Request) => string;

  constructor(config: {
    windowMs: number;
    maxRequests: number;
    keyGenerator?: (req: Request) => string;
  }) {
    this.windowMs = config.windowMs;
    this.maxRequests = config.maxRequests;
    this.keyGenerator = config.keyGenerator || ((req) => req.ip || 'unknown');
  }

  middleware() {
    return async (req: Request, res: Response, next: NextFunction) => {
      const key = `sliding_rate_limit:${this.keyGenerator(req)}`;
      const now = Date.now();
      const windowStart = now - this.windowMs;

      try {
        // Get request timestamps within the window
        const timestamps = await cache.get<number[]>(key) || [];
        
        // Filter out old timestamps
        const validTimestamps = timestamps.filter(timestamp => timestamp > windowStart);
        
        // Check if limit exceeded
        if (validTimestamps.length >= this.maxRequests) {
          const oldestTimestamp = Math.min(...validTimestamps);
          const retryAfter = Math.ceil((oldestTimestamp + this.windowMs - now) / 1000);
          
          res.set({
            'X-RateLimit-Limit': this.maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'Retry-After': retryAfter.toString()
          });

          return res.status(429).json({
            error: 'Rate limit exceeded',
            retryAfter
          });
        }

        // Add current timestamp
        validTimestamps.push(now);
        
        // Store updated timestamps
        await cache.set(key, validTimestamps, this.windowMs);

        // Set headers
        res.set({
          'X-RateLimit-Limit': this.maxRequests.toString(),
          'X-RateLimit-Remaining': (this.maxRequests - validTimestamps.length).toString()
        });

        next();
      } catch (error) {
        console.error('[SlidingWindowRateLimiter] Error:', error);
        next();
      }
    };
  }
}

// IP-based rate limiter with progressive penalties
export class ProgressiveRateLimiter {
  private baseWindowMs: number;
  private baseMaxRequests: number;
  private penaltyMultiplier: number;
  private maxPenaltyLevel: number;

  constructor(config: {
    baseWindowMs: number;
    baseMaxRequests: number;
    penaltyMultiplier?: number;
    maxPenaltyLevel?: number;
  }) {
    this.baseWindowMs = config.baseWindowMs;
    this.baseMaxRequests = config.baseMaxRequests;
    this.penaltyMultiplier = config.penaltyMultiplier || 2;
    this.maxPenaltyLevel = config.maxPenaltyLevel || 5;
  }

  middleware() {
    return async (req: Request, res: Response, next: NextFunction) => {
      const ip = req.ip || 'unknown';
      const penaltyKey = `penalty:${ip}`;
      const rateLimitKey = `progressive_rate_limit:${ip}`;

      try {
        // Get current penalty level
        const penaltyLevel = await cache.get<number>(penaltyKey) || 0;
        
        // Calculate current limits based on penalty level
        const currentMaxRequests = Math.max(1, this.baseMaxRequests - penaltyLevel);
        const currentWindowMs = this.baseWindowMs * Math.pow(this.penaltyMultiplier, penaltyLevel);

        // Check rate limit
        const rateLimitInfo = await cache.get<RateLimitInfo>(rateLimitKey);
        const now = Date.now();

        let currentInfo = rateLimitInfo;
        if (!currentInfo || currentInfo.resetTime <= now) {
          currentInfo = {
            count: 0,
            resetTime: now + currentWindowMs,
            firstRequest: now
          };
        }

        if (currentInfo.count >= currentMaxRequests) {
          // Increase penalty level
          const newPenaltyLevel = Math.min(penaltyLevel + 1, this.maxPenaltyLevel);
          await cache.set(penaltyKey, newPenaltyLevel, 24 * 60 * 60 * 1000); // 24 hours

          const remainingTime = Math.ceil((currentInfo.resetTime - now) / 1000);
          
          return res.status(429).json({
            error: `Rate limit exceeded. Penalty level: ${newPenaltyLevel}`,
            retryAfter: remainingTime,
            penaltyLevel: newPenaltyLevel
          });
        }

        // Increment counter
        currentInfo.count++;
        await cache.set(rateLimitKey, currentInfo, currentWindowMs);

        // Set headers
        res.set({
          'X-RateLimit-Limit': currentMaxRequests.toString(),
          'X-RateLimit-Remaining': (currentMaxRequests - currentInfo.count).toString(),
          'X-RateLimit-Reset': currentInfo.resetTime.toString(),
          'X-RateLimit-Penalty-Level': penaltyLevel.toString()
        });

        next();
      } catch (error) {
        console.error('[ProgressiveRateLimiter] Error:', error);
        next();
      }
    };
  }
}

// Rate limiter for specific user actions
export function createUserActionRateLimiter(action: string, config: RateLimitConfig) {
  return new RateLimiter({
    ...config,
    keyGenerator: (req) => `${action}:${req.userId || req.ip}`
  });
}

// Export middleware functions
export const generalRateLimit = rateLimiters.general.middleware();
export const authRateLimit = rateLimiters.auth.middleware();
export const authLimiter = authRateLimit; // Alias for backward compatibility
export const postingRateLimit = rateLimiters.posting.middleware();
export const searchRateLimit = rateLimiters.search.middleware();
export const medicalAIRateLimit = rateLimiters.medicalAI.middleware();
export const uploadRateLimit = rateLimiters.upload.middleware();
export const passwordResetRateLimit = rateLimiters.passwordReset.middleware();
export const emailVerificationRateLimit = rateLimiters.emailVerification.middleware();
export const reportingRateLimit = rateLimiters.reporting.middleware();
export const apiLimiter = generalRateLimit; // Alias for backward compatibility