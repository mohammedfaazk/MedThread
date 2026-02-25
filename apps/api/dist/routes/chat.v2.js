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
exports.chatRouterV2 = void 0;
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const chatPermission_1 = require("../middleware/chatPermission");
const chat_service_1 = require("../services/chat.service");
const asyncHandler_1 = require("../middleware/asyncHandler");
const database_1 = require("@medthread/database");
const router = (0, express_1.Router)();
exports.chatRouterV2 = router;
/**
 * Get all conversations for authenticated user
 * GET /api/v2/chat/conversations
 */
router.get('/conversations', auth_1.authenticate, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.userId;
    const conversations = await chat_service_1.chatService.getUserConversations(userId);
    res.json({
        success: true,
        data: conversations
    });
}));
/**
 * Get specific conversation details
 * GET /api/v2/chat/conversations/:conversationId
 */
router.get('/conversations/:conversationId', auth_1.authenticate, chatPermission_1.validateChatAccess, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { conversationId } = req.params;
    const conversation = await chat_service_1.chatService.getConversation(conversationId);
    if (!conversation) {
        return res.status(404).json({
            success: false,
            error: 'Conversation not found'
        });
    }
    res.json({
        success: true,
        data: conversation
    });
}));
/**
 * Get messages for a conversation with cursor-based pagination
 * GET /api/v2/chat/conversations/:conversationId/messages
 * Query params: limit (default 50), cursor (message ID)
 */
router.get('/conversations/:conversationId/messages', auth_1.authenticate, chatPermission_1.validateChatAccess, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { conversationId } = req.params;
    const { limit, cursor } = req.query;
    const result = await chat_service_1.chatService.getMessages({
        conversationId,
        limit: limit ? parseInt(limit) : 50,
        cursor: cursor
    });
    res.json({
        success: true,
        data: result.messages,
        pagination: {
            nextCursor: result.nextCursor,
            hasMore: result.hasMore
        }
    });
}));
/**
 * Send a message
 * POST /api/v2/chat/messages
 */
router.post('/messages', auth_1.authenticate, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.userId;
    const { conversationId, content, type, attachment } = req.body;
    // Validate required fields
    if (!conversationId || !content) {
        return res.status(400).json({
            success: false,
            error: 'conversationId and content are required'
        });
    }
    // Validate chat access
    const { canAccessConversation } = await Promise.resolve().then(() => __importStar(require('../middleware/chatPermission')));
    const permission = await canAccessConversation(userId, conversationId);
    if (!permission.allowed) {
        return res.status(403).json({
            success: false,
            error: permission.reason,
            code: permission.code
        });
    }
    try {
        const message = await chat_service_1.chatService.createMessage({
            conversationId,
            senderId: userId,
            content,
            type: type || database_1.MessageType.TEXT,
            attachment
        });
        res.status(201).json({
            success: true,
            data: message
        });
    }
    catch (error) {
        if (error.message.includes('Rate limit')) {
            return res.status(429).json({
                success: false,
                error: error.message,
                code: 'RATE_LIMIT_EXCEEDED'
            });
        }
        throw error;
    }
}));
/**
 * Edit a message (within 5 minutes)
 * PUT /api/v2/chat/messages/:messageId
 */
router.put('/messages/:messageId', auth_1.authenticate, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.userId;
    const { messageId } = req.params;
    const { content } = req.body;
    if (!content) {
        return res.status(400).json({
            success: false,
            error: 'content is required'
        });
    }
    try {
        const message = await chat_service_1.chatService.editMessage({
            messageId,
            userId,
            content
        });
        res.json({
            success: true,
            data: message
        });
    }
    catch (error) {
        if (error.message.includes('Edit window expired')) {
            return res.status(403).json({
                success: false,
                error: error.message,
                code: 'EDIT_WINDOW_EXPIRED'
            });
        }
        if (error.message.includes('only edit your own')) {
            return res.status(403).json({
                success: false,
                error: error.message,
                code: 'UNAUTHORIZED'
            });
        }
        throw error;
    }
}));
/**
 * Delete a message (soft delete)
 * DELETE /api/v2/chat/messages/:messageId
 */
router.delete('/messages/:messageId', auth_1.authenticate, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.userId;
    const { messageId } = req.params;
    try {
        await chat_service_1.chatService.deleteMessage(messageId, userId);
        res.json({
            success: true,
            message: 'Message deleted successfully'
        });
    }
    catch (error) {
        if (error.message.includes('only delete your own')) {
            return res.status(403).json({
                success: false,
                error: error.message,
                code: 'UNAUTHORIZED'
            });
        }
        throw error;
    }
}));
/**
 * Mark messages as read
 * POST /api/v2/chat/conversations/:conversationId/read
 */
router.post('/conversations/:conversationId/read', auth_1.authenticate, chatPermission_1.validateChatAccess, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.userId;
    const { conversationId } = req.params;
    await chat_service_1.chatService.markAsRead(conversationId, userId);
    res.json({
        success: true,
        message: 'Messages marked as read'
    });
}));
/**
 * Get unread count for a conversation
 * GET /api/v2/chat/conversations/:conversationId/unread
 */
router.get('/conversations/:conversationId/unread', auth_1.authenticate, chatPermission_1.validateChatAccess, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.userId;
    const { conversationId } = req.params;
    const count = await chat_service_1.chatService.getUnreadCount(userId, conversationId);
    res.json({
        success: true,
        data: { count }
    });
}));
/**
 * Get all unread counts for user
 * GET /api/v2/chat/unread
 */
router.get('/unread', auth_1.authenticate, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.userId;
    const counts = await chat_service_1.chatService.getAllUnreadCounts(userId);
    res.json({
        success: true,
        data: counts
    });
}));
/**
 * Upload attachment
 * POST /api/v2/chat/upload
 */
router.post('/upload', auth_1.authenticate, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { base64Data, filename, mimeType } = req.body;
    if (!base64Data || !filename || !mimeType) {
        return res.status(400).json({
            success: false,
            error: 'base64Data, filename, and mimeType are required'
        });
    }
    // Validate file size (max 10MB)
    const sizeInBytes = (base64Data.length * 3) / 4;
    const maxSize = 10 * 1024 * 1024;
    if (sizeInBytes > maxSize) {
        return res.status(413).json({
            success: false,
            error: 'File size exceeds maximum of 10MB',
            code: 'FILE_TOO_LARGE'
        });
    }
    // Validate MIME type
    const allowedMimeTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
    ];
    if (!allowedMimeTypes.includes(mimeType)) {
        return res.status(400).json({
            success: false,
            error: `Invalid MIME type. Allowed: ${allowedMimeTypes.join(', ')}`,
            code: 'INVALID_MIME_TYPE'
        });
    }
    // In production, upload to cloud storage (S3, Cloudinary, etc.)
    // For now, return data URL
    const dataUrl = `data:${mimeType};base64,${base64Data}`;
    res.json({
        success: true,
        data: {
            url: dataUrl,
            filename,
            mimeType,
            size: sizeInBytes
        }
    });
}));
/**
 * Check chat access permission (for frontend to validate before showing UI)
 * GET /api/v2/chat/conversations/:conversationId/access
 */
router.get('/conversations/:conversationId/access', auth_1.authenticate, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.userId;
    const { conversationId } = req.params;
    const { canAccessConversation } = await Promise.resolve().then(() => __importStar(require('../middleware/chatPermission')));
    const permission = await canAccessConversation(userId, conversationId);
    res.json({
        success: true,
        data: {
            allowed: permission.allowed,
            reason: permission.reason,
            code: permission.code
        }
    });
}));
