import { prisma } from '@medthread/database';
import fs from 'fs/promises';
import path from 'path';

export const voiceMessageService = {
  // Create voice message (stores as regular message with voice attachment)
  async createVoiceMessage(data: {
    userId: string;
    chatId: string;
    filePath: string;
    fileName: string;
    duration: number;
    fileSize: number;
  }) {
    // For now, we'll return the file info without storing in a separate table
    // The actual message will be sent through the regular chat system
    return {
      id: `voice-${Date.now()}`,
      userId: data.userId,
      chatId: data.chatId,
      filePath: data.filePath,
      fileName: data.fileName,
      duration: data.duration,
      fileSize: data.fileSize,
      createdAt: new Date()
    };
  },

  // Get voice message (placeholder - voice messages are stored as regular messages)
  async getVoiceMessage(messageId: string) {
    // Voice messages are stored as regular messages with attachments
    const message = await prisma.message.findUnique({
      where: { id: messageId },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            fullName: true,
            profilePicture: true
          }
        }
      }
    });

    return message;
  },

  // Get chat voice messages
  async getChatVoiceMessages(chatId: string) {
    // Get messages that contain voice attachments
    const messages = await prisma.message.findMany({
      where: { 
        conversationId: chatId,
        content: {
          contains: '🎤 Voice message'
        }
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            fullName: true,
            profilePicture: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return messages;
  },

  // Delete voice message
  async deleteVoiceMessage(messageId: string, userId: string) {
    const message = await prisma.message.findUnique({
      where: { id: messageId }
    });

    if (!message) {
      throw new Error('Voice message not found');
    }

    if (message.senderId !== userId) {
      throw new Error('Unauthorized to delete this voice message');
    }

    // Delete file from filesystem if attachment exists
    if (message.attachment) {
      try {
        const filePath = message.attachment.replace(/^\//, '');
        await fs.unlink(path.join(process.cwd(), filePath));
      } catch (error) {
        console.error('Error deleting voice file:', error);
      }
    }

    // Delete message from database
    return await prisma.message.delete({
      where: { id: messageId }
    });
  },

  // Get user voice messages
  async getUserVoiceMessages(userId: string) {
    const messages = await prisma.message.findMany({
      where: { 
        senderId: userId,
        content: {
          contains: '🎤 Voice message'
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    return messages;
  }
};
