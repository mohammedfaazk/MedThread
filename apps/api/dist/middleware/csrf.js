"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCsrfToken = generateCsrfToken;
exports.verifyCsrfToken = verifyCsrfToken;
exports.getCsrfToken = getCsrfToken;
const crypto_1 = __importDefault(require("crypto"));
// Store CSRF tokens in memory (in production, use Redis)
const csrfTokens = new Map();
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
function generateCsrfToken(req) {
    const token = crypto_1.default.randomBytes(32).toString('hex');
    const sessionId = req.headers['x-session-id'] || req.ip || 'unknown';
    csrfTokens.set(sessionId, {
        token,
        expires: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    });
    return token;
}
/**
 * Verify CSRF token
 */
function verifyCsrfToken(req, res, next) {
    // Skip CSRF for GET, HEAD, OPTIONS
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        return next();
    }
    const token = req.headers['x-csrf-token'];
    const sessionId = req.headers['x-session-id'] || req.ip || 'unknown';
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
function getCsrfToken(req, res) {
    const token = generateCsrfToken(req);
    res.json({
        success: true,
        csrfToken: token,
    });
}
