import { Router } from 'express';
import medicalVerificationRoutes from './medical-verification.routes';
import contentModerationRoutes from './content-moderation.routes';
import liabilityProtectionRoutes from './liability-protection.routes';
import searchRoutes from './search.routes';
import backupRoutes from './backup.routes';
import performanceMonitorRoutes from './performance-monitor.routes';
import notificationRoutes from './notification.routes';

const router = Router();

// Register all feature routes
router.use('/api/v1/medical-verification', medicalVerificationRoutes);
router.use('/api/v1/content-moderation', contentModerationRoutes);
router.use('/api/v1/liability', liabilityProtectionRoutes);
router.use('/api/v1/search', searchRoutes);
router.use('/api/v1/backup', backupRoutes);
router.use('/api/v1/performance', performanceMonitorRoutes);
router.use('/api/v1/notifications', notificationRoutes);

export default router;
