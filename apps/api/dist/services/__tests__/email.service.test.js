"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const email_service_1 = require("../email.service");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
(0, vitest_1.describe)('EmailService - Notification Methods', () => {
    let emailService;
    (0, vitest_1.beforeEach)(() => {
        emailService = new email_service_1.EmailService();
        vitest_1.vi.clearAllMocks();
        // Mock console.log to avoid cluttering test output
        vitest_1.vi.spyOn(console, 'log').mockImplementation(() => { });
    });
    (0, vitest_1.describe)('generateUnsubscribeToken', () => {
        (0, vitest_1.it)('should generate a valid JWT token', () => {
            const userId = 'user-123';
            const notificationType = 'REPLY';
            const token = emailService.generateUnsubscribeToken(userId, notificationType);
            (0, vitest_1.expect)(token).toBeTruthy();
            (0, vitest_1.expect)(typeof token).toBe('string');
            // Verify token can be decoded
            const decoded = jsonwebtoken_1.default.decode(token);
            (0, vitest_1.expect)(decoded.userId).toBe(userId);
            (0, vitest_1.expect)(decoded.notificationType).toBe(notificationType);
            (0, vitest_1.expect)(decoded.purpose).toBe('unsubscribe');
        });
    });
    (0, vitest_1.describe)('handleUnsubscribe', () => {
        (0, vitest_1.it)('should decode valid unsubscribe token', async () => {
            const userId = 'user-123';
            const notificationType = 'MENTION';
            const token = emailService.generateUnsubscribeToken(userId, notificationType);
            const result = await emailService.handleUnsubscribe(token);
            (0, vitest_1.expect)(result).toBeTruthy();
            (0, vitest_1.expect)(result?.userId).toBe(userId);
            (0, vitest_1.expect)(result?.notificationType).toBe(notificationType);
        });
        (0, vitest_1.it)('should return null for invalid token', async () => {
            const result = await emailService.handleUnsubscribe('invalid-token');
            (0, vitest_1.expect)(result).toBeNull();
        });
        (0, vitest_1.it)('should return null for expired token', async () => {
            const secret = process.env.JWT_SECRET || 'your-secret-key';
            const expiredToken = jsonwebtoken_1.default.sign({ userId: 'user-123', notificationType: 'REPLY', purpose: 'unsubscribe' }, secret, { expiresIn: '-1d' } // Already expired
            );
            const result = await emailService.handleUnsubscribe(expiredToken);
            (0, vitest_1.expect)(result).toBeNull();
        });
    });
    (0, vitest_1.describe)('sendNotificationEmail', () => {
        (0, vitest_1.it)('should send email for REPLY notification', async () => {
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
            (0, vitest_1.expect)(result).toBe(true);
        });
        (0, vitest_1.it)('should send email for MENTION notification', async () => {
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
            (0, vitest_1.expect)(result).toBe(true);
        });
        (0, vitest_1.it)('should send email for AWARD notification', async () => {
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
            (0, vitest_1.expect)(result).toBe(true);
        });
    });
    (0, vitest_1.describe)('sendDigestEmail', () => {
        (0, vitest_1.it)('should send daily digest email with multiple notifications', async () => {
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
            (0, vitest_1.expect)(result).toBe(true);
        });
        (0, vitest_1.it)('should send weekly digest email', async () => {
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
            (0, vitest_1.expect)(result).toBe(true);
        });
        (0, vitest_1.it)('should return false for empty notifications array', async () => {
            const user = {
                id: 'user-1',
                email: 'user@example.com',
                username: 'testuser'
            };
            const result = await emailService.sendDigestEmail(user, [], 'daily');
            (0, vitest_1.expect)(result).toBe(false);
        });
        (0, vitest_1.it)('should group notifications by type in digest', async () => {
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
            (0, vitest_1.expect)(result).toBe(true);
        });
    });
    (0, vitest_1.describe)('notification type templates', () => {
        (0, vitest_1.it)('should handle APPOINTMENT_REQUEST notification', async () => {
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
            (0, vitest_1.expect)(result).toBe(true);
        });
        (0, vitest_1.it)('should handle VERIFICATION_STATUS notification', async () => {
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
            (0, vitest_1.expect)(result).toBe(true);
        });
        (0, vitest_1.it)('should handle UPVOTE_MILESTONE notification', async () => {
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
            (0, vitest_1.expect)(result).toBe(true);
        });
        (0, vitest_1.it)('should handle unknown notification type with default template', async () => {
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
            (0, vitest_1.expect)(result).toBe(true);
        });
    });
});
