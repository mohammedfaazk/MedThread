import { Router } from 'express';
import { authenticate } from '../middleware/auth.refactored';
import { requireAdmin } from '../middleware/requireAdmin';
import { adminController } from '../controllers/admin.controller';

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(requireAdmin);

// Platform Statistics
router.get('/stats', adminController.getPlatformStats);

// User Management
router.get('/users', adminController.getUsers);
router.put('/users/:id/suspend', adminController.suspendUser);
router.put('/users/:id/unsuspend', adminController.unsuspendUser);
router.delete('/users/:id', adminController.deleteUser);

// Post Management
router.get('/posts', adminController.getPosts);
router.delete('/posts/:id', adminController.deletePost);
router.put('/posts/:id/pin', adminController.togglePinPost);
router.put('/posts/:id/lock', adminController.toggleLockPost);

// Comment Management
router.get('/comments', adminController.getComments);
router.delete('/comments/:id', adminController.deleteComment);

// Report Management
router.get('/reports', adminController.getReports);
router.put('/reports/:id/resolve', adminController.resolveReport);

// Audit Logs
router.get('/audit-logs', adminController.getAuditLogs);
router.get('/audit-logs/stats', adminController.getAuditLogStats);

export { router as adminRouter };
