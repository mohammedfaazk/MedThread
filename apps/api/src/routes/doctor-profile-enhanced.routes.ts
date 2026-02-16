import { Router } from 'express';
import { doctorProfileEnhancedService } from '../services/doctor-profile-enhanced.service';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/asyncHandler';

export const doctorProfileEnhancedRouter = Router();

/**
 * GET /api/doctor-profile/:username
 * Get public doctor profile
 */
doctorProfileEnhancedRouter.get(
  '/:username',
  asyncHandler(async (req, res) => {
    const { username } = req.params;
    const profile = await doctorProfileEnhancedService.getPublicProfile(username);
    res.json(profile);
  })
);

/**
 * PUT /api/doctor-profile/professional
 * Update professional profile (authenticated doctor only)
 */
doctorProfileEnhancedRouter.put(
  '/professional',
  authenticate,
  asyncHandler(async (req: any, res) => {
    const doctorId = req.user.userId;
    const profileData = req.body;
    
    const updated = await doctorProfileEnhancedService.updateProfessionalProfile(
      doctorId,
      profileData
    );
    
    res.json({
      message: 'Professional profile updated successfully',
      profile: updated
    });
  })
);

/**
 * GET /api/doctor-profile/metrics/performance
 * Get doctor's performance metrics
 */
doctorProfileEnhancedRouter.get(
  '/metrics/performance',
  authenticate,
  asyncHandler(async (req: any, res) => {
    const doctorId = req.user.userId;
    const metrics = await doctorProfileEnhancedService.calculatePerformanceMetrics(doctorId);
    res.json(metrics);
  })
);

/**
 * GET /api/doctor-profile/stats/contribution
 * Get doctor's contribution stats
 */
doctorProfileEnhancedRouter.get(
  '/stats/contribution',
  authenticate,
  asyncHandler(async (req: any, res) => {
    const doctorId = req.user.userId;
    const stats = await doctorProfileEnhancedService.getContributionStats(doctorId);
    res.json(stats);
  })
);

/**
 * POST /api/doctor-profile/badge
 * Award badge to doctor (admin only)
 */
doctorProfileEnhancedRouter.post(
  '/badge',
  authenticate,
  asyncHandler(async (req: any, res) => {
    // TODO: Add admin check
    const { doctorId, badge } = req.body;
    const awarded = await doctorProfileEnhancedService.awardBadge(doctorId, badge);
    res.json({
      message: 'Badge awarded successfully',
      badge: awarded
    });
  })
);
