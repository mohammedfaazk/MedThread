/**
 * 🚀 UNIQUE FEATURES API ROUTES
 * 
 * These are the game-changing features that make MedThread unique
 */

import express from 'express';
import { authenticate } from '../middleware/auth';
import outbreakDetectionService from '../services/outbreak-detection.service';
import smartDoctorMatchingService from '../services/smart-doctor-matching.service';

const router = express.Router();

// ============================================
// OUTBREAK DETECTION & ALERTS
// ============================================

/**
 * GET /api/v1/unique/outbreak-alerts
 * Get outbreak alerts for user's location
 */
router.get('/outbreak-alerts', authenticate, async (req, res) => {
  try {
    const userId = req.user!.userId;
    const { location } = req.query;

    let alerts;
    if (location) {
      alerts = await outbreakDetectionService.getOutbreakAlertsForLocation(location as string);
    } else {
      alerts = await outbreakDetectionService.getAlertsForUser(userId);
    }

    res.json({
      success: true,
      data: alerts
    });
  } catch (error) {
    console.error('Error fetching outbreak alerts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch outbreak alerts'
    });
  }
});

/**
 * POST /api/v1/unique/outbreak-alerts/:alertId/dismiss
 * Dismiss an outbreak alert
 */
router.post('/outbreak-alerts/:alertId/dismiss', authenticate, async (req, res) => {
  try {
    const userId = req.user!.userId;
    const { alertId } = req.params;

    await outbreakDetectionService.dismissAlert(alertId, userId);

    res.json({
      success: true,
      message: 'Alert dismissed'
    });
  } catch (error) {
    console.error('Error dismissing alert:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to dismiss alert'
    });
  }
});

/**
 * GET /api/v1/unique/symptom-clusters
 * Get symptom clusters for analytics
 */
router.get('/symptom-clusters', authenticate, async (req, res) => {
  try {
    const { location, severity, timeWindow } = req.query;

    const clusters = await outbreakDetectionService.getSymptomClusters({
      location: location as string,
      severity: severity as string,
      timeWindow: timeWindow as string
    });

    res.json({
      success: true,
      data: clusters
    });
  } catch (error) {
    console.error('Error fetching symptom clusters:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch symptom clusters'
    });
  }
});

/**
 * POST /api/v1/unique/analyze-outbreaks
 * Trigger outbreak analysis (admin only)
 */
router.post('/analyze-outbreaks', authenticate, async (req, res) => {
  try {
    // Check if user is admin
    const user = req.user!;
    if (user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized'
      });
    }

    const { timeWindow } = req.body;
    await outbreakDetectionService.analyzeSymptomClusters(timeWindow || '7_DAYS');

    res.json({
      success: true,
      message: 'Outbreak analysis completed'
    });
  } catch (error) {
    console.error('Error analyzing outbreaks:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze outbreaks'
    });
  }
});

// ============================================
// SMART DOCTOR MATCHING
// ============================================

/**
 * POST /api/v1/unique/find-doctors
 * Find best matching doctors for patient
 */
router.post('/find-doctors', authenticate, async (req, res) => {
  try {
    const userId = req.user!.userId;
    const criteria = req.body;

    const matches = await smartDoctorMatchingService.findBestMatches(userId, criteria);

    res.json({
      success: true,
      data: {
        matches,
        count: matches.length,
        topMatch: matches[0] || null
      }
    });
  } catch (error) {
    console.error('Error finding doctor matches:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to find doctor matches'
    });
  }
});

/**
 * GET /api/v1/unique/doctors/:doctorId/specializations
 * Get doctor's specialization details
 */
router.get('/doctors/:doctorId/specializations', async (req, res) => {
  try {
    const { doctorId } = req.params;

    const specializations = await smartDoctorMatchingService.getDoctorSpecializations(doctorId);

    res.json({
      success: true,
      data: specializations
    });
  } catch (error) {
    console.error('Error fetching doctor specializations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch doctor specializations'
    });
  }
});

/**
 * GET /api/v1/unique/top-doctors/:condition
 * Get top doctors for a specific condition
 */
router.get('/top-doctors/:condition', async (req, res) => {
  try {
    const { condition } = req.params;
    const { location, limit } = req.query;

    const doctors = await smartDoctorMatchingService.getTopDoctorsForCondition(
      condition,
      location as string,
      limit ? parseInt(limit as string) : 10
    );

    res.json({
      success: true,
      data: doctors
    });
  } catch (error) {
    console.error('Error fetching top doctors:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch top doctors'
    });
  }
});

/**
 * POST /api/v1/unique/update-specialization
 * Update doctor specialization based on outcome
 */
router.post('/update-specialization', authenticate, async (req, res) => {
  try {
    const { doctorId, condition, outcome } = req.body;

    if (!doctorId || !condition || !outcome) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    await smartDoctorMatchingService.updateDoctorSpecialization(
      doctorId,
      condition,
      outcome
    );

    res.json({
      success: true,
      message: 'Specialization updated'
    });
  } catch (error) {
    console.error('Error updating specialization:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update specialization'
    });
  }
});

// ============================================
// HEALTH INSIGHTS & PREDICTIONS
// ============================================

/**
 * GET /api/v1/unique/health-insights
 * Get personalized health insights for user
 */
router.get('/health-insights', authenticate, async (req, res) => {
  try {
    const userId = req.user!.userId;

    // This would use AI to generate insights
    // For now, return placeholder
    const insights = {
      patterns: [
        {
          type: 'PATTERN',
          title: 'Sleep Pattern Detected',
          description: 'Your headaches tend to occur when you sleep less than 6 hours',
          confidence: 0.85,
          priority: 'MEDIUM'
        }
      ],
      predictions: [
        {
          type: 'PREDICTION',
          title: 'Potential Symptom Alert',
          description: 'Based on your pattern, you might experience fatigue in 2-3 days',
          confidence: 0.72,
          priority: 'LOW'
        }
      ],
      recommendations: [
        {
          type: 'RECOMMENDATION',
          title: 'Improve Sleep Schedule',
          description: 'Try to maintain 7-8 hours of sleep to reduce headache frequency',
          priority: 'HIGH'
        }
      ]
    };

    res.json({
      success: true,
      data: insights
    });
  } catch (error) {
    console.error('Error fetching health insights:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch health insights'
    });
  }
});

/**
 * GET /api/v1/unique/community-health-score
 * Get community health score for location
 */
router.get('/community-health-score', async (req, res) => {
  try {
    const { location } = req.query;

    if (!location) {
      return res.status(400).json({
        success: false,
        error: 'Location is required'
      });
    }

    // Placeholder - would calculate from actual data
    const score = {
      location: location as string,
      healthScore: 78.5,
      rank: 12,
      activeUsers: 1247,
      doctorDensity: 3.2,
      avgResponseTime: 45,
      commonIssues: [
        { issue: 'Seasonal Flu', count: 45 },
        { issue: 'Allergies', count: 32 },
        { issue: 'Headaches', count: 28 }
      ],
      trendDirection: 'IMPROVING'
    };

    res.json({
      success: true,
      data: score
    });
  } catch (error) {
    console.error('Error fetching community health score:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch community health score'
    });
  }
});

export default router;
