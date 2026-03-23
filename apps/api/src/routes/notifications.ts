import { Router } from 'express';
import { authenticate as auth } from '../middleware/auth';
import { notificationService } from '../services/notification.service';
import { prisma } from '@medthread/database';

const router = Router();

// Register device for push notifications
router.post('/register-device', auth, async (req, res, next) => {
  try {
    const { token, deviceType, deviceName } = req.body;
    const userId = req.userId!;

    if (!token) {
      return res.status(400).json({ error: 'FCM token is required' });
    }

    // Check if device already exists
    const existing = await prisma.$queryRaw`
      SELECT * FROM "UserDevice" WHERE "fcmToken" = ${token} LIMIT 1
    `;

    if (Array.isArray(existing) && existing.length > 0) {
      // Update existing device
      await prisma.$executeRaw`
        UPDATE "UserDevice" 
        SET "isActive" = true, "lastUsed" = NOW(), "userId" = ${userId}
        WHERE "fcmToken" = ${token}
      `;
    } else {
      // Create new device
      const id = `dev_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await prisma.$executeRaw`
        INSERT INTO "UserDevice" ("id", "userId", "fcmToken", "deviceType", "deviceName", "isActive", "lastUsed", "createdAt")
        VALUES (${id}, ${userId}, ${token}, ${deviceType || 'web'}, ${deviceName || 'Web Browser'}, true, NOW(), NOW())
      `;
    }

    res.json({ success: true, message: 'Device registered successfully' });
  } catch (error) {
    console.error('Error registering device:', error);
    next(error);
  }
});

// Unregister device
router.post('/unregister-device', auth, async (req, res, next) => {
  try {
    const { token } = req.body;
    const userId = req.userId!;

    await prisma.$executeRaw`
      UPDATE "UserDevice" 
      SET "isActive" = false 
      WHERE "fcmToken" = ${token} AND "userId" = ${userId}
    `;

    res.json({ success: true, message: 'Device unregistered successfully' });
  } catch (error) {
    next(error);
  }
});

// Get notification preferences
router.get('/preferences', auth, async (req, res, next) => {
  try {
    const userId = req.userId!;

    let prefs = await prisma.notification_preferences.findUnique({
      where: { userId }
    });

    if (!prefs) {
      // Create default preferences
      prefs = await prisma.notification_preferences.create({
        data: {
          id: `pref_${Date.now()}`,
          userId,
          inApp: { enabled: true },
          email: { enabled: true },
          push: { enabled: true },
          digestFrequency: 'daily'
        }
      });
    }

    res.json(prefs);
  } catch (error) {
    next(error);
  }
});

// Update notification preferences
router.put('/preferences', auth, async (req, res, next) => {
  try {
    const userId = req.userId!;
    const { inApp, email, push, quietHoursStart, quietHoursEnd, digestFrequency } = req.body;

    const prefs = await prisma.notification_preferences.upsert({
      where: { userId },
      create: {
        id: `pref_${Date.now()}`,
        userId,
        inApp: inApp || { enabled: true },
        email: email || { enabled: true },
        push: push || { enabled: true },
        quietHoursStart,
        quietHoursEnd,
        digestFrequency: digestFrequency || 'daily'
      },
      update: {
        inApp,
        email,
        push,
        quietHoursStart,
        quietHoursEnd,
        digestFrequency
      }
    });

    res.json(prefs);
  } catch (error) {
    next(error);
  }
});

// Get user notifications
router.get('/', auth, async (req, res, next) => {
  try {
    const userId = req.userId!;
    const { limit = 20, offset = 0, unreadOnly } = req.query;

    const where: any = {
      recipientId: userId,
      isDeleted: false
    };

    if (unreadOnly === 'true') {
      where.isRead = false;
    }

    const notifications = await prisma.notifications.findMany({
      where,
      include: {
        User_notifications_actorIdToUser: {
          select: {
            id: true,
            username: true,
            avatar: true,
            role: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: Number(limit),
      skip: Number(offset)
    });

    const unreadCount = await prisma.notifications.count({
      where: {
        recipientId: userId,
        isRead: false,
        isDeleted: false
      }
    });

    res.json({
      notifications,
      unreadCount,
      hasMore: notifications.length === Number(limit)
    });
  } catch (error) {
    next(error);
  }
});

// Mark notification as read
router.put('/:id/read', auth, async (req, res, next) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    await prisma.notifications.updateMany({
      where: {
        id,
        recipientId: userId
      },
      data: {
        isRead: true,
        readAt: new Date()
      }
    });

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// Mark all as read
router.post('/mark-all-read', auth, async (req, res, next) => {
  try {
    const userId = req.userId!;

    await prisma.notifications.updateMany({
      where: {
        recipientId: userId,
        isRead: false
      },
      data: {
        isRead: true,
        readAt: new Date()
      }
    });

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// Delete notification
router.delete('/:id', auth, async (req, res, next) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    await prisma.notifications.updateMany({
      where: {
        id,
        recipientId: userId
      },
      data: {
        isDeleted: true,
        deletedAt: new Date()
      }
    });

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// Test notification (development only)
if (process.env.NODE_ENV === 'development') {
  router.post('/test', auth, async (req, res, next) => {
    try {
      const userId = req.userId!;

      await notificationService.sendNotification(userId, {
        title: 'Test Notification',
        body: 'This is a test notification from MedThread',
        data: {
          type: 'TEST',
          url: '/dashboard'
        }
      });

      res.json({ success: true, message: 'Test notification sent' });
    } catch (error) {
      next(error);
    }
  });
}

export default router;
