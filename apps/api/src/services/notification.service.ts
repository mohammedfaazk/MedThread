import admin from 'firebase-admin';
import { prisma } from '@medthread/database';

export class NotificationService {
  private messaging: admin.messaging.Messaging | null = null;
  private isFirebaseConfigured = false;
  
  constructor() {
    this.initializeFirebase();
  }

  private initializeFirebase() {
    try {
      if (!admin.apps.length) {
        const projectId = process.env.FIREBASE_PROJECT_ID;
        const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
        const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
        
        if (projectId && privateKey && clientEmail) {
          admin.initializeApp({
            credential: admin.credential.cert({
              projectId,
              privateKey,
              clientEmail
            })
          });
          this.messaging = admin.messaging();
          this.isFirebaseConfigured = true;
          console.log('[NotificationService] Firebase initialized successfully');
        } else {
          console.warn('[NotificationService] Firebase credentials not configured. Using fallback notification system.');
          this.setupFallbackNotifications();
        }
      } else {
        this.messaging = admin.messaging();
        this.isFirebaseConfigured = true;
      }
    } catch (error) {
      console.error('[NotificationService] Firebase initialization error:', error);
      this.setupFallbackNotifications();
    }
  }

  private setupFallbackNotifications() {
    // Setup email-based notifications as fallback
    console.log('[NotificationService] Setting up email-based notification fallback');
    this.isFirebaseConfigured = false;
  }
  
  async sendNotification(userId: string, notification: {
    title: string;
    body: string;
    data?: Record<string, string>;
    urgent?: boolean;
    type?: string;
  }) {
    try {
      // Store notification in database first
      const dbNotification = await this.storeNotification(userId, notification);

      if (this.isFirebaseConfigured && this.messaging) {
        await this.sendPushNotification(userId, notification);
      } else {
        await this.sendFallbackNotification(userId, notification);
      }

      return dbNotification;
    } catch (error) {
      console.error('[NotificationService] Failed to send notification:', error);
      throw error;
    }
  }

  private async sendPushNotification(userId: string, notification: any) {
    try {
      // Get user's device tokens
      const devices = await prisma.userDevice.findMany({
        where: { userId, isActive: true }
      });
      
      if (devices.length === 0) {
        console.log(`[NotificationService] No active devices for user ${userId}`);
        return;
      }
      
      // Check notification preferences
      const prefs = await prisma.notification_preferences.findUnique({
        where: { userId }
      });
      
      if (prefs && !this.shouldSendNotification(prefs, notification)) {
        console.log(`[NotificationService] Notification blocked by user preferences for ${userId}`);
        return;
      }
      
      // Send to all devices
      const tokens = devices.map(d => d.fcmToken);
      
      const message = {
        notification: {
          title: notification.title,
          body: notification.body
        },
        data: {
          ...notification.data,
          urgent: notification.urgent ? 'true' : 'false',
          type: notification.type || 'general'
        },
        webpush: {
          fcmOptions: {
            link: notification.data?.url || 'https://medthread.com'
          },
          notification: {
            requireInteraction: notification.urgent || false,
            icon: '/medthread-logo-1.jpeg',
            badge: '/medthread-logo-1.jpeg',
          }
        }
      };
      
      const response = await this.messaging!.sendMulticast({
        tokens,
        ...message
      });
      
      console.log(`[NotificationService] Sent push notification to ${response.successCount}/${tokens.length} devices`);
      
      // Remove invalid tokens
      if (response.failureCount > 0) {
        const failedTokens: string[] = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            failedTokens.push(tokens[idx]);
          }
        });
        
        await prisma.userDevice.updateMany({
          where: { fcmToken: { in: failedTokens } },
          data: { isActive: false }
        });
      }
      
      return response;
    } catch (error) {
      console.error('[NotificationService] Push notification failed:', error);
      throw error;
    }
  }

  private async sendFallbackNotification(userId: string, notification: any) {
    try {
      // Email-based notification fallback
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, username: true }
      });

      if (!user) return;

      // Queue email notification
      await prisma.email_queue.create({
        data: {
          userId,
          notificationId: 'fallback-' + Date.now(),
          type: 'notification',
          status: 'pending',
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      });

      console.log(`[NotificationService] Queued email notification for ${user.email}`);
    } catch (error) {
      console.error('[NotificationService] Fallback notification failed:', error);
    }
  }

  private async storeNotification(userId: string, notification: any) {
    try {
      // Use the recipient's ID as actorId if not provided (self-notification)
      // This prevents foreign key constraint errors
      const actorId = notification.actorId || userId;
      
      return await prisma.notifications.create({
        data: {
          id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: notification.type || 'REPLY',
          recipientId: userId,
          actorId: actorId,
          contentId: notification.contentId,
          contentType: notification.contentType,
          metadata: {
            title: notification.title,
            body: notification.body,
            urgent: notification.urgent || false,
            ...notification.data
          },
          updatedAt: new Date()
        }
      });
    } catch (error) {
      console.error('[NotificationService] Failed to store notification:', error);
      throw error;
    }
  }
  
  private shouldSendNotification(prefs: any, notification: any): boolean {
    // Check if push notifications are enabled
    if (!prefs.push?.enabled) return false;
    
    // Check quiet hours
    if (this.isQuietHours(prefs)) return false;
    
    // Always send urgent notifications
    if (notification.urgent) return true;
    
    return true;
  }
  
  private isQuietHours(prefs: any): boolean {
    if (!prefs.quietHoursStart || !prefs.quietHoursEnd) return false;
    
    const now = new Date();
    const currentHour = now.getHours();
    const start = parseInt(prefs.quietHoursStart.split(':')[0]);
    const end = parseInt(prefs.quietHoursEnd.split(':')[0]);
    
    if (start < end) {
      return currentHour >= start && currentHour < end;
    } else {
      return currentHour >= start || currentHour < end;
    }
  }
  
  async sendToMultipleUsers(userIds: string[], notification: {
    title: string;
    body: string;
    data?: Record<string, string>;
    urgent?: boolean;
  }) {
    const promises = userIds.map(userId => 
      this.sendNotification(userId, notification)
    );
    
    return Promise.allSettled(promises);
  }

  async getUnreadCount(userId: string): Promise<number> {
    try {
      const count = await prisma.notifications.count({
        where: {
          recipientId: userId,
          isRead: false,
          isDeleted: false
        }
      });
      return count;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }

  /**
   * Subscribe user device for push notifications
   */
  async subscribeDevice(userId: string, subscription: {
    endpoint: string;
    keys: { p256dh: string; auth: string };
  }) {
    try {
      await prisma.userDevice.upsert({
        where: {
          userId_fcmToken: {
            userId,
            fcmToken: subscription.endpoint
          }
        },
        update: {
          isActive: true,
          updatedAt: new Date()
        },
        create: {
          userId,
          fcmToken: subscription.endpoint,
          deviceType: 'web',
          isActive: true,
          subscriptionData: subscription,
        }
      });

      console.log(`[NotificationService] Device subscribed for user ${userId}`);
    } catch (error) {
      console.error('[NotificationService] Device subscription failed:', error);
      throw error;
    }
  }

  /**
   * Unsubscribe user device
   */
  async unsubscribeDevice(userId: string, endpoint: string) {
    try {
      await prisma.userDevice.updateMany({
        where: {
          userId,
          fcmToken: endpoint
        },
        data: {
          isActive: false
        }
      });

      console.log(`[NotificationService] Device unsubscribed for user ${userId}`);
    } catch (error) {
      console.error('[NotificationService] Device unsubscription failed:', error);
      throw error;
    }
  }

  /**
   * Send urgent medical notifications
   */
  async sendUrgentMedicalNotification(userId: string, message: string, emergencyType: string) {
    await this.sendNotification(userId, {
      title: '🚨 Urgent Medical Alert',
      body: message,
      urgent: true,
      type: 'MEDICAL_EMERGENCY',
      data: {
        emergencyType,
        timestamp: new Date().toISOString(),
        action: 'emergency'
      }
    });
  }

  /**
   * Send appointment reminders
   */
  async sendAppointmentReminder(userId: string, appointmentId: string, reminderTime: string) {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        doctor: { select: { username: true } },
        patient: { select: { username: true } }
      }
    });

    if (!appointment) return;

    await this.sendNotification(userId, {
      title: '📅 Appointment Reminder',
      body: `Your appointment with Dr. ${appointment.doctor.username} is ${reminderTime}`,
      type: 'APPOINTMENT_REMINDER',
      data: {
        appointmentId,
        doctorName: appointment.doctor.username,
        reminderTime
      }
    });
  }

  /**
   * Batch send notifications
   */
  async sendBatchNotifications(notifications: Array<{
    userId: string;
    title: string;
    body: string;
    data?: Record<string, string>;
    urgent?: boolean;
    type?: string;
  }>) {
    const promises = notifications.map(notification => 
      this.sendNotification(notification.userId, notification)
    );
    
    const results = await Promise.allSettled(promises);
    
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;
    
    console.log(`[NotificationService] Batch notifications: ${successful} successful, ${failed} failed`);
    
    return { successful, failed };
  }
}

export const notificationService = new NotificationService();
