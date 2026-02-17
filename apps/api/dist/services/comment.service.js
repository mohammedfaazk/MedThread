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
exports.commentService = void 0;
const database_1 = require("@medthread/database");
exports.commentService = {
    async createComment(data) {
        // Calculate depth if it's a reply
        let depth = 0;
        if (data.parentId) {
            const parent = await database_1.prisma.comment.findUnique({
                where: { id: data.parentId },
                select: { depth: true }
            });
            depth = (parent?.depth || 0) + 1;
            // Limit nesting to 10 levels
            if (depth > 10) {
                throw new Error('Maximum comment nesting depth reached');
            }
        }
        const comment = await database_1.prisma.comment.create({
            data: {
                content: data.content,
                authorId: data.authorId,
                postId: data.postId,
                parentId: data.parentId,
                depth,
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
                _count: {
                    select: {
                        replies: true,
                        votes: true,
                    }
                }
            }
        });
        // Update post comment count
        await database_1.prisma.post.update({
            where: { id: data.postId },
            data: {
                commentCount: { increment: 1 }
            }
        });
        return comment;
    },
    async getCommentsByPost(postId, userId) {
        const comments = await database_1.prisma.comment.findMany({
            where: {
                postId,
                isRemoved: false,
            },
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
                _count: {
                    select: {
                        replies: true,
                        votes: true,
                    }
                }
            },
            orderBy: {
                createdAt: 'asc'
            }
        });
        // Get user votes if userId provided
        let userVotes = {};
        if (userId) {
            const votes = await database_1.prisma.vote.findMany({
                where: {
                    userId,
                    commentId: { in: comments.map(c => c.id) }
                }
            });
            userVotes = votes.reduce((acc, vote) => {
                acc[vote.commentId] = vote.value;
                return acc;
            }, {});
        }
        // Build comment tree
        return this.buildCommentTree(comments, userVotes);
    },
    buildCommentTree(comments, userVotes = {}) {
        const commentMap = new Map();
        const rootComments = [];
        // First pass: create map
        comments.forEach(comment => {
            commentMap.set(comment.id, {
                ...comment,
                replies: [],
                userVote: userVotes[comment.id] || null,
            });
        });
        // Second pass: build tree
        comments.forEach(comment => {
            const commentNode = commentMap.get(comment.id);
            if (comment.parentId) {
                const parent = commentMap.get(comment.parentId);
                if (parent) {
                    parent.replies.push(commentNode);
                }
            }
            else {
                rootComments.push(commentNode);
            }
        });
        return rootComments;
    },
    async updateComment(commentId, userId, content) {
        // Verify ownership
        const comment = await database_1.prisma.comment.findUnique({
            where: { id: commentId },
            select: { authorId: true }
        });
        if (!comment) {
            throw new Error('Comment not found');
        }
        if (comment.authorId !== userId) {
            throw new Error('Unauthorized');
        }
        return await database_1.prisma.comment.update({
            where: { id: commentId },
            data: {
                content,
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
                }
            }
        });
    },
    async deleteComment(commentId, userId) {
        // Verify ownership
        const comment = await database_1.prisma.comment.findUnique({
            where: { id: commentId },
            select: { authorId: true, postId: true }
        });
        if (!comment) {
            throw new Error('Comment not found');
        }
        if (comment.authorId !== userId) {
            throw new Error('Unauthorized');
        }
        // Soft delete
        const deleted = await database_1.prisma.comment.update({
            where: { id: commentId },
            data: {
                isRemoved: true,
                content: '[deleted]',
            }
        });
        // Update post comment count
        await database_1.prisma.post.update({
            where: { id: comment.postId },
            data: {
                commentCount: { decrement: 1 }
            }
        });
        return deleted;
    },
    async voteComment(commentId, userId, value) {
        if (value !== 1 && value !== -1) {
            throw new Error('Vote value must be 1 or -1');
        }
        // Check if vote exists
        const existingVote = await database_1.prisma.vote.findUnique({
            where: {
                userId_commentId: {
                    userId,
                    commentId
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
                data: { userId, commentId, value }
            });
            voteChange = value;
        }
        // Update comment score
        const comment = await database_1.prisma.comment.update({
            where: { id: commentId },
            data: {
                upvotes: value === 1 ? { increment: voteChange > 0 ? 1 : -1 } : undefined,
                downvotes: value === -1 ? { increment: voteChange < 0 ? 1 : -1 } : undefined,
                score: { increment: voteChange }
            },
            select: {
                score: true,
                upvotes: true,
                downvotes: true,
                authorId: true,
            }
        });
        // Update author karma
        const { karmaService } = await Promise.resolve().then(() => __importStar(require('./karma.service')));
        await karmaService.updateUserKarma(comment.authorId);
        return {
            score: comment.score,
            upvotes: comment.upvotes,
            downvotes: comment.downvotes,
        };
    },
};
