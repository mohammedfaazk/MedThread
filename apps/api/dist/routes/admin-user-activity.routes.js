"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_user_activity_service_1 = require("../services/admin-user-activity.service");
const auth_refactored_1 = require("../middleware/auth.refactored");
const router = (0, express_1.Router)();
/**
 * GET /api/admin-user-activity/user/:userId
 * Get user activity time graphs (admin only)
 */
router.get('/user/:userId', auth_refactored_1.authenticate, (0, auth_refactored_1.requireRole)('ADMIN'), async (req, res) => {
    try {
        const { userId } = req.params;
        const { timeframe } = req.query;
        const data = await admin_user_activity_service_1.adminUserActivityService.getUserActivityTimeGraphs(userId, timeframe || 'hourly');
        res.json({ success: true, data });
    }
    catch (error) {
        console.error('Error fetching user activity graphs:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});
/**
 * POST /api/admin-user-activity/compare
 * Compare activity between multiple users (admin only)
 */
router.post('/compare', auth_refactored_1.authenticate, (0, auth_refactored_1.requireRole)('ADMIN'), async (req, res) => {
    try {
        const { userIds, timeframe } = req.body;
        if (!Array.isArray(userIds) || userIds.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'userIds must be a non-empty array'
            });
        }
        const data = await admin_user_activity_service_1.adminUserActivityService.compareUserActivities(userIds, timeframe || 'hourly');
        res.json({ success: true, data });
    }
    catch (error) {
        console.error('Error comparing user activities:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});
exports.default = router;
