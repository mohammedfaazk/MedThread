import { Router } from 'express';
import { doctorProfileAnalyticsService } from '../services/doctor-profile-analytics.service';
import { authenticate, optionalAuth } from '../middleware/auth.refactored';

const router = Router();

/**
 * GET /api/doctor-profile-analytics/patient-acquisition/:doctorId
 * Get patient acquisition graph data for doctor's public profile
 */
router.get('/patient-acquisition/:doctorId', optionalAuth, async (req, res) => {
  try {
    const { doctorId } = req.params;
    const data = await doctorProfileAnalyticsService.getPatientAcquisitionGraph(doctorId);
    res.json({ success: true, data });
  } catch (error: any) {
    console.error('Error fetching patient acquisition data:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/doctor-profile-analytics/reply-time/:doctorId
 * Get average reply time for doctor's public profile
 */
router.get('/reply-time/:doctorId', optionalAuth, async (req, res) => {
  try {
    const { doctorId } = req.params;
    const data = await doctorProfileAnalyticsService.getAverageReplyTime(doctorId);
    res.json({ success: true, data });
  } catch (error: any) {
    console.error('Error fetching reply time data:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/doctor-profile-analytics/daily-activity/:doctorId
 * Get daily activity pattern for doctor's public profile
 */
router.get('/daily-activity/:doctorId', optionalAuth, async (req, res) => {
  try {
    const { doctorId } = req.params;
    const data = await doctorProfileAnalyticsService.getDailyActivityGraph(doctorId);
    res.json({ success: true, data });
  } catch (error: any) {
    console.error('Error fetching daily activity data:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/doctor-profile-analytics/comprehensive/:doctorId
 * Get all doctor profile analytics in one call
 */
router.get('/comprehensive/:doctorId', optionalAuth, async (req, res) => {
  try {
    const { doctorId } = req.params;
    const data = await doctorProfileAnalyticsService.getComprehensiveDoctorStats(doctorId);
    res.json({ success: true, data });
  } catch (error: any) {
    console.error('Error fetching comprehensive doctor stats:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;