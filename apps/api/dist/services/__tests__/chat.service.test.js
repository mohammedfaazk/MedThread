"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const database_1 = require("@medthread/database");
const chat_service_1 = require("../chat.service");
// Mock Prisma
vitest_1.vi.mock('@medthread/database', () => ({
    PrismaClient: vitest_1.vi.fn(() => ({
        message: {
            create: vitest_1.vi.fn(),
            findMany: vitest_1.vi.fn(),
            findUnique: vitest_1.vi.fn(),
            update: vitest_1.vi.fn(),
            updateMany: vitest_1.vi.fn(),
            count: vitest_1.vi.fn()
        },
        conversation: {
            findUnique: vitest_1.vi.fn(),
            findMany: vitest_1.vi.fn(),
            update: vitest_1.vi.fn()
        }
    })),
    MessageType: {
        TEXT: 'TEXT',
        IMAGE: 'IMAGE',
        FILE: 'FILE'
    }
}));
// Mock socket
vitest_1.vi.mock('../../socket', () => ({
    getSocketInstance: vitest_1.vi.fn(() => ({
        to: vitest_1.vi.fn(() => ({
            emit: vitest_1.vi.fn()
        }))
    }))
}));
(0, vitest_1.describe)('ChatService', () => {
    let prisma;
    (0, vitest_1.beforeEach)(() => {
        prisma = new database_1.PrismaClient();
    });
    (0, vitest_1.afterEach)(() => {
        vitest_1.vi.clearAllMocks();
    });
    (0, vitest_1.describe)('createMessage', () => {
        (0, vitest_1.it)('should create a message with valid input', async () => {
            const mockConversation = {
                id: 'conv_123',
                appointment: {
                    patientId: 'patient_123',
                    doctorId: 'doctor_456'
                }
            };
            const mockMessage = {
                id: 'msg_789',
                conversationId: 'conv_123',
                senderId: 'patient_123',
                receiverId: 'doctor_456',
                content: 'Hello doctor',
                type: 'TEXT',
                createdAt: new Date(),
                sender: {
                    id: 'patient_123',
                    username: 'patient',
                    avatar: null,
                    role: 'PATIENT'
                }
            };
            prisma.conversation.findUnique.mockResolvedValue(mockConversation);
            prisma.message.count.mockResolvedValue(0); // No rate limit
            prisma.message.create.mockResolvedValue(mockMessage);
            prisma.conversation.update.mockResolvedValue({});
            const result = await chat_service_1.chatService.createMessage({
                conversationId: 'conv_123',
                senderId: 'patient_123',
                content: 'Hello doctor'
            });
            (0, vitest_1.expect)(result).toEqual(mockMessage);
            (0, vitest_1.expect)(prisma.message.create).toHaveBeenCalledWith(vitest_1.expect.objectContaining({
                data: vitest_1.expect.objectContaining({
                    conversationId: 'conv_123',
                    senderId: 'patient_123',
                    content: 'Hello doctor'
                })
            }));
        });
        (0, vitest_1.it)('should reject empty content', async () => {
            await (0, vitest_1.expect)(chat_service_1.chatService.createMessage({
                conversationId: 'conv_123',
                senderId: 'patient_123',
                content: ''
            })).rejects.toThrow('Message content cannot be empty');
        });
        (0, vitest_1.it)('should reject content exceeding max length', async () => {
            const longContent = 'a'.repeat(10001);
            await (0, vitest_1.expect)(chat_service_1.chatService.createMessage({
                conversationId: 'conv_123',
                senderId: 'patient_123',
                content: longContent
            })).rejects.toThrow('Message content exceeds maximum length');
        });
        (0, vitest_1.it)('should enforce rate limit', async () => {
            const mockConversation = {
                id: 'conv_123',
                appointment: {
                    patientId: 'patient_123',
                    doctorId: 'doctor_456'
                }
            };
            prisma.conversation.findUnique.mockResolvedValue(mockConversation);
            prisma.message.count.mockResolvedValue(30); // At rate limit
            await (0, vitest_1.expect)(chat_service_1.chatService.createMessage({
                conversationId: 'conv_123',
                senderId: 'patient_123',
                content: 'Hello'
            })).rejects.toThrow('Rate limit exceeded');
        });
        (0, vitest_1.it)('should reject invalid conversation', async () => {
            prisma.conversation.findUnique.mockResolvedValue(null);
            prisma.message.count.mockResolvedValue(0);
            await (0, vitest_1.expect)(chat_service_1.chatService.createMessage({
                conversationId: 'invalid',
                senderId: 'patient_123',
                content: 'Hello'
            })).rejects.toThrow('Invalid conversation');
        });
    });
    (0, vitest_1.describe)('getMessages', () => {
        (0, vitest_1.it)('should return paginated messages', async () => {
            const mockMessages = [
                {
                    id: 'msg_1',
                    content: 'Message 1',
                    createdAt: new Date('2026-02-17T10:00:00Z'),
                    sender: { id: 'user_1', username: 'user1' }
                },
                {
                    id: 'msg_2',
                    content: 'Message 2',
                    createdAt: new Date('2026-02-17T10:01:00Z'),
                    sender: { id: 'user_2', username: 'user2' }
                }
            ];
            prisma.message.findMany.mockResolvedValue(mockMessages);
            const result = await chat_service_1.chatService.getMessages({
                conversationId: 'conv_123',
                limit: 50
            });
            (0, vitest_1.expect)(result.messages).toHaveLength(2);
            (0, vitest_1.expect)(result.hasMore).toBe(false);
            (0, vitest_1.expect)(result.nextCursor).toBeNull();
        });
        (0, vitest_1.it)('should handle cursor-based pagination', async () => {
            const mockMessages = Array.from({ length: 51 }, (_, i) => ({
                id: `msg_${i}`,
                content: `Message ${i}`,
                createdAt: new Date(),
                sender: { id: 'user_1', username: 'user1' }
            }));
            prisma.message.findMany.mockResolvedValue(mockMessages);
            const result = await chat_service_1.chatService.getMessages({
                conversationId: 'conv_123',
                limit: 50,
                cursor: 'msg_100'
            });
            (0, vitest_1.expect)(result.messages).toHaveLength(50);
            (0, vitest_1.expect)(result.hasMore).toBe(true);
            (0, vitest_1.expect)(result.nextCursor).toBe('msg_49');
        });
    });
    (0, vitest_1.describe)('editMessage', () => {
        (0, vitest_1.it)('should edit message within time window', async () => {
            const recentMessage = {
                id: 'msg_123',
                senderId: 'user_123',
                content: 'Original',
                isDeleted: false,
                createdAt: new Date(Date.now() - 2 * 60 * 1000) // 2 minutes ago
            };
            const updatedMessage = {
                ...recentMessage,
                content: 'Updated',
                isEdited: true,
                editedAt: new Date()
            };
            prisma.message.findUnique.mockResolvedValue(recentMessage);
            prisma.message.update.mockResolvedValue(updatedMessage);
            const result = await chat_service_1.chatService.editMessage({
                messageId: 'msg_123',
                userId: 'user_123',
                content: 'Updated'
            });
            (0, vitest_1.expect)(result.content).toBe('Updated');
            (0, vitest_1.expect)(result.isEdited).toBe(true);
        });
        (0, vitest_1.it)('should reject edit after time window', async () => {
            const oldMessage = {
                id: 'msg_123',
                senderId: 'user_123',
                content: 'Original',
                isDeleted: false,
                createdAt: new Date(Date.now() - 10 * 60 * 1000) // 10 minutes ago
            };
            prisma.message.findUnique.mockResolvedValue(oldMessage);
            await (0, vitest_1.expect)(chat_service_1.chatService.editMessage({
                messageId: 'msg_123',
                userId: 'user_123',
                content: 'Updated'
            })).rejects.toThrow('Edit window expired');
        });
        (0, vitest_1.it)('should reject edit by non-owner', async () => {
            const message = {
                id: 'msg_123',
                senderId: 'user_123',
                content: 'Original',
                isDeleted: false,
                createdAt: new Date()
            };
            prisma.message.findUnique.mockResolvedValue(message);
            await (0, vitest_1.expect)(chat_service_1.chatService.editMessage({
                messageId: 'msg_123',
                userId: 'user_456', // Different user
                content: 'Updated'
            })).rejects.toThrow('only edit your own messages');
        });
    });
    (0, vitest_1.describe)('deleteMessage', () => {
        (0, vitest_1.it)('should soft delete message', async () => {
            const message = {
                id: 'msg_123',
                senderId: 'user_123',
                conversationId: 'conv_123',
                isDeleted: false
            };
            const deletedMessage = {
                ...message,
                isDeleted: true,
                deletedAt: new Date(),
                content: '[Message deleted]'
            };
            prisma.message.findUnique.mockResolvedValue(message);
            prisma.message.update.mockResolvedValue(deletedMessage);
            const result = await chat_service_1.chatService.deleteMessage('msg_123', 'user_123');
            (0, vitest_1.expect)(result.isDeleted).toBe(true);
            (0, vitest_1.expect)(result.content).toBe('[Message deleted]');
        });
        (0, vitest_1.it)('should reject delete by non-owner', async () => {
            const message = {
                id: 'msg_123',
                senderId: 'user_123',
                isDeleted: false
            };
            prisma.message.findUnique.mockResolvedValue(message);
            await (0, vitest_1.expect)(chat_service_1.chatService.deleteMessage('msg_123', 'user_456')).rejects.toThrow('only delete your own messages');
        });
    });
    (0, vitest_1.describe)('markAsRead', () => {
        (0, vitest_1.it)('should mark unread messages as read', async () => {
            prisma.message.updateMany.mockResolvedValue({ count: 5 });
            const result = await chat_service_1.chatService.markAsRead('conv_123', 'user_123');
            (0, vitest_1.expect)(result.count).toBe(5);
            (0, vitest_1.expect)(prisma.message.updateMany).toHaveBeenCalledWith(vitest_1.expect.objectContaining({
                where: vitest_1.expect.objectContaining({
                    conversationId: 'conv_123',
                    receiverId: 'user_123',
                    isRead: false
                }),
                data: vitest_1.expect.objectContaining({
                    isRead: true
                })
            }));
        });
    });
    (0, vitest_1.describe)('getUnreadCount', () => {
        (0, vitest_1.it)('should return unread message count', async () => {
            prisma.message.count.mockResolvedValue(3);
            const count = await chat_service_1.chatService.getUnreadCount('user_123', 'conv_123');
            (0, vitest_1.expect)(count).toBe(3);
            (0, vitest_1.expect)(prisma.message.count).toHaveBeenCalledWith(vitest_1.expect.objectContaining({
                where: vitest_1.expect.objectContaining({
                    conversationId: 'conv_123',
                    receiverId: 'user_123',
                    isRead: false,
                    isDeleted: false
                })
            }));
        });
    });
    (0, vitest_1.describe)('validateAttachment', () => {
        (0, vitest_1.it)('should accept valid image data URL', async () => {
            const validImageUrl = 'data:image/jpeg;base64,/9j/4AAQSkZJRg==';
            // This is a private method, so we test it indirectly through createMessage
            const mockConversation = {
                id: 'conv_123',
                appointment: {
                    patientId: 'patient_123',
                    doctorId: 'doctor_456'
                }
            };
            prisma.conversation.findUnique.mockResolvedValue(mockConversation);
            prisma.message.count.mockResolvedValue(0);
            prisma.message.create.mockResolvedValue({
                id: 'msg_123',
                attachment: validImageUrl
            });
            prisma.conversation.update.mockResolvedValue({});
            await (0, vitest_1.expect)(chat_service_1.chatService.createMessage({
                conversationId: 'conv_123',
                senderId: 'patient_123',
                content: 'Image',
                type: 'IMAGE',
                attachment: validImageUrl
            })).resolves.toBeDefined();
        });
        (0, vitest_1.it)('should reject invalid MIME type', async () => {
            const invalidUrl = 'data:application/exe;base64,abc123';
            const mockConversation = {
                id: 'conv_123',
                appointment: {
                    patientId: 'patient_123',
                    doctorId: 'doctor_456'
                }
            };
            prisma.conversation.findUnique.mockResolvedValue(mockConversation);
            prisma.message.count.mockResolvedValue(0);
            await (0, vitest_1.expect)(chat_service_1.chatService.createMessage({
                conversationId: 'conv_123',
                senderId: 'patient_123',
                content: 'File',
                type: 'IMAGE',
                attachment: invalidUrl
            })).rejects.toThrow('Invalid MIME type');
        });
    });
});
