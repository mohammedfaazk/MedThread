import { Router } from 'express';
import { authenticate as auth } from '../middleware/auth';
import { requireVerifiedDoctor } from '../middleware/requireVerifiedDoctor';
import { commentService } from '../services/comment.service';
import { emergencyDetectionService } from '../services/emergency-detection.service';
import { medicalVerificationService } from '../services/medical-verification.service';
import { contentModerationService } from '../services/content-moderation.service';
import { liabilityProtectionService } from '../services/liability-protection.service';
import { spamDetectionService } from '../services/spam-detection.service';

const router = Router();

// Create comment - requires verified doctor
router.post('/', auth, requireVerifiedDoctor, async (req, res, next) => {
  try {
    const { content, postId, parentId } = req.body;

    if (!content || !postId) {
      return res.status(400).json({ error: 'Content and postId are required' });
    }

    // Check for emergency keywords
    const emergencyResult = emergencyDetectionService.detectEmergency(content);

    // NEW: Medical verification
    const verificationResult = await medicalVerificationService.verifyMedicalContent(
      content,
      req.userRole || 'DOCTOR'
    );

    // NEW: Content moderation
    const moderationResult = await contentModerationService.moderateContent(
      content,
      req.userId!,
      'comment'
    );

    if (moderationResult.action === 'REMOVE') {
      return res.status(400).json({ 
        error: 'Content violates community guidelines',
        details: moderationResult.categories
      });
    }

    // NEW: Spam detection
    const spamResult = await spamDetectionService.checkSpam(content, req.userId!, 'comment');
    if (spamResult.isSpam && spamResult.score > 70) {
      return res.status(400).json({ 
        error: 'Content detected as spam',
        score: spamResult.score,
        reasons: spamResult.reasons
      });
    }

    // NEW: Add medical disclaimers to doctor responses
    let finalContent = content;
    if (req.userRole === 'DOCTOR' || req.userRole === 'VERIFIED_DOCTOR') {
      finalContent = await liabilityProtectionService.analyzeAndAddDisclaimers(
        content,
        req.userId!
      );
    }

    const comment = await commentService.createComment({
      content: finalContent,
      authorId: req.userId!,
      postId,
      parentId,
    });

    // Log emergency detection if found
    if (emergencyResult.isEmergency) {
      await emergencyDetectionService.logEmergencyDetection({
        userId: req.userId!,
        contentType: 'COMMENT',
        contentId: comment.id,
        level: emergencyResult.level,
        keywords: emergencyResult.matchedKeywords,
        confidence: emergencyResult.confidence
      });
    }

    // Auto-flag if needed
    if (moderationResult.action === 'FLAG') {
      await contentModerationService.autoFlagContent(undefined, 'Auto-flagged comment');
    }

    res.status(201).json({
      ...comment,
      medicalVerification: verificationResult,
      emergencyDetection: emergencyResult.isEmergency ? {
        level: emergencyResult.level,
        shouldShowAlert: emergencyDetectionService.shouldShowEmergencyAlert(emergencyResult)
      } : null,
      moderation: {
        action: moderationResult.action,
        toxicityScore: moderationResult.toxicityScore
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get comments by post or by author
router.get('/', async (req, res, next) => {
  try {
    const { postId, authorId, limit, offset } = req.query;

    if (authorId) {
      // Get comments by author
      const comments = await commentService.getCommentsByAuthor(
        authorId as string,
        limit ? Number(limit) : 20,
        offset ? Number(offset) : 0
      );
      return res.json({ success: true, data: comments });
    }

    if (!postId) {
      return res.status(400).json({ error: 'postId or authorId is required' });
    }

    // Extract userId from token if provided (optional auth)
    let userId: string | undefined;
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
        userId = decoded.userId;
      } catch (error) {
        // Invalid token, continue without userId
      }
    }

    const comments = await commentService.getCommentsByPost(postId as string, userId);

    res.json(comments);
  } catch (error) {
    next(error);
  }
});

// Update comment - requires verified doctor
router.put('/:id', auth, requireVerifiedDoctor, async (req, res, next) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const comment = await commentService.updateComment(req.params.id, req.userId!, content);
    res.json(comment);
  } catch (error) {
    next(error);
  }
});

// Delete comment - requires verified doctor
router.delete('/:id', auth, requireVerifiedDoctor, async (req, res, next) => {
  try {
    await commentService.deleteComment(req.params.id, req.userId!);
    res.json({ success: true, message: 'Comment deleted' });
  } catch (error) {
    next(error);
  }
});

// Vote on comment - requires verified doctor
router.post('/:id/vote', auth, requireVerifiedDoctor, async (req, res, next) => {
  try {
    const { value } = req.body;

    if (value !== 1 && value !== -1) {
      return res.status(400).json({ error: 'Vote value must be 1 or -1' });
    }

    const result = await commentService.voteComment(req.params.id, req.userId!, value);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
