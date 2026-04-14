import { Router } from 'express';
import { prisma } from '@medthread/database';
import { getPaginationParams, createPaginatedResponse, getSkipTake } from '../utils/pagination';
import { authenticate } from '../middleware/auth.refactored';
import { postingRateLimit } from '../middleware/rateLimiter';
import { analyticsEvents } from '../services/analytics-events.service';
import { mockPosts, mockComments, mockUsers } from '../mock-data/posts-and-users.mock';
import { getSocketInstance } from '../socket';

export const postsRouter = Router();

// Priority order for sorting
const PRIORITY_ORDER = { HIGH: 0, MEDIUM: 1, LOW: 2 };

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
    // Note: tag filtering removed as Post model doesn't have tags field

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
          priority: true,
          _count: {
            select: {
              comments: true,
              votes: true,
            }
          }
        },
        orderBy: [
          { priority: { urgencyScore: 'desc' } },
          { createdAt: 'desc' }
        ],
        skip,
        take,
      }),
      prisma.post.count({ where })
    ]);

    // Analyze posts without priority in the background
    const postsWithoutPriority = posts.filter(p => !p.priority);
    if (postsWithoutPriority.length > 0) {
      console.log(`[API] Found ${postsWithoutPriority.length} posts without priority, analyzing...`);
      const { postPriorityService } = await import('../services/post-priority.service');
      
      // Analyze in background (don't block response)
      Promise.all(
        postsWithoutPriority.map(post => 
          postPriorityService.analyzePostPriority(post.id, post.title, post.content || '')
            .catch(err => console.error(`[API] Failed to analyze post ${post.id}:`, err))
        )
      ).then(() => {
        console.log(`[API] Completed priority analysis for ${postsWithoutPriority.length} posts`);
      });
    }

    const response = createPaginatedResponse(posts, total, page, limit);
    res.json({ success: true, ...response });
  } catch (error: any) {
    console.error('[API] Error fetching posts:', error);
    
    // If database connection failed, use mock data
    if (error.message?.includes("Can't reach database") || 
        error.message?.includes("Tenant or user not found")) {
      console.log('[API] Database unavailable, using mock posts');
      
      const { communityId, userId } = req.query;
      let filteredPosts = [...mockPosts];
      if (communityId) filteredPosts = filteredPosts.filter(p => p.communityId === communityId);
      if (userId) filteredPosts = filteredPosts.filter(p => p.authorId === userId);
      
      // Attach comments to each post from mockComments
      filteredPosts = filteredPosts.map(post => ({
        ...post,
        comments: mockComments[post.id] || []
      }));
      
      // Sort by priority: HIGH -> MEDIUM -> LOW, then by priorityScore desc within each group
      filteredPosts.sort((a, b) => {
        const aPriorityOrder = PRIORITY_ORDER[a.priority?.priorityLevel as keyof typeof PRIORITY_ORDER] ?? 2;
        const bPriorityOrder = PRIORITY_ORDER[b.priority?.priorityLevel as keyof typeof PRIORITY_ORDER] ?? 2;
        
        if (aPriorityOrder !== bPriorityOrder) {
          return aPriorityOrder - bPriorityOrder; // Lower order number = higher priority
        }
        
        // Same priority level, sort by priorityScore descending
        return (b.priority?.urgencyScore || 0) - (a.priority?.urgencyScore || 0);
      });
      
      const { page: mockPage, limit: mockLimit } = getPaginationParams(req.query);
      const start = (mockPage - 1) * mockLimit;
      const paginatedPosts = filteredPosts.slice(start, start + mockLimit);
      
      const response = createPaginatedResponse(paginatedPosts, filteredPosts.length, mockPage, mockLimit);
      return res.json({ success: true, ...response, mock: true });
    }
    
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
postsRouter.post('/', authenticate, async (req, res) => {
  try {
    console.log('[API] Creating post with data:', JSON.stringify(req.body, null, 2));
    
    const { 
      title, 
      content, 
      communityId, 
      mediaUrls,
      type,
      url,
      isNSFW,
      isSpoiler,
      isPrivate,
      flair
    } = req.body;

    console.log('[API] User ID:', req.userId);
    console.log('[API] Community ID:', communityId);

    if (!req.userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    // Validate required fields
    if (!title || title.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Title is required' });
    }

    if (!communityId || communityId.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Community is required. Please select a community.' });
    }

    // Verify community exists
    const communityExists = await prisma.community.findUnique({
      where: { id: communityId }
    });

    if (!communityExists) {
      return res.status(404).json({ success: false, error: 'Selected community not found' });
    }

    // Build post data
    const postData: any = {
      title,
      content,
      authorId: req.userId,
      communityId,
      mediaUrls: mediaUrls || [],
    };

    // Add optional fields if provided
    if (type) postData.type = type;
    if (url) postData.url = url;
    if (typeof isNSFW === 'boolean') postData.isNSFW = isNSFW;
    if (typeof isSpoiler === 'boolean') postData.isSpoiler = isSpoiler;
    if (typeof isPrivate === 'boolean') postData.isPrivate = isPrivate;

    const post = await prisma.post.create({
      data: postData,
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
        priority: true,
      }
    });

    console.log('[API] Post created successfully:', post.id);

    // Run priority analysis and emit socket event after completion
    const { postPriorityService } = await import('../services/post-priority.service');
    postPriorityService.analyzePostPriority(post.id, post.title, post.content || '')
      .then(async (priorityResult) => {
        console.log('[API] Priority analysis complete:', priorityResult);
        
        // Fetch the updated post with priority and author location
        const updatedPost = await prisma.post.findUnique({
          where: { id: post.id },
          include: {
            author: {
              select: {
                id: true,
                username: true,
                avatar: true,
                role: true,
                verified: true,
                pincode: true,
                city: true,
                state: true,
              }
            },
            community: {
              select: {
                id: true,
                name: true,
                icon: true,
              }
            },
            priority: true,
            _count: {
              select: {
                comments: true,
                votes: true,
              }
            }
          }
        });

        // Emit socket event to all connected clients
        try {
          const io = getSocketInstance();
          const postData = {
            ...updatedPost,
            priorityLevel: updatedPost?.priority?.priorityLevel || 'LOW',
            urgencyScore: updatedPost?.priority?.urgencyScore || 0,
            detectedSymptoms: updatedPost?.priority?.detectedSymptoms || [],
          };
          
          // Broadcast to all users
          io.emit('new_post', { post: postData });
          console.log('[Socket] Emitted new_post event for post:', post.id);

          // If HIGH or MEDIUM priority, send targeted notifications to nearby doctors
          const priorityLevel = updatedPost?.priority?.priorityLevel;
          if ((priorityLevel === 'HIGH' || priorityLevel === 'MEDIUM') && updatedPost?.author) {
            const authorPincode = updatedPost.author.pincode;
            const authorCity = updatedPost.author.city;
            const authorState = updatedPost.author.state;

            // Find nearby doctors (same pincode or city)
            const nearbyDoctors = await prisma.user.findMany({
              where: {
                role: 'DOCTOR',
                OR: [
                  { pincode: authorPincode },
                  { city: authorCity },
                  { state: authorState }
                ]
              },
              select: {
                id: true,
                username: true,
                pincode: true,
                city: true,
                state: true,
              }
            });

            console.log(`[Socket] Found ${nearbyDoctors.length} nearby doctors for ${priorityLevel} priority post`);

            // Send targeted notification to each nearby doctor
            nearbyDoctors.forEach(doctor => {
              const proximity = doctor.pincode === authorPincode ? 'same area' : 
                               doctor.city === authorCity ? 'same city' : 'same state';
              
              io.to(`user_${doctor.id}`).emit('nearby_urgent_post', {
                post: postData,
                notification: {
                  title: `${priorityLevel} Priority Post Nearby`,
                  message: `New ${priorityLevel.toLowerCase()} priority post from ${proximity}: ${updatedPost.title}`,
                  priority: priorityLevel,
                  postId: post.id,
                  proximity
                }
              });
            });

            console.log(`[Socket] Sent proximity notifications to ${nearbyDoctors.length} doctors`);
          }
        } catch (socketError) {
          console.error('[Socket] Failed to emit new_post event:', socketError);
        }
      })
      .catch(err => console.error('[API] Priority analysis failed:', err));

    // Emit analytics event for post creation
    analyticsEvents.emitPostCreated({
      postId: post.id,
      authorRole: post.author.role,
      communityId: post.communityId || '',
      priority: 'normal' // Default priority since tags don't exist
    });

    res.status(201).json({ success: true, data: post });
  } catch (error: any) {
    console.error('[API] Error creating post:', error);
    
    // Provide specific error messages
    if (error.code === 'P2003') {
      // Foreign key constraint failed
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid community or user reference. Please try again.' 
      });
    }
    
    if (error.code === 'P2002') {
      // Unique constraint failed
      return res.status(400).json({ 
        success: false, 
        error: 'A post with this information already exists.' 
      });
    }

    if (error.code === 'P2025') {
      // Record not found
      return res.status(404).json({ 
        success: false, 
        error: 'Community or user not found.' 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create post. Please try again.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * POST /api/v1/posts/:id/vote
 * Vote on a post (upvote or downvote)
 */
postsRouter.post('/:id/vote', authenticate, async (req, res) => {
  try {
    const { value } = req.body;
    const postId = req.params.id;

    if (!req.userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    if (value !== 1 && value !== -1 && value !== 0) {
      return res.status(400).json({ success: false, error: 'Vote value must be 1 (upvote), -1 (downvote), or 0 (remove vote)' });
    }

    // Check if user already voted
    const existingVote = await prisma.vote.findUnique({
      where: {
        userId_postId: {
          userId: req.userId,
          postId: postId
        }
      }
    });

    let vote;
    if (value === 0) {
      // Remove vote
      if (existingVote) {
        await prisma.vote.delete({
          where: { id: existingVote.id }
        });
      }
      vote = null;
    } else if (existingVote) {
      // Update existing vote
      vote = await prisma.vote.update({
        where: { id: existingVote.id },
        data: { value }
      });
    } else {
      // Create new vote
      vote = await prisma.vote.create({
        data: {
          userId: req.userId,
          postId: postId,
          value
        }
      });
    }

    // Get updated vote counts
    const [upvotes, downvotes] = await Promise.all([
      prisma.vote.count({ where: { postId, value: 1 } }),
      prisma.vote.count({ where: { postId, value: -1 } })
    ]);

    const score = upvotes - downvotes;

    // Update post score
    await prisma.post.update({
      where: { id: postId },
      data: { 
        upvotes,
        downvotes,
        score 
      }
    });

    res.json({ 
      success: true, 
      data: { 
        userVote: value === 0 ? null : value,
        upvotes,
        downvotes,
        score
      } 
    });
  } catch (error: any) {
    console.error('[API] Error voting on post:', error);
    
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }
    
    res.status(500).json({ 
      success: false, 
      error: 'Failed to vote on post',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default postsRouter;
