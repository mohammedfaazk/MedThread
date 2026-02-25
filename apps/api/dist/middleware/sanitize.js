"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeInput = void 0;
exports.sanitizeBody = sanitizeBody;
exports.validateAndSanitize = validateAndSanitize;
const express_mongo_sanitize_1 = __importDefault(require("express-mongo-sanitize"));
/**
 * Sanitize user input to prevent NoSQL injection
 */
exports.sanitizeInput = (0, express_mongo_sanitize_1.default)({
    replaceWith: '_',
    onSanitize: ({ req, key }) => {
        console.warn(`Sanitized input detected: ${key}`);
    },
});
/**
 * Custom input sanitization middleware
 */
function sanitizeBody(req, res, next) {
    if (req.body) {
        req.body = sanitizeObject(req.body);
    }
    next();
}
/**
 * Recursively sanitize an object
 */
function sanitizeObject(obj) {
    if (typeof obj !== 'object' || obj === null) {
        return sanitizeString(obj);
    }
    if (Array.isArray(obj)) {
        return obj.map(item => sanitizeObject(item));
    }
    const sanitized = {};
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            sanitized[key] = sanitizeObject(obj[key]);
        }
    }
    return sanitized;
}
/**
 * Sanitize string to prevent XSS
 */
function sanitizeString(value) {
    if (typeof value !== 'string') {
        return value;
    }
    // Remove potentially dangerous characters
    return value
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '')
        .trim();
}
/**
 * Validate and sanitize specific fields
 */
function validateAndSanitize(fields) {
    return (req, res, next) => {
        for (const field of fields) {
            if (req.body[field]) {
                req.body[field] = sanitizeString(req.body[field]);
            }
        }
        next();
    };
}
