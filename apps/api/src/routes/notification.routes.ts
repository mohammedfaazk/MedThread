import { Router, Request, Response } from 'express';
import { notificationService } from '../services/notification.service';
import { authenticate, AuthRequest } from '../middleware/auth.refactored';

const router = Router();

router.post('/send', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { userId, title, body, data, urgent, type } = req.body;
    const result = await notificationService.sendNotification(userId, {
      title,
      body,
      data,
      urgent,
      type
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Send failed' });
  }
});

router.post('/subscribe-device', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { endpoint, keys } = req.body;
    await notificationService.subscribeDevice(req.userId, { endpoint, keys });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Subscription failed' });
  }
});

router.post('/unsubscribe-device', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { endpoint } = req.body;
    await notificationService.unsubscribeDevice(req.userId, endpoint);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unsubscription failed' });
  }
});

router.get('/unread-count', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const count = await notificationService.getUnreadCount(req.userId);
    res.json({ count });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Count fetch failed' });
  }
});

router.post('/batch-send', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { notifications } = req.body;
    const result = await notificationService.sendBatchNotifications(notifications);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Batch send failed' });
  }
});

router.post('/urgent-medical', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { userId, message, emergencyType } = req.body;
    await notificationService.sendUrgentMedicalNotification(userId, message, emergencyType);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Send failed' });
  }
});

router.post('/appointment-reminder', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { userId, appointmentId, reminderTime } = req.body;
    await notificationService.sendAppointmentReminder(userId, appointmentId, reminderTime);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Send failed' });
  }
});

export default router;
