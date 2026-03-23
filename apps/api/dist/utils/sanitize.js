"use strict";
/**
 * Content sanitization utilities to prevent XSS attacks
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeHtml = sanitizeHtml;
exports.sanitizeText = sanitizeText;
exports.sanitizeNotificationMetadata = sanitizeNotificationMetadata;
exports.sanitizeUrl = sanitizeUrl;
exports.truncateText = truncateText;
exports.isValidEmail = isValidEmail;
exports.isValidUsername = isValidUsername;
/**
 * Sanitize HTML content by removing potentially dangerous tags and attributes
 * This is a basic implementation - for production, consider using a library like DOMPurify
 */
function sanitizeHtml(html) {
    if (!html)
        return '';
    // Remove script tags and their content
    let sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    // Remove event handlers (onclick, onerror, etc.)
    sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
    sanitized = sanitized.replace(/\s*on\w+\s*=\s*[^\s>]*/gi, '');
    // Remove javascript: protocol
    sanitized = sanitized.replace(/javascript:/gi, '');
    // Remove data: protocol (can be used for XSS)
    sanitized = sanitized.replace(/data:text\/html/gi, '');
    // Remove iframe tags
    sanitized = sanitized.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
    // Remove object and embed tags
    sanitized = sanitized.replace(/<(object|embed)\b[^<]*(?:(?!<\/\1>)<[^<]*)*<\/\1>/gi, '');
    return sanitized;
}
/**
 * Sanitize plain text by escaping HTML special characters
 */
function sanitizeText(text) {
    if (!text)
        return '';
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
}
/**
 * Sanitize notification metadata
 * Ensures all user-provided content is safe to display
 */
function sanitizeNotificationMetadata(metadata) {
    const sanitized = {};
    for (const [key, value] of Object.entries(metadata)) {
        if (typeof value === 'string') {
            // Sanitize string values
            sanitized[key] = sanitizeText(value);
        }
        else if (typeof value === 'object' && value !== null) {
            // Recursively sanitize nested objects
            sanitized[key] = sanitizeNotificationMetadata(value);
        }
        else {
            // Keep other types as-is (numbers, booleans, null)
            sanitized[key] = value;
        }
    }
    return sanitized;
}
/**
 * Validate and sanitize URL
 * Ensures URL is safe and doesn't contain javascript: or data: protocols
 */
function sanitizeUrl(url) {
    if (!url)
        return '';
    // Remove whitespace
    const trimmed = url.trim();
    // Check for dangerous protocols
    const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:'];
    const lowerUrl = trimmed.toLowerCase();
    for (const protocol of dangerousProtocols) {
        if (lowerUrl.startsWith(protocol)) {
            return '';
        }
    }
    // Only allow http, https, and relative URLs
    if (!trimmed.startsWith('http://') &&
        !trimmed.startsWith('https://') &&
        !trimmed.startsWith('/')) {
        return '';
    }
    return trimmed;
}
/**
 * Truncate text to a maximum length
 */
function truncateText(text, maxLength) {
    if (!text || text.length <= maxLength)
        return text;
    return text.substring(0, maxLength - 3) + '...';
}
/**
 * Validate email address format
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
/**
 * Validate username format (alphanumeric, underscores, hyphens)
 */
function isValidUsername(username) {
    const usernameRegex = /^[a-zA-Z0-9_-]{3,30}$/;
    return usernameRegex.test(username);
}
