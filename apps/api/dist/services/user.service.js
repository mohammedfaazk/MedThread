"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userService = exports.UserService = void 0;
const database_1 = require("@medthread/database");
const errors_1 = require("../utils/errors");
class UserService {
    async getUserById(userId) {
        const user = await database_1.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
                verified: true,
                specialty: true,
                bio: true,
                avatar: true,
                banner: true,
                postKarma: true,
                commentKarma: true,
                totalKarma: true,
                isPremium: true,
                createdAt: true,
                _count: {
                    select: {
                        posts: true,
                        comments: true,
                        followers: true,
                        following: true,
                    }
                }
            }
        });
        if (!user) {
            throw new errors_1.NotFoundError('User not found');
        }
        return user;
    }
    async getUserByUsername(username) {
        const user = await database_1.prisma.user.findUnique({
            where: { username },
            select: {
                id: true,
                username: true,
                role: true,
                verified: true,
                specialty: true,
                bio: true,
                avatar: true,
                banner: true,
                postKarma: true,
                commentKarma: true,
                totalKarma: true,
                isPremium: true,
                createdAt: true,
                _count: {
                    select: {
                        posts: true,
                        comments: true,
                        followers: true,
                        following: true,
                    }
                }
            }
        });
        if (!user) {
            throw new errors_1.NotFoundError('User not found');
        }
        return user;
    }
    async updateUser(userId, data) {
        const user = await database_1.prisma.user.update({
            where: { id: userId },
            data,
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
                verified: true,
                specialty: true,
                bio: true,
                avatar: true,
                banner: true,
            }
        });
        return user;
    }
    async followUser(followerId, followingId) {
        if (followerId === followingId) {
            throw new errors_1.ValidationError('Cannot follow yourself');
        }
        // Check if already following
        const existingFollow = await database_1.prisma.follow.findUnique({
            where: {
                followerId_followingId: {
                    followerId,
                    followingId
                }
            }
        });
        if (existingFollow) {
            throw new errors_1.ValidationError('Already following this user');
        }
        const follow = await database_1.prisma.follow.create({
            data: {
                followerId,
                followingId
            }
        });
        return follow;
    }
    async unfollowUser(followerId, followingId) {
        const follow = await database_1.prisma.follow.findUnique({
            where: {
                followerId_followingId: {
                    followerId,
                    followingId
                }
            }
        });
        if (!follow) {
            throw new errors_1.NotFoundError('Follow relationship not found');
        }
        await database_1.prisma.follow.delete({
            where: {
                followerId_followingId: {
                    followerId,
                    followingId
                }
            }
        });
        return { message: 'Unfollowed successfully' };
    }
    async getUserFollowers(userId, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [followers, total] = await Promise.all([
            database_1.prisma.follow.findMany({
                where: { followingId: userId },
                include: {
                    follower: {
                        select: {
                            id: true,
                            username: true,
                            avatar: true,
                            role: true,
                            verified: true,
                        }
                    }
                },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' }
            }),
            database_1.prisma.follow.count({ where: { followingId: userId } })
        ]);
        return {
            followers: followers.map(f => f.follower),
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }
    async getUserFollowing(userId, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [following, total] = await Promise.all([
            database_1.prisma.follow.findMany({
                where: { followerId: userId },
                include: {
                    following: {
                        select: {
                            id: true,
                            username: true,
                            avatar: true,
                            role: true,
                            verified: true,
                        }
                    }
                },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' }
            }),
            database_1.prisma.follow.count({ where: { followerId: userId } })
        ]);
        return {
            following: following.map(f => f.following),
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }
}
exports.UserService = UserService;
exports.userService = new UserService();
