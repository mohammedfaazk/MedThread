import { prisma } from '@medthread/database';
import { EmailService } from './email.service';
import { PreferencesService } from './notification-preferences.service';
import { subDays, subWeeks, startOfDay, endOfDay } from 'date-fns';

export class DigestEmailService {
  private emailService: EmailService;
  private preferencesService: PreferencesService;

  constructor() {
    this.emailService = new EmailService();
    this.preferencesService = new PreferencesService();
  }

  /**
   * Send daily digest emails
   * Should be run once per day (e.g., at 8 AM)
   */
  async sendDailyDigests(): Promise<number> {
    console.log('[DIGEST] Starting daily digest email job');
    
    try {
      // Find users with daily digest preference
      const users = await prisma.user.findMany({
        where: {
          notificationPreferences: {
            digestFrequency: 'daily'
          }
        },
        include: {
          notificationPreferences: true
        }
      });

      console.log(`[DIGEST] Found ${users.length} users with daily digest preference`);

      let sentCount = 0;

      for (const user of users) {
        try {
          const sent = await this.sendDigestForUser(user.id, 'daily');
          if (sent) {
            sentCount++;
          }
        } catch (error) {
          console.error(`[DIGEST] Error sending daily digest to user ${user.id}:`, error);
          // Continue with other users
        }
      }

      console.log(`[DIGEST] Sent ${sentCount} daily digest emails`);
      return sentCount;
    } catch (error) {
      console.error('[DIGEST] Error in daily digest job:', error);
      throw error;
    }
  }

  /**
   * Send weekly digest emails
   * Should be run once per week (e.g., Monday at 8 AM)
   */
  async sendWeeklyDigests(): Promise<number> {
    console.log('[DIGEST] Starting weekly digest email job');
    
    try {
      // Find users with weekly digest preference
      const users = await prisma.user.findMany({
        where: {
          notificationPreferences: {
            digestFrequency: 'weekly'
          }
        },
        include: {
          notificationPreferences: true
        }
      });

      console.log(`[DIGEST] Found ${users.length} users with weekly digest preference`);

      let sentCount = 0;

      for (const user of users) {
        try {
          const sent = await this.sendDigestForUser(user.id, 'weekly');
          if (sent) {
            sentCount++;
          }
        } catch (error) {
          console.error(`[DIGEST] Error sending weekly digest to user ${user.id}:`, error);
          // Continue with other users
        }
      }

      console.log(`[DIGEST] Sent ${sentCount} weekly digest emails`);
      return sentCount;
    } catch (error) {
      console.error('[DIGEST] Error in weekly digest job:', error);
      throw error;
    }
  }

  /**
   * Send digest email for a specific user
   */
  private async sendDigestForUser(userId: string, frequency: 'daily' | 'weekly'): Promise<boolean> {
    try {
      // Get user details
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          username: true
        }
      });

      if (!user) {
        console.error(`[DIGEST] User ${userId} not found`);
        return false;
      }

      // Get user preferences to filter notification types
      const preferences = await this.preferencesService.getPreferences(userId);

      // Determine time range
      const now = new Date();
      const startDate = frequency === 'daily' 
        ? startOfDay(subDays(now, 1))
        : startOfDay(subWeeks(now, 1));
      const endDate = endOfDay(now);

      // Get unread notifications for the period
      // Only include notification types where user has digest email enabled
      const digestEnabledTypes = Object.entries(preferences.email)
        .filter(([_, value]) => value === 'digest')
        .map(([type, _]) => type);

      if (digestEnabledTypes.length === 0) {
        console.log(`[DIGEST] User ${userId} has no digest-enabled notification types`);
        return false;
      }

      const notifications = await prisma.notification.findMany({
        where: {
          recipientId: userId,
          isDeleted: false,
          createdAt: {
            gte: startDate,
            lte: endDate
          },
          type: {
            in: digestEnabledTypes as any[]
          }
        },
        include: {
          actor: {
            select: {
              id: true,
              username: true,
              avatar: true,
              role: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      // Don't send empty digest
      if (notifications.length === 0) {
        console.log(`[DIGEST] No notifications for user ${userId} in ${frequency} period`);
        return false;
      }

      // Send digest email
      const success = await this.emailService.sendDigestEmail(
        user,
        notifications,
        frequency
      );

      if (success) {
        console.log(`[DIGEST] Sent ${frequency} digest to ${user.email} with ${notifications.length} notifications`);
        
        // Create email queue record for tracking
        await prisma.emailQueue.create({
          data: {
            userId: user.id,
            notificationId: notifications[0].id, // Use first notification as reference
            type: 'digest',
            status: 'sent',
            attempts: 1,
            sentAt: new Date()
          }
        });
      }

      return success;
    } catch (error) {
      console.error(`[DIGEST] Error sending digest for user ${userId}:`, error);
      return false;
    }
  }

  /**
   * Send digest for a specific user on-demand (for testing)
   */
  async sendDigestNow(userId: string, frequency: 'daily' | 'weekly'): Promise<boolean> {
    return this.sendDigestForUser(userId, frequency);
  }

  /**
   * Get digest preview for a user (for testing/preview)
   */
  async getDigestPreview(userId: string, frequency: 'daily' | 'weekly'): Promise<{
    notificationCount: number;
    notifications: any[];
    willSend: boolean;
  }> {
    try {
      const preferences = await this.preferencesService.getPreferences(userId);

      const now = new Date();
      const startDate = frequency === 'daily' 
        ? startOfDay(subDays(now, 1))
        : startOfDay(subWeeks(now, 1));
      const endDate = endOfDay(now);

      const digestEnabledTypes = Object.entries(preferences.email)
        .filter(([_, value]) => value === 'digest')
        .map(([type, _]) => type);

      const notifications = await prisma.notification.findMany({
        where: {
          recipientId: userId,
          isDeleted: false,
          createdAt: {
            gte: startDate,
            lte: endDate
          },
          type: {
            in: digestEnabledTypes as any[]
          }
        },
        include: {
          actor: {
            select: {
              id: true,
              username: true,
              avatar: true,
              role: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return {
        notificationCount: notifications.length,
        notifications,
        willSend: notifications.length > 0 && digestEnabledTypes.length > 0
      };
    } catch (error) {
      console.error(`[DIGEST] Error getting digest preview for user ${userId}:`, error);
      throw error;
    }
  }
}

// Export singleton instance
export const digestEmailService = new DigestEmailService();
