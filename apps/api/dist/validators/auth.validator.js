"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshTokenSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address'),
    username: zod_1.z.string()
        .min(3, 'Username must be at least 3 characters')
        .max(30, 'Username must not exceed 30 characters')
        .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
    password: zod_1.z.string()
        .min(8, 'Password must be at least 8 characters'),
    role: zod_1.z.enum(['PATIENT', 'DOCTOR', 'NURSE', 'MEDICAL_STUDENT', 'PHARMACIST'], {
        errorMap: () => ({ message: 'Invalid role' })
    }),
    pincode: zod_1.z.union([
        zod_1.z.string().regex(/^\d{6}$/, 'Pincode must be exactly 6 digits'),
        zod_1.z.string().length(0),
        zod_1.z.undefined()
    ]).optional()
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address'),
    password: zod_1.z.string().min(1, 'Password is required')
});
exports.refreshTokenSchema = zod_1.z.object({
    refreshToken: zod_1.z.string().min(1, 'Refresh token is required')
});
