import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { prisma } from '@medthread/database';

const router = Router();

// Simple ping endpoint that updates user activity
router.get('/ping', authenticate, async (req: any, res) => {
  try {
    if (req.userId) {
      // Update user's updatedAt
      await prisma.user.update({
        where: { id: req.userId },
        data: { updatedAt: new Date() }
      });

      const user = await prisma.user.findUnique({
        where: { id: req.userId },
        select: {
          username: true,
          role: true,
          updatedAt: true
        }
      });

      console.log(`🏓 Ping from ${user?.username} (${user?.role}) - Activity updated`);

      res.json({
        success: true,
        message: 'Pong! Activity updated',
        user: {
          username: user?.username,
          role: user?.role,
          lastActivity: user?.updatedAt
        }
      });
    } else {
      res.status(401).json({
        success: false,
        error: 'Not authenticated'
      });
    }
  } catch (error: any) {
    console.error('❌ Ping error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
