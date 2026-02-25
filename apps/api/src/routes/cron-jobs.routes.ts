import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { requireAdmin } from '../middleware/requireAdmin';
import { asyncHandler } from '../middleware/asyncHandler';
import { cronJobsService } from '../services/cron-jobs.service';

const router = Router();

/**
 * Get all available cron jobs
 * GET /api/cron-jobs
 */
router.get(
  '/',
  authenticate,
  requireAdmin,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const jobs = [
      {
        name: 'checkExpiringLicenses',
        description: 'Check for expiring medical licenses and send reminders',
        schedule: '0 9 * * *',
        frequency: 'Daily at 9 AM'
      },
      {
        name: 'sendAppointmentReminders',
        description: 'Send appointment reminders to patients and doctors',
        schedule: '0 * * * *',
        frequency: 'Every hour'
      },
      {
        name: 'autoAwardCmeCredits',
        description: 'Auto-award CME credits for quality replies',
        schedule: '0 0 * * *',
        frequency: 'Daily at midnight'
      },
      {
        name: 'sendDailyDigests',
        description: 'Send daily digest emails to users',
        schedule: '0 8 * * *',
        frequency: 'Daily at 8 AM'
      },
      {
        name: 'sendWeeklyDigests',
        description: 'Send weekly digest emails to users',
        schedule: '0 8 * * 1',
        frequency: 'Monday at 8 AM'
      },
      {
        name: 'updateLeaderboards',
        description: 'Update all leaderboards with latest rankings',
        schedule: '0 */6 * * *',
        frequency: 'Every 6 hours'
      },
      {
        name: 'checkAllBadges',
        description: 'Check and award badges for all active doctors',
        schedule: '0 2 * * *',
        frequency: 'Daily at 2 AM'
      },
      {
        name: 'cleanupOldNotifications',
        description: 'Delete old read notifications (6+ months)',
        schedule: '0 3 * * 0',
        frequency: 'Sunday at 3 AM'
      },
      {
        name: 'cleanupOldSessions',
        description: 'Delete old user sessions (30+ days)',
        schedule: '0 4 * * *',
        frequency: 'Daily at 4 AM'
      },
      {
        name: 'archiveOldPosts',
        description: 'Archive old posts with low engagement',
        schedule: '0 2 * * 0',
        frequency: 'Sunday at 2 AM'
      },
      {
        name: 'checkSubscriptionRenewals',
        description: 'Check for expiring subscriptions and send reminders',
        schedule: '0 6 * * *',
        frequency: 'Daily at 6 AM'
      },
      {
        name: 'autoResolveOldReports',
        description: 'Auto-resolve reports older than 30 days',
        schedule: '0 5 * * *',
        frequency: 'Daily at 5 AM'
      },
      {
        name: 'cleanupFailedEmails',
        description: 'Clean up failed email queue entries',
        schedule: '0 3 * * *',
        frequency: 'Daily at 3 AM'
      },
      {
        name: 'updateDoctorAnalytics',
        description: 'Update doctor analytics and statistics',
        schedule: '0 1 * * *',
        frequency: 'Daily at 1 AM'
      },
      {
        name: 'warnInactiveUsers',
        description: 'Send reminders to inactive users',
        schedule: '0 10 * * 3',
        frequency: 'Wednesday at 10 AM'
      },
      {
        name: 'generateMonthlyReports',
        description: 'Generate monthly platform reports',
        schedule: '0 7 1 * *',
        frequency: '1st of month at 7 AM'
      }
    ];

    res.json({
      success: true,
      data: jobs
    });
  })
);

/**
 * Manually trigger a cron job
 * POST /api/cron-jobs/:jobName/trigger
 */
router.post(
  '/:jobName/trigger',
  authenticate,
  requireAdmin,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { jobName } = req.params;

    // Validate job name
    const validJobs = [
      'checkExpiringLicenses',
      'sendAppointmentReminders',
      'autoAwardCmeCredits',
      'sendDailyDigests',
      'sendWeeklyDigests',
      'updateLeaderboards',
      'checkAllBadges',
      'cleanupOldNotifications',
      'cleanupOldSessions',
      'archiveOldPosts',
      'checkSubscriptionRenewals',
      'autoResolveOldReports',
      'cleanupFailedEmails',
      'updateDoctorAnalytics',
      'warnInactiveUsers',
      'generateMonthlyReports'
    ];

    if (!validJobs.includes(jobName)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid job name'
      });
    }

    // Execute the job
    try {
      const startTime = Date.now();
      await (cronJobsService as any)[jobName]();
      const duration = Date.now() - startTime;

      res.json({
        success: true,
        message: `Job ${jobName} executed successfully`,
        duration: `${duration}ms`
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: `Failed to execute job: ${error.message}`
      });
    }
  })
);

/**
 * Get cron job execution history
 * GET /api/cron-jobs/history
 */
router.get(
  '/history',
  authenticate,
  requireAdmin,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    // TODO: Implement job execution history tracking
    // For now, return empty array
    res.json({
      success: true,
      data: [],
      message: 'Job history tracking not yet implemented'
    });
  })
);

export { router as cronJobsRouter };
