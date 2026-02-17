import { Router } from 'express';
import { authenticate } from '../middleware/auth.refactored';
import { reportController } from '../controllers/report.controller';

const router = Router();

// All report routes require authentication
router.use(authenticate);

// Create reports
router.post('/post/:postId', reportController.reportPost);
router.post('/comment/:commentId', reportController.reportComment);
router.post('/user/:userId', reportController.reportUser);

// Get user's own reports
router.get('/my-reports', reportController.getMyReports);

export { router as reportRouter };
