"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const account_service_1 = require("../services/account.service");
const asyncHandler_1 = require("../middleware/asyncHandler");
const router = (0, express_1.Router)();
/**
 * GET /api/v1/account/deletion-preview
 * Get preview of what will be deleted
 */
router.get('/deletion-preview', auth_1.authenticate, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const preview = await account_service_1.accountService.getAccountDeletionPreview(req.userId);
    res.json({
        success: true,
        data: preview
    });
}));
/**
 * POST /api/v1/account/deactivate
 * Deactivate account (reversible)
 */
router.post('/deactivate', auth_1.authenticate, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const result = await account_service_1.accountService.deactivateAccount(req.userId);
    res.json({
        success: true,
        message: result.message,
        data: {
            username: result.username,
            email: result.email,
        }
    });
}));
/**
 * POST /api/v1/account/reactivate
 * Reactivate account
 */
router.post('/reactivate', auth_1.authenticate, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const result = await account_service_1.accountService.reactivateAccount(req.userId);
    res.json({
        success: true,
        message: result.message,
        data: {
            username: result.username,
        }
    });
}));
/**
 * DELETE /api/v1/account/delete-permanently
 * Permanently delete account and all data
 */
router.delete('/delete-permanently', auth_1.authenticate, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { confirmation } = req.body;
    // Require explicit confirmation
    if (confirmation !== 'DELETE MY ACCOUNT') {
        return res.status(400).json({
            success: false,
            error: 'Confirmation text does not match. Please type "DELETE MY ACCOUNT" to confirm.'
        });
    }
    const result = await account_service_1.accountService.deleteAccountPermanently(req.userId);
    res.json({
        success: true,
        message: result.message,
        data: {
            username: result.username,
            email: result.email,
        }
    });
}));
exports.default = router;
