import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.refactored';
import { adminService } from '../services/admin.service';
import { auditLogService } from '../services/audit-log.service';
import { asyncHandler } from '../middleware/asyncHandler';

export class AdminController {
  // Platform Statistics
  getPlatformStats = asyncHandler(async (req: AuthRequest, res: Response) => {
    const stats = await adminService.getPlatformStats();

    res.json({
      success: true,
      data: stats,
    });
  });

  // User Management
  getUsers = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { role, suspended, search, page, limit } = req.query;

    const users = await adminService.getUsers({
      role: role as any,
      isSuspended: suspended === 'true',
      search: search as string,
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
    });

    res.json({
      success: true,
      data: users,
    });
  });

  suspendUser = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { reason } = req.body;

    const user = await adminService.suspendUser(id, reason);

    // Log action
    await auditLogService.createLog({
      action: 'USER_SUSPEND',
      adminId: req.userId!,
      targetType: 'USER',
      targetId: id,
      details: { reason },
      ipAddress: req.headers['x-forwarded-for']?.toString().split(',')[0].trim() || req.socket.remoteAddress,
      userAgent: req.headers['user-agent'],
    });

    res.json({
      success: true,
      data: user,
      message: 'User suspended successfully',
    });
  });

  unsuspendUser = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    const user = await adminService.unsuspendUser(id);

    // Log action
    await auditLogService.createLog({
      action: 'USER_UNSUSPEND',
      adminId: req.userId!,
      targetType: 'USER',
      targetId: id,
      ipAddress: req.headers['x-forwarded-for']?.toString().split(',')[0].trim() || req.socket.remoteAddress,
      userAgent: req.headers['user-agent'],
    });

    res.json({
      success: true,
      data: user,
      message: 'User unsuspended successfully',
    });
  });

  deleteUser = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    await adminService.deleteUser(id);

    // Log action
    await auditLogService.createLog({
      action: 'USER_DELETE',
      adminId: req.userId!,
      targetType: 'USER',
      targetId: id,
      ipAddress: req.headers['x-forwarded-for']?.toString().split(',')[0].trim() || req.socket.remoteAddress,
      userAgent: req.headers['user-agent'],
    });

    res.json({
      success: true,
      message: 'User deleted successfully',
    });
  });

  // Post Management
  getPosts = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { communityId, authorId, isRemoved, isPinned, isLocked, search, page, limit } = req.query;

    const posts = await adminService.getPosts({
      communityId: communityId as string,
      authorId: authorId as string,
      isRemoved: isRemoved === 'true',
      isPinned: isPinned === 'true',
      isLocked: isLocked === 'true',
      search: search as string,
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
    });

    res.json({
      success: true,
      data: posts,
    });
  });

  deletePost = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { reason } = req.body;

    await adminService.deletePost(id);

    // Log action
    await auditLogService.createLog({
      action: 'POST_DELETE',
      adminId: req.userId!,
      targetType: 'POST',
      targetId: id,
      details: { reason },
      ipAddress: req.headers['x-forwarded-for']?.toString().split(',')[0].trim() || req.socket.remoteAddress,
      userAgent: req.headers['user-agent'],
    });

    res.json({
      success: true,
      message: 'Post deleted successfully',
    });
  });

  togglePinPost = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    const post = await adminService.togglePinPost(id);

    // Log action
    await auditLogService.createLog({
      action: (post.isPinned ? 'POST_PIN' : 'POST_UNPIN') as any,
      adminId: req.userId!,
      targetType: 'POST',
      targetId: id,
      ipAddress: req.headers['x-forwarded-for']?.toString().split(',')[0].trim() || req.socket.remoteAddress,
      userAgent: req.headers['user-agent'],
    });

    res.json({
      success: true,
      data: post,
      message: `Post ${post.isPinned ? 'pinned' : 'unpinned'} successfully`,
    });
  });

  toggleLockPost = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    const post = await adminService.toggleLockPost(id);

    // Log action
    await auditLogService.createLog({
      action: (post.isLocked ? 'POST_LOCK' : 'POST_UNLOCK') as any,
      adminId: req.userId!,
      targetType: 'POST',
      targetId: id,
      ipAddress: req.headers['x-forwarded-for']?.toString().split(',')[0].trim() || req.socket.remoteAddress,
      userAgent: req.headers['user-agent'],
    });

    res.json({
      success: true,
      data: post,
      message: `Post ${post.isLocked ? 'locked' : 'unlocked'} successfully`,
    });
  });

  // Comment Management
  getComments = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { postId, authorId, isRemoved, search, page, limit } = req.query;

    const comments = await adminService.getComments({
      postId: postId as string,
      authorId: authorId as string,
      isRemoved: isRemoved === 'true',
      search: search as string,
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
    });

    res.json({
      success: true,
      data: comments,
    });
  });

  deleteComment = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { reason } = req.body;

    await adminService.deleteComment(id);

    // Log action
    await auditLogService.createLog({
      action: 'COMMENT_DELETE',
      adminId: req.userId!,
      targetType: 'COMMENT',
      targetId: id,
      details: { reason },
      ipAddress: req.headers['x-forwarded-for']?.toString().split(',')[0].trim() || req.socket.remoteAddress,
      userAgent: req.headers['user-agent'],
    });

    res.json({
      success: true,
      message: 'Comment deleted successfully',
    });
  });

  // Report Management
  getReports = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { status, targetType, page, limit } = req.query;

    const reports = await adminService.getReports({
      status: status as any,
      targetType: targetType as any,
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
    });

    res.json({
      success: true,
      data: reports,
    });
  });

  resolveReport = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { action, notes } = req.body;

    const report = await adminService.resolveReport(id, action, notes);

    // Log action
    await auditLogService.createLog({
      action: 'REPORT_RESOLVE',
      adminId: req.userId!,
      targetType: 'REPORT',
      targetId: id,
      details: { action, notes },
      ipAddress: req.headers['x-forwarded-for']?.toString().split(',')[0].trim() || req.socket.remoteAddress,
      userAgent: req.headers['user-agent'],
    });

    res.json({
      success: true,
      data: report,
      message: 'Report resolved successfully',
    });
  });

  // Audit Logs
  getAuditLogs = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { adminId, action, targetType, targetId, startDate, endDate, page, limit } = req.query;

    const logs = await auditLogService.getLogs({
      adminId: adminId as string,
      action: action as any,
      targetType: targetType as string,
      targetId: targetId as string,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
    });

    res.json({
      success: true,
      data: logs,
    });
  });

  getAuditLogStats = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { adminId, startDate, endDate } = req.query;

    const stats = await auditLogService.getStats({
      adminId: adminId as string,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
    });

    res.json({
      success: true,
      data: stats,
    });
  });

  /**
   * Create system announcement notification
   */
  createSystemAnnouncement = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { title, body, link } = req.body;

    if (!title || title.trim().length < 5) {
      return res.status(400).json({
        success: false,
        error: 'Announcement title must be at least 5 characters'
      });
    }

    if (!body || body.trim().length < 10) {
      return res.status(400).json({
        success: false,
        error: 'Announcement body must be at least 10 characters'
      });
    }

    const result = await adminService.createSystemAnnouncement(
      req.user!.id,
      { title, body, link }
    );

    res.status(201).json({
      success: true,
      data: result,
      message: 'System announcement created successfully'
    });
  });
}

export const adminController = new AdminController();
