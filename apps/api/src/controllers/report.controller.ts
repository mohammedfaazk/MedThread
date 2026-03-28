import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.refactored';
import { reportService } from '../services/report.service';
import { asyncHandler } from '../middleware/asyncHandler';
import { analyticsEvents } from '../services/analytics-events.service';

export class ReportController {
  // Report a post
  reportPost = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { postId } = req.params;
    const { reason, details } = req.body;
    const userId = req.userId!;

    const report = await reportService.reportPost(userId, postId, reason, details);

    // Emit analytics event for report filed
    analyticsEvents.emitReportFiled({
      reportId: report.id,
      reason: reason
    });

    res.status(201).json({
      success: true,
      data: report,
      message: 'Post reported successfully',
    });
  });

  // Report a comment
  reportComment = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { commentId } = req.params;
    const { reason, details } = req.body;
    const userId = req.userId!;

    const report = await reportService.reportComment(userId, commentId, reason, details);

    // Emit analytics event for report filed
    analyticsEvents.emitReportFiled({
      reportId: report.id,
      reason: reason
    });

    res.status(201).json({
      success: true,
      data: report,
      message: 'Comment reported successfully',
    });
  });

  // Report a user
  reportUser = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { userId: reportedUserId } = req.params;
    const { reason, details } = req.body;
    const userId = req.userId!;

    const report = await reportService.reportUser(userId, reportedUserId, reason, details);

    // Emit analytics event for report filed
    analyticsEvents.emitReportFiled({
      reportId: report.id,
      reason: reason
    });

    res.status(201).json({
      success: true,
      data: report,
      message: 'User reported successfully',
    });
  });

  // Get user's own reports
  getMyReports = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.userId!;
    const { page, limit } = req.query;

    const reports = await reportService.getUserReports(userId, {
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
    });

    res.json({
      success: true,
      data: reports,
    });
  });
}

export const reportController = new ReportController();
