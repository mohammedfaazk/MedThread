import { Router } from 'express';
import { authenticate as auth } from '../middleware/auth';
import { requireVerifiedDoctor } from '../middleware/requireVerifiedDoctor';
import { postService } from '../services/post.service';

const router = Router();

// Create post - requires verified doctor
router.post('/', auth, requireVerifiedDoctor, async (req, res, next) => {
  try {
    const { title, content, type, url, mediaUrls, communityId, flairId, isNSFW, isSpoiler, isDraft } = req.body;

    if (!title || !communityId) {
      return res.status(400).json({ error: 'Title and community are required' });
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

    res.status(201).json(post);
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

export default router;


// Get user's drafts
router.get('/drafts', auth, async (req, res, next) => {
  try {
    const drafts = await postService.getDrafts(req.userId!);
    res.json(drafts);
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

// Get saved posts
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

// Get hidden posts
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
