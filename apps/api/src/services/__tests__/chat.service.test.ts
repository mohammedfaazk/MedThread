import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { PrismaClient } from '@medthread/database';
import { chatService } from '../chat.service';

// Mock Prisma
vi.mock('@medthread/database', () => ({
  PrismaClient: vi.fn(() => ({
    message: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      count: vi.fn()
    },
    conversation: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn()
    }
  })),
  MessageType: {
    TEXT: 'TEXT',
    IMAGE: 'IMAGE',
    FILE: 'FILE'
  }
}));

// Mock socket
vi.mock('../../socket', () => ({
  getSocketInstance: vi.fn(() => ({
    to: vi.fn(() => ({
      emit: vi.fn()
    }))
  }))
}));

describe('ChatService', () => {
  let prisma: any;

  beforeEach(() => {
    prisma = new PrismaClient();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('createMessage', () => {
    it('should create a message with valid input', async () => {
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

      const result = await chatService.createMessage({
        conversationId: 'conv_123',
        senderId: 'patient_123',
        content: 'Hello doctor'
      });

      expect(result).toEqual(mockMessage);
      expect(prisma.message.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            conversationId: 'conv_123',
            senderId: 'patient_123',
            content: 'Hello doctor'
          })
        })
      );
    });

    it('should reject empty content', async () => {
      await expect(
        chatService.createMessage({
          conversationId: 'conv_123',
          senderId: 'patient_123',
          content: ''
        })
      ).rejects.toThrow('Message content cannot be empty');
    });

    it('should reject content exceeding max length', async () => {
      const longContent = 'a'.repeat(10001);

      await expect(
        chatService.createMessage({
          conversationId: 'conv_123',
          senderId: 'patient_123',
          content: longContent
        })
      ).rejects.toThrow('Message content exceeds maximum length');
    });

    it('should enforce rate limit', async () => {
      const mockConversation = {
        id: 'conv_123',
        appointment: {
          patientId: 'patient_123',
          doctorId: 'doctor_456'
        }
      };

      prisma.conversation.findUnique.mockResolvedValue(mockConversation);
      prisma.message.count.mockResolvedValue(30); // At rate limit

      await expect(
        chatService.createMessage({
          conversationId: 'conv_123',
          senderId: 'patient_123',
          content: 'Hello'
        })
      ).rejects.toThrow('Rate limit exceeded');
    });

    it('should reject invalid conversation', async () => {
      prisma.conversation.findUnique.mockResolvedValue(null);
      prisma.message.count.mockResolvedValue(0);

      await expect(
        chatService.createMessage({
          conversationId: 'invalid',
          senderId: 'patient_123',
          content: 'Hello'
        })
      ).rejects.toThrow('Invalid conversation');
    });
  });

  describe('getMessages', () => {
    it('should return paginated messages', async () => {
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

      const result = await chatService.getMessages({
        conversationId: 'conv_123',
        limit: 50
      });

      expect(result.messages).toHaveLength(2);
      expect(result.hasMore).toBe(false);
      expect(result.nextCursor).toBeNull();
    });

    it('should handle cursor-based pagination', async () => {
      const mockMessages = Array.from({ length: 51 }, (_, i) => ({
        id: `msg_${i}`,
        content: `Message ${i}`,
        createdAt: new Date(),
        sender: { id: 'user_1', username: 'user1' }
      }));

      prisma.message.findMany.mockResolvedValue(mockMessages);

      const result = await chatService.getMessages({
        conversationId: 'conv_123',
        limit: 50,
        cursor: 'msg_100'
      });

      expect(result.messages).toHaveLength(50);
      expect(result.hasMore).toBe(true);
      expect(result.nextCursor).toBe('msg_49');
    });
  });

  describe('editMessage', () => {
    it('should edit message within time window', async () => {
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

      const result = await chatService.editMessage({
        messageId: 'msg_123',
        userId: 'user_123',
        content: 'Updated'
      });

      expect(result.content).toBe('Updated');
      expect(result.isEdited).toBe(true);
    });

    it('should reject edit after time window', async () => {
      const oldMessage = {
        id: 'msg_123',
        senderId: 'user_123',
        content: 'Original',
        isDeleted: false,
        createdAt: new Date(Date.now() - 10 * 60 * 1000) // 10 minutes ago
      };

      prisma.message.findUnique.mockResolvedValue(oldMessage);

      await expect(
        chatService.editMessage({
          messageId: 'msg_123',
          userId: 'user_123',
          content: 'Updated'
        })
      ).rejects.toThrow('Edit window expired');
    });

    it('should reject edit by non-owner', async () => {
      const message = {
        id: 'msg_123',
        senderId: 'user_123',
        content: 'Original',
        isDeleted: false,
        createdAt: new Date()
      };

      prisma.message.findUnique.mockResolvedValue(message);

      await expect(
        chatService.editMessage({
          messageId: 'msg_123',
          userId: 'user_456', // Different user
          content: 'Updated'
        })
      ).rejects.toThrow('only edit your own messages');
    });
  });

  describe('deleteMessage', () => {
    it('should soft delete message', async () => {
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

      const result = await chatService.deleteMessage('msg_123', 'user_123');

      expect(result.isDeleted).toBe(true);
      expect(result.content).toBe('[Message deleted]');
    });

    it('should reject delete by non-owner', async () => {
      const message = {
        id: 'msg_123',
        senderId: 'user_123',
        isDeleted: false
      };

      prisma.message.findUnique.mockResolvedValue(message);

      await expect(
        chatService.deleteMessage('msg_123', 'user_456')
      ).rejects.toThrow('only delete your own messages');
    });
  });

  describe('markAsRead', () => {
    it('should mark unread messages as read', async () => {
      prisma.message.updateMany.mockResolvedValue({ count: 5 });

      const result = await chatService.markAsRead('conv_123', 'user_123');

      expect(result.count).toBe(5);
      expect(prisma.message.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            conversationId: 'conv_123',
            receiverId: 'user_123',
            isRead: false
          }),
          data: expect.objectContaining({
            isRead: true
          })
        })
      );
    });
  });

  describe('getUnreadCount', () => {
    it('should return unread message count', async () => {
      prisma.message.count.mockResolvedValue(3);

      const count = await chatService.getUnreadCount('user_123', 'conv_123');

      expect(count).toBe(3);
      expect(prisma.message.count).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            conversationId: 'conv_123',
            receiverId: 'user_123',
            isRead: false,
            isDeleted: false
          })
        })
      );
    });
  });

  describe('validateAttachment', () => {
    it('should accept valid image data URL', async () => {
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

      await expect(
        chatService.createMessage({
          conversationId: 'conv_123',
          senderId: 'patient_123',
          content: 'Image',
          type: 'IMAGE' as any,
          attachment: validImageUrl
        })
      ).resolves.toBeDefined();
    });

    it('should reject invalid MIME type', async () => {
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

      await expect(
        chatService.createMessage({
          conversationId: 'conv_123',
          senderId: 'patient_123',
          content: 'File',
          type: 'IMAGE' as any,
          attachment: invalidUrl
        })
      ).rejects.toThrow('Invalid MIME type');
    });
  });
});
