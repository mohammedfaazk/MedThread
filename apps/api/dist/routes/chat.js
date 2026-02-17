"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatRouter = void 0;
const express_1 = require("express");
const database_1 = require("@medthread/database");
const auth_1 = require("../middleware/auth");
const requireVerifiedDoctor_1 = require("../middleware/requireVerifiedDoctor");
const router = (0, express_1.Router)();
exports.chatRouter = router;
const prisma = new database_1.PrismaClient();
const mockStore_1 = require("../lib/mockStore");
// Get all conversations for a user
router.get('/conversations', async (req, res) => {
    try {
        const { userId } = req.query;
        console.log('[API] Fetching conversations for userId:', userId);
        // Proactive Sync: Ensure any approved appointments for this user have mock conversations
        // This is now done in the main path to support hybrid dev mode
        const approvedForUser = mockStore_1.appointmentsStore.filter((a) => a.status === 'APPROVED' && (a.patientId === userId || a.doctorId === userId));
        console.log(`[API] Found ${approvedForUser.length} approved appointments for user ${userId} in Mock Store`);
        approvedForUser.forEach((apt) => {
            (0, mockStore_1.createMockConversation)(apt);
        });
        let dbConversations = [];
        try {
            dbConversations = await prisma.conversation.findMany({
                where: {
                    participants: {
                        some: { id: userId }
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
        }
        catch (dbError) {
            console.error('[API] DB Conversation fetch failed:', dbError);
        }
        // Get and Filter Mock Conversations
        const userIdStr = (userId || '').trim().toLowerCase();
        const mockConversations = mockStore_1.conversationsStore.filter((c) => {
            const hasInParticipantIds = c.participantIds && c.participantIds.map((id) => id.trim().toLowerCase()).includes(userIdStr);
            const hasInParticipants = c.participants && c.participants.some((p) => p.id && p.id.trim().toLowerCase() === userIdStr);
            return hasInParticipantIds || hasInParticipants;
        });
        console.log(`[API] Found ${mockConversations.length} matching mock conversations for ${userIdStr}`);
        // Populate messages for mock conversations
        const mockConversationsWithMessages = mockConversations.map((conv) => {
            const convMessages = mockStore_1.messagesStore
                .filter((m) => m.conversationId === conv.id)
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            return {
                ...conv,
                messages: convMessages.slice(0, 1) // Only include last message for preview
            };
        });
        // Merge Results - with deduplication
        const allConversations = [...dbConversations];
        const seenParticipantPairs = new Set();
        // Add DB conversations to seen set
        dbConversations.forEach((conv) => {
            if (conv.participants && conv.participants.length === 2) {
                const ids = conv.participants.map((p) => p.id).sort().join('-');
                seenParticipantPairs.add(ids);
            }
        });
        // Only add mock conversations if they don't duplicate existing ones
        mockConversationsWithMessages.forEach((mockConv) => {
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
    }
    catch (error) {
        console.error('[API] Fetch conversations error:', error);
        res.status(500).json({ error: 'Failed to fetch conversations' });
    }
});
// Get messages for a conversation
router.get('/conversations/:id/messages', async (req, res) => {
    try {
        const { id } = req.params;
        const { limit = 50, before } = req.query;
        let dbMessages = [];
        try {
            dbMessages = await prisma.message.findMany({
                where: {
                    conversationId: id,
                    ...(before && { createdAt: { lt: new Date(before) } })
                },
                include: {
                    sender: { select: { id: true, username: true, avatar: true } }
                },
                orderBy: { createdAt: 'desc' },
                take: Number(limit)
            });
            console.log(`[API] Found ${dbMessages.length} messages in DB for conversation ${id}`);
        }
        catch (dbError) {
            console.error('[API] DB Message fetch failed:', dbError);
        }
        // Always check Mock Store
        const mockMessages = mockStore_1.messagesStore.filter((m) => m.conversationId === id);
        console.log(`[API] Found ${mockMessages.length} messages in Mock Store for conversation ${id}`);
        // Merge and sort
        const allMessages = [...dbMessages];
        mockMessages.forEach((mockMsg) => {
            if (!allMessages.find(dbMsg => dbMsg.id === mockMsg.id)) {
                allMessages.push(mockMsg);
            }
        });
        // Sort by creation time (ascending for ChatWindow)
        allMessages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        res.json(allMessages);
    }
    catch (error) {
        console.error('Failed to fetch messages:', error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});
// Send a message (also handled via Socket.io) - requires verified doctor
router.post('/messages', auth_1.authenticate, requireVerifiedDoctor_1.requireVerifiedDoctor, async (req, res) => {
    try {
        const { conversationId, senderId, content, type = 'TEXT', attachment } = req.body;
        try {
            // First try DB if it exists (not starting with conv-)
            if (!conversationId.startsWith('conv-')) {
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
                return res.json(message);
            }
        }
        catch (dbError) {
            console.error('[API] DB Message save failed, falling back to mock store');
        }
        // Fallback to mock store - try to get actual username
        let senderUsername = 'User';
        try {
            const { createClient } = require('@supabase/supabase-js');
            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
            const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
            if (supabaseUrl && supabaseKey) {
                const supabase = createClient(supabaseUrl, supabaseKey);
                const { data: userAuth } = await supabase.auth.admin.getUserById(senderId);
                if (userAuth?.user?.email) {
                    senderUsername = userAuth.user.email.split('@')[0];
                }
            }
        }
        catch (authError) {
            console.log('[API] Could not fetch sender info:', authError);
        }
        const message = {
            id: `msg-${Date.now()}`,
            conversationId,
            senderId,
            content,
            type,
            attachment,
            createdAt: new Date().toISOString(),
            sender: { id: senderId, username: senderUsername, avatar: null }
        };
        mockStore_1.messagesStore.push(message);
        (0, mockStore_1.saveStore)();
        res.json(message);
    }
    catch (error) {
        console.error('Failed to send message:', error);
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
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to upload attachment' });
    }
});
