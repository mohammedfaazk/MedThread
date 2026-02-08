import { Router } from 'express';
import { PrismaClient } from '@medthread/database';

const router = Router();
const prisma = new PrismaClient();

import { conversationsStore, messagesStore, appointmentsStore, createMockConversation, saveStore } from '../lib/mockStore';

// Get all conversations for a user
router.get('/conversations', async (req, res) => {
    try {
        const { userId } = req.query;
        console.log('[API] Fetching conversations for userId:', userId);

        try {
            const conversations = await prisma.conversation.findMany({
                where: {
                    participants: {
                        some: { id: userId as string }
                    }
                },
                include: {
                    participants: {
                        select: { id: true, username: true, avatar: true, role: true }
                    },
                    messages: {
                        orderBy: { createdAt: 'desc' },
                        take: 1
                    },
                    appointment: {
                        select: { status: true, startTime: true, endTime: true }
                    }
                }
            });
            res.json(conversations);
        } catch (dbError) {
            console.error('[API] DB Conversation fetch failed, checking mock store');

            // Proactive Sync: Ensure any approved appointments for this user have mock conversations
            const approvedForUser = appointmentsStore.filter((a: any) =>
                a.status === 'APPROVED' && (a.patientId === userId || a.doctorId === userId)
            );
            console.log(`[API] Found ${approvedForUser.length} approved appointments for user ${userId}`);
            approvedForUser.forEach(apt => {
                console.log(`[API] Creating/checking conversation for appointment ${apt.id}`);
                createMockConversation(apt);
            });

            const userConversations = conversationsStore.filter((c: any) => {
                // Check both participantIds array and participants array
                const hasInParticipantIds = c.participantIds && c.participantIds.includes(userId);
                const hasInParticipants = c.participants && c.participants.some((p: any) => p.id === userId);
                const match = hasInParticipantIds || hasInParticipants;
                
                if (match) {
                    console.log(`[API] Conversation ${c.id} matches user ${userId}`);
                }
                return match;
            });

            // Populate messages for each conversation
            const conversationsWithMessages = userConversations.map((conv: any) => {
                const convMessages = messagesStore
                    .filter((m: any) => m.conversationId === conv.id)
                    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                
                return {
                    ...conv,
                    messages: convMessages.slice(0, 1) // Only include last message for preview
                };
            });
            
            console.log(`[API] Returning ${conversationsWithMessages.length} mock conversations for user ${userId}`);
            console.log(`[API] Total conversations in store: ${conversationsStore.length}`);
            res.json(conversationsWithMessages);
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch conversations' });
    }
});

// Get messages for a conversation
router.get('/conversations/:id/messages', async (req, res) => {
    try {
        const { id } = req.params;
        const { limit = 50, before } = req.query;

        try {
            const messages = await prisma.message.findMany({
                where: {
                    conversationId: id,
                    ...(before && { createdAt: { lt: new Date(before as string) } })
                },
                include: {
                    sender: { select: { id: true, username: true, avatar: true } }
                },
                orderBy: { createdAt: 'desc' },
                take: Number(limit)
            });

            res.json(messages.reverse());
        } catch (dbError) {
            console.error('[API] DB Message fetch failed, using mock store');
            const convMessages = messagesStore.filter(m => m.conversationId === id);
            res.json(convMessages);
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

// Send a message (also handled via Socket.io)
router.post('/messages', async (req, res) => {
    try {
        const { conversationId, senderId, content, type = 'TEXT', attachment } = req.body;

        try {
            const message = await prisma.message.create({
                data: {
                    conversationId,
                    senderId,
                    receiverId: senderId, // Will be updated to proper receiver
                    content,
                    type,
                    attachment
                },
                include: {
                    sender: { select: { id: true, username: true, avatar: true } }
                }
            });
            res.json(message);
        } catch (dbError) {
            console.error('[API] DB Message save failed, using mock store');
            const message = {
                id: `msg-${Date.now()}`,
                conversationId,
                senderId,
                content,
                type,
                attachment,
                createdAt: new Date().toISOString(),
                sender: { id: senderId, username: 'User', avatar: null }
            };
            messagesStore.push(message);
            saveStore();
            res.json(message);
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to send message' });
    }
});

// Upload attachment (Base64)
router.post('/upload', async (req, res) => {
    try {
        const { base64Data, filename, mimeType } = req.body;

        // In a real app, you might want to store this in cloud storage
        // For now, we'll just return the base64 data
        const attachment = {
            data: base64Data,
            filename,
            mimeType,
            url: `data:${mimeType};base64,${base64Data}`
        };

        res.json(attachment);
    } catch (error) {
        res.status(500).json({ error: 'Failed to upload attachment' });
    }
});

export { router as chatRouter };
