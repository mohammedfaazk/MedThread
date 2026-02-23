"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.awardService = exports.AwardService = void 0;
const database_1 = require("@medthread/database");
const errors_1 = require("../utils/errors");
// Predefined award types
const DEFAULT_AWARDS = [
    {
        name: 'Helpful',
        description: 'For helpful medical advice',
        icon: '🏥',
        cost: 50,
        tier: 1,
        color: '#10b981'
    },
    {
        name: 'Informative',
        description: 'For educational content',
        icon: '📚',
        cost: 100,
        tier: 2,
        color: '#3b82f6'
    },
    {
        name: 'Life Saver',
        description: 'For potentially life-saving information',
        icon: '💊',
        cost: 200,
        tier: 3,
        color: '#ef4444'
    },
    {
        name: 'Expert Opinion',
        description: 'For expert medical insights',
        icon: '⭐',
        cost: 150,
        tier: 2,
        color: '#f59e0b'
    },
    {
        name: 'Compassionate',
        description: 'For showing empathy and care',
        icon: '❤️',
        cost: 75,
        tier: 1,
        color: '#ec4899'
    },
    {
        name: 'Gold Star',
        description: 'Premium recognition',
        icon: '🌟',
        cost: 500,
        tier: 4,
        color: '#fbbf24'
    }
];
class AwardService {
    /**
     * Initialize default awards in the database
     */
    async initializeDefaultAwards() {
        const existingAwards = await database_1.prisma.award.count();
        if (existingAwards === 0) {
            await database_1.prisma.award.createMany({
                data: DEFAULT_AWARDS,
                skipDuplicates: true
            });
            console.log('✅ Default awards initialized');
        }
    }
    /**
     * Get all available awards
     */
    async getAllAwards() {
        return await database_1.prisma.award.findMany({
            orderBy: [
                { tier: 'asc' },
                { cost: 'asc' }
            ],
            include: {
                _count: {
                    select: {
                        given: true
                    }
                }
            }
        });
    }
    /**
     * Get a specific award by ID
     */
    async getAwardById(awardId) {
        const award = await database_1.prisma.award.findUnique({
            where: { id: awardId },
            include: {
                _count: {
                    select: {
                        given: true
                    }
                }
            }
        });
        if (!award) {
            throw new errors_1.NotFoundError('Award not found');
        }
        return award;
    }
    /**
     * Create a new award (admin only)
     */
    async createAward(data) {
        // Check if award with same name exists
        const existing = await database_1.prisma.award.findUnique({
            where: { name: data.name }
        });
        if (existing) {
            throw new errors_1.ValidationError('Award with this name already exists');
        }
        return await database_1.prisma.award.create({
            data: {
                name: data.name,
                description: data.description,
                icon: data.icon,
                cost: data.cost,
                tier: data.tier || 1,
                color: data.color || '#gray'
            }
        });
    }
    /**
     * Give an award to a post or comment
     */
    async giveAward(data) {
        const { awardId, giverId, postId, commentId } = data;
        // Validate that either postId or commentId is provided
        if (!postId && !commentId) {
            throw new errors_1.ValidationError('Must specify either postId or commentId');
        }
        if (postId && commentId) {
            throw new errors_1.ValidationError('Cannot give award to both post and comment');
        }
        // Get award details
        const award = await this.getAwardById(awardId);
        // Get giver's coin balance
        const giver = await database_1.prisma.user.findUnique({
            where: { id: giverId },
            select: { coins: true }
        });
        if (!giver) {
            throw new errors_1.NotFoundError('User not found');
        }
        // Check if user has enough coins
        if (giver.coins < award.cost) {
            throw new errors_1.ValidationError(`Insufficient coins. Need ${award.cost}, have ${giver.coins}`);
        }
        // Verify post or comment exists
        if (postId) {
            const post = await database_1.prisma.post.findUnique({ where: { id: postId } });
            if (!post) {
                throw new errors_1.NotFoundError('Post not found');
            }
        }
        if (commentId) {
            const comment = await database_1.prisma.comment.findUnique({ where: { id: commentId } });
            if (!comment) {
                throw new errors_1.NotFoundError('Comment not found');
            }
        }
        // Use transaction to ensure atomicity
        const result = await database_1.prisma.$transaction(async (tx) => {
            // Deduct coins from giver
            await tx.user.update({
                where: { id: giverId },
                data: {
                    coins: {
                        decrement: award.cost
                    }
                }
            });
            // Create award given record
            const awardGiven = await tx.awardGiven.create({
                data: {
                    awardId,
                    giverId,
                    postId,
                    commentId
                },
                include: {
                    award: true,
                    giver: {
                        select: {
                            id: true,
                            username: true,
                            avatar: true
                        }
                    }
                }
            });
            // Get recipient ID
            let recipientId = null;
            if (postId) {
                const post = await tx.post.findUnique({
                    where: { id: postId },
                    select: { authorId: true }
                });
                recipientId = post?.authorId || null;
            }
            else if (commentId) {
                const comment = await tx.comment.findUnique({
                    where: { id: commentId },
                    select: { authorId: true }
                });
                recipientId = comment?.authorId || null;
            }
            // Create notification for recipient
            if (recipientId && recipientId !== giverId) {
                await tx.notification.create({
                    data: {
                        userId: recipientId,
                        type: 'AWARD_RECEIVED',
                        content: `You received a ${award.name} award!`,
                        link: postId ? `/post/${postId}` : `/comment/${commentId}`
                    }
                });
            }
            return awardGiven;
        });
        return result;
    }
    /**
     * Get awards given to a post
     */
    async getPostAwards(postId) {
        const awards = await database_1.prisma.awardGiven.findMany({
            where: { postId },
            include: {
                award: true,
                giver: {
                    select: {
                        id: true,
                        username: true,
                        avatar: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        // Group by award type and count
        const grouped = awards.reduce((acc, item) => {
            const awardName = item.award.name;
            if (!acc[awardName]) {
                acc[awardName] = {
                    award: item.award,
                    count: 0,
                    givers: []
                };
            }
            acc[awardName].count++;
            acc[awardName].givers.push(item.giver);
            return acc;
        }, {});
        return {
            total: awards.length,
            awards: Object.values(grouped)
        };
    }
    /**
     * Get awards given to a comment
     */
    async getCommentAwards(commentId) {
        const awards = await database_1.prisma.awardGiven.findMany({
            where: { commentId },
            include: {
                award: true,
                giver: {
                    select: {
                        id: true,
                        username: true,
                        avatar: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        // Group by award type and count
        const grouped = awards.reduce((acc, item) => {
            const awardName = item.award.name;
            if (!acc[awardName]) {
                acc[awardName] = {
                    award: item.award,
                    count: 0,
                    givers: []
                };
            }
            acc[awardName].count++;
            acc[awardName].givers.push(item.giver);
            return acc;
        }, {});
        return {
            total: awards.length,
            awards: Object.values(grouped)
        };
    }
    /**
     * Get awards given by a user
     */
    async getUserGivenAwards(userId, limit = 20, offset = 0) {
        const [awards, total] = await Promise.all([
            database_1.prisma.awardGiven.findMany({
                where: { giverId: userId },
                include: {
                    award: true,
                    post: {
                        select: {
                            id: true,
                            title: true,
                            author: {
                                select: {
                                    username: true
                                }
                            }
                        }
                    },
                    comment: {
                        select: {
                            id: true,
                            content: true,
                            author: {
                                select: {
                                    username: true
                                }
                            }
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                },
                take: limit,
                skip: offset
            }),
            database_1.prisma.awardGiven.count({
                where: { giverId: userId }
            })
        ]);
        return {
            awards,
            pagination: {
                limit,
                offset,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }
    /**
     * Get awards received by a user
     */
    async getUserReceivedAwards(userId) {
        const [postAwards, commentAwards] = await Promise.all([
            database_1.prisma.awardGiven.findMany({
                where: {
                    post: {
                        authorId: userId
                    }
                },
                include: {
                    award: true,
                    giver: {
                        select: {
                            id: true,
                            username: true,
                            avatar: true
                        }
                    }
                }
            }),
            database_1.prisma.awardGiven.findMany({
                where: {
                    comment: {
                        authorId: userId
                    }
                },
                include: {
                    award: true,
                    giver: {
                        select: {
                            id: true,
                            username: true,
                            avatar: true
                        }
                    }
                }
            })
        ]);
        const allAwards = [...postAwards, ...commentAwards];
        // Group by award type
        const grouped = allAwards.reduce((acc, item) => {
            const awardName = item.award.name;
            if (!acc[awardName]) {
                acc[awardName] = {
                    award: item.award,
                    count: 0
                };
            }
            acc[awardName].count++;
            return acc;
        }, {});
        return {
            total: allAwards.length,
            awards: Object.values(grouped)
        };
    }
    /**
     * Add coins to user (admin or purchase)
     */
    async addCoins(userId, amount, reason = 'Purchase') {
        if (amount <= 0) {
            throw new errors_1.ValidationError('Amount must be positive');
        }
        const user = await database_1.prisma.user.update({
            where: { id: userId },
            data: {
                coins: {
                    increment: amount
                }
            },
            select: {
                id: true,
                username: true,
                coins: true
            }
        });
        // Create notification
        await database_1.prisma.notification.create({
            data: {
                userId,
                type: 'COINS_ADDED',
                content: `You received ${amount} coins! Reason: ${reason}`
            }
        });
        return user;
    }
    /**
     * Get user's coin balance
     */
    async getUserCoins(userId) {
        const user = await database_1.prisma.user.findUnique({
            where: { id: userId },
            select: {
                coins: true,
                _count: {
                    select: {
                        givenAwards: true
                    }
                }
            }
        });
        if (!user) {
            throw new errors_1.NotFoundError('User not found');
        }
        return {
            coins: user.coins,
            awardsGiven: user._count.givenAwards
        };
    }
    /**
     * Get award statistics
     */
    async getAwardStats() {
        const [totalAwards, totalGiven, topAwards] = await Promise.all([
            database_1.prisma.award.count(),
            database_1.prisma.awardGiven.count(),
            database_1.prisma.awardGiven.groupBy({
                by: ['awardId'],
                _count: true,
                orderBy: {
                    _count: {
                        awardId: 'desc'
                    }
                },
                take: 5
            })
        ]);
        // Get award details for top awards
        const topAwardDetails = await Promise.all(topAwards.map(async (item) => {
            const award = await database_1.prisma.award.findUnique({
                where: { id: item.awardId }
            });
            return {
                award,
                count: item._count
            };
        }));
        return {
            totalAwardTypes: totalAwards,
            totalAwardsGiven: totalGiven,
            topAwards: topAwardDetails
        };
    }
}
exports.AwardService = AwardService;
exports.awardService = new AwardService();
