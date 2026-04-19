/**
 * 🎯 ENHANCED DOCTOR SCORING WITH SENTIMENT ANALYSIS
 * 
 * Combines traditional star ratings with sentiment analysis of patient reviews
 * to create a more comprehensive doctor scoring system
 */

import { prisma } from '@medthread/database';
import { sentimentAnalysisService } from './sentiment-analysis.service';

interface EnhancedDoctorScore {
  doctorId: string;
  traditionalScore: number; // 0-5 (star rating)
  sentimentScore: number; // -1 to 1
  combinedScore: number; // 0-5 (weighted combination)
  totalReviews: number;
  reviewsWithText: number;
  sentimentBreakdown: {
    veryPositive: number;
    positive: number;
    neutral: number;
    negative: number;
    veryNegative: number;
  };
  confidence: number; // 0-1
  lastUpdated: Date;
}

export class DoctorSentimentScoringService {

  /**
   * Calculate enhanced score for a doctor
   */
  async calculateEnhancedScore(doctorId: string): Promise<EnhancedDoctorScore> {
    // Get all ratings for this doctor
    const ratings = await prisma.doctorRating.findMany({
      where: { doctorId },
      select: {
        rating: true,
        feedback: true,
        helpfulness: true,
        communication: true,
        expertise: true
      }
    });

    // Get patient feedback
    const patientFeedback = await prisma.patientFeedback.findMany({
      where: { doctorId },
      select: {
        rating: true,
        feedback: true,
        communicationRating: true,
        professionalismRating: true,
        treatmentEffectivenessRating: true
      }
    });

    // Calculate traditional score (star ratings)
    const allRatings = [
      ...ratings.map(r => r.rating),
      ...patientFeedback.map(f => f.rating).filter(r => r !== null) as number[]
    ];

    const traditionalScore = allRatings.length > 0
      ? allRatings.reduce((sum, r) => sum + r, 0) / allRatings.length
      : 0;

    // Collect all text reviews
    const textReviews = [
      ...ratings.map(r => r.feedback).filter(f => f && f.trim().length > 0) as string[],
      ...patientFeedback.map(f => f.feedback).filter(f => f && f.trim().length > 0) as string[]
    ];

    // Analyze sentiment of text reviews
    let sentimentScore = 0;
    let sentimentBreakdown = {
      veryPositive: 0,
      positive: 0,
      neutral: 0,
      negative: 0,
      veryNegative: 0
    };
    let confidence = 0;

    if (textReviews.length > 0) {
      const sentiments = await sentimentAnalysisService.analyzeBatch(textReviews);
      
      const aggregate = sentimentAnalysisService.calculateAggregateSentiment(sentiments);
      sentimentScore = aggregate.averageScore;
      confidence = aggregate.averageConfidence;

      // Build breakdown
      sentimentBreakdown = {
        veryPositive: aggregate.distribution.VERY_POSITIVE || 0,
        positive: aggregate.distribution.POSITIVE || 0,
        neutral: aggregate.distribution.NEUTRAL || 0,
        negative: aggregate.distribution.NEGATIVE || 0,
        veryNegative: aggregate.distribution.VERY_NEGATIVE || 0
      };
    }

    // Calculate combined score
    // Weight: 70% traditional rating, 30% sentiment analysis
    // Convert sentiment score (-1 to 1) to 0-5 scale
    const sentimentOn5Scale = ((sentimentScore + 1) / 2) * 5;
    
    const combinedScore = textReviews.length > 0
      ? (traditionalScore * 0.7) + (sentimentOn5Scale * 0.3)
      : traditionalScore;

    return {
      doctorId,
      traditionalScore,
      sentimentScore,
      combinedScore,
      totalReviews: allRatings.length,
      reviewsWithText: textReviews.length,
      sentimentBreakdown,
      confidence,
      lastUpdated: new Date()
    };
  }

  /**
   * Update doctor performance with sentiment-enhanced score
   */
  async updateDoctorPerformanceWithSentiment(doctorId: string): Promise<void> {
    const enhancedScore = await this.calculateEnhancedScore(doctorId);

    // Update DoctorPerformance table
    await prisma.doctorPerformance.upsert({
      where: { doctorId },
      update: {
        helpfulnessScore: enhancedScore.combinedScore,
        totalRatings: enhancedScore.totalReviews
      },
      create: {
        doctorId,
        helpfulnessScore: enhancedScore.combinedScore,
        totalRatings: enhancedScore.totalReviews,
        totalPatientsHelped: 0,
        curedPatientCount: 0,
        avgResponseTime: 0
      }
    });

    // Store detailed sentiment analysis
    await this.storeSentimentAnalysis(enhancedScore);
  }

  /**
   * Store sentiment analysis results
   */
  private async storeSentimentAnalysis(score: EnhancedDoctorScore): Promise<void> {
    // Store in a JSON field or create a new table
    // For now, we'll use the existing structure and add metadata
    const metadata = {
      sentimentScore: score.sentimentScore,
      sentimentBreakdown: score.sentimentBreakdown,
      confidence: score.confidence,
      reviewsWithText: score.reviewsWithText,
      lastAnalyzed: score.lastUpdated
    };

    // You can store this in a new SentimentAnalysis table or in doctor's metadata
    // For now, logging it for tracking
    console.log(`[DoctorSentimentScoring] Updated score for doctor ${score.doctorId}:`, {
      traditional: score.traditionalScore.toFixed(2),
      sentiment: score.sentimentScore.toFixed(2),
      combined: score.combinedScore.toFixed(2),
      reviews: score.totalReviews,
      textReviews: score.reviewsWithText
    });
  }

  /**
   * Batch update all doctors' scores
   */
  async updateAllDoctorScores(): Promise<{
    updated: number;
    failed: number;
    errors: string[];
  }> {
    const doctors = await prisma.user.findMany({
      where: {
        role: 'DOCTOR',
        doctorVerificationStatus: 'APPROVED'
      },
      select: { id: true }
    });

    let updated = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const doctor of doctors) {
      try {
        await this.updateDoctorPerformanceWithSentiment(doctor.id);
        updated++;
      } catch (error) {
        failed++;
        errors.push(`Doctor ${doctor.id}: ${error}`);
        console.error(`[DoctorSentimentScoring] Failed to update doctor ${doctor.id}:`, error);
      }
    }

    return { updated, failed, errors };
  }

  /**
   * Get enhanced score for display
   */
  async getEnhancedScoreForDisplay(doctorId: string): Promise<{
    score: number;
    outOf: number;
    totalReviews: number;
    sentimentSummary: string;
    breakdown: {
      stars: number;
      sentiment: string;
    };
  }> {
    const enhanced = await this.calculateEnhancedScore(doctorId);

    let sentimentSummary = 'No reviews yet';
    if (enhanced.reviewsWithText > 0) {
      const { sentimentBreakdown } = enhanced;
      const total = enhanced.reviewsWithText;
      const positivePercent = Math.round(
        ((sentimentBreakdown.veryPositive + sentimentBreakdown.positive) / total) * 100
      );
      sentimentSummary = `${positivePercent}% positive feedback from ${enhanced.reviewsWithText} reviews`;
    }

    return {
      score: enhanced.combinedScore,
      outOf: 5,
      totalReviews: enhanced.totalReviews,
      sentimentSummary,
      breakdown: {
        stars: enhanced.traditionalScore,
        sentiment: this.getSentimentLabel(enhanced.sentimentScore)
      }
    };
  }

  /**
   * Get sentiment label
   */
  private getSentimentLabel(score: number): string {
    if (score > 0.5) return 'Very Positive';
    if (score > 0.1) return 'Positive';
    if (score > -0.1) return 'Neutral';
    if (score > -0.5) return 'Negative';
    return 'Very Negative';
  }

  /**
   * Analyze a single new review and update score
   */
  async analyzeNewReview(doctorId: string, reviewText: string, starRating: number): Promise<{
    sentiment: any;
    updatedScore: number;
  }> {
    // Analyze the new review
    const sentiment = await sentimentAnalysisService.analyzeSentiment(reviewText);

    // Recalculate doctor's score
    await this.updateDoctorPerformanceWithSentiment(doctorId);

    // Get updated score
    const enhanced = await this.calculateEnhancedScore(doctorId);

    return {
      sentiment,
      updatedScore: enhanced.combinedScore
    };
  }
}

export const doctorSentimentScoringService = new DoctorSentimentScoringService();
