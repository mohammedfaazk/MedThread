/**
 * Hook to automatically update doctor sentiment scores when reviews are added
 */

import { doctorSentimentScoringService } from '../services/doctor-sentiment-scoring.service';

/**
 * Call this after a new DoctorRating is created
 */
export async function onDoctorRatingCreated(doctorId: string, reviewText?: string, starRating?: number) {
  try {
    if (reviewText && reviewText.trim().length > 0) {
      console.log(`[ReviewSentimentHook] New review for doctor ${doctorId}, analyzing sentiment...`);
      
      const result = await doctorSentimentScoringService.analyzeNewReview(
        doctorId,
        reviewText,
        starRating || 0
      );

      console.log(`[ReviewSentimentHook] Sentiment: ${result.sentiment.category} (${result.sentiment.score.toFixed(2)})`);
      console.log(`[ReviewSentimentHook] Updated score: ${result.updatedScore.toFixed(2)}/5`);
    } else {
      // Just update the score without sentiment analysis
      await doctorSentimentScoringService.updateDoctorPerformanceWithSentiment(doctorId);
      console.log(`[ReviewSentimentHook] Updated score for doctor ${doctorId} (no text review)`);
    }
  } catch (error) {
    console.error('[ReviewSentimentHook] Error updating sentiment score:', error);
    // Don't throw - we don't want to fail the review creation
  }
}

/**
 * Call this after a new PatientFeedback is created
 */
export async function onPatientFeedbackCreated(doctorId: string, feedbackText?: string, rating?: number) {
  try {
    if (feedbackText && feedbackText.trim().length > 0) {
      console.log(`[ReviewSentimentHook] New feedback for doctor ${doctorId}, analyzing sentiment...`);
      
      const result = await doctorSentimentScoringService.analyzeNewReview(
        doctorId,
        feedbackText,
        rating || 0
      );

      console.log(`[ReviewSentimentHook] Sentiment: ${result.sentiment.category} (${result.sentiment.score.toFixed(2)})`);
      console.log(`[ReviewSentimentHook] Updated score: ${result.updatedScore.toFixed(2)}/5`);
    } else {
      // Just update the score without sentiment analysis
      await doctorSentimentScoringService.updateDoctorPerformanceWithSentiment(doctorId);
      console.log(`[ReviewSentimentHook] Updated score for doctor ${doctorId} (no text feedback)`);
    }
  } catch (error) {
    console.error('[ReviewSentimentHook] Error updating sentiment score:', error);
    // Don't throw - we don't want to fail the feedback creation
  }
}

/**
 * Batch update all doctors (can be run as a cron job)
 */
export async function batchUpdateAllDoctorScores() {
  try {
    console.log('[ReviewSentimentHook] Starting batch update of all doctor scores...');
    
    const result = await doctorSentimentScoringService.updateAllDoctorScores();
    
    console.log(`[ReviewSentimentHook] Batch update complete: ${result.updated} updated, ${result.failed} failed`);
    
    if (result.errors.length > 0) {
      console.error('[ReviewSentimentHook] Errors:', result.errors);
    }

    return result;
  } catch (error) {
    console.error('[ReviewSentimentHook] Error in batch update:', error);
    throw error;
  }
}
