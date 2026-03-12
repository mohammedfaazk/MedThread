import { Router } from 'express';
import { healthAnalyticsService } from '../services/health-analytics.service';
import { optionalAuth, AuthRequest } from '../middleware/auth.refactored';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();

/**
 * POST /api/health-analytics/symptom-report
 * Track symptom report
 */
router.post('/symptom-report', optionalAuth, asyncHandler(async (req: AuthRequest, res) => {
  const { sessionId, symptoms, location, age, gender, temperature, duration } = req.body;

  if (!sessionId || !symptoms || !Array.isArray(symptoms)) {
    return res.status(400).json({
      success: false,
      error: 'sessionId and symptoms array are required'
    });
  }

  const report = await healthAnalyticsService.trackSymptomReport({
    userId: req.userId,
    sessionId,
    symptoms,
    location,
    age,
    gender,
    temperature,
    duration
  });

  res.json({ success: true, data: report });
}));

/**
 * GET /api/health-analytics/trending
 * Get trending symptoms
 */
router.get('/trending', asyncHandler(async (req, res) => {
  const { timeWindow = 'daily', limit = 10 } = req.query;

  const trending = await healthAnalyticsService.getTrendingSymptoms(
    timeWindow as string,
    parseInt(limit as string)
  );

  res.json({ success: true, data: trending });
}));

/**
 * GET /api/health-analytics/geographic-alerts
 * Get geographic health alerts
 */
router.get('/geographic-alerts', asyncHandler(async (req, res) => {
  const { region } = req.query;

  const alerts = await healthAnalyticsService.getGeographicAlerts(region as string);

  res.json({ success: true, data: alerts });
}));

/**
 * GET /api/health-analytics/advisory/:symptom
 * Get health advisory for symptom
 */
router.get('/advisory/:symptom', asyncHandler(async (req, res) => {
  const { symptom } = req.params;
  const { region } = req.query;

  const advisory = await healthAnalyticsService.generateHealthAdvisory(
    symptom,
    region as string
  );

  if (!advisory) {
    return res.status(404).json({
      success: false,
      error: 'No data available for this symptom'
    });
  }

  res.json({ success: true, data: advisory });
}));

/**
 * GET /api/health-analytics/patterns
 * Get symptom patterns
 */
router.get('/patterns', asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    return res.status(400).json({
      success: false,
      error: 'startDate and endDate are required'
    });
  }

  const patterns = await healthAnalyticsService.getSymptomPatterns({
    startDate: new Date(startDate as string),
    endDate: new Date(endDate as string)
  });

  res.json({ success: true, data: patterns });
}));

/**
 * GET /api/health-analytics/top-issues
 * Get top health issues
 */
router.get('/top-issues', asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;

  const issues = await healthAnalyticsService.getTopHealthIssues(
    parseInt(limit as string)
  );

  res.json({ success: true, data: issues });
}));

export { router as healthAnalyticsRouter };
