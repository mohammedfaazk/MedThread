import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EmailService } from '../email.service';
import jwt from 'jsonwebtoken';

describe('EmailService - Notification Methods', () => {
  let emailService: EmailService;

  beforeEach(() => {
    emailService = new EmailService();
    vi.clearAllMocks();
    // Mock console.log to avoid cluttering test output
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  describe('generateUnsubscribeToken', () => {
    it('should generate a valid JWT token', () => {
      const userId = 'user-123';
      const notificationType = 'REPLY';
      
      const token = emailService.generateUnsubscribeToken(userId, notificationType);
      
      expect(token).toBeTruthy();
      expect(typeof token).toBe('string');
      
      // Verify token can be decoded
      const decoded = jwt.decode(token) as any;
      expect(decoded.userId).toBe(userId);
      expect(decoded.notificationType).toBe(notificationType);
      expect(decoded.purpose).toBe('unsubscribe');
    });
  });

  describe('handleUnsubscribe', () => {
    it('should decode valid unsubscribe token', async () => {
      const userId = 'user-123';
      const notificationType = 'MENTION';
      
      const token = emailService.generateUnsubscribeToken(userId, notificationType);
      const result = await emailService.handleUnsubscribe(token);
      
      expect(result).toBeTruthy();
      expect(result?.userId).toBe(userId);
      expect(result?.notificationType).toBe(notificationType);
    });

    it('should return null for invalid token', async () => {
      const result = await emailService.handleUnsubscribe('invalid-token');
      
      expect(result).toBeNull();
    });

    it('should return null for expired token', async () => {
      const secret = process.env.JWT_SECRET || 'your-secret-key';
      const expiredToken = jwt.sign(
        { userId: 'user-123', notificationType: 'REPLY', purpose: 'unsubscribe' },
        secret,
        { expiresIn: '-1d' } // Already expired
      );
      
      const result = await emailService.handleUnsubscribe(expiredToken);
      
      expect(result).toBeNull();
    });
  });

  describe('sendNotificationEmail', () => {
    it('should send email for REPLY notification', async () => {
      const user = {
        id: 'user-1',
        email: 'user@example.com',
        username: 'testuser'
      };

      const notification = {
        id: 'notif-1',
        type: 'REPLY',
        recipientId: 'user-1',
        actorId: 'user-2',
        metadata: {
          preview: 'This is a reply to your post',
          link: '/posts/123',
          contentType: 'post'
        },
        createdAt: new Date(),
        actor: {
          username: 'replier',
          avatar: 'https://example.com/avatar.jpg'
        }
      };

      const result = await emailService.sendNotificationEmail(user, notification);
      
      expect(result).toBe(true);
    });

    it('should send email for MENTION notification', async () => {
      const user = {
        id: 'user-1',
        email: 'user@example.com',
        username: 'testuser'
      };

      const notification = {
        id: 'notif-2',
        type: 'MENTION',
        recipientId: 'user-1',
        actorId: 'user-2',
        metadata: {
          preview: '@testuser check this out',
          link: '/posts/456'
        },
        createdAt: new Date(),
        actor: {
          username: 'mentioner'
        }
      };

      const result = await emailService.sendNotificationEmail(user, notification);
      
      expect(result).toBe(true);
    });

    it('should send email for AWARD notification', async () => {
      const user = {
        id: 'user-1',
        email: 'user@example.com',
        username: 'testuser'
      };

      const notification = {
        id: 'notif-3',
        type: 'AWARD',
        recipientId: 'user-1',
        actorId: 'user-2',
        metadata: {
          awardType: 'Gold',
          link: '/posts/789',
          contentType: 'comment'
        },
        createdAt: new Date(),
        actor: {
          username: 'awarder'
        }
      };

      const result = await emailService.sendNotificationEmail(user, notification);
      
      expect(result).toBe(true);
    });
  });

  describe('sendDigestEmail', () => {
    it('should send daily digest email with multiple notifications', async () => {
      const user = {
        id: 'user-1',
        email: 'user@example.com',
        username: 'testuser'
      };

      const notifications = [
        {
          id: 'notif-1',
          type: 'REPLY',
          recipientId: 'user-1',
          actorId: 'user-2',
          metadata: { preview: 'Reply 1' },
          createdAt: new Date(),
          actor: { username: 'user2' }
        },
        {
          id: 'notif-2',
          type: 'REPLY',
          recipientId: 'user-1',
          actorId: 'user-3',
          metadata: { preview: 'Reply 2' },
          createdAt: new Date(),
          actor: { username: 'user3' }
        },
        {
          id: 'notif-3',
          type: 'MENTION',
          recipientId: 'user-1',
          actorId: 'user-4',
          metadata: { preview: 'Mention 1' },
          createdAt: new Date(),
          actor: { username: 'user4' }
        }
      ];

      const result = await emailService.sendDigestEmail(user, notifications, 'daily');
      
      expect(result).toBe(true);
    });

    it('should send weekly digest email', async () => {
      const user = {
        id: 'user-1',
        email: 'user@example.com',
        username: 'testuser'
      };

      const notifications = [
        {
          id: 'notif-1',
          type: 'FOLLOWER',
          recipientId: 'user-1',
          actorId: 'user-2',
          metadata: {},
          createdAt: new Date(),
          actor: { username: 'newfollower' }
        }
      ];

      const result = await emailService.sendDigestEmail(user, notifications, 'weekly');
      
      expect(result).toBe(true);
    });

    it('should return false for empty notifications array', async () => {
      const user = {
        id: 'user-1',
        email: 'user@example.com',
        username: 'testuser'
      };

      const result = await emailService.sendDigestEmail(user, [], 'daily');
      
      expect(result).toBe(false);
    });

    it('should group notifications by type in digest', async () => {
      const user = {
        id: 'user-1',
        email: 'user@example.com',
        username: 'testuser'
      };

      const notifications = [
        {
          id: 'notif-1',
          type: 'REPLY',
          recipientId: 'user-1',
          actorId: 'user-2',
          metadata: { preview: 'Reply 1' },
          createdAt: new Date(),
          actor: { username: 'user2' }
        },
        {
          id: 'notif-2',
          type: 'REPLY',
          recipientId: 'user-1',
          actorId: 'user-3',
          metadata: { preview: 'Reply 2' },
          createdAt: new Date(),
          actor: { username: 'user3' }
        },
        {
          id: 'notif-3',
          type: 'AWARD',
          recipientId: 'user-1',
          actorId: 'user-4',
          metadata: { awardType: 'Gold' },
          createdAt: new Date(),
          actor: { username: 'user4' }
        },
        {
          id: 'notif-4',
          type: 'AWARD',
          recipientId: 'user-1',
          actorId: 'user-5',
          metadata: { awardType: 'Silver' },
          createdAt: new Date(),
          actor: { username: 'user5' }
        }
      ];

      const result = await emailService.sendDigestEmail(user, notifications, 'daily');
      
      expect(result).toBe(true);
    });
  });

  describe('notification type templates', () => {
    it('should handle APPOINTMENT_REQUEST notification', async () => {
      const user = {
        id: 'user-1',
        email: 'doctor@example.com',
        username: 'drsmith'
      };

      const notification = {
        id: 'notif-1',
        type: 'APPOINTMENT_REQUEST',
        recipientId: 'user-1',
        actorId: 'user-2',
        metadata: {
          appointmentTime: new Date('2024-01-15T10:00:00Z'),
          link: '/appointments/123'
        },
        createdAt: new Date(),
        actor: { username: 'patient1' }
      };

      const result = await emailService.sendNotificationEmail(user, notification);
      
      expect(result).toBe(true);
    });

    it('should handle VERIFICATION_STATUS notification', async () => {
      const user = {
        id: 'user-1',
        email: 'doctor@example.com',
        username: 'drsmith'
      };

      const notification = {
        id: 'notif-1',
        type: 'VERIFICATION_STATUS',
        recipientId: 'user-1',
        actorId: 'admin-1',
        metadata: {
          status: 'approved'
        },
        createdAt: new Date(),
        actor: { username: 'admin' }
      };

      const result = await emailService.sendNotificationEmail(user, notification);
      
      expect(result).toBe(true);
    });

    it('should handle UPVOTE_MILESTONE notification', async () => {
      const user = {
        id: 'user-1',
        email: 'user@example.com',
        username: 'testuser'
      };

      const notification = {
        id: 'notif-1',
        type: 'UPVOTE_MILESTONE',
        recipientId: 'user-1',
        actorId: 'system',
        metadata: {
          upvoteCount: 100,
          contentType: 'post',
          postTitle: 'My awesome post',
          link: '/posts/123'
        },
        createdAt: new Date(),
        actor: { username: 'system' }
      };

      const result = await emailService.sendNotificationEmail(user, notification);
      
      expect(result).toBe(true);
    });

    it('should handle unknown notification type with default template', async () => {
      const user = {
        id: 'user-1',
        email: 'user@example.com',
        username: 'testuser'
      };

      const notification = {
        id: 'notif-1',
        type: 'UNKNOWN_TYPE',
        recipientId: 'user-1',
        actorId: 'user-2',
        metadata: {},
        createdAt: new Date(),
        actor: { username: 'someuser' }
      };

      const result = await emailService.sendNotificationEmail(user, notification);
      
      expect(result).toBe(true);
    });
  });
});
