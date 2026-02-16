import { Router } from 'express';
import { healthInsightsService } from '../services/health-insights.service';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/asyncHandler';

export const healthInsightsRouter = Router();

/**
 * GET /api/health-insights/dashboard
 * Get complete insights dashboard for doctor
 */
healthInsightsRouter.get(
  '/dashboard',
  authenticate,
  asyncHandler(async (req: any, res) => {
    const doctorId = req.user.userId;
    const { specialty } = req.query;
    
    const dashboard = await healthInsightsService.getDoctorInsightsDashboard(
      doctorId,
      specialty as string
    );
    res.json(dashboard);
  })
);

/**
 * GET /api/health-insights/trending-symptoms
 * Get trending symptoms
 */
healthInsightsRouter.get(
  '/trending-symptoms',
  authenticate,
  asyncHandler(async (req, res) => {
    const { timeframe = 'week' } = req.query;
    const insights = await healthInsightsService.generateTrendingSymptoms(timeframe as any);
    res.json(insights);
  })
);

/**
 * GET /api/health-insights/regional-alerts
 * Get regional health alerts
 */
healthInsightsRouter.get(
  '/regional-alerts',
  authenticate,
  asyncHandler(async (req, res) => {
    const alerts = await healthInsightsService.generateRegionalAlerts();
    res.json(alerts);
  })
);

/**
 * GET /api/health-insights/medication-patterns
 * Get medication usage patterns
 */
healthInsightsRouter.get(
  '/medication-patterns',
  authenticate,
  asyncHandler(async (req, res) => {
    const patterns = await healthInsightsService.analyzeMedicationPatterns();
    res.json(patterns);
  })
);

/**
 * GET /api/health-insights/diagnostic-patterns
 * Get diagnostic patterns and common misdiagnoses
 */
healthInsightsRouter.get(
  '/diagnostic-patterns',
  authenticate,
  asyncHandler(async (req, res) => {
    const patterns = await healthInsightsService.getDiagnosticPatterns();
    res.json(patterns);
  })
);
