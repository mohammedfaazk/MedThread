/**
 * API Routes for Doctor Sentiment Scoring
 */

import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { doctorSentimentScoringService } from '../services/doctor-sentiment-scoring.service';
import { sentimentAnalysisService } from '../services/sentiment-analysis.service';

const router = Router();

/**
 * GET /api/doctor-sentiment/:doctorId/score
 * Get enhanced score for a doctor (with sentiment analysis)
 */
router.get('/:doctorId/score', async (req, res: Response) => {
  try {
    const { doctorId } = req.params;
    const score = await doctorSentimentScoringService.getEnhancedScoreForDisplay(doctorId);
    res.json(score);
  } catch (error) {
    console.error('[DoctorSentiment] Error getting score:', error);
    res.status(500).json({ error: 'Failed to get doctor score' });
  }
});

/**
 * GET /api/doctor-sentiment/:doctorId/detailed
 * Get detailed sentiment analysis breakdown
 */
router.get('/:doctorId/detailed', async (req, res: Response) => {
  try {
    const { doctorId } = req.params;
    const detailed = await doctorSentimentScoringService.calculateEnhancedScore(doctorId);
    res.json(detailed);
  } catch (error) {
    console.error('[DoctorSentiment] Error getting detailed score:', error);
    res.status(500).json({ error: 'Failed to get detailed score' });
  }
});

/**
 * POST /api/doctor-sentiment/:doctorId/update
 * Manually trigger score update for a doctor
 */
router.post('/:doctorId/update', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { doctorId } = req.params;
    
    // Only admins or the doctor themselves can trigger updates
    if (req.user?.role !== 'ADMIN' && req.user?.id !== doctorId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await doctorSentimentScoringService.updateDoctorPerformanceWithSentiment(doctorId);
    const updated = await doctorSentimentScoringService.getEnhancedScoreForDisplay(doctorId);
    
    res.json({
      message: 'Score updated successfully',
      score: updated
    });
  } catch (error) {
    console.error('[DoctorSentiment] Error updating score:', error);
    res.status(500).json({ error: 'Failed to update score' });
  }
});

/**
 * POST /api/doctor-sentiment/analyze-review
 * Analyze sentiment of a review text (for preview before submission)
 */
router.post('/analyze-review', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { text } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Review text is required' });
    }

    const sentiment = await sentimentAnalysisService.analyzeSentiment(text);
    res.json(sentiment);
  } catch (error) {
    console.error('[DoctorSentiment] Error analyzing review:', error);
    res.status(500).json({ error: 'Failed to analyze review' });
  }
});

/**
 * POST /api/doctor-sentiment/batch-update
 * Update scores for all doctors (admin only)
 */
router.post('/batch-update', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const result = await doctorSentimentScoringService.updateAllDoctorScores();
    res.json({
      message: 'Batch update completed',
      ...result
    });
  } catch (error) {
    console.error('[DoctorSentiment] Error in batch update:', error);
    res.status(500).json({ error: 'Failed to update scores' });
  }
});

export default router;
