import { prisma, MessageType } from '@medthread/database';
import { checkMessageRateLimit } from '../middleware/chatPermission';
import { getSocketInstance } from '../socket';

interface CreateMessageInput {
  conversationId: string;
  senderId: string;
  content: string;
  type?: MessageType;
  attachment?: string;
  isUrgent?: boolean;
  urgencyLevel?: string;
}

interface UpdateMessageInput {
  messageId: string;
  userId: string;
  content: string;
}

interface GetMessagesInput {
  conversationId: string;
  limit?: number;
  cursor?: string; // Message ID for cursor-based pagination
}

export class ChatService {
  /**
   * Create a new message with validation
   */
  async createMessage(input: CreateMessageInput) {
    const { conversationId, senderId, content, type = MessageType.TEXT, attachment, isUrgent, urgencyLevel } = input;

    // Validate content
    if (!content || content.trim().length === 0) {
      throw new Error('Message content cannot be empty');
    }

    if (content.length > 10000) {
      throw new Error('Message content exceeds maximum length of 10,000 characters');
    }

    // Check rate limit
    const rateLimitCheck = await checkMessageRateLimit(senderId, conversationId);
    if (!rateLimitCheck.allowed) {
      throw new Error(
        `Rate limit exceeded. Please wait until ${rateLimitCheck.resetAt?.toISOString()}`
      );
    }

    // Validate attachment if present
    if (attachment) {
      await this.validateAttachment(attachment, type);
    }

    // Get conversation to find receiver
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        appointment: {
          select: {
            patientId: true,
            doctorId: true
          }
        }
      }
    });

    if (!conversation || !conversation.appointment) {
      throw new Error('Invalid conversation');
    }

    const receiverId = conversation.appointment.patientId === senderId
      ? conversation.appointment.doctorId
      : conversation.appointment.patientId;

    // Create message
    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId,
        receiverId,
        content,
        type,
        attachment,
        isRead: false,
        isUrgent: isUrgent || false,
        urgencyLevel: urgencyLevel || null
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            avatar: true,
            role: true
          }
        }
      }
    });

    // Update conversation's last message timestamp
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() }
    });

    // Emit real-time event
    try {
      const io = getSocketInstance();
      console.log(`[Chat] Emitting receive_message to conversation: ${conversationId}, message ID: ${message.id}`);
      io.to(conversationId).emit('receive_message', message);
      console.log(`[Chat] Message emitted successfully`);
      
      // Send unread count update to receiver
      const unreadCount = await this.getUnreadCount(receiverId, conversationId);
      io.to(`user:${receiverId}`).emit('unread_count_update', {
        conversationId,
        count: unreadCount
      });
      console.log(`[Chat] Unread count update sent to user: ${receiverId}`);
    } catch (socketError) {
      console.error('Socket emission error:', socketError);
      // Don't fail the message creation if socket fails
    }

    // Create notification for receiver
    try {
      const { notificationService } = await import('./notification.service');
      await notificationService.createNotification({
        type: 'DIRECT_MESSAGE',
        recipientIds: [receiverId],
        actorId: senderId,
        contentId: conversationId,
        contentType: 'POST', // Using POST as placeholder
        metadata: {
          preview: content.substring(0, 100),
          link: `/chat?conversation=${conversationId}`,
          messageId: message.id
        }
      });
    } catch (notifError) {
      console.error('Notification creation error:', notifError);
    }

    return message;
  }

  /**
   * Get messages with cursor-based pagination
   */
  async getMessages(input: GetMessagesInput) {
    const { conversationId, limit = 50, cursor } = input;

    const messages = await prisma.message.findMany({
      where: {
        conversationId,
        ...(cursor && {
          id: {
            lt: cursor // Get messages before this cursor
          }
        })
      },
      include: {
        sender: {
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
      },
      take: limit + 1 // Fetch one extra to determine if there are more
    });

    const hasMore = messages.length > limit;
    const items = hasMore ? messages.slice(0, limit) : messages;
    const nextCursor = hasMore ? items[items.length - 1].id : null;

    // Reverse to show oldest first
    return {
      messages: items.reverse(),
      nextCursor,
      hasMore
    };
  }

  /**
   * Mark messages as read
   */
  async markAsRead(conversationId: string, userId: string) {
    const result = await prisma.message.updateMany({
      where: {
        conversationId,
        receiverId: userId,
        isRead: false
      },
      data: {
        isRead: true
      }
    });

    // Emit read receipt
    try {
      const io = getSocketInstance();
      io.to(conversationId).emit('messages_read', {
        conversationId,
        userId,
        readAt: new Date()
      });
    } catch (socketError) {
      console.error('Socket emission error:', socketError);
    }

    return result;
  }

  /**
   * Edit message (within 5 minutes) - Note: Current schema doesn't support editing
   */
  async editMessage(input: UpdateMessageInput) {
    const { messageId, userId, content } = input;

    if (!content || content.trim().length === 0) {
      throw new Error('Message content cannot be empty');
    }

    if (content.length > 10000) {
      throw new Error('Message content exceeds maximum length');
    }

    const message = await prisma.message.findUnique({
      where: { id: messageId }
    });

    if (!message) {
      throw new Error('Message not found');
    }

    if (message.senderId !== userId) {
      throw new Error('You can only edit your own messages');
    }

    // Check if within 5 minute edit window
    const now = new Date();
    const messageAge = now.getTime() - new Date(message.createdAt).getTime();
    const fiveMinutes = 5 * 60 * 1000;

    if (messageAge > fiveMinutes) {
      throw new Error('Edit window expired (5 minutes)');
    }

    // Since the schema doesn't have isEdited/editedAt fields, we'll just update content
    const updated = await prisma.message.update({
      where: { id: messageId },
      data: {
        content
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            avatar: true,
            role: true
          }
        }
      }
    });

    // Emit update
    try {
      const io = getSocketInstance();
      io.to(message.conversationId!).emit('message_edited', updated);
    } catch (socketError) {
      console.error('Socket emission error:', socketError);
    }

    return updated;
  }

  /**
   * Soft delete message - Note: Current schema doesn't support soft delete
   */
  async deleteMessage(messageId: string, userId: string) {
    const message = await prisma.message.findUnique({
      where: { id: messageId }
    });

    if (!message) {
      throw new Error('Message not found');
    }

    if (message.senderId !== userId) {
      throw new Error('You can only delete your own messages');
    }

    // Since schema doesn't have isDeleted field, we'll update content to show deletion
    const updated = await prisma.message.update({
      where: { id: messageId },
      data: {
        content: '[Message deleted]'
      }
    });

    // Emit deletion
    try {
      const io = getSocketInstance();
      io.to(message.conversationId!).emit('message_deleted', {
        messageId,
        conversationId: message.conversationId
      });
    } catch (socketError) {
      console.error('Socket emission error:', socketError);
    }

    return updated;
  }

  /**
   * Get unread message count for a user in a conversation
   */
  async getUnreadCount(userId: string, conversationId: string): Promise<number> {
    return await prisma.message.count({
      where: {
        conversationId,
        receiverId: userId,
        isRead: false
      }
    });
  }

  /**
   * Get all unread counts for a user across all conversations
   */
  async getAllUnreadCounts(userId: string) {
    const conversations = await prisma.conversation.findMany({
      where: {
        appointment: {
          OR: [
            { patientId: userId },
            { doctorId: userId }
          ]
        }
      },
      select: {
        id: true
      }
    });

    const counts = await Promise.all(
      conversations.map(async (conv) => ({
        conversationId: conv.id,
        count: await this.getUnreadCount(userId, conv.id)
      }))
    );

    return counts.filter(c => c.count > 0);
  }

  /**
   * Validate attachment based on type
   */
  private async validateAttachment(attachment: string, type: MessageType) {
    // Check if it's a data URL
    if (attachment.startsWith('data:')) {
      const matches = attachment.match(/^data:([^;]+);base64,(.+)$/);
      if (!matches) {
        throw new Error('Invalid attachment format');
      }

      const mimeType = matches[1];
      const base64Data = matches[2];

      // Validate MIME type
      const allowedMimeTypes = {
        [MessageType.IMAGE]: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        [MessageType.FILE]: [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'text/plain'
        ]
      };

      const allowed = allowedMimeTypes[type] || [];
      if (!allowed.includes(mimeType)) {
        throw new Error(`Invalid MIME type: ${mimeType}. Allowed: ${allowed.join(', ')}`);
      }

      // Validate size (max 10MB)
      const sizeInBytes = (base64Data.length * 3) / 4;
      const maxSize = 10 * 1024 * 1024; // 10MB

      if (sizeInBytes > maxSize) {
        throw new Error(`File size exceeds maximum of 10MB`);
      }
    } else if (attachment.startsWith('http://') || attachment.startsWith('https://')) {
      // URL validation - ensure it's from allowed domains
      // In production, you'd want to validate against your CDN/storage domain
      const url = new URL(attachment);
      const allowedDomains = [
        process.env.CDN_DOMAIN,
        process.env.STORAGE_DOMAIN,
        'localhost'
      ].filter(Boolean);

      if (!allowedDomains.some(domain => url.hostname.includes(domain as string))) {
        throw new Error('Attachment URL from unauthorized domain');
      }
    } else {
      throw new Error('Invalid attachment format. Must be data URL or HTTPS URL');
    }
  }

  /**
   * Get conversation details with participants
   */
  async getConversation(conversationId: string) {
    return await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        appointment: {
          include: {
            patient: {
              select: {
                id: true,
                username: true,
                avatar: true,
                role: true
              }
            },
            doctor: {
              select: {
                id: true,
                username: true,
                avatar: true,
                role: true,
                specialty: true,
                doctorVerificationStatus: true
              }
            }
          }
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            sender: {
              select: {
                id: true,
                username: true,
                avatar: true
              }
            }
          }
        }
      }
    });
  }

  /**
   * Get all conversations for a user
   */
  async getUserConversations(userId: string) {
    const conversations = await prisma.conversation.findMany({
      where: {
        appointment: {
          OR: [
            { patientId: userId },
            { doctorId: userId }
          ]
        }
      },
      include: {
        appointment: {
          include: {
            patient: {
              select: {
                id: true,
                username: true,
                avatar: true,
                role: true
              }
            },
            doctor: {
              select: {
                id: true,
                username: true,
                avatar: true,
                role: true,
                specialty: true
              }
            }
          }
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            sender: {
              select: {
                id: true,
                username: true,
                avatar: true
              }
            }
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    // Add unread counts
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conv) => ({
        ...conv,
        unreadCount: await this.getUnreadCount(userId, conv.id)
      }))
    );

    return conversationsWithUnread;
  }

  /**
   * Deactivate conversation (when appointment is cancelled or doctor loses verification)
   * Since there's no isActive field, we'll handle this by checking appointment status
   */
  async deactivateConversation(conversationId: string, reason: string) {
    // We can't actually deactivate the conversation in the database
    // Instead, we'll emit the event to notify clients
    try {
      const io = getSocketInstance();
      io.to(conversationId).emit('conversation_deactivated', {
        conversationId,
        reason
      });
    } catch (socketError) {
      console.error('Socket emission error:', socketError);
    }

    // Return the conversation as-is since we can't modify isActive
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId }
    });

    return conversation;
  }
}

export const chatService = new ChatService();
