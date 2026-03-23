"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatService = exports.ChatService = void 0;
const database_1 = require("@medthread/database");
const chatPermission_1 = require("../middleware/chatPermission");
const socket_1 = require("../socket");
class ChatService {
    /**
     * Create a new message with validation
     */
    async createMessage(input) {
        const { conversationId, senderId, content, type = database_1.MessageType.TEXT, attachment } = input;
        // Validate content
        if (!content || content.trim().length === 0) {
            throw new Error('Message content cannot be empty');
        }
        if (content.length > 10000) {
            throw new Error('Message content exceeds maximum length of 10,000 characters');
        }
        // Check rate limit
        const rateLimitCheck = await (0, chatPermission_1.checkMessageRateLimit)(senderId, conversationId);
        if (!rateLimitCheck.allowed) {
            throw new Error(`Rate limit exceeded. Please wait until ${rateLimitCheck.resetAt?.toISOString()}`);
        }
        // Validate attachment if present
        if (attachment) {
            await this.validateAttachment(attachment, type);
        }
        // Get conversation to find receiver
        const conversation = await database_1.prisma.conversation.findUnique({
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
        const message = await database_1.prisma.message.create({
            data: {
                conversationId,
                senderId,
                receiverId,
                content,
                type,
                attachment,
                isRead: false
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
        await database_1.prisma.conversation.update({
            where: { id: conversationId },
            data: { updatedAt: new Date() }
        });
        // Emit real-time event
        try {
            const io = (0, socket_1.getSocketInstance)();
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
        }
        catch (socketError) {
            console.error('Socket emission error:', socketError);
            // Don't fail the message creation if socket fails
        }
        // Create notification for receiver
        try {
            const { notificationService } = await Promise.resolve().then(() => __importStar(require('./notification.service')));
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
        }
        catch (notifError) {
            console.error('Notification creation error:', notifError);
        }
        return message;
    }
    /**
     * Get messages with cursor-based pagination
     */
    async getMessages(input) {
        const { conversationId, limit = 50, cursor } = input;
        const messages = await database_1.prisma.message.findMany({
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
    async markAsRead(conversationId, userId) {
        const result = await database_1.prisma.message.updateMany({
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
            const io = (0, socket_1.getSocketInstance)();
            io.to(conversationId).emit('messages_read', {
                conversationId,
                userId,
                readAt: new Date()
            });
        }
        catch (socketError) {
            console.error('Socket emission error:', socketError);
        }
        return result;
    }
    /**
     * Edit message (within 5 minutes) - Note: Current schema doesn't support editing
     */
    async editMessage(input) {
        const { messageId, userId, content } = input;
        if (!content || content.trim().length === 0) {
            throw new Error('Message content cannot be empty');
        }
        if (content.length > 10000) {
            throw new Error('Message content exceeds maximum length');
        }
        const message = await database_1.prisma.message.findUnique({
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
        const updated = await database_1.prisma.message.update({
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
            const io = (0, socket_1.getSocketInstance)();
            io.to(message.conversationId).emit('message_edited', updated);
        }
        catch (socketError) {
            console.error('Socket emission error:', socketError);
        }
        return updated;
    }
    /**
     * Soft delete message - Note: Current schema doesn't support soft delete
     */
    async deleteMessage(messageId, userId) {
        const message = await database_1.prisma.message.findUnique({
            where: { id: messageId }
        });
        if (!message) {
            throw new Error('Message not found');
        }
        if (message.senderId !== userId) {
            throw new Error('You can only delete your own messages');
        }
        // Since schema doesn't have isDeleted field, we'll update content to show deletion
        const updated = await database_1.prisma.message.update({
            where: { id: messageId },
            data: {
                content: '[Message deleted]'
            }
        });
        // Emit deletion
        try {
            const io = (0, socket_1.getSocketInstance)();
            io.to(message.conversationId).emit('message_deleted', {
                messageId,
                conversationId: message.conversationId
            });
        }
        catch (socketError) {
            console.error('Socket emission error:', socketError);
        }
        return updated;
    }
    /**
     * Get unread message count for a user in a conversation
     */
    async getUnreadCount(userId, conversationId) {
        return await database_1.prisma.message.count({
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
    async getAllUnreadCounts(userId) {
        const conversations = await database_1.prisma.conversation.findMany({
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
        const counts = await Promise.all(conversations.map(async (conv) => ({
            conversationId: conv.id,
            count: await this.getUnreadCount(userId, conv.id)
        })));
        return counts.filter(c => c.count > 0);
    }
    /**
     * Validate attachment based on type
     */
    async validateAttachment(attachment, type) {
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
                [database_1.MessageType.IMAGE]: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
                [database_1.MessageType.FILE]: [
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
        }
        else if (attachment.startsWith('http://') || attachment.startsWith('https://')) {
            // URL validation - ensure it's from allowed domains
            // In production, you'd want to validate against your CDN/storage domain
            const url = new URL(attachment);
            const allowedDomains = [
                process.env.CDN_DOMAIN,
                process.env.STORAGE_DOMAIN,
                'localhost'
            ].filter(Boolean);
            if (!allowedDomains.some(domain => url.hostname.includes(domain))) {
                throw new Error('Attachment URL from unauthorized domain');
            }
        }
        else {
            throw new Error('Invalid attachment format. Must be data URL or HTTPS URL');
        }
    }
    /**
     * Get conversation details with participants
     */
    async getConversation(conversationId) {
        return await database_1.prisma.conversation.findUnique({
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
    async getUserConversations(userId) {
        const conversations = await database_1.prisma.conversation.findMany({
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
        const conversationsWithUnread = await Promise.all(conversations.map(async (conv) => ({
            ...conv,
            unreadCount: await this.getUnreadCount(userId, conv.id)
        })));
        return conversationsWithUnread;
    }
    /**
     * Deactivate conversation (when appointment is cancelled or doctor loses verification)
     * Since there's no isActive field, we'll handle this by checking appointment status
     */
    async deactivateConversation(conversationId, reason) {
        // We can't actually deactivate the conversation in the database
        // Instead, we'll emit the event to notify clients
        try {
            const io = (0, socket_1.getSocketInstance)();
            io.to(conversationId).emit('conversation_deactivated', {
                conversationId,
                reason
            });
        }
        catch (socketError) {
            console.error('Socket emission error:', socketError);
        }
        // Return the conversation as-is since we can't modify isActive
        const conversation = await database_1.prisma.conversation.findUnique({
            where: { id: conversationId }
        });
        return conversation;
    }
}
exports.ChatService = ChatService;
exports.chatService = new ChatService();
