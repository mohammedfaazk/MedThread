"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setAuthCookie = setAuthCookie;
exports.setRefreshCookie = setRefreshCookie;
exports.clearAuthCookies = clearAuthCookies;
exports.getTokenFromRequest = getTokenFromRequest;
const COOKIE_OPTIONS = {
    httpOnly: true, // Prevents JavaScript access
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    sameSite: 'strict', // CSRF protection
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
};
/**
 * Set JWT token in httpOnly cookie
 */
function setAuthCookie(res, token) {
    res.cookie('auth_token', token, COOKIE_OPTIONS);
}
/**
 * Set refresh token in httpOnly cookie
 */
function setRefreshCookie(res, refreshToken) {
    res.cookie('refresh_token', refreshToken, {
        ...COOKIE_OPTIONS,
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });
}
/**
 * Clear auth cookies
 */
function clearAuthCookies(res) {
    res.clearCookie('auth_token', { path: '/' });
    res.clearCookie('refresh_token', { path: '/' });
}
/**
 * Get token from cookie or Authorization header
 */
function getTokenFromRequest(req) {
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
