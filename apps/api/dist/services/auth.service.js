"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = exports.AuthService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = require("@medthread/database");
const config_1 = require("../config");
const errors_1 = require("../utils/errors");
class AuthService {
    constructor() {
        this.SALT_ROUNDS = 12;
    }
    async register(input) {
        // Check if user already exists
        const existingUser = await database_1.prisma.user.findFirst({
            where: {
                OR: [
                    { email: input.email },
                    { username: input.username }
                ]
            }
        });
        if (existingUser) {
            if (existingUser.email === input.email) {
                throw new errors_1.ConflictError('Email already registered');
            }
            throw new errors_1.ConflictError('Username already taken');
        }
        // Hash password
        const passwordHash = await bcrypt_1.default.hash(input.password, this.SALT_ROUNDS);
        // Create user with doctor verification status if role is DOCTOR
        const user = await database_1.prisma.user.create({
            data: {
                email: input.email,
                username: input.username,
                passwordHash,
                role: input.role,
                doctorVerificationStatus: input.role === 'DOCTOR' ? 'PENDING' : null,
            },
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
                doctorVerificationStatus: true,
            }
        });
        // Generate token
        const token = this.generateToken(user.id, user.role);
        return {
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                doctorVerificationStatus: user.doctorVerificationStatus || undefined,
            },
        };
    }
    async login(input) {
        // Find user
        const user = await database_1.prisma.user.findUnique({
            where: { email: input.email },
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
                passwordHash: true,
                isSuspended: true,
                doctorVerificationStatus: true,
            }
        });
        if (!user) {
            throw new errors_1.UnauthorizedError('Invalid email or password');
        }
        // Check if user is suspended
        if (user.isSuspended) {
            throw new errors_1.UnauthorizedError('Account suspended. Please contact support.');
        }
        // Verify password
        const isValidPassword = await bcrypt_1.default.compare(input.password, user.passwordHash);
        if (!isValidPassword) {
            throw new errors_1.UnauthorizedError('Invalid email or password');
        }
        // Generate token
        const token = this.generateToken(user.id, user.role);
        return {
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                doctorVerificationStatus: user.doctorVerificationStatus || undefined,
            },
        };
    }
    async verifyToken(token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, config_1.config.jwtSecret);
            return decoded;
        }
        catch (error) {
            throw new errors_1.UnauthorizedError('Invalid or expired token');
        }
    }
    async refreshToken(userId) {
        const user = await database_1.prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, role: true, isSuspended: true }
        });
        if (!user) {
            throw new errors_1.UnauthorizedError('User not found');
        }
        if (user.isSuspended) {
            throw new errors_1.UnauthorizedError('Account suspended');
        }
        return this.generateToken(user.id, user.role);
    }
    generateToken(userId, role) {
        return jsonwebtoken_1.default.sign({ userId, role }, config_1.config.jwtSecret, { expiresIn: config_1.config.jwtExpiresIn });
    }
}
exports.AuthService = AuthService;
exports.authService = new AuthService();
