import { Router } from 'express';
import { authenticate as auth } from '../middleware/auth';
import { requireVerifiedDoctor } from '../middleware/requireVerifiedDoctor';
import { postService } from '../services/post.service';
import { emergencyDetectionService } from '../services/emergency-detection.service';
import { medicalVerificationService } from '../services/medical-verification.service';
import { contentModerationService } from '../services/content-moderation.service';
import { spamDetectionService } from '../services/spam-detection.service';

const router = Router();

// Create post - requires verified doctor
router.post('/', auth, requireVerifiedDoctor, async (req, res, next) => {
  try {
    const { title, content, type, url, mediaUrls, communityId, flairId, isNSFW, isSpoiler, isDraft } = req.body;

    if (!title || !communityId) {
      return res.status(400).json({ error: 'Title and community are required' });
    }

    // Check for emergency keywords in title and content
    const combinedContent = `${title} ${content || ''}`;
    const emergencyResult = emergencyDetectionService.detectEmergency(combinedContent);

    // NEW: Medical verification for medical content
    let verificationResult = null;
    if (content && content.length > 50) {
      verificationResult = await medicalVerificationService.verifyMedicalContent(
        combinedContent,
        req.userRole || 'PATIENT'
      );
    }

    // NEW: Content moderation
    const moderationResult = await contentModerationService.moderateContent(
      combinedContent,
      req.userId!,
      'post'
    );

    // Block if content should be removed
    if (moderationResult.action === 'REMOVE') {
      return res.status(400).json({ 
        error: 'Content violates community guidelines',
        details: moderationResult.categories
      });
    }

    // NEW: Spam detection
    const spamResult = await spamDetectionService.checkSpam(combinedContent, req.userId!, 'post');
    if (spamResult.isSpam && spamResult.score > 70) {
      return res.status(400).json({ 
        error: 'Content detected as spam',
        score: spamResult.score,
        reasons: spamResult.reasons
      });
    }

    const post = await postService.createPost({
      title,
      content,
      type,
      url,
      mediaUrls,
      authorId: req.userId!,
      communityId,
      flairId,
      isNSFW,
      isSpoiler,
      isDraft,
    });

    // Log emergency detection if found
    if (emergencyResult.isEmergency) {
      await emergencyDetectionService.logEmergencyDetection({
        userId: req.userId!,
        contentType: 'POST',
        contentId: post.id,
        level: emergencyResult.level,
        keywords: emergencyResult.matchedKeywords,
        confidence: emergencyResult.confidence
      });
    }

    // Auto-flag if needed
    if (moderationResult.action === 'FLAG') {
      await contentModerationService.autoFlagContent(post.id, 'Auto-flagged by moderation system');
    }

    // Return post with verification and emergency detection
    res.status(201).json({
      ...post,
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

// Get posts (with filters)
router.get('/', async (req, res, next) => {
  try {
    const { 
      community, 
      sort, 
      limit, 
      offset, 
      authorId,
      specialty,
      authorType,
      dateFrom,
      dateTo,
      postType
    } = req.query;

    const posts = await postService.getPosts({
      community: community as string,
      sort: sort as 'hot' | 'new' | 'top' | 'rising',
      limit: limit ? Number(limit) : 20,
      offset: offset ? Number(offset) : 0,
      authorId: authorId as string,
      specialty: specialty as string,
      authorType: authorType as 'doctor' | 'patient' | 'all',
      dateFrom: dateFrom ? new Date(dateFrom as string) : undefined,
      dateTo: dateTo ? new Date(dateTo as string) : undefined,
      postType: postType as 'TEXT' | 'IMAGE' | 'VIDEO' | 'LINK' | 'POLL',
    });

    res.json(posts);
  } catch (error) {
    next(error);
  }
});

// Get user's drafts - MUST be before /:id route
router.get('/drafts', auth, async (req, res, next) => {
  try {
    const drafts = await postService.getDrafts(req.userId!);
    res.json(drafts);
  } catch (error) {
    next(error);
  }
});

// Get saved posts - MUST be before /:id route
router.get('/saved', auth, async (req, res, next) => {
  try {
    const { limit, offset } = req.query;
    const posts = await postService.getSavedPosts(
      req.userId!,
      limit ? Number(limit) : 20,
      offset ? Number(offset) : 0
    );
    res.json(posts);
  } catch (error) {
    next(error);
  }
});

// Get hidden posts - MUST be before /:id route
router.get('/hidden', auth, async (req, res, next) => {
  try {
    const { limit, offset } = req.query;
    const posts = await postService.getHiddenPosts(
      req.userId!,
      limit ? Number(limit) : 20,
      offset ? Number(offset) : 0
    );
    res.json(posts);
  } catch (error) {
    next(error);
  }
});

// Get single post
router.get('/:id', async (req, res, next) => {
  try {
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

    const post = await postService.getPostById(req.params.id, userId);
    res.json(post);
  } catch (error: any) {
    if (error.message === 'Post not found') {
      return res.status(404).json({ error: 'Post not found' });
    }
    next(error);
  }
});

// Update post - requires verified doctor
router.put('/:id', auth, requireVerifiedDoctor, async (req, res, next) => {
  try {
    const { title, content, isNSFW, isSpoiler } = req.body;

    const post = await postService.updatePost(req.params.id, req.userId!, {
      title,
      content,
      isNSFW,
      isSpoiler,
    });

    res.json(post);
  } catch (error) {
    next(error);
  }
});

// Delete post - requires verified doctor
router.delete('/:id', auth, requireVerifiedDoctor, async (req, res, next) => {
  try {
    await postService.deletePost(req.params.id, req.userId!);
    res.json({ success: true, message: 'Post deleted' });
  } catch (error) {
    next(error);
  }
});

// Vote on post - requires verified doctor
router.post('/:id/vote', auth, requireVerifiedDoctor, async (req, res, next) => {
  try {
    const { value } = req.body;

    if (value !== 1 && value !== -1) {
      return res.status(400).json({ error: 'Vote value must be 1 or -1' });
    }

    const result = await postService.votePost(req.params.id, req.userId!, value);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Save/unsave post - requires verified doctor
router.post('/:id/save', auth, requireVerifiedDoctor, async (req, res, next) => {
  try {
    const result = await postService.savePost(req.params.id, req.userId!);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Hide/unhide post - requires verified doctor
router.post('/:id/hide', auth, requireVerifiedDoctor, async (req, res, next) => {
  try {
    const result = await postService.hidePost(req.params.id, req.userId!);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Endorse post - only doctors can endorse, only doctor-authored posts
router.post('/:id/endorse', auth, async (req, res, next) => {
  try {
    const { prisma } = await import('@medthread/database');
    const doctorId = req.userId!;

    // Verify endorser is a doctor
    const endorser = await prisma.user.findUnique({
      where: { id: doctorId },
      select: { role: true, doctorVerificationStatus: true }
    });

    if (!endorser || (endorser.role !== 'DOCTOR' && endorser.role !== 'VERIFIED_DOCTOR')) {
      return res.status(403).json({ success: false, error: 'Only doctors can endorse posts' });
    }

    // Get the post and its author
    const post = await prisma.post.findUnique({
      where: { id: req.params.id },
      select: { authorId: true, author: { select: { role: true } } }
    });

    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }

    // Only doctor-authored posts can be endorsed
    if (post.author.role !== 'DOCTOR' && post.author.role !== 'VERIFIED_DOCTOR') {
      return res.status(400).json({ success: false, error: 'Only posts by doctors can be endorsed' });
    }

    // Prevent self-endorsement
    if (post.authorId === doctorId) {
      return res.status(400).json({ success: false, error: 'You cannot endorse your own post' });
    }

    // Toggle endorsement
    const existing = await prisma.doctorEndorsement.findUnique({
      where: { postId_doctorId: { postId: req.params.id, doctorId } }
    });

    if (existing) {
      // Remove endorsement
      await prisma.doctorEndorsement.delete({ where: { id: existing.id } });
      await prisma.post.update({
        where: { id: req.params.id },
        data: { endorsementCount: { decrement: 1 } }
      });
      return res.json({ success: true, endorsed: false });
    } else {
      // Add endorsement
      await prisma.doctorEndorsement.create({
        data: { postId: req.params.id, doctorId }
      });
      await prisma.post.update({
        where: { id: req.params.id },
        data: { endorsementCount: { increment: 1 } }
      });
      return res.json({ success: true, endorsed: true });
    }
  } catch (error) {
    next(error);
  }
});

// Publish a draft - requires verified doctor
router.post('/:id/publish', auth, requireVerifiedDoctor, async (req, res, next) => {
  try {
    const post = await postService.publishDraft(req.params.id, req.userId!);
    res.json(post);
  } catch (error) {
    next(error);
  }
});

export default router;
