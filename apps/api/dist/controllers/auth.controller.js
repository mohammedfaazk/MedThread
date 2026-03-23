"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = exports.AuthController = void 0;
const auth_service_1 = require("../services/auth.service");
const email_service_1 = require("../services/email.service");
const auth_validator_1 = require("../validators/auth.validator");
const asyncHandler_1 = require("../middleware/asyncHandler");
const cookies_1 = require("../utils/cookies");
class AuthController {
    constructor() {
        this.register = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const validatedData = auth_validator_1.registerSchema.parse(req.body);
            const result = await auth_service_1.authService.register(validatedData);
            // Set token in httpOnly cookie
            (0, cookies_1.setAuthCookie)(res, result.token);
            // Send welcome email
            email_service_1.emailService.sendWelcomeEmail({
                username: result.user.username,
                email: result.user.email,
                loginUrl: 'http://localhost:3000/login',
            }).catch(err => console.error('Failed to send welcome email:', err));
            res.status(201).json({
                success: true,
                data: {
                    user: result.user,
                    token: result.token,
                },
                message: 'Registration successful'
            });
        });
        this.login = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const validatedData = auth_validator_1.loginSchema.parse(req.body);
            const result = await auth_service_1.authService.login(validatedData);
            // Set token in httpOnly cookie
            (0, cookies_1.setAuthCookie)(res, result.token);
            // Log admin login
            if (result.user.role === 'ADMIN') {
                const { auditLogService } = require('../services/audit-log.service');
                auditLogService.createLog({
                    action: 'ADMIN_LOGIN',
                    adminId: result.user.id,
                    details: {
                        email: result.user.email,
                        username: result.user.username,
                    },
                    ipAddress: req.headers['x-forwarded-for']?.toString().split(',')[0].trim() || req.socket.remoteAddress,
                    userAgent: req.headers['user-agent'],
                }).catch((err) => console.error('Audit log failed:', err));
            }
            res.status(200).json({
                success: true,
                data: {
                    user: result.user,
                    // Still send token for backward compatibility
                    token: result.token,
                },
                message: 'Login successful'
            });
        });
        this.refreshToken = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            if (!req.userId) {
                return res.status(401).json({
                    success: false,
                    error: 'Authentication required'
                });
            }
            const token = await auth_service_1.authService.refreshToken(req.userId);
            res.status(200).json({
                success: true,
                data: { token },
                message: 'Token refreshed successfully'
            });
        });
        this.me = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            if (!req.userId) {
                return res.status(401).json({
                    success: false,
                    error: 'Authentication required'
                });
            }
            // This would typically call a user service to get full user details
            res.status(200).json({
                success: true,
                data: {
                    userId: req.userId,
                    role: req.userRole
                }
            });
        });
        this.logout = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            // Clear httpOnly cookies
            (0, cookies_1.clearAuthCookies)(res);
            // Log admin logout
            if (req.userId && req.userRole === 'ADMIN') {
                const { auditLogService } = require('../services/audit-log.service');
                auditLogService.createLog({
                    action: 'ADMIN_LOGOUT',
                    adminId: req.userId,
                    ipAddress: req.headers['x-forwarded-for']?.toString().split(',')[0].trim() || req.socket.remoteAddress,
                    userAgent: req.headers['user-agent'],
                }).catch((err) => console.error('Audit log failed:', err));
            }
            res.status(200).json({
                success: true,
                message: 'Logout successful'
            });
        });
        this.verifyPassword = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            if (!req.userId) {
                return res.status(401).json({
                    success: false,
                    error: 'Authentication required'
                });
            }
            const { password } = req.body;
            if (!password) {
                return res.status(400).json({
                    success: false,
                    error: 'Password required'
                });
            }
            const isValid = await auth_service_1.authService.verifyPassword(req.userId, password);
            if (!isValid) {
                return res.status(401).json({
                    success: false,
                    error: 'Invalid password'
                });
            }
            res.status(200).json({
                success: true,
                message: 'Password verified'
            });
        });
    }
}
exports.AuthController = AuthController;
exports.authController = new AuthController();
