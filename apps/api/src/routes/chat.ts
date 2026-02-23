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

        // Proactive Sync: Ensure any approved appointments for this user have mock conversations
        // This is now done in the main path to support hybrid dev mode
        const approvedForUser = appointmentsStore.filter((a: any) =>
            a.status === 'APPROVED' && (a.patientId === userId || a.doctorId === userId)
        );
        console.log(`[API] Found ${approvedForUser.length} approved appointments for user ${userId} in Mock Store`);
        approvedForUser.forEach((apt: any) => {
            createMockConversation(apt);
        });

        let dbConversations: any[] = [];
        try {
            dbConversations = await prisma.conversation.findMany({
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
            console.log(`[API] Found ${dbConversations.length} conversations in DB`);
        } catch (dbError) {
            console.error('[API] DB Conversation fetch failed:', dbError);
        }

        // Get and Filter Mock Conversations
        const userIdStr = (userId as string || '').trim().toLowerCase();
        const mockConversations = conversationsStore.filter((c: any) => {
            const hasInParticipantIds = c.participantIds && c.participantIds.map((id: string) => id.trim().toLowerCase()).includes(userIdStr);
            const hasInParticipants = c.participants && c.participants.some((p: any) => p.id && p.id.trim().toLowerCase() === userIdStr);
            return hasInParticipantIds || hasInParticipants;
        });
        console.log(`[API] Found ${mockConversations.length} matching mock conversations for ${userIdStr}`);

        // Populate messages for mock conversations
        const mockConversationsWithMessages = mockConversations.map((conv: any) => {
            const convMessages = messagesStore
                .filter((m: any) => m.conversationId === conv.id)
                .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

            return {
                ...conv,
                messages: convMessages.slice(0, 1) // Only include last message for preview
            };
        });

        // Merge Results - with deduplication
        const allConversations = [...dbConversations];
        const seenParticipantPairs = new Set<string>();

        // Add DB conversations to seen set
        dbConversations.forEach((conv: any) => {
            if (conv.participants && conv.participants.length === 2) {
                const ids = conv.participants.map((p: any) => p.id).sort().join('-');
                seenParticipantPairs.add(ids);
            }
        });

        // Only add mock conversations if they don't duplicate existing ones
        mockConversationsWithMessages.forEach((mockConv: any) => {
            // Check by conversation ID
            if (allConversations.find(dbConv => dbConv.id === mockConv.id)) {
                return; // Skip duplicate by ID
            }

            // Check by participant pair
            if (mockConv.participantIds && mockConv.participantIds.length === 2) {
                const ids = [...mockConv.participantIds].sort().join('-');
                if (seenParticipantPairs.has(ids)) {
                    console.log(`[API] Skipping duplicate conversation for participants: ${ids}`);
                    return; // Skip duplicate by participants
                }
                seenParticipantPairs.add(ids);
            }

            allConversations.push(mockConv);
        });

        console.log(`[API] Returning total ${allConversations.length} merged conversations (after deduplication)`);
        res.json(allConversations);
    } catch (error) {
        console.error('[API] Fetch conversations error:', error);
        res.status(500).json({ error: 'Failed to fetch conversations' });
    }
});

// Get messages for a conversation
router.get('/conversations/:id/messages', async (req, res) => {
    try {
        const { id } = req.params;
        const { limit = 50, before } = req.query;

        let dbMessages: any[] = [];
        try {
            dbMessages = await prisma.message.findMany({
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
            console.log(`[API] Found ${dbMessages.length} messages in DB for conversation ${id}`);
        } catch (dbError) {
            console.error('[API] DB Message fetch failed:', dbError);
        }

        // Always check Mock Store
        const mockMessages = messagesStore.filter((m: any) => m.conversationId === id);
        console.log(`[API] Found ${mockMessages.length} messages in Mock Store for conversation ${id}`);

        // Merge and sort
        const allMessages = [...dbMessages];
        mockMessages.forEach((mockMsg: any) => {
            if (!allMessages.find(dbMsg => dbMsg.id === mockMsg.id)) {
                allMessages.push(mockMsg);
            }
        });

        // Sort by creation time (ascending for ChatWindow)
        allMessages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

        res.json(allMessages);
    } catch (error) {
        console.error('Failed to fetch messages:', error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

// Send a message (also handled via Socket.io)
router.post('/messages', async (req, res) => {
    try {
        const { conversationId, senderId, content, type = 'TEXT', attachment } = req.body;

        // Get conversation to find receiver
        let receiverId = senderId; // Default fallback
        let conversation: any = null;

        try {
            // Try to get conversation from DB first
            conversation = await prisma.conversation.findUnique({
                where: { id: conversationId },
                include: {
                    participants: { select: { id: true, username: true, avatar: true } }
                }
            });

            if (conversation) {
                // Find the other participant (receiver)
                const otherParticipant = conversation.participants.find((p: any) => p.id !== senderId);
                if (otherParticipant) {
                    receiverId = otherParticipant.id;
                }
            }
        } catch (dbError) {
            console.log('[API] Could not fetch conversation from DB, checking mock store');
        }

        // If not in DB, check mock store
        if (!conversation) {
            conversation = conversationsStore.find((c: any) => c.id === conversationId);
            if (conversation && conversation.participantIds) {
                const otherParticipantId = conversation.participantIds.find((id: string) => id !== senderId);
                if (otherParticipantId) {
                    receiverId = otherParticipantId;
                }
            }
        }

        // Try to save to database
        try {
            const message = await prisma.message.create({
                data: {
                    conversationId,
                    senderId,
                    receiverId,
                    content,
                    type,
                    attachment
                },
                include: {
                    sender: { select: { id: true, username: true, avatar: true } }
                }
            });
            console.log('[API] Message saved to database successfully');
            
            // Also save to mock store for backward compatibility
            messagesStore.push({
                id: message.id,
                conversationId: message.conversationId,
                senderId: message.senderId,
                content: message.content,
                type: message.type,
                attachment: message.attachment,
                createdAt: message.createdAt.toISOString(),
                sender: message.sender
            });
            saveStore();
            
            return res.json(message);
        } catch (dbError) {
            console.error('[API] DB Message save failed:', dbError);
            console.log('[API] Falling back to mock store only');
        }

        // Fallback to mock store only - get sender info
        let senderUsername = 'User';
        let senderAvatar = null;

        try {
            const user = await prisma.user.findUnique({
                where: { id: senderId },
                select: { username: true, avatar: true }
            });
            if (user) {
                senderUsername = user.username;
                senderAvatar = user.avatar;
            }
        } catch (userError) {
            console.log('[API] Could not fetch sender info from DB');
        }

        const message = {
            id: `msg-${Date.now()}`,
            conversationId,
            senderId,
            content,
            type,
            attachment,
            createdAt: new Date().toISOString(),
            sender: { id: senderId, username: senderUsername, avatar: senderAvatar }
        };
        messagesStore.push(message);
        saveStore();
        res.json(message);
    } catch (error) {
        console.error('Failed to send message:', error);
        res.status(500).json({ error: 'Failed to send message' });
    }
});

// Upload attachment (Now uses Cloudinary)
router.post('/upload', async (req, res) => {
    try {
        const { base64Data, filename, mimeType } = req.body;

        if (!base64Data) {
            return res.status(400).json({ error: 'No file data provided' });
        }

        // Import cloudinary helper
        const { uploadBase64ToCloudinary } = require('../config/cloudinary');

        // Determine resource type
        let resourceType: 'image' | 'video' | 'raw' = 'raw';
        if (mimeType?.startsWith('image/')) {
            resourceType = 'image';
        } else if (mimeType?.startsWith('video/')) {
            resourceType = 'video';
        }

        try {
            // Upload to Cloudinary
            const result = await uploadBase64ToCloudinary(base64Data, 'chat-attachments', resourceType);

            const attachment = {
                url: result.url,
                publicId: result.publicId,
                filename,
                mimeType,
            };

            res.json(attachment);
        } catch (cloudinaryError: any) {
            console.error('Cloudinary upload error:', cloudinaryError);
            
            // Fallback to returning base64 if Cloudinary fails
            const attachment = {
                url: base64Data,
                filename,
                mimeType,
            };
            
            res.json(attachment);
        }
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Failed to upload attachment' });
    }
});

export { router as chatRouter };
