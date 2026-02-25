"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postsRouter = void 0;
const express_1 = require("express");
const database_1 = require("@medthread/database");
const pagination_1 = require("../utils/pagination");
const auth_refactored_1 = require("../middleware/auth.refactored");
const rateLimiter_1 = require("../middleware/rateLimiter");
const privacyCheck_1 = require("../utils/privacyCheck");
exports.postsRouter = (0, express_1.Router)();
/**
 * GET /api/posts
 * Get paginated list of posts
 * Query params: page, limit, sortBy, sortOrder, communityId, userId, privacyMode
 */
exports.postsRouter.get('/', async (req, res) => {
    try {
        const { page, limit, sortBy, sortOrder } = (0, pagination_1.getPaginationParams)(req.query);
        const { skip, take } = (0, pagination_1.getSkipTake)(page, limit);
        const { communityId, userId, tag, privacyMode } = req.query;
        // Build where clause
        const where = {};
        if (communityId)
            where.communityId = communityId;
        if (userId)
            where.authorId = userId;
        if (tag)
            where.tags = { has: tag };
        // Privacy filtering based on user role
        const userRole = req.userRole; // From auth middleware
        const currentUserId = req.userId; // From auth middleware
        if (privacyMode === 'PUBLIC') {
            where.isPrivate = false;
        }
        else if (privacyMode === 'PRIVATE') {
            where.isPrivate = true;
        }
        else if (privacyMode === 'ALL') {
            // No filter, show both
        }
        else {
            // Default behavior: non-doctors only see public posts (except own posts)
            if (userRole !== 'DOCTOR') {
                where.OR = [
                    { isPrivate: false },
                    { authorId: currentUserId || '' }
                ];
            }
            // Doctors see all posts by default
        }
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
        // Check privacy access
        const userId = req.userId;
        const userRole = req.userRole;
        if (post.isPrivate) {
            const accessResult = await (0, privacyCheck_1.checkPrivatePostAccess)(post.id, userId, userRole);
            if (!accessResult.hasAccess) {
                // Return 404 to avoid information leakage
                return res.status(404).json({ success: false, error: 'Post not found' });
            }
            // Filter comments based on access result
            if (accessResult.filterComments && !accessResult.isAuthor) {
                // Doctor viewing private post - only show their own comments
                post.comments = post.comments.filter(comment => comment.authorId === userId);
            }
            // Log access to audit log
            await database_1.prisma.auditLog.create({
                data: {
                    action: 'PRIVATE_POST_ACCESS',
                    userId: userId || 'anonymous',
                    targetId: post.id,
                    targetType: 'POST',
                    metadata: {
                        postId: post.id,
                        userRole,
                        isAuthor: accessResult.isAuthor,
                    }
                }
            });
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
        // Check if post exists and get privacy status
        const post = await database_1.prisma.post.findUnique({
            where: { id: req.params.id },
            select: { id: true, isPrivate: true, authorId: true }
        });
        if (!post) {
            return res.status(404).json({ success: false, error: 'Post not found' });
        }
        const userId = req.userId;
        const userRole = req.userRole;
        // Check privacy access for private posts
        if (post.isPrivate) {
            const accessResult = await (0, privacyCheck_1.checkPrivatePostAccess)(post.id, userId, userRole);
            if (!accessResult.hasAccess) {
                return res.status(404).json({ success: false, error: 'Post not found' });
            }
            // Log access to audit log
            await database_1.prisma.auditLog.create({
                data: {
                    action: 'PRIVATE_REPLY_ACCESS',
                    userId: userId || 'anonymous',
                    targetId: post.id,
                    targetType: 'POST',
                    metadata: {
                        postId: post.id,
                        userRole,
                        isAuthor: accessResult.isAuthor,
                    }
                }
            });
        }
        // Build where clause for comments
        const where = {
            postId: req.params.id,
            parentId: null, // Only top-level comments
        };
        // Filter comments for private posts
        if (post.isPrivate && userId !== post.authorId && userRole === 'DOCTOR') {
            // Doctor viewing private post - only show their own comments
            where.authorId = userId;
        }
        const [comments, total] = await Promise.all([
            database_1.prisma.comment.findMany({
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
            database_1.prisma.comment.count({ where })
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
        const { title, content, communityId, tags, mediaUrls, isPrivate } = req.body;
        if (!req.userId) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }
        const post = await database_1.prisma.post.create({
            data: {
                title,
                content,
                authorId: req.userId,
                communityId,
                tags: tags || [],
                mediaUrls: mediaUrls || [],
                isPrivate: isPrivate === true, // Explicit boolean conversion, defaults to false
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
        // Log private post creation to audit log
        if (post.isPrivate) {
            await database_1.prisma.auditLog.create({
                data: {
                    action: 'PRIVATE_POST_CREATED',
                    userId: req.userId,
                    targetId: post.id,
                    targetType: 'POST',
                    metadata: {
                        postId: post.id,
                        title: post.title,
                    }
                }
            });
        }
        res.status(201).json({ success: true, data: post });
    }
    catch (error) {
        console.error('[API] Error creating post:', error);
        res.status(500).json({ success: false, error: 'Failed to create post' });
    }
});
exports.default = exports.postsRouter;
