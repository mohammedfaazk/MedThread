"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const database_1 = require("@medthread/database");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const zod_1 = require("zod");
exports.authRouter = (0, express_1.Router)();
const registerSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    username: zod_1.z.string().min(3),
    password: zod_1.z.string().min(8),
    role: zod_1.z.enum(['PATIENT', 'DOCTOR', 'NURSE', 'MEDICAL_STUDENT', 'PHARMACIST', 'ADMIN'])
});
exports.authRouter.post('/register', async (req, res) => {
    try {
        const data = registerSchema.parse(req.body);
        const existingUser = await database_1.prisma.user.findFirst({
            where: { OR: [{ email: data.email }, { username: data.username }] }
        });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                error: existingUser.email === data.email
                    ? 'Email already registered'
                    : 'Username already taken'
            });
        }
        const passwordHash = await bcrypt_1.default.hash(data.password, 10);
        const user = await database_1.prisma.user.create({
            data: {
                email: data.email,
                username: data.username,
                passwordHash,
                role: data.role
            }
        });
        const token = jsonwebtoken_1.default.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
        res.json({
            success: true,
            data: {
                token,
                user: { id: user.id, username: user.username, email: user.email, role: user.role }
            }
        });
    }
    catch (error) {
        console.error('Registration error:', error);
        // Handle Zod validation errors
        if (error instanceof zod_1.z.ZodError) {
            const firstError = error.errors[0];
            return res.status(400).json({
                success: false,
                error: `${firstError.path.join('.')}: ${firstError.message}`
            });
        }
        res.status(400).json({ success: false, error: 'Registration failed' });
    }
});
exports.authRouter.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await database_1.prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const valid = await bcrypt_1.default.compare(password, user.passwordHash);
        if (!valid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
        res.json({
            success: true,
            data: {
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    doctorVerificationStatus: user.doctorVerificationStatus
                }
            }
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(400).json({ success: false, error: 'Login failed' });
    }
});
exports.default = exports.authRouter;
