import express from 'express';
import { authenticate } from '../middleware/auth';
import { prisma } from '@medthread/database';

const router = express.Router();

// Search conversations and messages
router.get('/search', authenticate, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { q, limit = 20 } = req.query;

    if (!q || typeof q !== 'string') {
      return res.status(400).json({ error: 'Search query required' });
    }

    const searchQuery = q.toLowerCase();

    // Search messages
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId }
        ],
        content: {
          contains: searchQuery,
          mode: 'insensitive'
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
        },
        receiver: {
          select: {
            id: true,
            username: true,
            fullName: true,
            profilePicture: true
          }
        },
        conversation: {
          select: {
            id: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: parseInt(limit as string)
    });

    // Group by conversation
    const conversationMap = new Map();
    
    messages.forEach(message => {
      const conversationId = message.conversationId || 'direct';
      if (!conversationMap.has(conversationId)) {
        conversationMap.set(conversationId, {
          conversationId,
          messages: [],
          participants: new Set()
        });
      }
      
      const conv = conversationMap.get(conversationId);
      conv.messages.push(message);
      conv.participants.add(message.sender);
      conv.participants.add(message.receiver);
    });

    const results = Array.from(conversationMap.values()).map(conv => ({
      conversationId: conv.conversationId,
      messageCount: conv.messages.length,
      latestMessage: conv.messages[0],
      participants: Array.from(conv.participants),
      messages: conv.messages
    }));

    res.json({
      success: true,
      query: q,
      results,
      totalResults: messages.length
    });
  } catch (error) {
    console.error('Conversation search error:', error);
    res.status(500).json({ error: 'Failed to search conversations' });
  }
});

// Search by participant
router.get('/search/participant', authenticate, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { username } = req.query;

    if (!username || typeof username !== 'string') {
      return res.status(400).json({ error: 'Username required' });
    }

    // Find user
    const participant = await prisma.user.findFirst({
      where: {
        OR: [
          { username: { contains: username, mode: 'insensitive' } },
          { fullName: { contains: username, mode: 'insensitive' } }
        ]
      },
      select: {
        id: true,
        username: true,
        fullName: true,
        profilePicture: true
      }
    });

    if (!participant) {
      return res.json({ success: true, conversations: [] });
    }

    // Find conversations with this participant
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: participant.id },
          { senderId: participant.id, receiverId: userId }
        ]
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            fullName: true,
            profilePicture: true
          }
        },
        receiver: {
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
      },
      take: 50
    });

    res.json({
      success: true,
      participant,
      messages,
      totalMessages: messages.length
    });
  } catch (error) {
    console.error('Participant search error:', error);
    res.status(500).json({ error: 'Failed to search by participant' });
  }
});

export default router;
