"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postsRouter = void 0;
const express_1 = require("express");
const database_1 = require("@medthread/database");
const pagination_1 = require("../utils/pagination");
const auth_refactored_1 = require("../middleware/auth.refactored");
const rateLimiter_1 = require("../middleware/rateLimiter");
exports.postsRouter = (0, express_1.Router)();
/**
 * GET /api/posts
 * Get paginated list of posts
 * Query params: page, limit, sortBy, sortOrder, communityId, userId
 */
exports.postsRouter.get('/', async (req, res) => {
    try {
        const { page, limit, sortBy, sortOrder } = (0, pagination_1.getPaginationParams)(req.query);
        const { skip, take } = (0, pagination_1.getSkipTake)(page, limit);
        const { communityId, userId, tag } = req.query;
        const currentUserId = req.userId; // From auth middleware (optional)
        // Build where clause
        const where = {
            isDraft: false,
            isRemoved: false,
        };
        // Privacy filtering logic
        if (currentUserId) {
            // Authenticated user can see:
            // 1. All public posts
            // 2. Their own private posts
            // 3. Private posts if they're a verified doctor
            const user = await database_1.prisma.user.findUnique({
                where: { id: currentUserId },
                select: { role: true, doctorVerificationStatus: true }
            });
            const isVerifiedDoctor = user?.role === 'VERIFIED_DOCTOR' ||
                (user?.role === 'DOCTOR' && user?.doctorVerificationStatus === 'APPROVED');
            where.OR = [
                { isPrivate: false }, // Public posts
                { authorId: currentUserId }, // Own posts
                ...(isVerifiedDoctor ? [{ isPrivate: true }] : []) // Private posts for verified doctors
            ];
        }
        else {
            // Unauthenticated users can only see public posts
            where.isPrivate = false;
        }
        if (communityId)
            where.communityId = communityId;
        if (userId)
            where.authorId = userId;
        if (tag)
            where.tags = { has: tag };
        const [posts, total] = await Promise.all([
            database_1.prisma.post.findMany({
                where,
                include: {
                    author: {
                        select: {
                            id: true,
                            username: true,
                            avatar: true,
                            role: true,
                            verified: true,
                            doctorVerificationStatus: true,
                            specialty: true,
                            pincode: true,
                        }
                    },
                    community: {
                        select: {
                            id: true,
                            name: true,
                            displayName: true,
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
            database_1.prisma.post.count({ where })
        ]);
        const response = (0, pagination_1.createPaginatedResponse)(posts, total, page, limit);
        res.json({ success: true, ...response });
    }
    catch (error) {
        console.error('[API] Error fetching posts:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch posts' });
    }
});
/**
 * GET /api/posts/:id
 * Get single post with comments
 */
exports.postsRouter.get('/:id', async (req, res) => {
    try {
        const post = await database_1.prisma.post.findUnique({
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
    }
    catch (error) {
        console.error('[API] Error fetching post:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch post' });
    }
});
/**
 * GET /api/posts/:id/comments
 * Get paginated comments for a post
 */
exports.postsRouter.get('/:id/comments', async (req, res) => {
    try {
        const { page, limit, sortBy, sortOrder } = (0, pagination_1.getPaginationParams)(req.query);
        const { skip, take } = (0, pagination_1.getSkipTake)(page, limit);
        const [comments, total] = await Promise.all([
            database_1.prisma.comment.findMany({
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
            database_1.prisma.comment.count({
                where: {
                    postId: req.params.id,
                    parentId: null,
                }
            })
        ]);
        const response = (0, pagination_1.createPaginatedResponse)(comments, total, page, limit);
        res.json({ success: true, ...response });
    }
    catch (error) {
        console.error('[API] Error fetching comments:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch comments' });
    }
});
/**
 * POST /api/posts
 * Create a new post
 */
exports.postsRouter.post('/', auth_refactored_1.authenticate, rateLimiter_1.createContentLimiter, async (req, res) => {
    try {
        const { title, content, communityId, tags, mediaUrls, type, isNSFW, isSpoiler, isPrivate, url } = req.body;
        if (!req.userId) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }
        if (!title || !communityId) {
            return res.status(400).json({ success: false, error: 'Title and community are required' });
        }
        // Map type string to PostType enum
        const postType = type ? type.toUpperCase() : 'TEXT';
        const post = await database_1.prisma.post.create({
            data: {
                title,
                content,
                authorId: req.userId,
                communityId,
                type: postType,
                tags: tags || [],
                mediaUrls: mediaUrls || [],
                url: url || null,
                isNSFW: isNSFW || false,
                isSpoiler: isSpoiler || false,
                isPrivate: isPrivate || false,
                isDraft: false,
            },
            include: {
                author: {
                    select: {
                        id: true,
                        username: true,
                        avatar: true,
                        role: true,
                        verified: true,
                        doctorVerificationStatus: true,
                        specialty: true,
                    }
                },
                community: {
                    select: {
                        id: true,
                        name: true,
                        displayName: true,
                        icon: true,
                    }
                },
                _count: {
                    select: {
                        comments: true,
                        votes: true,
                    }
                }
            }
        });
        console.log('[API] Post created successfully:', post.id);
        res.status(201).json({ success: true, data: post });
    }
    catch (error) {
        console.error('[API] Error creating post:', error);
        res.status(500).json({ success: false, error: error.message || 'Failed to create post' });
    }
});
exports.default = exports.postsRouter;
