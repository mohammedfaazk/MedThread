import { Router, Request, Response } from 'express';
import { cmeCreditsService } from '../services/cme-credits.service';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/asyncHandler';

export const cmeCreditsRouter = Router();

/**
 * GET /api/cme-credits/my-credits
 * Get doctor's CME credits summary
 */
cmeCreditsRouter.get(
  '/my-credits',
  authenticate,
  asyncHandler(async (req: any, res: Response) => {
    const doctorId = req.user.userId;
    const credits = await cmeCreditsService.getDoctorCmeCredits(doctorId);
    res.json(credits);
  })
);

/**
 * GET /api/cme-credits/leaderboard
 * Get CME leaderboard
 */
cmeCreditsRouter.get(
  '/leaderboard',
  asyncHandler(async (req: Request, res: Response) => {
    const { timeframe = 'month', limit = 10 } = req.query;
    const leaderboard = await cmeCreditsService.getCmeLeaderboard(
      timeframe as any,
      Number(limit)
    );
    res.json(leaderboard);
  })
);

/**
 * GET /api/cme-credits/opportunities
 * Get CME earning opportunities
 */
cmeCreditsRouter.get(
  '/opportunities',
  authenticate,
  asyncHandler(async (req: any, res: Response) => {
    const doctorId = req.user.userId;
    const opportunities = await cmeCreditsService.getCmeOpportunities(doctorId);
    res.json(opportunities);
  })
);

/**
 * POST /api/cme-credits/award
 * Award CME credits (admin or auto-trigger)
 */
cmeCreditsRouter.post(
  '/award',
  authenticate,
  asyncHandler(async (req: any, res: Response) => {
    const activity = req.body;
    const result = await cmeCreditsService.awardCredits(activity);
    res.json(result);
  })
);

/**
 * POST /api/cme-credits/check-reply/:replyId
 * Check if reply qualifies for CME credits
 */
cmeCreditsRouter.post(
  '/check-reply/:replyId',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const { replyId } = req.params;
    const result = await cmeCreditsService.checkAndAwardForReply(replyId);
    res.json(result || { message: 'Reply does not qualify for CME credits yet' });
  })
);

/**
 * POST /api/cme-credits/certificate/:activityId
 * Generate CME certificate
 */
cmeCreditsRouter.post(
  '/certificate/:activityId',
  authenticate,
  asyncHandler(async (req: any, res: Response) => {
    const { activityId } = req.params;
    const doctorId = req.user.userId;
    
    const certificate = await cmeCreditsService.generateCertificate(doctorId, activityId);
    res.json(certificate);
  })
);

