import { Router } from 'express';
import { doctorAnalyticsService } from '../services/doctor-analytics.service';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth.refactored';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();

/**
 * GET /api/doctor-analytics/leaderboard
 * Get top doctors leaderboard
 */
router.get('/leaderboard', asyncHandler(async (req, res) => {
  const { limit = 10, sortBy = 'helpfulnessScore' } = req.query;

  const leaderboard = await doctorAnalyticsService.getTopDoctors(
    parseInt(limit as string),
    sortBy as string
  );

  res.json({ success: true, data: leaderboard });
}));

/**
 * GET /api/doctor-analytics/performance/:doctorId
 * Get doctor performance metrics
 */
router.get('/performance/:doctorId', asyncHandler(async (req, res) => {
  const { doctorId } = req.params;

  const metrics = await doctorAnalyticsService.calculateDoctorEngagement(doctorId);

  res.json({ success: true, data: metrics });
}));

/**
 * POST /api/doctor-analytics/rate
 * Rate a doctor
 */
router.post('/rate', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  const { doctorId, appointmentId, threadId, rating, helpfulness, communication, expertise, feedback } = req.body;

  if (!doctorId || !rating) {
    return res.status(400).json({
      success: false,
      error: 'doctorId and rating are required'
    });
  }

  if (rating < 1 || rating > 5) {
    return res.status(400).json({
      success: false,
      error: 'rating must be between 1 and 5'
    });
  }

  const ratingRecord = await doctorAnalyticsService.trackDoctorRating({
    doctorId,
    patientId: req.userId!,
    appointmentId,
    threadId,
    rating,
    helpfulness,
    communication,
    expertise,
    feedback
  });

  res.json({ success: true, data: ratingRecord });
}));

/**
 * GET /api/doctor-analytics/growth
 * Get doctor growth metrics (Admin only)
 */
router.get('/growth', authenticate, requireRole('ADMIN'), asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    return res.status(400).json({
      success: false,
      error: 'startDate and endDate are required'
    });
  }

  const growth = await doctorAnalyticsService.getDoctorGrowthMetrics({
    startDate: new Date(startDate as string),
    endDate: new Date(endDate as string)
  });

  res.json({ success: true, data: growth });
}));

/**
 * GET /api/doctor-analytics/response-times
 * Get doctor response time analytics
 */
router.get('/response-times', asyncHandler(async (req, res) => {
  const { doctorId } = req.query;

  const responseTimes = await doctorAnalyticsService.getDoctorResponseTimes(
    doctorId as string
  );

  res.json({ success: true, data: responseTimes });
}));

export { router as doctorAnalyticsRouter };
