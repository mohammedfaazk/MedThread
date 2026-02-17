import { Router } from 'express';
import { prisma } from '@medthread/database';
import { getPaginationParams, createPaginatedResponse, getSkipTake } from '../utils/pagination';
import { authenticate } from '../middleware/auth.refactored';
import { createContentLimiter } from '../middleware/rateLimiter';

export const postsRouter = Router();

/**
 * GET /api/posts
 * Get paginated list of posts
 * Query params: page, limit, sortBy, sortOrder, communityId, userId
 */
postsRouter.get('/', async (req, res) => {
  try {
    const { page, limit, sortBy, sortOrder } = getPaginationParams(req.query);
    const { skip, take } = getSkipTake(page, limit);
    
    const { communityId, userId, tag } = req.query;

    // Build where clause
    const where: any = {};
    if (communityId) where.communityId = communityId as string;
    if (userId) where.authorId = userId as string;
    if (tag) where.tags = { has: tag as string };

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              username: true,
              avatar: true,
              role: true,
              verified: true,
            }
          },
          community: {
            select: {
              id: true,
              name: true,
              icon: true,
            }
          },
          _count: {
            select: {
              comments: true,
              votes: true,
            }
          }
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take,
      }),
      prisma.post.count({ where })
    ]);

    const response = createPaginatedResponse(posts, total, page, limit);
    res.json({ success: true, ...response });
  } catch (error) {
    console.error('[API] Error fetching posts:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch posts' });
  }
});

/**
 * GET /api/posts/:id
 * Get single post with comments
 */
postsRouter.get('/:id', async (req, res) => {
  try {
    const post = await prisma.post.findUnique({
      where: { id: req.params.id },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatar: true,
            role: true,
            verified: true,
          }
        },
        community: {
          select: {
            id: true,
            name: true,
            icon: true,
            description: true,
          }
        },
        comments: {
          where: { parentId: null }, // Only top-level comments
          include: {
            author: {
              select: {
                id: true,
                username: true,
                avatar: true,
                role: true,
                verified: true,
              }
            },
            _count: {
              select: {
                replies: true,
                votes: true,
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 20, // Initial load
        },
        _count: {
          select: {
            comments: true,
            votes: true,
          }
        }
      }
    });

    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }

    res.json({ success: true, data: post });
  } catch (error) {
    console.error('[API] Error fetching post:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch post' });
  }
});

/**
 * GET /api/posts/:id/comments
 * Get paginated comments for a post
 */
postsRouter.get('/:id/comments', async (req, res) => {
  try {
    const { page, limit, sortBy, sortOrder } = getPaginationParams(req.query);
    const { skip, take } = getSkipTake(page, limit);

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where: {
          postId: req.params.id,
          parentId: null, // Only top-level comments
        },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              avatar: true,
              role: true,
              verified: true,
            }
          },
          _count: {
            select: {
              replies: true,
              votes: true,
            }
          }
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take,
      }),
      prisma.comment.count({
        where: {
          postId: req.params.id,
          parentId: null,
        }
      })
    ]);

    const response = createPaginatedResponse(comments, total, page, limit);
    res.json({ success: true, ...response });
  } catch (error) {
    console.error('[API] Error fetching comments:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch comments' });
  }
});

/**
 * POST /api/posts
 * Create a new post
 */
postsRouter.post('/', authenticate, createContentLimiter, async (req, res) => {
  try {
    const { title, content, communityId, tags, mediaUrls } = req.body;

    if (!req.userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const post = await prisma.post.create({
      data: {
        title,
        content,
        authorId: req.userId,
        communityId,
        tags: tags || [],
        mediaUrls: mediaUrls || [],
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatar: true,
            role: true,
            verified: true,
          }
        },
        community: {
          select: {
            id: true,
            name: true,
            icon: true,
          }
        }
      }
    });

    res.status(201).json({ success: true, data: post });
  } catch (error) {
    console.error('[API] Error creating post:', error);
    res.status(500).json({ success: false, error: 'Failed to create post' });
  }
});

export default postsRouter;
