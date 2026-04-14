import express from 'express';
import { enhancedAnalyticsService } from '../services/enhanced-analytics.service';
import { authenticate } from '../middleware/auth.refactored';

const router = express.Router();

// Feature 1: Doctor specialty distribution
router.get('/doctor-specialty-distribution', async (req, res) => {
  try {
    const data = await enhancedAnalyticsService.getDoctorSpecialtyDistribution();
    res.json({ success: true, data });
  } catch (error: any) {
    console.error('Error fetching doctor specialty distribution:', error);
    res.status(500).json({ error: error.message });
  }
});

// Feature 2: Community activity analysis
router.get('/community-activity', async (req, res) => {
  try {
    const { communityId } = req.query;
    const data = await enhancedAnalyticsService.analyzeCommunityActivity(communityId as string);
    res.json({ success: true, data });
  } catch (error: any) {
    console.error('Error analyzing community activity:', error);
    res.status(500).json({ error: error.message });
  }
});

// Feature 3: Doctor public stats (real-time)
router.get('/doctor-stats/:doctorId', async (req, res) => {
  try {
    const { doctorId } = req.params;
    const data = await enhancedAnalyticsService.getDoctorPublicStats(doctorId);
    res.json({ success: true, data });
  } catch (error: any) {
    console.error('Error fetching doctor stats:', error);
    res.status(500).json({ error: error.message });
  }
});

// Feature 4: Track comment conversion
router.post('/track-conversion', authenticate, async (req, res) => {
  try {
    const { commentId, doctorId, postId, action } = req.body;
    const patientId = (req as any).userId;

    const data = await enhancedAnalyticsService.trackCommentConversion({
      commentId,
      doctorId,
      patientId,
      postId,
      action
    });

    res.json({ success: true, data });
  } catch (error: any) {
    console.error('Error tracking conversion:', error);
    res.status(500).json({ error: error.message });
  }
});

// Feature 5: Submit patient feedback
router.post('/patient-feedback', authenticate, async (req, res) => {
  try {
    const { doctorId, conversationId, appointmentId, status, wasClinicVisit } = req.body;
    const patientId = (req as any).userId;

    const data = await enhancedAnalyticsService.submitPatientFeedback({
      patientId,
      doctorId,
      conversationId,
      appointmentId,
      status,
      wasClinicVisit
    });

    res.json({ success: true, data });
  } catch (error: any) {
    console.error('Error submitting patient feedback:', error);
    res.status(500).json({ error: error.message });
  }
});

// Feature 6: Doctor portfolio (admin only)
router.get('/doctor-portfolio/:doctorId', authenticate, async (req, res) => {
  try {
    const userRole = (req as any).userRole;
    if (userRole !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { doctorId } = req.params;
    const data = await enhancedAnalyticsService.getDoctorPortfolio(doctorId);
    res.json({ success: true, data });
  } catch (error: any) {
    console.error('Error fetching doctor portfolio:', error);
    res.status(500).json({ error: error.message });
  }
});

// Feature 7: Track clinic visit
router.post('/track-clinic-visit', authenticate, async (req, res) => {
  try {
    const { doctorId } = req.body;
    const patientId = (req as any).userId;

    const data = await enhancedAnalyticsService.trackClinicVisit(doctorId, patientId);
    res.json({ success: true, data });
  } catch (error: any) {
    console.error('Error tracking clinic visit:', error);
    res.status(500).json({ error: error.message });
  }
});

// Feature 8 & 9: Get top doctors
router.get('/top-doctors', async (req, res) => {
  try {
    const { region, specialty, limit } = req.query;

    const data = await enhancedAnalyticsService.getTopDoctors({
      region: region as string,
      specialty: specialty as string,
      limit: limit ? parseInt(limit as string) : 10
    });

    res.json({ success: true, data });
  } catch (error: any) {
    console.error('Error fetching top doctors:', error);
    
    // If database connection failed, use mock data
    if (error.message?.includes("Can't reach database") || 
        error.message?.includes("Tenant or user not found")) {
      console.log('[API] Database unavailable, using mock top doctors');
      
      const { mockVerifiedDoctors } = require('../mock-data/posts-and-users.mock');
      const mockTopDoctors = mockVerifiedDoctors.map((doc: any, idx: number) => ({
        id: doc.id,
        username: doc.username,
        specialty: doc.specialization || 'General Physician',
        avatar: doc.avatar,
        pincode: '110001',
        curedPatientCount: 50 - (idx * 8),
        conversionCount: 30 - (idx * 5),
        portfolioScore: 95 - (idx * 5),
        helpfulnessScore: 4.8 - (idx * 0.1)
      }));
      
      return res.json({ success: true, data: mockTopDoctors, mock: true });
    }
    
    res.status(500).json({ error: error.message });
  }
});

// Check if feedback is needed
router.get('/check-feedback-needed', authenticate, async (req, res) => {
  try {
    const { conversationId, appointmentId } = req.query;
    const patientId = (req as any).userId;

    const { feedbackNotificationService } = require('../services/feedback-notification.service');
    const result = await feedbackNotificationService.checkFeedbackNeeded(
      patientId,
      conversationId as string,
      appointmentId as string
    );

    res.json({ success: true, ...result });
  } catch (error: any) {
    console.error('Error checking feedback needed:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
// Recalculate portfolio scores (admin only)
router.post('/recalculate-portfolio-scores', authenticate, async (req, res) => {
  try {
    const userRole = (req as any).userRole;
    if (userRole !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const data = await enhancedAnalyticsService.recalculateAllPortfolioScores();
    res.json({ success: true, data });
  } catch (error: any) {
    console.error('Error recalculating portfolio scores:', error);
    res.status(500).json({ error: error.message });
  }
});