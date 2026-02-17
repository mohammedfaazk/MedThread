import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

// Store CSRF tokens in memory (in production, use Redis)
const csrfTokens = new Map<string, { token: string; expires: number }>();

// Clean up expired tokens every hour
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of csrfTokens.entries()) {
    if (value.expires < now) {
      csrfTokens.delete(key);
    }
  }
}, 60 * 60 * 1000);

/**
 * Generate CSRF token
 */
export function generateCsrfToken(req: Request): string {
  const token = crypto.randomBytes(32).toString('hex');
  const sessionId = req.headers['x-session-id'] as string || req.ip || 'unknown';
  
  csrfTokens.set(sessionId, {
    token,
    expires: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
  });

  return token;
}

/**
 * Verify CSRF token
 */
export function verifyCsrfToken(req: Request, res: Response, next: NextFunction) {
  // Skip CSRF for GET, HEAD, OPTIONS
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  const token = req.headers['x-csrf-token'] as string;
  const sessionId = req.headers['x-session-id'] as string || req.ip || 'unknown';

  if (!token) {
    return res.status(403).json({
      success: false,
      error: 'CSRF token missing',
    });
  }

  const storedToken = csrfTokens.get(sessionId);

  if (!storedToken || storedToken.token !== token) {
    return res.status(403).json({
      success: false,
      error: 'Invalid CSRF token',
    });
  }

  // Check if token expired
  if (storedToken.expires < Date.now()) {
    csrfTokens.delete(sessionId);
    return res.status(403).json({
      success: false,
      error: 'CSRF token expired',
    });
  }

  next();
}

/**
 * Endpoint to get CSRF token
 */
export function getCsrfToken(req: Request, res: Response) {
  const token = generateCsrfToken(req);
  res.json({
    success: true,
    csrfToken: token,
  });
}
