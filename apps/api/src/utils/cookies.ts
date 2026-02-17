import { Response } from 'express';

const COOKIE_OPTIONS = {
  httpOnly: true, // Prevents JavaScript access
  secure: process.env.NODE_ENV === 'production', // HTTPS only in production
  sameSite: 'strict' as const, // CSRF protection
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/',
};

/**
 * Set JWT token in httpOnly cookie
 */
export function setAuthCookie(res: Response, token: string) {
  res.cookie('auth_token', token, COOKIE_OPTIONS);
}

/**
 * Set refresh token in httpOnly cookie
 */
export function setRefreshCookie(res: Response, refreshToken: string) {
  res.cookie('refresh_token', refreshToken, {
    ...COOKIE_OPTIONS,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });
}

/**
 * Clear auth cookies
 */
export function clearAuthCookies(res: Response) {
  res.clearCookie('auth_token', { path: '/' });
  res.clearCookie('refresh_token', { path: '/' });
}

/**
 * Get token from cookie or Authorization header
 */
export function getTokenFromRequest(req: any): string | null {
  // First check cookies
  if (req.cookies && req.cookies.auth_token) {
    return req.cookies.auth_token;
  }

  // Fallback to Authorization header for backward compatibility
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  return null;
}
