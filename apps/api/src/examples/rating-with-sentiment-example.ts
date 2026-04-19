/**
 * EXAMPLE: How to integrate sentiment analysis into rating endpoints
 * 
 * This shows how to update existing rating creation endpoints
 * to automatically trigger sentiment analysis
 */

import { Router, Response } from 'express';
import { prisma } from '@medthread/database';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { onDoctorRatingCreated } from '../hooks/review-sentiment-hook';

const router = Router();

/**
 * EXAMPLE 1: Create Doctor Rating with Automatic Sentiment Analysis
 */
router.post('/doctor-rating', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { doctorId, rating, helpfulness, communication, expertise, feedback } = req.body;
    const patientId = req.user!.id;

    // Validate input
    if (!doctorId || !rating) {
      return res.status(400).json({ error: 'Doctor ID and rating are required' });
    }

    // Create the rating
    const newRating = await prisma.doctorRating.create({
      data: {
        doctorId,
        patientId,
        rating: parseFloat(rating),
        helpfulness: helpfulness ? parseInt(helpfulness) : null,
        communication: communication ? parseInt(communication) : null,
        expertise: expertise ? parseInt(expertise) : null,
        feedback: feedback || null
      }
    });

    // 🎯 AUTOMATICALLY TRIGGER SENTIMENT ANALYSIS
    // This updates the doctor's score in the background
    // Non-blocking - doesn't slow down the response
    onDoctorRatingCreated(doctorId, feedback, rating).catch(error => {
      console.error('[Rating] Failed to update sentiment score:', error);
      // Don't fail the request if sentiment analysis fails
    });

    res.status(201).json({
      message: 'Rating submitted successfully',
      rating: newRating
    });
  } catch (error) {
    console.error('[Rating] Error creating rating:', error);
    res.status(500).json({ error: 'Failed to create rating' });
  }
});

/**
 * EXAMPLE 2: Create Patient Feedback with Sentiment Analysis
 */
router.post('/patient-feedback', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { 
      doctorId, 
      conversationId, 
      appointmentId,
      status,
      rating,
      communicationRating,
      professionalismRating,
      treatmentEffectivenessRating,
      feedback,
      wasClinicVisit
    } = req.body;
    
    const patientId = req.user!.id;

    // Create feedback
    const newFeedback = await prisma.patientFeedback.create({
      data: {
        patientId,
        doctorId,
        conversationId: conversationId || null,
        appointmentId: appointmentId || null,
        status: status || 'PENDING',
        rating: rating ? parseFloat(rating) : null,
        communicationRating: communicationRating ? parseFloat(communicationRating) : null,
        professionalismRating: professionalismRating ? parseFloat(professionalismRating) : null,
        treatmentEffectivenessRating: treatmentEffectivenessRating ? parseFloat(treatmentEffectivenessRating) : null,
        feedback: feedback || null,
        wasClinicVisit: wasClinicVisit || false,
        lastFeedbackAt: new Date()
      }
    });

    // 🎯 AUTOMATICALLY TRIGGER SENTIMENT ANALYSIS
    const { onPatientFeedbackCreated } = await import('../hooks/review-sentiment-hook');
    onPatientFeedbackCreated(doctorId, feedback, rating).catch(error => {
      console.error('[Feedback] Failed to update sentiment score:', error);
    });

    res.status(201).json({
      message: 'Feedback submitted successfully',
      feedback: newFeedback
    });
  } catch (error) {
    console.error('[Feedback] Error creating feedback:', error);
    res.status(500).json({ error: 'Failed to create feedback' });
  }
});

/**
 * EXAMPLE 3: Preview Sentiment Before Submission
 * Shows user how their review will be interpreted
 */
router.post('/preview-sentiment', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { text } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Review text is required' });
    }

    const { sentimentAnalysisService } = await import('../services/sentiment-analysis.service');
    const sentiment = await sentimentAnalysisService.analyzeSentiment(text);

    // Return user-friendly interpretation
    let interpretation = '';
    if (sentiment.category === 'VERY_POSITIVE') {
      interpretation = 'Your review is very positive! 😊';
    } else if (sentiment.category === 'POSITIVE') {
      interpretation = 'Your review is positive. 👍';
    } else if (sentiment.category === 'NEUTRAL') {
      interpretation = 'Your review is neutral. 😐';
    } else if (sentiment.category === 'NEGATIVE') {
      interpretation = 'Your review is negative. 👎';
    } else {
      interpretation = 'Your review is very negative. 😞';
    }

    res.json({
      sentiment: {
        score: sentiment.score,
        category: sentiment.category,
        confidence: sentiment.confidence
      },
      interpretation,
      keywords: sentiment.keywords
    });
  } catch (error) {
    console.error('[Preview] Error analyzing sentiment:', error);
    res.status(500).json({ error: 'Failed to analyze sentiment' });
  }
});

/**
 * EXAMPLE 4: Get Doctor Score with Sentiment Breakdown
 * Shows on doctor profile page
 */
router.get('/doctor/:doctorId/score-with-sentiment', async (req, res: Response) => {
  try {
    const { doctorId } = req.params;

    const { doctorSentimentScoringService } = await import('../services/doctor-sentiment-scoring.service');
    const scoreDisplay = await doctorSentimentScoringService.getEnhancedScoreForDisplay(doctorId);

    res.json({
      score: scoreDisplay.score,
      outOf: scoreDisplay.outOf,
      totalReviews: scoreDisplay.totalReviews,
      sentimentSummary: scoreDisplay.sentimentSummary,
      breakdown: scoreDisplay.breakdown
    });
  } catch (error) {
    console.error('[Score] Error getting score:', error);
    res.status(500).json({ error: 'Failed to get score' });
  }
});

/**
 * EXAMPLE 5: Batch Update (Cron Job)
 * Run this periodically to keep scores up-to-date
 */
export async function scheduledSentimentUpdate() {
  try {
    console.log('[Cron] Starting scheduled sentiment score update...');
    
    const { batchUpdateAllDoctorScores } = await import('../hooks/review-sentiment-hook');
    const result = await batchUpdateAllDoctorScores();
    
    console.log(`[Cron] Sentiment update complete: ${result.updated} updated, ${result.failed} failed`);
    
    return result;
  } catch (error) {
    console.error('[Cron] Error in scheduled update:', error);
    throw error;
  }
}

// Example: Add to cron jobs service
// cronJobsService.addJob('update-sentiment-scores', '0 2 * * *', scheduledSentimentUpdate);
// This runs daily at 2 AM

export default router;
