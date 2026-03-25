import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { validateChatAccess } from '../middleware/chatPermission';
import { chatService } from '../services/chat.service';
import { asyncHandler } from '../middleware/asyncHandler';
import { MessageType } from '@medthread/database';

const router = Router();

/**
 * Get all conversations for authenticated user
 * GET /api/v2/chat/conversations
 */
router.get(
  '/conversations',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const userId = req.userId!;
    
    const conversations = await chatService.getUserConversations(userId);
    
    res.json({
      success: true,
      data: conversations
    });
  })
);

/**
 * Get specific conversation details
 * GET /api/v2/chat/conversations/:conversationId
 */
router.get(
  '/conversations/:conversationId',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const { conversationId } = req.params;
    
    const conversation = await chatService.getConversation(conversationId);
    
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
  })
);

/**
 * Get messages for a conversation with cursor-based pagination
 * GET /api/v2/chat/conversations/:conversationId/messages
 * Query params: limit (default 50), cursor (message ID)
 */
router.get(
  '/conversations/:conversationId/messages',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const { conversationId } = req.params;
    const { limit, cursor } = req.query;
    
    const result = await chatService.getMessages({
      conversationId,
      limit: limit ? parseInt(limit as string) : 50,
      cursor: cursor as string | undefined
    });
    
    res.json({
      success: true,
      data: result.messages,
      pagination: {
        nextCursor: result.nextCursor,
        hasMore: result.hasMore
      }
    });
  })
);

/**
 * Send a message
 * POST /api/v2/chat/messages
 */
router.post(
  '/messages',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const userId = req.userId!;
    const { conversationId, content, type, attachment, isUrgent, urgencyLevel } = req.body;
    
    // Validate required fields
    if (!conversationId || !content) {
      return res.status(400).json({
        success: false,
        error: 'conversationId and content are required'
      });
    }
    
    // Validate chat access
    const { canAccessConversation } = await import('../middleware/chatPermission');
    const permission = await canAccessConversation(userId, conversationId);
    
    if (!permission.allowed) {
      return res.status(403).json({
        success: false,
        error: permission.reason,
        code: permission.code
      });
    }
    
    // AUTO-DETECT URGENT MESSAGES
    let finalIsUrgent = false;
    let finalUrgencyLevel = null;
    
    try {
      const { urgentMessageService } = await import('../services/urgent-message.service');
      const urgencyDetection = urgentMessageService.detectUrgency(content);
      
      // ALWAYS use detected urgency (ignore what frontend sends)
      finalIsUrgent = urgencyDetection.isUrgent;
      finalUrgencyLevel = urgencyDetection.urgencyLevel || null;
      
      console.log('🚨 Message Urgency Detection:', {
        content: content.substring(0, 50),
        detected_isUrgent: urgencyDetection.isUrgent,
        detected_level: urgencyDetection.urgencyLevel,
        final_isUrgent: finalIsUrgent,
        final_level: finalUrgencyLevel,
        reason: urgencyDetection.reason
      });
    } catch (urgencyError) {
      console.error('❌ Urgency detection failed:', urgencyError);
      // Continue without urgency detection if it fails
    }
    
    try {
      const message = await chatService.createMessage({
        conversationId,
        senderId: userId,
        content,
        type: type || MessageType.TEXT,
        attachment,
        isUrgent: finalIsUrgent,
        urgencyLevel: finalUrgencyLevel
      });
      
      res.status(201).json({
        success: true,
        data: message
      });
    } catch (error: any) {
      if (error.message.includes('Rate limit')) {
        return res.status(429).json({
          success: false,
          error: error.message,
          code: 'RATE_LIMIT_EXCEEDED'
        });
      }
      throw error;
    }
  })
);

/**
 * Edit a message (within 5 minutes)
 * PUT /api/v2/chat/messages/:messageId
 */
router.put(
  '/messages/:messageId',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const userId = req.userId!;
    const { messageId } = req.params;
    const { content } = req.body;
    
    if (!content) {
      return res.status(400).json({
        success: false,
        error: 'content is required'
      });
    }
    
    try {
      const message = await chatService.editMessage({
        messageId,
        userId,
        content
      });
      
      res.json({
        success: true,
        data: message
      });
    } catch (error: any) {
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
  })
);

/**
 * Delete a message (soft delete)
 * DELETE /api/v2/chat/messages/:messageId
 */
router.delete(
  '/messages/:messageId',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const userId = req.userId!;
    const { messageId } = req.params;
    
    try {
      await chatService.deleteMessage(messageId, userId);
      
      res.json({
        success: true,
        message: 'Message deleted successfully'
      });
    } catch (error: any) {
      if (error.message.includes('only delete your own')) {
        return res.status(403).json({
          success: false,
          error: error.message,
          code: 'UNAUTHORIZED'
        });
      }
      throw error;
    }
  })
);

/**
 * Mark messages as read
 * POST /api/v2/chat/conversations/:conversationId/read
 */
router.post(
  '/conversations/:conversationId/read',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const userId = req.userId!;
    const { conversationId } = req.params;
    
    await chatService.markAsRead(conversationId, userId);
    
    res.json({
      success: true,
      message: 'Messages marked as read'
    });
  })
);

/**
 * Get unread count for a conversation
 * GET /api/v2/chat/conversations/:conversationId/unread
 */
router.get(
  '/conversations/:conversationId/unread',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const userId = req.userId!;
    const { conversationId } = req.params;
    
    const count = await chatService.getUnreadCount(userId, conversationId);
    
    res.json({
      success: true,
      data: { count }
    });
  })
);

/**
 * Get all unread counts for user
 * GET /api/v2/chat/unread
 */
router.get(
  '/unread',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const userId = req.userId!;
    
    const counts = await chatService.getAllUnreadCounts(userId);
    
    res.json({
      success: true,
      data: counts
    });
  })
);

/**
 * Upload attachment
 * POST /api/v2/chat/upload
 */
router.post(
  '/upload',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
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
  })
);

/**
 * Check chat access permission (for frontend to validate before showing UI)
 * GET /api/v2/chat/conversations/:conversationId/access
 */
router.get(
  '/conversations/:conversationId/access',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const userId = req.userId!;
    const { conversationId } = req.params;
    
    const { canAccessConversation } = await import('../middleware/chatPermission');
    const permission = await canAccessConversation(userId, conversationId);
    
    res.json({
      success: true,
      data: {
        allowed: permission.allowed,
        reason: permission.reason,
        code: permission.code
      }
    });
  })
);

export { router as chatRouterV2 };
