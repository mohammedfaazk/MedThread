import { prisma } from '@medthread/database';
import { getSocketInstance } from '../socket';
import { notificationService } from './notification.service';

interface BroadcastData {
  title: string;
  message: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  type: 'HEALTH_ALERT' | 'SYSTEM' | 'EMERGENCY';
  targetAudience?: 'ALL' | 'PATIENTS' | 'DOCTORS';
  targetRegion?: string;
  expiresAt?: Date;
}

export class EmergencyBroadcastService {
  /**
   * Create and send emergency broadcast
   */
  async createBroadcast(adminId: string, data: BroadcastData) {
    try {
      // Create broadcast record
      const broadcast = await prisma.emergencyBroadcast.create({
        data: {
          title: data.title,
          message: data.message,
          priority: data.priority,
          type: data.type,
          targetAudience: data.targetAudience || 'ALL',
          targetRegion: data.targetRegion,
          expiresAt: data.expiresAt,
          createdBy: adminId,
          isActive: true
        }
      });

      // Send to all users via socket
      await this.broadcastToUsers(broadcast);

      // Send push notifications for critical broadcasts
      if (data.priority === 'CRITICAL') {
        await this.sendPushNotifications(broadcast);
      }

      // Log audit trail
      await prisma.auditLog.create({
        data: {
          action: 'EMERGENCY_BROADCAST_CREATED',
          adminId,
          targetType: 'BROADCAST',
          targetId: broadcast.id,
          details: {
            title: data.title,
            priority: data.priority,
            type: data.type
          }
        }
      });

      return broadcast;
    } catch (error) {
      console.error('[EmergencyBroadcast] Error creating broadcast:', error);
      throw error;
    }
  }

  /**
   * Broadcast to all connected users via WebSocket
   */
  private async broadcastToUsers(broadcast: any) {
    try {
      const io = getSocketInstance();
      
      // Emit to all connected clients
      io.emit('emergency:broadcast', {
        id: broadcast.id,
        title: broadcast.title,
        message: broadcast.message,
        priority: broadcast.priority,
        type: broadcast.type,
        createdAt: broadcast.createdAt
      });

      console.log(`[EmergencyBroadcast] Sent broadcast ${broadcast.id} to all users`);
    } catch (error) {
      console.error('[EmergencyBroadcast] Error broadcasting via socket:', error);
    }
  }

  /**
   * Send push notifications for critical broadcasts
   */
  private async sendPushNotifications(broadcast: any) {
    try {
      // Get all users based on target audience
      const whereClause: any = {};
      
      if (broadcast.targetAudience === 'PATIENTS') {
        whereClause.role = 'PATIENT';
      } else if (broadcast.targetAudience === 'DOCTORS') {
        whereClause.role = 'DOCTOR';
      }

      if (broadcast.targetRegion) {
        whereClause.state = broadcast.targetRegion;
      }

      const users = await prisma.user.findMany({
        where: whereClause,
        select: { id: true }
      });

      // Send notification to each user
      for (const user of users) {
        await notificationService.createNotification({
          recipientId: user.id,
          type: 'SYSTEM_ANNOUNCEMENT',
          actorId: broadcast.createdBy,
          metadata: {
            title: broadcast.title,
            body: broadcast.message,
            priority: broadcast.priority,
            broadcastId: broadcast.id
          }
        });
      }

      console.log(`[EmergencyBroadcast] Sent push notifications to ${users.length} users`);
    } catch (error) {
      console.error('[EmergencyBroadcast] Error sending push notifications:', error);
    }
  }

  /**
   * Get all active broadcasts
   */
  async getActiveBroadcasts() {
    try {
      const now = new Date();
      
      const broadcasts = await prisma.emergencyBroadcast.findMany({
        where: {
          isActive: true,
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: now } }
          ]
        },
        orderBy: [
          { priority: 'asc' }, // CRITICAL first
          { createdAt: 'desc' }
        ],
        take: 5 // Limit to 5 active broadcasts
      });

      return broadcasts;
    } catch (error) {
      console.error('[EmergencyBroadcast] Error getting active broadcasts:', error);
      return [];
    }
  }

  /**
   * Deactivate a broadcast
   */
  async deactivateBroadcast(broadcastId: string, adminId: string) {
    try {
      const broadcast = await prisma.emergencyBroadcast.update({
        where: { id: broadcastId },
        data: { isActive: false }
      });

      // Notify all users to remove the broadcast
      const io = getSocketInstance();
      io.emit('emergency:broadcast-removed', { id: broadcastId });

      // Log audit trail
      await prisma.auditLog.create({
        data: {
          action: 'EMERGENCY_BROADCAST_DEACTIVATED',
          adminId,
          targetType: 'BROADCAST',
          targetId: broadcastId
        }
      });

      return broadcast;
    } catch (error) {
      console.error('[EmergencyBroadcast] Error deactivating broadcast:', error);
      throw error;
    }
  }

  /**
   * Get broadcast history
   */
  async getBroadcastHistory(page: number = 1, limit: number = 20) {
    try {
      const skip = (page - 1) * limit;

      const [broadcasts, total] = await Promise.all([
        prisma.emergencyBroadcast.findMany({
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
          include: {
            creator: {
              select: {
                id: true,
                username: true,
                role: true
              }
            }
          }
        }),
        prisma.emergencyBroadcast.count()
      ]);

      return {
        broadcasts,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('[EmergencyBroadcast] Error getting broadcast history:', error);
      throw error;
    }
  }

  /**
   * Auto-expire old broadcasts (run via cron)
   */
  async expireOldBroadcasts() {
    try {
      const now = new Date();
      
      const result = await prisma.emergencyBroadcast.updateMany({
        where: {
          isActive: true,
          expiresAt: {
            lte: now
          }
        },
        data: {
          isActive: false
        }
      });

      console.log(`[EmergencyBroadcast] Expired ${result.count} old broadcasts`);
      return result.count;
    } catch (error) {
      console.error('[EmergencyBroadcast] Error expiring broadcasts:', error);
      return 0;
    }
  }
}

export const emergencyBroadcastService = new EmergencyBroadcastService();
