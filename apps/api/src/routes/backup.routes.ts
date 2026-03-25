import { Router, Request, Response } from 'express';
import { backupService } from '../services/backup.service';
import { authenticate, AuthRequest } from '../middleware/auth.refactored';

const router = Router();

router.post('/full', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const result = await backupService.createFullBackup();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Backup failed' });
  }
});

router.post('/incremental', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { lastBackupDate } = req.body;
    const result = await backupService.createIncrementalBackup(new Date(lastBackupDate));
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Backup failed' });
  }
});

router.post('/restore/:backupId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { restoreDatabase, restoreFiles } = req.body;
    const result = await backupService.restoreFromBackup(req.params.backupId, {
      restoreDatabase,
      restoreFiles
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Restore failed' });
  }
});

router.get('/status', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const status = await backupService.getBackupStatus();
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Status check failed' });
  }
});

router.post('/cleanup', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const result = await backupService.cleanupOldBackups();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Cleanup failed' });
  }
});

export default router;
