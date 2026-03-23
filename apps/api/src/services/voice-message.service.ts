import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

export const voiceMessageService = {
  // Create voice message
  async createVoiceMessage(data: {
    userId: string;
    chatId: string;
    filePath: string;
    fileName: string;
    duration: number;
    fileSize: number;
  }) {
    return await prisma.voiceMessage.create({
      data: {
        userId: data.userId,
        chatId: data.chatId,
        filePath: data.filePath,
        fileName: data.fileName,
        duration: data.duration,
        fileSize: data.fileSize,
        transcription: null // Can be added later with speech-to-text
      }
    });
  },

  // Get voice message
  async getVoiceMessage(messageId: string) {
    return await prisma.voiceMessage.findUnique({
      where: { id: messageId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            fullName: true,
            profilePicture: true
          }
        }
      }
    });
  },

  // Get chat voice messages
  async getChatVoiceMessages(chatId: string) {
    return await prisma.voiceMessage.findMany({
      where: { chatId },
      include: {
        user: {
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
  },

  // Delete voice message
  async deleteVoiceMessage(messageId: string, userId: string) {
    const voiceMessage = await prisma.voiceMessage.findUnique({
      where: { id: messageId }
    });

    if (!voiceMessage) {
      throw new Error('Voice message not found');
    }

    if (voiceMessage.userId !== userId) {
      throw new Error('Unauthorized to delete this voice message');
    }

    // Delete file from filesystem
    try {
      await fs.unlink(voiceMessage.filePath);
    } catch (error) {
      console.error('Error deleting voice file:', error);
    }

    // Delete from database
    return await prisma.voiceMessage.delete({
      where: { id: messageId }
    });
  },

  // Update transcription (for future speech-to-text integration)
  async updateTranscription(messageId: string, transcription: string) {
    return await prisma.voiceMessage.update({
      where: { id: messageId },
      data: { transcription }
    });
  },

  // Get user voice messages
  async getUserVoiceMessages(userId: string) {
    return await prisma.voiceMessage.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
  }
};
