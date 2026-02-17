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
exports.postService = void 0;
const database_1 = require("@medthread/database");
exports.postService = {
    async createPost(data) {
        const post = await database_1.prisma.post.create({
            data: {
                title: data.title,
                content: data.content,
                type: data.type || 'TEXT',
                url: data.url,
                mediaUrls: data.mediaUrls || [],
                authorId: data.authorId,
                communityId: data.communityId,
                flairId: data.flairId,
                isNSFW: data.isNSFW || false,
                isSpoiler: data.isSpoiler || false,
                isDraft: data.isDraft || false,
                publishedAt: data.isDraft ? null : new Date(),
            },
            include: {
                author: {
                    select: {
                        id: true,
                        username: true,
                        role: true,
                        avatar: true,
                        totalKarma: true,
                        doctorVerificationStatus: true,
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
                flair: true,
                _count: {
                    select: {
                        comments: true,
                        votes: true,
                    }
                }
            }
        });
        return post;
    },
    async getPosts(options) {
        const { community, sort = 'hot', limit = 20, offset = 0, authorId, tags, specialty, authorType, dateFrom, dateTo, postType } = options;
        let orderBy;
        switch (sort) {
            case 'new':
                orderBy = { createdAt: 'desc' };
                break;
            case 'top':
                orderBy = { score: 'desc' };
                break;
            case 'hot':
            case 'rising':
                // For hot/rising, we'll sort by createdAt and apply algorithm in memory
                orderBy = { createdAt: 'desc' };
                break;
            default:
                orderBy = { createdAt: 'desc' };
        }
        const where = {
            isRemoved: false,
            isArchived: false,
            isDraft: false,
        };
        // Filter by community
        if (community) {
            where.community = { name: community };
        }
        // Filter by author
        if (authorId) {
            where.authorId = authorId;
        }
        // Filter by specialty (medical)
        if (specialty) {
            where.author = {
                specialty: { contains: specialty, mode: 'insensitive' }
            };
        }
        // Filter by author type (doctor/patient)
        if (authorType && authorType !== 'all') {
            if (authorType === 'doctor') {
                where.author = {
                    ...where.author,
                    OR: [
                        { role: 'VERIFIED_DOCTOR' },
                        {
                            AND: [
                                { role: 'DOCTOR' },
                                { doctorVerificationStatus: 'APPROVED' }
                            ]
                        }
                    ]
                };
            }
            else if (authorType === 'patient') {
                where.author = {
                    ...where.author,
                    role: { not: 'VERIFIED_DOCTOR' },
                    OR: [
                        { role: { not: 'DOCTOR' } },
                        { doctorVerificationStatus: { not: 'APPROVED' } }
                    ]
                };
            }
        }
        // Filter by date range
        if (dateFrom || dateTo) {
            where.createdAt = {};
            if (dateFrom) {
                where.createdAt.gte = dateFrom;
            }
            if (dateTo) {
                where.createdAt.lte = dateTo;
            }
        }
        // Filter by post type
        if (postType) {
            where.type = postType;
        }
        const posts = await database_1.prisma.post.findMany({
            where,
            include: {
                author: {
                    select: {
                        id: true,
                        username: true,
                        role: true,
                        avatar: true,
                        totalKarma: true,
                        specialty: true,
                        doctorVerificationStatus: true,
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
                flair: true,
                _count: {
                    select: {
                        comments: true,
                        votes: true,
                    }
                }
            },
            orderBy,
            take: limit,
            skip: offset
        });
        // Apply hot/rising algorithm if needed
        if (sort === 'hot' || sort === 'rising') {
            return this.applyRankingAlgorithm(posts, sort);
        }
        return posts;
    },
    async getPostById(postId, userId) {
        const post = await database_1.prisma.post.findUnique({
            where: { id: postId },
            include: {
                author: {
                    select: {
                        id: true,
                        username: true,
                        role: true,
                        avatar: true,
                        totalKarma: true,
                        specialty: true,
                        doctorVerificationStatus: true,
                    }
                },
                community: {
                    select: {
                        id: true,
                        name: true,
                        displayName: true,
                        icon: true,
                        description: true,
                    }
                },
                flair: true,
                _count: {
                    select: {
                        comments: true,
                        votes: true,
                    }
                }
            }
        });
        if (!post) {
            throw new Error('Post not found');
        }
        // Get user's vote if userId provided
        let userVote = null;
        let isSaved = false;
        let isHidden = false;
        if (userId) {
            const vote = await database_1.prisma.vote.findUnique({
                where: {
                    userId_postId: {
                        userId,
                        postId
                    }
                }
            });
            userVote = vote?.value || null;
            const saved = await database_1.prisma.savedPost.findUnique({
                where: {
                    userId_postId: {
                        userId,
                        postId
                    }
                }
            });
            isSaved = !!saved;
            const hidden = await database_1.prisma.hiddenPost.findUnique({
                where: {
                    userId_postId: {
                        userId,
                        postId
                    }
                }
            });
            isHidden = !!hidden;
        }
        return {
            ...post,
            userVote,
            isSaved,
            isHidden,
        };
    },
    async updatePost(postId, userId, data) {
        // Verify ownership
        const post = await database_1.prisma.post.findUnique({
            where: { id: postId },
            select: { authorId: true }
        });
        if (!post) {
            throw new Error('Post not found');
        }
        if (post.authorId !== userId) {
            throw new Error('Unauthorized');
        }
        return await database_1.prisma.post.update({
            where: { id: postId },
            data: {
                ...data,
                editedAt: new Date(),
            },
            include: {
                author: {
                    select: {
                        id: true,
                        username: true,
                        role: true,
                        avatar: true,
                        doctorVerificationStatus: true,
                    }
                },
                community: true,
                flair: true,
            }
        });
    },
    async deletePost(postId, userId) {
        // Verify ownership
        const post = await database_1.prisma.post.findUnique({
            where: { id: postId },
            select: { authorId: true }
        });
        if (!post) {
            throw new Error('Post not found');
        }
        if (post.authorId !== userId) {
            throw new Error('Unauthorized');
        }
        // Soft delete
        return await database_1.prisma.post.update({
            where: { id: postId },
            data: {
                isRemoved: true,
                content: '[deleted]',
            }
        });
    },
    async votePost(postId, userId, value) {
        if (value !== 1 && value !== -1) {
            throw new Error('Vote value must be 1 or -1');
        }
        // Check if vote exists
        const existingVote = await database_1.prisma.vote.findUnique({
            where: {
                userId_postId: {
                    userId,
                    postId
                }
            }
        });
        let voteChange = 0;
        if (existingVote) {
            if (existingVote.value === value) {
                // Remove vote (toggle off)
                await database_1.prisma.vote.delete({
                    where: { id: existingVote.id }
                });
                voteChange = -value;
            }
            else {
                // Update vote
                await database_1.prisma.vote.update({
                    where: { id: existingVote.id },
                    data: { value }
                });
                voteChange = value - existingVote.value;
            }
        }
        else {
            // Create new vote
            await database_1.prisma.vote.create({
                data: { userId, postId, value }
            });
            voteChange = value;
        }
        // Update post score
        const post = await database_1.prisma.post.update({
            where: { id: postId },
            data: {
                upvotes: value === 1 ? { increment: voteChange > 0 ? 1 : -1 } : undefined,
                downvotes: value === -1 ? { increment: voteChange < 0 ? 1 : -1 } : undefined,
                score: { increment: voteChange }
            },
            select: {
                score: true,
                upvotes: true,
                downvotes: true,
            }
        });
        // Update author karma
        const postAuthor = await database_1.prisma.post.findUnique({
            where: { id: postId },
            select: { authorId: true }
        });
        if (postAuthor) {
            // Use centralized karma service
            const { karmaService } = await Promise.resolve().then(() => __importStar(require('./karma.service')));
            await karmaService.updateUserKarma(postAuthor.authorId);
        }
        return post;
    },
    async savePost(postId, userId) {
        const existing = await database_1.prisma.savedPost.findUnique({
            where: {
                userId_postId: {
                    userId,
                    postId
                }
            }
        });
        if (existing) {
            // Unsave
            await database_1.prisma.savedPost.delete({
                where: { id: existing.id }
            });
            return { saved: false };
        }
        else {
            // Save
            await database_1.prisma.savedPost.create({
                data: { userId, postId }
            });
            return { saved: true };
        }
    },
    async hidePost(postId, userId) {
        const existing = await database_1.prisma.hiddenPost.findUnique({
            where: {
                userId_postId: {
                    userId,
                    postId
                }
            }
        });
        if (existing) {
            // Unhide
            await database_1.prisma.hiddenPost.delete({
                where: { id: existing.id }
            });
            return { hidden: false };
        }
        else {
            // Hide
            await database_1.prisma.hiddenPost.create({
                data: { userId, postId }
            });
            return { hidden: true };
        }
    },
    applyRankingAlgorithm(posts, algorithm) {
        const now = new Date().getTime();
        const rankedPosts = posts.map(post => {
            const createdAt = new Date(post.createdAt).getTime();
            const hoursOld = (now - createdAt) / (1000 * 60 * 60);
            let rankScore = 0;
            if (algorithm === 'hot') {
                // Hot algorithm: score / (hours + 2)^1.5
                rankScore = post.score / Math.pow(hoursOld + 2, 1.5);
            }
            else if (algorithm === 'rising') {
                // Rising algorithm: score / (hours + 1)
                rankScore = post.score / (hoursOld + 1);
            }
            return {
                ...post,
                rankScore
            };
        });
        // Sort by rank score
        return rankedPosts.sort((a, b) => b.rankScore - a.rankScore);
    },
    async getDrafts(userId) {
        return await database_1.prisma.post.findMany({
            where: {
                authorId: userId,
                isDraft: true,
                isRemoved: false,
            },
            include: {
                author: {
                    select: {
                        id: true,
                        username: true,
                        role: true,
                        avatar: true,
                        doctorVerificationStatus: true,
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
                flair: true,
            },
            orderBy: { updatedAt: 'desc' }
        });
    },
    async publishDraft(postId, userId) {
        // Verify ownership
        const post = await database_1.prisma.post.findUnique({
            where: { id: postId },
            select: { authorId: true, isDraft: true }
        });
        if (!post) {
            throw new Error('Post not found');
        }
        if (post.authorId !== userId) {
            throw new Error('Unauthorized');
        }
        if (!post.isDraft) {
            throw new Error('Post is not a draft');
        }
        return await database_1.prisma.post.update({
            where: { id: postId },
            data: {
                isDraft: false,
                publishedAt: new Date(),
            },
            include: {
                author: {
                    select: {
                        id: true,
                        username: true,
                        role: true,
                        avatar: true,
                        doctorVerificationStatus: true,
                    }
                },
                community: true,
                flair: true,
            }
        });
    },
    async getSavedPosts(userId, limit = 20, offset = 0) {
        const savedPosts = await database_1.prisma.savedPost.findMany({
            where: { userId },
            include: {
                post: {
                    include: {
                        author: {
                            select: {
                                id: true,
                                username: true,
                                role: true,
                                avatar: true,
                                doctorVerificationStatus: true,
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
                        flair: true,
                        _count: {
                            select: {
                                comments: true,
                                votes: true,
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip: offset
        });
        return savedPosts.map(sp => sp.post);
    },
    async getHiddenPosts(userId, limit = 20, offset = 0) {
        const hiddenPosts = await database_1.prisma.hiddenPost.findMany({
            where: { userId },
            include: {
                post: {
                    include: {
                        author: {
                            select: {
                                id: true,
                                username: true,
                                role: true,
                                avatar: true,
                                doctorVerificationStatus: true,
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
                        flair: true,
                        _count: {
                            select: {
                                comments: true,
                                votes: true,
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip: offset
        });
        return hiddenPosts.map(hp => hp.post);
    },
};
