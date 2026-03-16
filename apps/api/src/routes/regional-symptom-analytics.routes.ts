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

/**
 * GET /api/regional-symptom-analytics/by-pincode
 * Get symptom heatmap scoped to a user's pincode + chosen geographic scope
 * Query: pincode, scope (area|city|district|state|country), timeWindow
 */
router.get('/by-pincode', authenticate, async (req, res) => {
  try {
    const { pincode, scope, timeWindow } = req.query;
    if (!pincode) return res.status(400).json({ success: false, error: 'pincode is required' });

    const data = await regionalSymptomAnalyticsService.getSymptomsByPincode(
      pincode as string,
      (scope as 'area' | 'city' | 'district' | 'state' | 'country') || 'city',
      (timeWindow as 'week' | 'month' | 'quarter') || 'month'
    );
    res.json(data);
  } catch (error: any) {
    console.error('Error fetching symptoms by pincode:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/regional-symptom-analytics/resolve-pincode
 * Resolve a pincode to its geographic hierarchy
 */
router.get('/resolve-pincode', authenticate, async (req, res) => {
  try {
    const { pincode } = req.query;
    if (!pincode) return res.status(400).json({ success: false, error: 'pincode is required' });
    const location = await regionalSymptomAnalyticsService.resolveLocation(pincode as string);
    res.json({ success: !!location, data: location });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;