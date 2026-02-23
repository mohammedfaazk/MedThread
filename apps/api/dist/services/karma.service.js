"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.karmaService = exports.KarmaService = void 0;
const database_1 = require("@medthread/database");
const errors_1 = require("../utils/errors");
const KARMA_MILESTONES = [
    { level: 1, name: 'Newcomer', minKarma: 0, maxKarma: 99, badge: '🌱', color: '#94a3b8' },
    { level: 2, name: 'Contributor', minKarma: 100, maxKarma: 499, badge: '📝', color: '#60a5fa' },
    { level: 3, name: 'Active Member', minKarma: 500, maxKarma: 999, badge: '⭐', color: '#34d399' },
    { level: 4, name: 'Trusted Voice', minKarma: 1000, maxKarma: 2499, badge: '💎', color: '#a78bfa' },
    { level: 5, name: 'Expert', minKarma: 2500, maxKarma: 4999, badge: '🏆', color: '#f59e0b' },
    { level: 6, name: 'Master', minKarma: 5000, maxKarma: 9999, badge: '👑', color: '#ef4444' },
    { level: 7, name: 'Legend', minKarma: 10000, maxKarma: Infinity, badge: '🌟', color: '#fbbf24' },
];
class KarmaService {
    /**
     * Update user's karma based on all their votes
     */
    async updateUserKarma(userId) {
        // Calculate post karma
        const postKarma = await database_1.prisma.vote.aggregate({
            _sum: { value: true },
            where: {
                post: { authorId: userId }
            }
        });
        // Calculate comment karma
        const commentKarma = await database_1.prisma.vote.aggregate({
            _sum: { value: true },
            where: {
                comment: { authorId: userId }
            }
        });
        // Get post and comment counts
        const [postCount, commentCount] = await Promise.all([
            database_1.prisma.post.count({ where: { authorId: userId, isDraft: false } }),
            database_1.prisma.comment.count({ where: { authorId: userId } })
        ]);
        const postKarmaValue = postKarma._sum.value || 0;
        const commentKarmaValue = commentKarma._sum.value || 0;
        const totalKarma = postKarmaValue + commentKarmaValue;
        // Update user karma
        await database_1.prisma.user.update({
            where: { id: userId },
            data: {
                postKarma: postKarmaValue,
                commentKarma: commentKarmaValue,
                totalKarma
            }
        });
        return {
            postKarma: postKarmaValue,
            commentKarma: commentKarmaValue,
            totalKarma,
            postCount,
            commentCount,
            averagePostKarma: postCount > 0 ? postKarmaValue / postCount : 0,
            averageCommentKarma: commentCount > 0 ? commentKarmaValue / commentCount : 0
        };
    }
    /**
     * Get user's karma breakdown
     */
    async getUserKarma(userId) {
        const user = await database_1.prisma.user.findUnique({
            where: { id: userId },
            select: {
                postKarma: true,
                commentKarma: true,
                totalKarma: true,
                _count: {
                    select: {
                        posts: true,
                        comments: true
                    }
                }
            }
        });
        if (!user) {
            throw new errors_1.NotFoundError('User not found');
        }
        const milestone = this.getKarmaMilestone(user.totalKarma);
        return {
            postKarma: user.postKarma,
            commentKarma: user.commentKarma,
            totalKarma: user.totalKarma,
            postCount: user._count.posts,
            commentCount: user._count.comments,
            averagePostKarma: user._count.posts > 0 ? user.postKarma / user._count.posts : 0,
            averageCommentKarma: user._count.comments > 0 ? user.commentKarma / user._count.comments : 0,
            milestone
        };
    }
    /**
     * Get karma milestone for a given karma value
     */
    getKarmaMilestone(karma) {
        for (let i = KARMA_MILESTONES.length - 1; i >= 0; i--) {
            if (karma >= KARMA_MILESTONES[i].minKarma) {
                return KARMA_MILESTONES[i];
            }
        }
        return KARMA_MILESTONES[0];
    }
    /**
     * Get all karma milestones
     */
    getAllMilestones() {
        return KARMA_MILESTONES;
    }
    /**
     * Get global karma leaderboard
     */
    async getLeaderboard(limit = 50, offset = 0) {
        const [users, total] = await Promise.all([
            database_1.prisma.user.findMany({
                where: {
                    isSuspended: false,
                    isShadowBanned: false
                },
                orderBy: { totalKarma: 'desc' },
                take: limit,
                skip: offset,
                select: {
                    id: true,
                    username: true,
                    avatar: true,
                    role: true,
                    verified: true,
                    specialty: true,
                    totalKarma: true,
                    postKarma: true,
                    commentKarma: true,
                    doctorVerificationStatus: true,
                    _count: {
                        select: {
                            posts: true,
                            comments: true
                        }
                    }
                }
            }),
            database_1.prisma.user.count({
                where: {
                    isSuspended: false,
                    isShadowBanned: false
                }
            })
        ]);
        // Add milestones and rankings
        const usersWithMilestones = users.map((user, index) => ({
            ...user,
            rank: offset + index + 1,
            milestone: this.getKarmaMilestone(user.totalKarma)
        }));
        return {
            users: usersWithMilestones,
            pagination: {
                limit,
                offset,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }
    /**
     * Get doctor karma leaderboard
     */
    async getDoctorLeaderboard(limit = 50, offset = 0) {
        const [doctors, total] = await Promise.all([
            database_1.prisma.user.findMany({
                where: {
                    doctorVerificationStatus: 'APPROVED',
                    isSuspended: false,
                    isShadowBanned: false
                },
                orderBy: { totalKarma: 'desc' },
                take: limit,
                skip: offset,
                select: {
                    id: true,
                    username: true,
                    avatar: true,
                    role: true,
                    verified: true,
                    specialty: true,
                    subSpecialty: true,
                    yearsOfExperience: true,
                    totalKarma: true,
                    postKarma: true,
                    commentKarma: true,
                    doctorVerificationStatus: true,
                    _count: {
                        select: {
                            posts: true,
                            comments: true
                        }
                    }
                }
            }),
            database_1.prisma.user.count({
                where: {
                    doctorVerificationStatus: 'APPROVED',
                    isSuspended: false,
                    isShadowBanned: false
                }
            })
        ]);
        const doctorsWithMilestones = doctors.map((doctor, index) => ({
            ...doctor,
            rank: offset + index + 1,
            milestone: this.getKarmaMilestone(doctor.totalKarma)
        }));
        return {
            doctors: doctorsWithMilestones,
            pagination: {
                limit,
                offset,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }
    /**
     * Get specialty-specific leaderboard
     */
    async getSpecialtyLeaderboard(specialty, limit = 20, offset = 0) {
        const [doctors, total] = await Promise.all([
            database_1.prisma.user.findMany({
                where: {
                    specialty: {
                        contains: specialty,
                        mode: 'insensitive'
                    },
                    doctorVerificationStatus: 'APPROVED',
                    isSuspended: false,
                    isShadowBanned: false
                },
                orderBy: { totalKarma: 'desc' },
                take: limit,
                skip: offset,
                select: {
                    id: true,
                    username: true,
                    avatar: true,
                    role: true,
                    verified: true,
                    specialty: true,
                    subSpecialty: true,
                    totalKarma: true,
                    postKarma: true,
                    commentKarma: true,
                    _count: {
                        select: {
                            posts: true,
                            comments: true
                        }
                    }
                }
            }),
            database_1.prisma.user.count({
                where: {
                    specialty: {
                        contains: specialty,
                        mode: 'insensitive'
                    },
                    doctorVerificationStatus: 'APPROVED',
                    isSuspended: false,
                    isShadowBanned: false
                }
            })
        ]);
        const doctorsWithMilestones = doctors.map((doctor, index) => ({
            ...doctor,
            rank: offset + index + 1,
            milestone: this.getKarmaMilestone(doctor.totalKarma)
        }));
        return {
            specialty,
            doctors: doctorsWithMilestones,
            pagination: {
                limit,
                offset,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }
    /**
     * Get user's karma rank
     */
    async getUserRank(userId) {
        const user = await database_1.prisma.user.findUnique({
            where: { id: userId },
            select: { totalKarma: true }
        });
        if (!user) {
            throw new errors_1.NotFoundError('User not found');
        }
        const [higherRanked, totalUsers] = await Promise.all([
            database_1.prisma.user.count({
                where: {
                    totalKarma: { gt: user.totalKarma },
                    isSuspended: false,
                    isShadowBanned: false
                }
            }),
            database_1.prisma.user.count({
                where: {
                    isSuspended: false,
                    isShadowBanned: false
                }
            })
        ]);
        const rank = higherRanked + 1;
        const percentile = totalUsers > 0 ? ((totalUsers - rank) / totalUsers) * 100 : 0;
        return {
            rank,
            totalUsers,
            percentile: Math.round(percentile * 100) / 100
        };
    }
    /**
     * Get karma statistics for the platform
     */
    async getKarmaStats() {
        const [totalKarma, avgKarma, topUser, recentActivity] = await Promise.all([
            database_1.prisma.user.aggregate({
                _sum: { totalKarma: true }
            }),
            database_1.prisma.user.aggregate({
                _avg: { totalKarma: true }
            }),
            database_1.prisma.user.findFirst({
                where: {
                    isSuspended: false,
                    isShadowBanned: false
                },
                orderBy: { totalKarma: 'desc' },
                select: {
                    username: true,
                    totalKarma: true,
                    avatar: true
                }
            }),
            database_1.prisma.vote.count({
                where: {
                    createdAt: {
                        gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
                    }
                }
            })
        ]);
        return {
            totalKarma: totalKarma._sum.totalKarma || 0,
            averageKarma: Math.round(avgKarma._avg.totalKarma || 0),
            topUser,
            recentVotes24h: recentActivity
        };
    }
}
exports.KarmaService = KarmaService;
exports.karmaService = new KarmaService();
