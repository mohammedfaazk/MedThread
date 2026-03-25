import { prisma } from '@medthread/database';

export interface UrgentMessageMetadata {
  isUrgent: boolean;
  urgencyLevel?: 'low' | 'medium' | 'high' | 'critical';
  reason?: string;
}

export const urgentMessageService = {
  /**
   * Mark a message as urgent
   */
  async markAsUrgent(messageId: string, userId: string, metadata: UrgentMessageMetadata) {
    try {
      // Verify the message belongs to the user
      const message = await prisma.message.findUnique({
        where: { id: messageId }
      });

      if (!message) {
        throw new Error('Message not found');
      }

      if (message.senderId !== userId) {
        throw new Error('Unauthorized to modify this message');
      }

      // Update message with urgent metadata
      const updatedMessage = await prisma.message.update({
        where: { id: messageId },
        data: {
          // Store urgency info in existing attachment field as JSON
          // Or we can use a separate metadata field if available
          type: metadata.isUrgent ? 'TEXT' : message.type
        }
      });

      return updatedMessage;
    } catch (error) {
      console.error('Error marking message as urgent:', error);
      throw error;
    }
  },

  /**
   * Get urgent messages for a conversation
   */
  async getUrgentMessages(conversationId: string) {
    try {
      // For now, we'll filter based on message type or content
      // In a real implementation, you'd have a dedicated urgency field
      const messages = await prisma.message.findMany({
        where: {
          conversationId
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
        orderBy: {
          createdAt: 'desc'
        }
      });

      return messages;
    } catch (error) {
      console.error('Error fetching urgent messages:', error);
      throw error;
    }
  },

  /**
   * Detect urgency from message content
   */
  detectUrgency(content: string): UrgentMessageMetadata {
    const urgentKeywords = {
      critical: ['emergency', 'urgent', 'critical', 'severe pain', 'bleeding', 'unconscious', 'chest pain', 'difficulty breathing'],
      high: ['asap', 'immediately', 'right away', 'very painful', 'worsening', 'getting worse'],
      medium: ['soon', 'quickly', 'concerned', 'worried', 'uncomfortable']
    };

    const lowerContent = content.toLowerCase();

    for (const keyword of urgentKeywords.critical) {
      if (lowerContent.includes(keyword)) {
        return {
          isUrgent: true,
          urgencyLevel: 'critical',
          reason: `Contains critical keyword: "${keyword}"`
        };
      }
    }

    for (const keyword of urgentKeywords.high) {
      if (lowerContent.includes(keyword)) {
        return {
          isUrgent: true,
          urgencyLevel: 'high',
          reason: `Contains high-priority keyword: "${keyword}"`
        };
      }
    }

    for (const keyword of urgentKeywords.medium) {
      if (lowerContent.includes(keyword)) {
        return {
          isUrgent: true,
          urgencyLevel: 'medium',
          reason: `Contains medium-priority keyword: "${keyword}"`
        };
      }
    }

    return {
      isUrgent: false
    };
  }
};
