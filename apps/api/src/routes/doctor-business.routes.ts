import { Router } from 'express';
import { prisma } from '@medthread/database';
import { authenticate } from '../middleware/auth.refactored';
import { doctorBusinessService } from '../services/doctor-business.service';

export const doctorBusinessRouter = Router();

/**
 * GET /api/doctor-business/analytics
 * Get business analytics for authenticated doctor
 */
doctorBusinessRouter.get('/doctor-business/analytics', authenticate, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { startDate, endDate, period = 'month' } = req.query;

    // Verify user is a doctor
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !['DOCTOR', 'NURSE', 'PHARMACIST'].includes(user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Only healthcare professionals can access business analytics'
      });
    }

    const analytics = await doctorBusinessService.getDoctorAnalytics(userId, {
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      period: period as any
    });

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
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
doctorBusinessRouter.get('/doctor-business/revenue', authenticate, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate as string) : new Date();

    const revenue = await doctorBusinessService.getRevenueBreakdown(userId, start, end);

    res.json({
      success: true,
      data: revenue
    });
  } catch (error) {
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
doctorBusinessRouter.get('/doctor-business/retention', authenticate, async (req, res) => {
  try {
    const userId = (req as any).userId;

    const retention = await doctorBusinessService.getPatientRetention(userId);

    res.json({
      success: true,
      data: retention
    });
  } catch (error) {
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
doctorBusinessRouter.post('/doctor-business/promotions', authenticate, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const {
      promotionType,
      title,
      description,
      targetSpecialty,
      targetLocation,
      targetKeywords,
      pricePerDay,
      startDate,
      endDate
    } = req.body;

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

    const promotion = await doctorBusinessService.createPromotion(userId, {
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
  } catch (error) {
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
doctorBusinessRouter.post('/doctor-business/promotions/:promotionId/activate', authenticate, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { promotionId } = req.params;
    const { paymentId } = req.body;

    if (!paymentId) {
      return res.status(400).json({
        success: false,
        error: 'Payment ID is required'
      });
    }

    // Verify promotion belongs to user
    const promotion = await prisma.$queryRaw<any[]>`
      SELECT * FROM "DoctorPromotion" WHERE id = ${parseInt(promotionId)} AND doctor_id = ${userId}
    `;

    if (promotion.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Promotion not found'
      });
    }

    const activated = await doctorBusinessService.activatePromotion(parseInt(promotionId), paymentId);

    res.json({
      success: true,
      data: activated,
      message: 'Promotion activated successfully'
    });
  } catch (error) {
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
doctorBusinessRouter.get('/doctor-business/promotions', authenticate, async (req, res) => {
  try {
    const userId = (req as any).userId;

    const promotions = await doctorBusinessService.getActivePromotions(userId);

    res.json({
      success: true,
      data: promotions
    });
  } catch (error) {
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
doctorBusinessRouter.get('/doctor-business/promotions/:promotionId/performance', authenticate, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { promotionId } = req.params;

    // Verify promotion belongs to user
    const promotion = await prisma.$queryRaw<any[]>`
      SELECT * FROM "DoctorPromotion" WHERE id = ${parseInt(promotionId)} AND doctor_id = ${userId}
    `;

    if (promotion.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Promotion not found'
      });
    }

    const performance = await doctorBusinessService.getPromotionPerformance(parseInt(promotionId));

    res.json({
      success: true,
      data: performance
    });
  } catch (error) {
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
doctorBusinessRouter.get('/doctor-business/featured', async (req, res) => {
  try {
    const { limit = '10' } = req.query;

    const featured = await doctorBusinessService.getFeaturedDoctors(parseInt(limit as string));

    res.json({
      success: true,
      data: featured
    });
  } catch (error) {
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
doctorBusinessRouter.post('/doctor-business/promotions/:promotionId/track', async (req, res) => {
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
      await doctorBusinessService.trackPromotionImpression(parseInt(promotionId), type);
    } else if (action === 'click') {
      await doctorBusinessService.trackPromotionClick(parseInt(promotionId), type);
    } else {
      return res.status(400).json({
        success: false,
        error: 'Invalid action'
      });
    }

    res.json({
      success: true,
      message: 'Tracking recorded'
    });
  } catch (error) {
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
doctorBusinessRouter.post('/doctor-business/analytics/update', authenticate, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { doctorId } = req.body;

    // Check if admin or updating own analytics
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const targetDoctorId = doctorId || userId;

    if (doctorId && user?.role !== 'ADMIN' && userId !== doctorId) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized'
      });
    }

    await doctorBusinessService.updateDailyAnalytics(targetDoctorId);

    res.json({
      success: true,
      message: 'Analytics updated successfully'
    });
  } catch (error) {
    console.error('[API] Error updating analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update analytics'
    });
  }
});

export default doctorBusinessRouter;
