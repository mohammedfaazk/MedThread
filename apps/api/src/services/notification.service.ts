import admin from 'firebase-admin';
import { prisma } from '@medthread/database';

export class NotificationService {
  private messaging: admin.messaging.Messaging;
  
  constructor() {
    if (!admin.apps.length) {
      try {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL
          })
        });
      } catch (error) {
        console.error('Firebase admin initialization error:', error);
      }
    }
    this.messaging = admin.messaging();
  }
  
  async sendNotification(userId: string, notification: {
    title: string;
    body: string;
    data?: Record<string, string>;
    urgent?: boolean;
  }) {
    try {
      // Get user's device tokens
      const devices = await prisma.userDevice.findMany({
        where: { userId, isActive: true }
      });
      
      if (devices.length === 0) {
        console.log(`No active devices for user ${userId}`);
        return;
      }
      
      // Check notification preferences
      const prefs = await prisma.notification_preferences.findUnique({
        where: { userId }
      });
      
      if (prefs && !this.shouldSendNotification(prefs, notification)) {
        console.log(`Notification blocked by user preferences for ${userId}`);
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
          urgent: notification.urgent ? 'true' : 'false'
        },
        webpush: {
          fcmOptions: {
            link: notification.data?.url || 'https://medthread.com'
          },
          notification: {
            requireInteraction: notification.urgent || false
          }
        }
      };
      
      const response = await this.messaging.sendMulticast({
        tokens,
        ...message
      });
      
      console.log(`Sent notification to ${response.successCount}/${tokens.length} devices`);
      
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
      console.error('Error sending notification:', error);
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
}

export const notificationService = new NotificationService();
