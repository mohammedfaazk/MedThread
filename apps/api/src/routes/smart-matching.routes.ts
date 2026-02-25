import { Router } from 'express';
import { authenticate } from '../middleware/auth.refactored';
import { smartMatchingService } from '../services/smart-matching.service';

export const smartMatchingRouter = Router();

/**
 * POST /api/matching/find
 * Find best matching doctors for patient
 */
smartMatchingRouter.post('/matching/find', authenticate, async (req, res) => {
  try {
    const patientId = (req as any).userId;
    const {
      symptoms,
      location,
      preferredLanguage,
      insuranceProvider,
      maxDistance,
      minRating,
      consultationType,
      preferredGender,
      limit
    } = req.body;

    if (!symptoms || symptoms.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Symptoms are required'
      });
    }

    const criteria = {
      symptoms,
      patientLocation: location,
      preferredLanguage,
      insuranceProvider,
      maxDistance,
      minRating,
      consultationType,
      preferredGender
    };

    const matches = await smartMatchingService.findMatches(
      patientId,
      criteria,
      limit || 10
    );

    res.json({
      success: true,
      data: {
        matches,
        total: matches.length
      }
    });
  } catch (error) {
    console.error('[API] Error finding matches:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to find matching doctors'
    });
  }
});

/**
 * GET /api/matching/results/:resultId
 * Get match details
 */
smartMatchingRouter.get('/matching/results/:resultId', authenticate, async (req, res) => {
  try {
    const { resultId } = req.params;

    const match = await smartMatchingService.getMatchDetails(
      parseInt(resultId)
    );

    if (!match) {
      return res.status(404).json({
        success: false,
        error: 'Match not found'
      });
    }

    res.json({
      success: true,
      data: match
    });
  } catch (error) {
    console.error('[API] Error fetching match details:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch match details'
    });
  }
});

/**
 * PUT /api/matching/preferences
 * Update patient matching preferences
 */
smartMatchingRouter.put('/matching/preferences', authenticate, async (req, res) => {
  try {
    const patientId = (req as any).userId;
    const preferences = req.body;

    await smartMatchingService.updatePatientPreferences(patientId, preferences);

    res.json({
      success: true,
      message: 'Preferences updated successfully'
    });
  } catch (error) {
    console.error('[API] Error updating preferences:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update preferences'
    });
  }
});

/**
 * POST /api/matching/feedback
 * Submit feedback on matching result
 */
smartMatchingRouter.post('/matching/feedback', authenticate, async (req, res) => {
  try {
    const patientId = (req as any).userId;
    const {
      matchingResultId,
      wasHelpful,
      feedbackType,
      feedbackText,
      matchAccuracyRating
    } = req.body;

    if (!matchingResultId) {
      return res.status(400).json({
        success: false,
        error: 'Matching result ID is required'
      });
    }

    await smartMatchingService.submitFeedback(
      matchingResultId,
      patientId,
      {
        wasHelpful,
        feedbackType,
        feedbackText,
        matchAccuracyRating
      }
    );

    res.json({
      success: true,
      message: 'Feedback submitted successfully'
    });
  } catch (error) {
    console.error('[API] Error submitting feedback:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit feedback'
    });
  }
});

export default smartMatchingRouter;
