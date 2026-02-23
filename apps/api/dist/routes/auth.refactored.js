"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_refactored_1 = require("../middleware/auth.refactored");
const router = (0, express_1.Router)();
exports.authRouter = router;
/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', auth_controller_1.authController.register);
/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', auth_controller_1.authController.login);
/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  Private
 */
router.post('/refresh', auth_refactored_1.authenticate, auth_controller_1.authController.refreshToken);
/**
 * @route   GET /api/auth/me
 * @desc    Get current user
 * @access  Private
 */
router.get('/me', auth_refactored_1.authenticate, auth_controller_1.authController.me);
/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post('/logout', auth_refactored_1.authenticate, auth_controller_1.authController.logout);
