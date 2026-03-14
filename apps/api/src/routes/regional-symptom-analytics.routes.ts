import { Router } from 'express';
import { regionalSymptomAnalyticsService } from '../services/regional-symptom-analytics.service';
import { authenticate, optionalAuth } from '../middleware/auth.refactored';

const router = Router();

/**
 * POST /api/regional-symptom-analytics/collect-reports
 * Collect symptom reports from recent posts (can be run as cron job)
 */
router.post('/collect-reports', authenticate, async (req, res) => {
  try {
    const data = await regionalSymptomAnalyticsService.collectSymptomReports();
    res.json({ success: true, data });
  } catch (error: any) {
    console.error('Error collecting symptom reports:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/regional-symptom-analytics/heatmap
 * Get regional symptom heatmap data with filtering
 */
router.get('/heatmap', optionalAuth, async (req, res) => {
  try {
    const { locationLevel, symptom, timeWindow, severity } = req.query;
    
    const data = await regionalSymptomAnalyticsService.getRegionalSymptomHeatmap({
      locationLevel: (locationLevel as 'city' | 'district' | 'state') || 'city',
      symptomFilter: symptom as string,
      timeWindow: (timeWindow as 'week' | 'month' | 'quarter') || 'month',
      severityFilter: severity as 'HIGH' | 'MEDIUM' | 'LOW'
    });
    
    res.json({ success: true, data });
  } catch (error: any) {
    console.error('Error fetching regional symptom heatmap:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/regional-symptom-analytics/trending
 * Get trending symptoms across regions
 */
router.get('/trending', optionalAuth, async (req, res) => {
  try {
    const { days } = req.query;
    const data = await regionalSymptomAnalyticsService.getTrendingSymptoms(
      days ? parseInt(days as string) : 7
    );
    res.json({ success: true, data });
  } catch (error: any) {
    console.error('Error fetching trending symptoms:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/regional-symptom-analytics/location/:location
 * Get detailed symptom data for specific location
 */
router.get('/location/:location', optionalAuth, async (req, res) => {
  try {
    const { location } = req.params;
    const { level } = req.query;
    
    const data = await regionalSymptomAnalyticsService.getLocationSymptomDetails(
      location,
      (level as 'city' | 'district' | 'state') || 'city'
    );
    
    res.json({ success: true, data });
  } catch (error: any) {
    console.error('Error fetching location symptom details:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/regional-symptom-analytics/alerts
 * Get regional health alerts
 */
router.get('/alerts', optionalAuth, async (req, res) => {
  try {
    const data = await regionalSymptomAnalyticsService.generateRegionalHealthAlerts();
    res.json({ success: true, data });
  } catch (error: any) {
    console.error('Error generating regional health alerts:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;