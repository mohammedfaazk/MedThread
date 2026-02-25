"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.revenueRouter = void 0;
const express_1 = require("express");
const auth_refactored_1 = require("../middleware/auth.refactored");
const revenue_service_1 = require("../services/revenue.service");
exports.revenueRouter = (0, express_1.Router)();
/**
 * GET /api/revenue/subscription-tiers
 * Get all subscription tiers
 */
exports.revenueRouter.get('/revenue/subscription-tiers', async (req, res) => {
    try {
        const tiers = await revenue_service_1.revenueService.getSubscriptionTiers();
        res.json({
            success: true,
            data: { tiers }
        });
    }
    catch (error) {
        console.error('[API] Error fetching subscription tiers:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch subscription tiers'
        });
    }
});
/**
 * POST /api/revenue/subscribe
 * Purchase subscription (doctors only)
 */
exports.revenueRouter.post('/revenue/subscribe', auth_refactored_1.authenticate, async (req, res) => {
    try {
        const doctorId = req.userId;
        const { tierId, billingCycle, paymentMethod, isTrial } = req.body;
        if (!tierId || !billingCycle || !paymentMethod) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields'
            });
        }
        const result = await revenue_service_1.revenueService.purchaseSubscription({
            doctorId,
            tierId: parseInt(tierId),
            billingCycle,
            paymentMethod,
            isTrial
        });
        res.json({
            success: true,
            data: result
        });
    }
    catch (error) {
        console.error('[API] Error purchasing subscription:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to purchase subscription'
        });
    }
});
/**
 * GET /api/revenue/my-subscription
 * Get current subscription (doctors only)
 */
exports.revenueRouter.get('/revenue/my-subscription', auth_refactored_1.authenticate, async (req, res) => {
    try {
        const doctorId = req.userId;
        const subscription = await revenue_service_1.revenueService.getDoctorSubscription(doctorId);
        res.json({
            success: true,
            data: { subscription }
        });
    }
    catch (error) {
        console.error('[API] Error fetching subscription:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch subscription'
        });
    }
});
/**
 * POST /api/revenue/record-commission
 * Record consultation commission (internal use)
 */
exports.revenueRouter.post('/revenue/record-commission', auth_refactored_1.authenticate, async (req, res) => {
    try {
        const { consultationFee, doctorId, appointmentId, patientId } = req.body;
        if (!consultationFee || !doctorId || !appointmentId || !patientId) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields'
            });
        }
        const result = await revenue_service_1.revenueService.recordConsultationCommission({
            consultationFee: parseFloat(consultationFee),
            doctorId,
            appointmentId,
            patientId
        });
        res.json({
            success: true,
            data: result
        });
    }
    catch (error) {
        console.error('[API] Error recording commission:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to record commission'
        });
    }
});
/**
 * GET /api/revenue/doctor-summary
 * Get doctor revenue summary
 */
exports.revenueRouter.get('/revenue/doctor-summary', auth_refactored_1.authenticate, async (req, res) => {
    try {
        const doctorId = req.userId;
        const { startDate, endDate } = req.query;
        const summary = await revenue_service_1.revenueService.getDoctorRevenueSummary(doctorId, startDate ? new Date(startDate) : undefined, endDate ? new Date(endDate) : undefined);
        res.json({
            success: true,
            data: summary
        });
    }
    catch (error) {
        console.error('[API] Error fetching doctor revenue:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch revenue summary'
        });
    }
});
/**
 * POST /api/revenue/advertisements
 * Create advertisement (admin only)
 */
exports.revenueRouter.post('/revenue/advertisements', auth_refactored_1.authenticate, async (req, res) => {
    try {
        const result = await revenue_service_1.revenueService.createAdvertisement(req.body);
        res.status(201).json({
            success: true,
            data: result
        });
    }
    catch (error) {
        console.error('[API] Error creating advertisement:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create advertisement'
        });
    }
});
/**
 * GET /api/revenue/advertisements
 * Get active advertisements
 */
exports.revenueRouter.get('/revenue/advertisements', async (req, res) => {
    try {
        const { adType, placementPage, userType, specialty, location } = req.query;
        const ads = await revenue_service_1.revenueService.getActiveAds({
            adType: adType,
            placementPage: placementPage,
            userType: userType,
            specialty: specialty,
            location: location
        });
        res.json({
            success: true,
            data: { ads }
        });
    }
    catch (error) {
        console.error('[API] Error fetching advertisements:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch advertisements'
        });
    }
});
/**
 * POST /api/revenue/ad-impression
 * Record ad impression
 */
exports.revenueRouter.post('/revenue/ad-impression', async (req, res) => {
    try {
        const { adId, userId, userType, pageUrl, placementPosition } = req.body;
        await revenue_service_1.revenueService.recordAdImpression({
            adId: parseInt(adId),
            userId,
            userType,
            pageUrl,
            placementPosition,
            userAgent: req.headers['user-agent'] || '',
            ipAddress: req.ip || '',
            deviceType: req.headers['user-agent']?.includes('Mobile') ? 'mobile' : 'desktop'
        });
        res.json({
            success: true,
            message: 'Impression recorded'
        });
    }
    catch (error) {
        console.error('[API] Error recording impression:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to record impression'
        });
    }
});
/**
 * POST /api/revenue/ad-click
 * Record ad click
 */
exports.revenueRouter.post('/revenue/ad-click', async (req, res) => {
    try {
        const { adId, impressionId } = req.body;
        await revenue_service_1.revenueService.recordAdClick(parseInt(adId), parseInt(impressionId));
        res.json({
            success: true,
            message: 'Click recorded'
        });
    }
    catch (error) {
        console.error('[API] Error recording click:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to record click'
        });
    }
});
/**
 * POST /api/revenue/data-insights
 * Create data insight (admin only)
 */
exports.revenueRouter.post('/revenue/data-insights', auth_refactored_1.authenticate, async (req, res) => {
    try {
        const result = await revenue_service_1.revenueService.createDataInsight(req.body);
        res.status(201).json({
            success: true,
            data: result
        });
    }
    catch (error) {
        console.error('[API] Error creating data insight:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create data insight'
        });
    }
});
/**
 * GET /api/revenue/platform-analytics
 * Get platform revenue analytics (admin only)
 */
exports.revenueRouter.get('/revenue/platform-analytics', auth_refactored_1.authenticate, async (req, res) => {
    try {
        const { periodType = 'daily', startDate, endDate } = req.query;
        const revenue = await revenue_service_1.revenueService.getPlatformRevenue(periodType, startDate ? new Date(startDate) : undefined, endDate ? new Date(endDate) : undefined);
        res.json({
            success: true,
            data: { revenue }
        });
    }
    catch (error) {
        console.error('[API] Error fetching platform analytics:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch platform analytics'
        });
    }
});
exports.default = exports.revenueRouter;
