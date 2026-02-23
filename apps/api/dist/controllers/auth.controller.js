"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = exports.AuthController = void 0;
const auth_service_1 = require("../services/auth.service");
const auth_validator_1 = require("../validators/auth.validator");
const asyncHandler_1 = require("../middleware/asyncHandler");
class AuthController {
    constructor() {
        this.register = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const validatedData = auth_validator_1.registerSchema.parse(req.body);
            const result = await auth_service_1.authService.register(validatedData);
            res.status(201).json({
                success: true,
                data: result,
                message: 'Registration successful'
            });
        });
        this.login = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const validatedData = auth_validator_1.loginSchema.parse(req.body);
            const result = await auth_service_1.authService.login(validatedData);
            res.status(200).json({
                success: true,
                data: result,
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
            // In a stateless JWT system, logout is handled client-side
            // If using refresh tokens, you would invalidate them here
            res.status(200).json({
                success: true,
                message: 'Logout successful'
            });
        });
    }
}
exports.AuthController = AuthController;
exports.authController = new AuthController();
