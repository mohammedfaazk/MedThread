import { Router } from 'express';
import { prisma } from '@medthread/database';
import { authenticate } from '../middleware/auth.refactored';
import { doctorRankingService } from '../services/doctor-ranking.service';

export const doctorRankingRouter = Router();

/**
 * GET /api/doctors/top
 * Get top doctors with filtering options
 */
doctorRankingRouter.get('/doctors/top', async (req, res) => {
  try {
    const {
      limit = '20',
      offset = '0',
      regionType,
      regionName,
      specialty,
      sortBy
    } = req.query;

    const criteria: any = {};
    if (sortBy === 'rating') criteria.overallRating = true;
    if (sortBy === 'responseTime') criteria.responseTime = true;
    if (sortBy === 'successRate') criteria.successRate = true;
    if (sortBy === 'satisfaction') criteria.satisfaction = true;

    const doctors = await doctorRankingService.getTopDoctors({
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
      regionType: regionType as string,
      regionName: regionName as string,
      specialty: specialty as string,
      criteria
    });

    res.json({
      success: true,
      data: {
        doctors,
        pagination: {
          limit: parseInt(limit as string),
          offset: parseInt(offset as string),
          total: Array.isArray(doctors) ? doctors.length : 0
        }
      }
    });
  } catch (error) {
    console.error('[API] Error fetching top doctors:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch top doctors'
    });
  }
});

/**
 * GET /api/doctors/rising-stars
 * Get rising star doctors (new doctors with high ratings)
 */
doctorRankingRouter.get('/doctors/rising-stars', async (req, res) => {
  try {
    const { limit = '10' } = req.query;

    const doctors = await doctorRankingService.getRisingStars(
      parseInt(limit as string)
    );

    res.json({
      success: true,
      data: { doctors }
    });
  } catch (error) {
    console.error('[API] Error fetching rising stars:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch rising stars'
    });
  }
});

/**
 * GET /api/doctors/trending
 * Get trending doctors (based on recent activity)
 */
doctorRankingRouter.get('/doctors/trending', async (req, res) => {
  try {
    const { limit = '10' } = req.query;

    const doctors = await doctorRankingService.getTrendingDoctors(
      parseInt(limit as string)
    );

    res.json({
      success: true,
      data: { doctors }
    });
  } catch (error) {
    console.error('[API] Error fetching trending doctors:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch trending doctors'
    });
  }
});

/**
 * GET /api/doctors/most-helpful/:specialty
 * Get most helpful doctors in a specialty
 */
doctorRankingRouter.get('/doctors/most-helpful/:specialty', async (req, res) => {
  try {
    const { specialty } = req.params;
    const { limit = '10' } = req.query;

    const doctors = await doctorRankingService.getMostHelpfulInSpecialty(
      specialty,
      parseInt(limit as string)
    );

    res.json({
      success: true,
      data: { doctors, specialty }
    });
  } catch (error) {
    console.error('[API] Error fetching most helpful doctors:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch most helpful doctors'
    });
  }
});

/**
 * POST /api/doctors/:doctorId/reviews
 * Submit a review for a doctor (verified patients only)
 */
doctorRankingRouter.post('/doctors/:doctorId/reviews', authenticate, async (req, res) => {
  try {
    const { doctorId } = req.params;
    const userId = (req as any).userId;
    const {
      rating,
      reviewText,
      responseTimeRating,
      professionalismRating,
      communicationRating,
      wouldRecommend,
      appointmentId,
      isAnonymous
    } = req.body;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: 'Rating must be between 1 and 5'
      });
    }

    // Check if user has had an appointment with this doctor
    let isVerified = false;
    if (appointmentId) {
      const appointment = await prisma.appointment.findFirst({
        where: {
          id: appointmentId,
          patientId: userId,
          doctorId,
          status: 'COMPLETED'
        }
      });
      isVerified = !!appointment;
    }

    // Check if review already exists
    const existingReview = await prisma.$queryRaw<any[]>`
      SELECT id FROM "DoctorReview"
      WHERE doctor_id = ${doctorId}
        AND patient_id = ${userId}
        ${appointmentId ? `AND appointment_id = ${appointmentId}` : ''}
    `;

    if (existingReview.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'You have already reviewed this doctor for this appointment'
      });
    }

    // Create review
    await prisma.$executeRaw`
      INSERT INTO "DoctorReview" (
        doctor_id, patient_id, appointment_id, rating, review_text,
        response_time_rating, professionalism_rating, communication_rating,
        would_recommend, is_verified, is_anonymous
      ) VALUES (
        ${doctorId}, ${userId}, ${appointmentId || null}, ${rating}, ${reviewText || null},
        ${responseTimeRating || null}, ${professionalismRating || null},
        ${communicationRating || null}, ${wouldRecommend !== false}, ${isVerified},
        ${isAnonymous === true}
      )
    `;

    // Update doctor rating statistics
    await doctorRankingService.updateDoctorRating(doctorId);

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully'
    });
  } catch (error) {
    console.error('[API] Error submitting review:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit review'
    });
  }
});

/**
 * GET /api/doctors/:doctorId/reviews
 * Get reviews for a doctor
 */
doctorRankingRouter.get('/doctors/:doctorId/reviews', async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { limit = '20', offset = '0', verifiedOnly = 'false' } = req.query;

    let query = `
      SELECT 
        dr.id,
        dr.rating,
        dr.review_text,
        dr.response_time_rating,
        dr.professionalism_rating,
        dr.communication_rating,
        dr.would_recommend,
        dr.is_verified,
        dr.is_anonymous,
        dr.helpful_count,
        dr.created_at,
        CASE 
          WHEN dr.is_anonymous THEN 'Anonymous'
          ELSE u.username
        END as reviewer_name,
        CASE 
          WHEN dr.is_anonymous THEN NULL
          ELSE u.avatar
        END as reviewer_avatar
      FROM "DoctorReview" dr
      LEFT JOIN "User" u ON dr.patient_id = u.id
      WHERE dr.doctor_id = $1
    `;

    if (verifiedOnly === 'true') {
      query += ` AND dr.is_verified = true`;
    }

    query += ` ORDER BY dr.created_at DESC LIMIT $2 OFFSET $3`;

    const reviews = await prisma.$queryRawUnsafe(
      query,
      doctorId,
      parseInt(limit as string),
      parseInt(offset as string)
    );

    // Get total count
    const countResult = await prisma.$queryRaw<any[]>`
      SELECT COUNT(*) as total
      FROM "DoctorReview"
      WHERE doctor_id = ${doctorId}
      ${verifiedOnly === 'true' ? `AND is_verified = true` : ''}
    `;

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          limit: parseInt(limit as string),
          offset: parseInt(offset as string),
          total: parseInt(countResult[0].total)
        }
      }
    });
  } catch (error) {
    console.error('[API] Error fetching reviews:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch reviews'
    });
  }
});

/**
 * POST /api/reviews/:reviewId/helpful
 * Mark a review as helpful
 */
doctorRankingRouter.post('/reviews/:reviewId/helpful', authenticate, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = (req as any).userId;

    // Check if already marked helpful
    const existing = await prisma.$queryRaw<any[]>`
      SELECT id FROM "ReviewHelpful"
      WHERE review_id = ${parseInt(reviewId)}
        AND user_id = ${userId}
    `;

    if (existing.length > 0) {
      // Remove helpful mark
      await prisma.$executeRaw`
        DELETE FROM "ReviewHelpful"
        WHERE review_id = ${parseInt(reviewId)}
          AND user_id = ${userId}
      `;

      await prisma.$executeRaw`
        UPDATE "DoctorReview"
        SET helpful_count = helpful_count - 1
        WHERE id = ${parseInt(reviewId)}
      `;

      return res.json({
        success: true,
        message: 'Helpful mark removed',
        helpful: false
      });
    }

    // Add helpful mark
    await prisma.$executeRaw`
      INSERT INTO "ReviewHelpful" (review_id, user_id)
      VALUES (${parseInt(reviewId)}, ${userId})
    `;

    await prisma.$executeRaw`
      UPDATE "DoctorReview"
      SET helpful_count = helpful_count + 1
      WHERE id = ${parseInt(reviewId)}
    `;

    res.json({
      success: true,
      message: 'Review marked as helpful',
      helpful: true
    });
  } catch (error) {
    console.error('[API] Error marking review helpful:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark review as helpful'
    });
  }
});

/**
 * GET /api/doctors/:doctorId/rating-summary
 * Get rating summary for a doctor
 */
doctorRankingRouter.get('/doctors/:doctorId/rating-summary', async (req, res) => {
  try {
    const { doctorId } = req.params;

    const summary = await prisma.$queryRaw<any[]>`
      SELECT 
        dr.overall_rating,
        dr.total_reviews,
        dr.response_time_minutes,
        dr.consultation_success_rate,
        dr.patient_satisfaction_score,
        dr.specialization_match_score,
        dr.helpful_replies_count,
        dr.total_replies_count,
        COUNT(CASE WHEN drev.rating = 5 THEN 1 END) as five_star_count,
        COUNT(CASE WHEN drev.rating = 4 THEN 1 END) as four_star_count,
        COUNT(CASE WHEN drev.rating = 3 THEN 1 END) as three_star_count,
        COUNT(CASE WHEN drev.rating = 2 THEN 1 END) as two_star_count,
        COUNT(CASE WHEN drev.rating = 1 THEN 1 END) as one_star_count
      FROM "DoctorRating" dr
      LEFT JOIN "DoctorReview" drev ON dr.doctor_id = drev.doctor_id
      WHERE dr.doctor_id = ${doctorId}
      GROUP BY dr.doctor_id, dr.overall_rating, dr.total_reviews,
               dr.response_time_minutes, dr.consultation_success_rate,
               dr.patient_satisfaction_score, dr.specialization_match_score,
               dr.helpful_replies_count, dr.total_replies_count
    `;

    if (summary.length === 0) {
      return res.json({
        success: true,
        data: {
          overall_rating: 0,
          total_reviews: 0,
          rating_distribution: {
            5: 0, 4: 0, 3: 0, 2: 0, 1: 0
          }
        }
      });
    }

    const data = summary[0];
    res.json({
      success: true,
      data: {
        ...data,
        rating_distribution: {
          5: parseInt(data.five_star_count),
          4: parseInt(data.four_star_count),
          3: parseInt(data.three_star_count),
          2: parseInt(data.two_star_count),
          1: parseInt(data.one_star_count)
        }
      }
    });
  } catch (error) {
    console.error('[API] Error fetching rating summary:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch rating summary'
    });
  }
});

export default doctorRankingRouter;
