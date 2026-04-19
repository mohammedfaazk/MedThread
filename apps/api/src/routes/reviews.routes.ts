import { Router } from 'express';
import { prisma } from '@medthread/database';
import { authenticate } from '../middleware/auth.refactored';
import { onPatientFeedbackCreated } from '../hooks/review-sentiment-hook';

const router = Router();

/**
 * POST /api/reviews
 * Create a new review
 */
router.post('/', authenticate, async (req, res) => {
  try {
    const patientId = (req as any).userId;
    const {
      doctorId,
      appointmentId,
      overallRating,
      communicationRating,
      knowledgeRating,
      empathyRating,
      reviewText
    } = req.body;

    if (!doctorId || !overallRating) {
      return res.status(400).json({
        success: false,
        error: 'Doctor ID and overall rating are required'
      });
    }

    // Check if user already reviewed this doctor
    const existingReview = await prisma.patientFeedback.findFirst({
      where: {
        patientId,
        doctorId,
        rating: { not: null }, // Only check for actual reviews
        ...(appointmentId && { appointmentId })
      }
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        error: 'You have already reviewed this doctor'
      });
    }

    // Create review
    const review = await prisma.patientFeedback.create({
      data: {
        patientId,
        doctorId,
        appointmentId,
        rating: overallRating,
        communicationRating,
        professionalismRating: knowledgeRating,
        treatmentEffectivenessRating: empathyRating,
        feedback: reviewText,
        isAnonymous: false
      }
    });

    // Update doctor's average rating
    await updateDoctorRating(doctorId);

    // 🎯 Trigger sentiment analysis (non-blocking)
    onPatientFeedbackCreated(doctorId, reviewText, overallRating).catch(error => {
      console.error('[Reviews] Failed to update sentiment score:', error);
      // Don't fail the request if sentiment analysis fails
    });

    res.json({ success: true, data: review });
  } catch (error: any) {
    console.error('Error creating review:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/reviews/doctor/:doctorId
 * Get all reviews for a doctor
 */
router.get('/doctor/:doctorId', async (req, res) => {
  try {
    const { doctorId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      prisma.patientFeedback.findMany({
        where: { 
          doctorId,
          rating: { not: null } // Only get actual reviews
        },
        include: {
          patient: {
            select: {
              id: true,
              username: true,
              avatar: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.patientFeedback.count({ 
        where: { 
          doctorId,
          rating: { not: null }
        }
      })
    ]);

    // Calculate stats - Use enhanced score from DoctorPerformance if available
    const doctorPerformance = await prisma.doctorPerformance.findUnique({
      where: { doctorId },
      select: { helpfulnessScore: true }
    });

    const allReviews = await prisma.patientFeedback.findMany({
      where: { 
        doctorId,
        rating: { not: null }
      },
      select: { rating: true }
    });

    // Use enhanced score if available, otherwise calculate simple average
    const averageRating = doctorPerformance?.helpfulnessScore 
      ? doctorPerformance.helpfulnessScore
      : (allReviews.length > 0
          ? allReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / allReviews.length
          : 0);

    const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    allReviews.forEach(r => {
      if (r.rating) {
        const rating = Math.round(r.rating) as 1 | 2 | 3 | 4 | 5;
        ratingDistribution[rating]++;
      }
    });

    // Format reviews
    const formattedReviews = reviews.map(review => ({
      id: review.id,
      overallRating: review.rating || 0,
      communicationRating: review.communicationRating,
      knowledgeRating: review.professionalismRating,
      empathyRating: review.treatmentEffectivenessRating,
      reviewText: review.feedback,
      createdAt: review.createdAt,
      helpfulCount: 0, // TODO: Implement helpful votes
      patient: review.patient
    }));

    res.json({
      success: true,
      data: {
        reviews: formattedReviews,
        stats: {
          averageRating,
          totalReviews: total,
          ratingDistribution
        },
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error: any) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/reviews/:id/helpful
 * Mark review as helpful
 */
router.post('/:reviewId/helpful', authenticate, async (req, res) => {
  try {
    // TODO: Implement helpful votes tracking
    // For now, just return success
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error marking helpful:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * PUT /api/reviews/:id
 * Edit a review
 */
router.put('/:id', authenticate, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;
    const { overallRating, communicationRating, knowledgeRating, empathyRating, reviewText } = req.body;

    const review = await prisma.patientFeedback.findUnique({ where: { id } });
    
    if (!review) {
      return res.status(404).json({ success: false, error: 'Review not found' });
    }

    if (review.patientId !== userId) {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    const updated = await prisma.patientFeedback.update({
      where: { id },
      data: {
        rating: overallRating,
        communicationRating,
        professionalismRating: knowledgeRating,
        treatmentEffectivenessRating: empathyRating,
        feedback: reviewText,
        updatedAt: new Date()
      }
    });

    await updateDoctorRating(review.doctorId);

    // 🎯 Trigger sentiment analysis for updated review (non-blocking)
    onPatientFeedbackCreated(review.doctorId, reviewText, overallRating).catch(error => {
      console.error('[Reviews] Failed to update sentiment score:', error);
    });

    res.json({ success: true, data: updated });
  } catch (error: any) {
    console.error('Error updating review:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * DELETE /api/reviews/:id
 * Delete a review
 */
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;

    const review = await prisma.patientFeedback.findUnique({ where: { id } });
    
    if (!review) {
      return res.status(404).json({ success: false, error: 'Review not found' });
    }

    if (review.patientId !== userId) {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    await prisma.patientFeedback.delete({ where: { id } });
    await updateDoctorRating(review.doctorId);
    
    res.json({ success: true, message: 'Review deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting review:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/reviews/:id/report
 * Report a review
 */
router.post('/:reviewId/report', authenticate, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { reason } = req.body;

    await prisma.report.create({
      data: {
        userId,
        reason: 'REVIEW_VIOLATION',
        details: reason,
        status: 'PENDING'
      }
    });

    res.json({ success: true });
  } catch (error: any) {
    console.error('Error reporting review:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Helper function to update doctor's average rating
 */
async function updateDoctorRating(doctorId: string) {
  const reviews = await prisma.patientFeedback.findMany({
    where: { 
      doctorId,
      rating: { not: null }
    },
    select: { rating: true }
  });

  if (reviews.length === 0) return;

  const averageRating = reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length;

  // Update doctor activity metrics
  await prisma.doctorActivityMetrics.upsert({
    where: { doctorId },
    create: {
      doctorId,
      averageRating,
      totalRatings: reviews.length
    },
    update: {
      averageRating,
      totalRatings: reviews.length
    }
  });
}

export default router;
