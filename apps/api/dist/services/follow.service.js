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
exports.followService = exports.FollowService = void 0;
const database_1 = require("@medthread/database");
const database_2 = require("@medthread/database");
class FollowService {
    /**
     * Follow a user (verified doctors only)
     */
    async followUser(followerId, followingId) {
        // Validation: Cannot follow self
        if (followerId === followingId) {
            throw new Error('Cannot follow yourself');
        }
        // Check if user to follow exists and is a verified doctor
        const userToFollow = await database_1.prisma.user.findUnique({
            where: { id: followingId },
            select: {
                id: true,
                role: true,
                doctorVerificationStatus: true,
                isSuspended: true,
            },
        });
        if (!userToFollow) {
            throw new Error('User not found');
        }
        if (userToFollow.isSuspended) {
            throw new Error('Cannot follow suspended users');
        }
        if (userToFollow.role !== 'DOCTOR') {
            throw new Error('Can only follow verified doctors');
        }
        if (userToFollow.doctorVerificationStatus !== database_2.DoctorVerificationStatus.APPROVED) {
            throw new Error('Can only follow verified doctors');
        }
        // Check if blocked
        const isBlocked = await database_1.prisma.block.findFirst({
            where: {
                OR: [
                    { blockerId: followerId, blockedId: followingId },
                    { blockerId: followingId, blockedId: followerId },
                ],
            },
        });
        if (isBlocked) {
            throw new Error('Cannot follow blocked users');
        }
        // Check if already following
        const existingFollow = await database_1.prisma.follow.findUnique({
            where: {
                followerId_followingId: {
                    followerId,
                    followingId,
                },
            },
        });
        if (existingFollow) {
            throw new Error('Already following this user');
        }
        // Create follow relationship
        const follow = await database_1.prisma.follow.create({
            data: {
                followerId,
                followingId,
            },
            include: {
                following: {
                    select: {
                        id: true,
                        username: true,
                        avatar: true,
                        role: true,
                        specialty: true,
                    },
                },
            },
        });
        // Create notification
        try {
            const { notificationService } = await Promise.resolve().then(() => __importStar(require('./notification.service')));
            await notificationService.createNotification({
                type: 'FOLLOWER',
                recipientIds: [followingId],
                actorId: followerId,
                contentId: followerId,
                contentType: 'POST', // Using POST as placeholder
                metadata: {
                    link: `/u/${follow.following.username}`,
                },
            });
        }
        catch (error) {
            console.error('Error creating follow notification:', error);
        }
        // Check follower badges in background
        try {
            const { badgeService } = await Promise.resolve().then(() => __importStar(require('./badge.service')));
            badgeService.checkFollowerBadges(followingId).catch(err => {
                console.error('Error checking follower badges:', err);
            });
        }
        catch (error) {
            console.error('Error creating follow notification:', error);
        }
        // Check follower badges in background
        try {
            const { badgeService } = await Promise.resolve().then(() => __importStar(require('./badge.service')));
            badgeService.checkFollowerBadges(followingId).catch(err => {
                console.error('Error checking follower badges:', err);
            });
        }
        catch (error) {
            console.error('Error importing badge service:', error);
        }
        return follow;
    }
    /**
     * Unfollow a user
     */
    async unfollowUser(followerId, followingId) {
        const follow = await database_1.prisma.follow.findUnique({
            where: {
                followerId_followingId: {
                    followerId,
                    followingId,
                },
            },
        });
        if (!follow) {
            throw new Error('Not following this user');
        }
        await database_1.prisma.follow.delete({
            where: {
                id: follow.id,
            },
        });
        return { success: true };
    }
    /**
     * Check if user is following another user
     */
    async isFollowing(followerId, followingId) {
        const follow = await database_1.prisma.follow.findUnique({
            where: {
                followerId_followingId: {
                    followerId,
                    followingId,
                },
            },
        });
        return !!follow;
    }
    /**
     * Get followers list with cursor pagination
     */
    async getFollowers(userId, cursor, limit = 20) {
        const followers = await database_1.prisma.follow.findMany({
            where: { followingId: userId },
            take: limit + 1,
            ...(cursor && {
                cursor: { id: cursor },
                skip: 1,
            }),
            orderBy: { createdAt: 'desc' },
            include: {
                follower: {
                    select: {
                        id: true,
                        username: true,
                        avatar: true,
                        role: true,
                        bio: true,
                        totalKarma: true,
                        verified: true,
                    },
                },
            },
        });
        const hasMore = followers.length > limit;
        const data = hasMore ? followers.slice(0, -1) : followers;
        const nextCursor = hasMore ? data[data.length - 1].id : null;
        return {
            followers: data.map((f) => f.follower),
            pagination: {
                nextCursor,
                hasMore,
            },
        };
    }
    /**
     * Get following list with cursor pagination
     */
    async getFollowing(userId, cursor, limit = 20) {
        const following = await database_1.prisma.follow.findMany({
            where: { followerId: userId },
            take: limit + 1,
            ...(cursor && {
                cursor: { id: cursor },
                skip: 1,
            }),
            orderBy: { createdAt: 'desc' },
            include: {
                following: {
                    select: {
                        id: true,
                        username: true,
                        avatar: true,
                        role: true,
                        specialty: true,
                        bio: true,
                        totalKarma: true,
                        verified: true,
                        doctorVerificationStatus: true,
                    },
                },
            },
        });
        const hasMore = following.length > limit;
        const data = hasMore ? following.slice(0, -1) : following;
        const nextCursor = hasMore ? data[data.length - 1].id : null;
        return {
            following: data.map((f) => f.following),
            pagination: {
                nextCursor,
                hasMore,
            },
        };
    }
    /**
     * Get follower/following counts
     */
    async getFollowCounts(userId) {
        const [followersCount, followingCount] = await Promise.all([
            database_1.prisma.follow.count({ where: { followingId: userId } }),
            database_1.prisma.follow.count({ where: { followerId: userId } }),
        ]);
        return {
            followersCount,
            followingCount,
        };
    }
    /**
     * Get posts from followed users (feed aggregation)
     */
    async getFollowingFeed(userId, cursor, limit = 20) {
        // Get list of followed user IDs
        const following = await database_1.prisma.follow.findMany({
            where: { followerId: userId },
            select: { followingId: true },
        });
        const followingIds = following.map((f) => f.followingId);
        if (followingIds.length === 0) {
            return {
                posts: [],
                pagination: {
                    nextCursor: null,
                    hasMore: false,
                },
            };
        }
        // Get posts from followed users
        const posts = await database_1.prisma.post.findMany({
            where: {
                authorId: { in: followingIds },
                isDeleted: false,
            },
            take: limit + 1,
            ...(cursor && {
                cursor: { id: cursor },
                skip: 1,
            }),
            orderBy: { createdAt: 'desc' },
            include: {
                author: {
                    select: {
                        id: true,
                        username: true,
                        avatar: true,
                        role: true,
                        specialty: true,
                        verified: true,
                        doctorVerificationStatus: true,
                    },
                },
                community: {
                    select: {
                        id: true,
                        name: true,
                        displayName: true,
                        icon: true,
                    },
                },
                _count: {
                    select: {
                        comments: true,
                        votes: true,
                    },
                },
            },
        });
        const hasMore = posts.length > limit;
        const data = hasMore ? posts.slice(0, -1) : posts;
        const nextCursor = hasMore ? data[data.length - 1].id : null;
        return {
            posts: data,
            pagination: {
                nextCursor,
                hasMore,
            },
        };
    }
    /**
     * Get verified doctors to follow (recommendations)
     */
    async getVerifiedDoctorsToFollow(userId, specialty, cursor, limit = 20) {
        // Get users already following
        const following = await database_1.prisma.follow.findMany({
            where: { followerId: userId },
            select: { followingId: true },
        });
        const followingIds = following.map((f) => f.followingId);
        // Get blocked users
        const blocked = await database_1.prisma.block.findMany({
            where: {
                OR: [{ blockerId: userId }, { blockedId: userId }],
            },
            select: { blockerId: true, blockedId: true },
        });
        const blockedIds = [
            ...blocked.map((b) => b.blockedId),
            ...blocked.map((b) => b.blockerId),
        ].filter((id) => id !== userId);
        const doctors = await database_1.prisma.user.findMany({
            where: {
                role: 'DOCTOR',
                doctorVerificationStatus: database_2.DoctorVerificationStatus.APPROVED,
                isSuspended: false,
                id: {
                    notIn: [...followingIds, ...blockedIds, userId],
                },
                ...(specialty && { specialty }),
            },
            take: limit + 1,
            ...(cursor && {
                cursor: { id: cursor },
                skip: 1,
            }),
            orderBy: [{ totalKarma: 'desc' }, { createdAt: 'desc' }],
            select: {
                id: true,
                username: true,
                avatar: true,
                bio: true,
                specialty: true,
                subSpecialty: true,
                yearsOfExperience: true,
                hospitalAffiliation: true,
                totalKarma: true,
                verified: true,
                _count: {
                    select: {
                        followers: true,
                        posts: true,
                    },
                },
            },
        });
        const hasMore = doctors.length > limit;
        const data = hasMore ? doctors.slice(0, -1) : doctors;
        const nextCursor = hasMore ? data[data.length - 1].id : null;
        return {
            doctors: data,
            pagination: {
                nextCursor,
                hasMore,
            },
        };
    }
    /**
     * Bulk check if following multiple users
     */
    async checkFollowingMultiple(followerId, userIds) {
        const follows = await database_1.prisma.follow.findMany({
            where: {
                followerId,
                followingId: { in: userIds },
            },
            select: { followingId: true },
        });
        const followingSet = new Set(follows.map((f) => f.followingId));
        return userIds.reduce((acc, userId) => {
            acc[userId] = followingSet.has(userId);
            return acc;
        }, {});
    }
}
exports.FollowService = FollowService;
exports.followService = new FollowService();
