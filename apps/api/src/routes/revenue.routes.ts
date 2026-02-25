import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth.refactored';
import { revenueService } from '../services/revenue.service';

export const revenueRouter = Router();

/**
 * GET /api/revenue/subscription-tiers
 * Get all subscription tiers
 */
revenueRouter.get('/revenue/subscription-tiers', async (req, res) => {
  try {
    const tiers = await revenueService.getSubscriptionTiers();

    res.json({
      success: true,
      data: { tiers }
    });
  } catch (error) {
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
revenueRouter.post('/revenue/subscribe', authenticate, async (req, res) => {
  try {
    const doctorId = (req as any).userId;
    const { tierId, billingCycle, paymentMethod, isTrial } = req.body;

    if (!tierId || !billingCycle || !paymentMethod) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    const result = await revenueService.purchaseSubscription({
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
  } catch (error: any) {
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
revenueRouter.get('/revenue/my-subscription', authenticate, async (req, res) => {
  try {
    const doctorId = (req as any).userId;

    const subscription = await revenueService.getDoctorSubscription(doctorId);

    res.json({
      success: true,
      data: { subscription }
    });
  } catch (error) {
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
revenueRouter.post('/revenue/record-commission', authenticate, async (req, res) => {
  try {
    const { consultationFee, doctorId, appointmentId, patientId } = req.body;

    if (!consultationFee || !doctorId || !appointmentId || !patientId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    const result = await revenueService.recordConsultationCommission({
      consultationFee: parseFloat(consultationFee),
      doctorId,
      appointmentId,
      patientId
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error: any) {
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
revenueRouter.get('/revenue/doctor-summary', authenticate, async (req, res) => {
  try {
    const doctorId = (req as any).userId;
    const { startDate, endDate } = req.query;

    const summary = await revenueService.getDoctorRevenueSummary(
      doctorId,
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined
    );

    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
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
revenueRouter.post('/revenue/advertisements', authenticate, async (req, res) => {
  try {
    const result = await revenueService.createAdvertisement(req.body);

    res.status(201).json({
      success: true,
      data: result
    });
  } catch (error) {
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
revenueRouter.get('/revenue/advertisements', async (req, res) => {
  try {
    const { adType, placementPage, userType, specialty, location } = req.query;

    const ads = await revenueService.getActiveAds({
      adType: adType as string,
      placementPage: placementPage as string,
      userType: userType as string,
      specialty: specialty as string,
      location: location as string
    });

    res.json({
      success: true,
      data: { ads }
    });
  } catch (error) {
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
revenueRouter.post('/revenue/ad-impression', async (req, res) => {
  try {
    const { adId, userId, userType, pageUrl, placementPosition } = req.body;

    await revenueService.recordAdImpression({
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
  } catch (error) {
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
revenueRouter.post('/revenue/ad-click', async (req, res) => {
  try {
    const { adId, impressionId } = req.body;

    await revenueService.recordAdClick(parseInt(adId), parseInt(impressionId));

    res.json({
      success: true,
      message: 'Click recorded'
    });
  } catch (error) {
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
revenueRouter.post('/revenue/data-insights', authenticate, async (req, res) => {
  try {
    const result = await revenueService.createDataInsight(req.body);

    res.status(201).json({
      success: true,
      data: result
    });
  } catch (error) {
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
revenueRouter.get('/revenue/platform-analytics', authenticate, async (req, res) => {
  try {
    const { periodType = 'daily', startDate, endDate } = req.query;

    const revenue = await revenueService.getPlatformRevenue(
      periodType as string,
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined
    );

    res.json({
      success: true,
      data: { revenue }
    });
  } catch (error) {
    console.error('[API] Error fetching platform analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch platform analytics'
    });
  }
});

export default revenueRouter;
