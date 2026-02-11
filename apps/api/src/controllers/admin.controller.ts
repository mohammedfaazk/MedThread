import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.refactored';
import { adminService } from '../services/admin.service';
import { asyncHandler } from '../middleware/asyncHandler';

export class AdminController {
  /**
   * Get platform statistics
   */
  getPlatformStats = asyncHandler(async (req: AuthRequest, res: Response) => {
    const stats = await adminService.getPlatformStats();

    res.status(200).json({
      success: true,
      data: stats
    });
  });

  /**
   * Get all users with filters
   */
  getUsers = asyncHandler(async (req: AuthRequest, res: Response) => {
    const filters = {
      role: req.query.role as string,
      search: req.query.search as string,
      isSuspended: req.query.isSuspended === 'true',
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 50,
    };

    const result = await adminService.getUsers(filters);

    res.status(200).json({
      success: true,
      data: result
    });
  });

  /**
   * Suspend user
   */
  suspendUser = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { userId } = req.params;
    const { reason } = req.body;

    if (!reason || reason.trim().length < 10) {
      return res.status(400).json({
        success: false,
        error: 'Suspension reason must be at least 10 characters'
      });
    }

    const result = await adminService.suspendUser(userId, reason);

    res.status(200).json({
      success: true,
      data: result,
      message: 'User suspended successfully'
    });
  });

  /**
   * Unsuspend user
   */
  unsuspendUser = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { userId } = req.params;

    const result = await adminService.unsuspendUser(userId);

    res.status(200).json({
      success: true,
      data: result,
      message: 'User unsuspended successfully'
    });
  });

  /**
   * Delete user
   */
  deleteUser = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { userId } = req.params;

    const result = await adminService.deleteUser(userId);

    res.status(200).json({
      success: true,
      data: result,
      message: 'User deleted successfully'
    });
  });

  /**
   * Get reports
   */
  getReports = asyncHandler(async (req: AuthRequest, res: Response) => {
    const filters = {
      status: req.query.status as string,
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 50,
    };

    const result = await adminService.getReports(filters);

    res.status(200).json({
      success: true,
      data: result
    });
  });

  /**
   * Resolve report
   */
  resolveReport = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { reportId } = req.params;
    const { action, notes } = req.body;

    if (!['APPROVED', 'REJECTED'].includes(action)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid action. Must be APPROVED or REJECTED'
      });
    }

    const result = await adminService.resolveReport(reportId, action, notes);

    res.status(200).json({
      success: true,
      data: result,
      message: `Report ${action.toLowerCase()} successfully`
    });
  });
}

export const adminController = new AdminController();
