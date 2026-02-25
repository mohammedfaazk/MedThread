"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.doctorBusinessRouter = void 0;
const express_1 = require("express");
const database_1 = require("@medthread/database");
const auth_refactored_1 = require("../middleware/auth.refactored");
const doctor_business_service_1 = require("../services/doctor-business.service");
exports.doctorBusinessRouter = (0, express_1.Router)();
/**
 * GET /api/doctor-business/analytics
 * Get business analytics for authenticated doctor
 */
exports.doctorBusinessRouter.get('/doctor-business/analytics', auth_refactored_1.authenticate, async (req, res) => {
    try {
        const userId = req.userId;
        const { startDate, endDate, period = 'month' } = req.query;
        // Verify user is a doctor
        const user = await database_1.prisma.user.findUnique({ where: { id: userId } });
        if (!user || !['DOCTOR', 'NURSE', 'PHARMACIST'].includes(user.role)) {
            return res.status(403).json({
                success: false,
                error: 'Only healthcare professionals can access business analytics'
            });
        }
        const analytics = await doctor_business_service_1.doctorBusinessService.getDoctorAnalytics(userId, {
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
            period: period
        });
        res.json({
            success: true,
            data: analytics
        });
    }
    catch (error) {
        console.error('[API] Error fetching business analytics:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch business analytics'
        });
    }
});
/**
 * GET /api/doctor-business/revenue
 * Get revenue breakdown
 */
exports.doctorBusinessRouter.get('/doctor-business/revenue', auth_refactored_1.authenticate, async (req, res) => {
    try {
        const userId = req.userId;
        const { startDate, endDate } = req.query;
        const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const end = endDate ? new Date(endDate) : new Date();
        const revenue = await doctor_business_service_1.doctorBusinessService.getRevenueBreakdown(userId, start, end);
        res.json({
            success: true,
            data: revenue
        });
    }
    catch (error) {
        console.error('[API] Error fetching revenue:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch revenue data'
        });
    }
});
/**
 * GET /api/doctor-business/retention
 * Get patient retention metrics
 */
exports.doctorBusinessRouter.get('/doctor-business/retention', auth_refactored_1.authenticate, async (req, res) => {
    try {
        const userId = req.userId;
        const retention = await doctor_business_service_1.doctorBusinessService.getPatientRetention(userId);
        res.json({
            success: true,
            data: retention
        });
    }
    catch (error) {
        console.error('[API] Error fetching retention:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch retention data'
        });
    }
});
/**
 * POST /api/doctor-business/promotions
 * Create a new promotion campaign
 */
exports.doctorBusinessRouter.post('/doctor-business/promotions', auth_refactored_1.authenticate, async (req, res) => {
    try {
        const userId = req.userId;
        const { promotionType, title, description, targetSpecialty, targetLocation, targetKeywords, pricePerDay, startDate, endDate } = req.body;
        // Validate required fields
        if (!promotionType || !title || !pricePerDay || !startDate || !endDate) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields'
            });
        }
        // Validate promotion type
        if (!['top_search', 'featured_badge', 'sponsored_answer'].includes(promotionType)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid promotion type'
            });
        }
        const promotion = await doctor_business_service_1.doctorBusinessService.createPromotion(userId, {
            promotionType,
            title,
            description,
            targetSpecialty,
            targetLocation,
            targetKeywords,
            pricePerDay: parseFloat(pricePerDay),
            startDate: new Date(startDate),
            endDate: new Date(endDate)
        });
        res.status(201).json({
            success: true,
            data: promotion,
            message: 'Promotion created successfully. Please complete payment to activate.'
        });
    }
    catch (error) {
        console.error('[API] Error creating promotion:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create promotion'
        });
    }
});
/**
 * POST /api/doctor-business/promotions/:promotionId/activate
 * Activate promotion after payment
 */
exports.doctorBusinessRouter.post('/doctor-business/promotions/:promotionId/activate', auth_refactored_1.authenticate, async (req, res) => {
    try {
        const userId = req.userId;
        const { promotionId } = req.params;
        const { paymentId } = req.body;
        if (!paymentId) {
            return res.status(400).json({
                success: false,
                error: 'Payment ID is required'
            });
        }
        // Verify promotion belongs to user
        const promotion = await database_1.prisma.$queryRaw `
      SELECT * FROM "DoctorPromotion" WHERE id = ${parseInt(promotionId)} AND doctor_id = ${userId}
    `;
        if (promotion.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Promotion not found'
            });
        }
        const activated = await doctor_business_service_1.doctorBusinessService.activatePromotion(parseInt(promotionId), paymentId);
        res.json({
            success: true,
            data: activated,
            message: 'Promotion activated successfully'
        });
    }
    catch (error) {
        console.error('[API] Error activating promotion:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to activate promotion'
        });
    }
});
/**
 * GET /api/doctor-business/promotions
 * Get active promotions for authenticated doctor
 */
exports.doctorBusinessRouter.get('/doctor-business/promotions', auth_refactored_1.authenticate, async (req, res) => {
    try {
        const userId = req.userId;
        const promotions = await doctor_business_service_1.doctorBusinessService.getActivePromotions(userId);
        res.json({
            success: true,
            data: promotions
        });
    }
    catch (error) {
        console.error('[API] Error fetching promotions:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch promotions'
        });
    }
});
/**
 * GET /api/doctor-business/promotions/:promotionId/performance
 * Get promotion performance metrics
 */
exports.doctorBusinessRouter.get('/doctor-business/promotions/:promotionId/performance', auth_refactored_1.authenticate, async (req, res) => {
    try {
        const userId = req.userId;
        const { promotionId } = req.params;
        // Verify promotion belongs to user
        const promotion = await database_1.prisma.$queryRaw `
      SELECT * FROM "DoctorPromotion" WHERE id = ${parseInt(promotionId)} AND doctor_id = ${userId}
    `;
        if (promotion.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Promotion not found'
            });
        }
        const performance = await doctor_business_service_1.doctorBusinessService.getPromotionPerformance(parseInt(promotionId));
        res.json({
            success: true,
            data: performance
        });
    }
    catch (error) {
        console.error('[API] Error fetching promotion performance:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch promotion performance'
        });
    }
});
/**
 * GET /api/doctor-business/featured
 * Get featured doctors (public endpoint)
 */
exports.doctorBusinessRouter.get('/doctor-business/featured', async (req, res) => {
    try {
        const { limit = '10' } = req.query;
        const featured = await doctor_business_service_1.doctorBusinessService.getFeaturedDoctors(parseInt(limit));
        res.json({
            success: true,
            data: featured
        });
    }
    catch (error) {
        console.error('[API] Error fetching featured doctors:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch featured doctors'
        });
    }
});
/**
 * POST /api/doctor-business/promotions/:promotionId/track
 * Track promotion impression or click
 */
exports.doctorBusinessRouter.post('/doctor-business/promotions/:promotionId/track', async (req, res) => {
    try {
        const { promotionId } = req.params;
        const { action, type } = req.body; // action: 'impression' | 'click', type: 'search' | 'answer' | 'badge'
        if (!action || !type) {
            return res.status(400).json({
                success: false,
                error: 'Action and type are required'
            });
        }
        if (action === 'impression') {
            await doctor_business_service_1.doctorBusinessService.trackPromotionImpression(parseInt(promotionId), type);
        }
        else if (action === 'click') {
            await doctor_business_service_1.doctorBusinessService.trackPromotionClick(parseInt(promotionId), type);
        }
        else {
            return res.status(400).json({
                success: false,
                error: 'Invalid action'
            });
        }
        res.json({
            success: true,
            message: 'Tracking recorded'
        });
    }
    catch (error) {
        console.error('[API] Error tracking promotion:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to track promotion'
        });
    }
});
/**
 * POST /api/doctor-business/analytics/update
 * Manually trigger analytics update (admin or cron)
 */
exports.doctorBusinessRouter.post('/doctor-business/analytics/update', auth_refactored_1.authenticate, async (req, res) => {
    try {
        const userId = req.userId;
        const { doctorId } = req.body;
        // Check if admin or updating own analytics
        const user = await database_1.prisma.user.findUnique({ where: { id: userId } });
        const targetDoctorId = doctorId || userId;
        if (doctorId && user?.role !== 'ADMIN' && userId !== doctorId) {
            return res.status(403).json({
                success: false,
                error: 'Unauthorized'
            });
        }
        await doctor_business_service_1.doctorBusinessService.updateDailyAnalytics(targetDoctorId);
        res.json({
            success: true,
            message: 'Analytics updated successfully'
        });
    }
    catch (error) {
        console.error('[API] Error updating analytics:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update analytics'
        });
    }
});
exports.default = exports.doctorBusinessRouter;
