import { Router } from 'express';
import { adminController } from '../controllers/admin.controller';
import { authenticate } from '../middleware/auth.refactored';
import { requireAdmin } from '../middleware/requireAdmin';

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticate, requireAdmin);

/**
 * @route   GET /api/v1/admin/stats
 * @desc    Get platform statistics
 * @access  Private (Admin only)
 */
router.get('/stats', adminController.getPlatformStats);

/**
 * @route   GET /api/v1/admin/users
 * @desc    Get all users with filters
 * @access  Private (Admin only)
 */
router.get('/users', adminController.getUsers);

/**
 * @route   POST /api/v1/admin/users/:userId/suspend
 * @desc    Suspend user account
 * @access  Private (Admin only)
 */
router.post('/users/:userId/suspend', adminController.suspendUser);

/**
 * @route   POST /api/v1/admin/users/:userId/unsuspend
 * @desc    Unsuspend user account
 * @access  Private (Admin only)
 */
router.post('/users/:userId/unsuspend', adminController.unsuspendUser);

/**
 * @route   DELETE /api/v1/admin/users/:userId
 * @desc    Delete user account
 * @access  Private (Admin only)
 */
router.delete('/users/:userId', adminController.deleteUser);

/**
 * @route   GET /api/v1/admin/reports
 * @desc    Get reported content
 * @access  Private (Admin only)
 */
router.get('/reports', adminController.getReports);

/**
 * @route   POST /api/v1/admin/reports/:reportId/resolve
 * @desc    Resolve a report
 * @access  Private (Admin only)
 */
router.post('/reports/:reportId/resolve', adminController.resolveReport);

export { router as adminRouter };
