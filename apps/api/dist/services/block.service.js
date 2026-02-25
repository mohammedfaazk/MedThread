"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.blockService = exports.BlockService = void 0;
const database_1 = require("@medthread/database");
const socket_1 = require("../socket");
const prisma = new database_1.PrismaClient();
class BlockService {
    /**
     * Block a user
     */
    async blockUser(blockerId, blockedId) {
        // Validation: Cannot block self
        if (blockerId === blockedId) {
            throw new Error('Cannot block yourself');
        }
        // Check if already blocked
        const existingBlock = await prisma.block.findUnique({
            where: {
                blockerId_blockedId: {
                    blockerId,
                    blockedId,
                },
            },
        });
        if (existingBlock) {
            throw new Error('User is already blocked');
        }
        // Create block relationship
        const block = await prisma.block.create({
            data: {
                blockerId,
                blockedId,
            },
        });
        // Remove follow relationships (both directions)
        await Promise.all([
            prisma.follow.deleteMany({
                where: {
                    OR: [
                        { followerId: blockerId, followingId: blockedId },
                        { followerId: blockedId, followingId: blockerId },
                    ],
                },
            }),
        ]);
        // Deactivate conversations between users
        await this.deactivateConversations(blockerId, blockedId);
        // Delete pending notifications between users
        await this.deleteNotificationsBetweenUsers(blockerId, blockedId);
        // Cancel pending appointments
        await this.cancelAppointmentsBetweenUsers(blockerId, blockedId);
        // Emit real-time event
        try {
            const io = (0, socket_1.getSocketInstance)();
            io.to(`user:${blockedId}`).emit('blocked_by_user', {
                blockerId,
            });
        }
        catch (socketError) {
            console.error('[BLOCK] Socket notification failed:', socketError);
        }
        console.log(`[BLOCK] User ${blockerId} blocked user ${blockedId}`);
        return block;
    }
    /**
     * Unblock a user
     */
    async unblockUser(blockerId, blockedId) {
        const block = await prisma.block.findUnique({
            where: {
                blockerId_blockedId: {
                    blockerId,
                    blockedId,
                },
            },
        });
        if (!block) {
            throw new Error('User is not blocked');
        }
        await prisma.block.delete({
            where: {
                blockerId_blockedId: {
                    blockerId,
                    blockedId,
                },
            },
        });
        console.log(`[BLOCK] User ${blockerId} unblocked user ${blockedId}`);
        return { success: true };
    }
    /**
     * Check if user A has blocked user B
     */
    async isBlocked(blockerId, blockedId) {
        const block = await prisma.block.findUnique({
            where: {
                blockerId_blockedId: {
                    blockerId,
                    blockedId,
                },
            },
        });
        return !!block;
    }
    /**
     * Check if there's any block between two users (either direction)
     */
    async hasBlockBetween(userId1, userId2) {
        const block = await prisma.block.findFirst({
            where: {
                OR: [
                    { blockerId: userId1, blockedId: userId2 },
                    { blockerId: userId2, blockedId: userId1 },
                ],
            },
        });
        return !!block;
    }
    /**
     * Get list of users blocked by a user
     */
    async getBlockedUsers(userId, cursor, limit = 20) {
        const blocks = await prisma.block.findMany({
            where: { blockerId: userId },
            include: {
                blocked: {
                    select: {
                        id: true,
                        username: true,
                        avatar: true,
                        role: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
            take: limit + 1,
            ...(cursor && {
                cursor: { id: cursor },
                skip: 1,
            }),
        });
        const hasMore = blocks.length > limit;
        const items = hasMore ? blocks.slice(0, limit) : blocks;
        const nextCursor = hasMore ? items[items.length - 1].id : null;
        return {
            blocks: items.map((b) => b.blocked),
            pagination: {
                hasMore,
                nextCursor,
            },
        };
    }
    /**
     * Get list of users who blocked a user
     */
    async getBlockedByUsers(userId) {
        const blocks = await prisma.block.findMany({
            where: { blockedId: userId },
            select: {
                blockerId: true,
            },
        });
        return blocks.map((b) => b.blockerId);
    }
    /**
     * Deactivate conversations between two users
     */
    async deactivateConversations(userId1, userId2) {
        try {
            await prisma.conversation.updateMany({
                where: {
                    OR: [
                        { patientId: userId1, doctorId: userId2 },
                        { patientId: userId2, doctorId: userId1 },
                    ],
                },
                data: {
                    isActive: false,
                },
            });
            console.log(`[BLOCK] Deactivated conversations between ${userId1} and ${userId2}`);
        }
        catch (error) {
            console.error('[BLOCK] Error deactivating conversations:', error);
        }
    }
    /**
     * Delete notifications between two users
     */
    async deleteNotificationsBetweenUsers(userId1, userId2) {
        try {
            await prisma.notification.deleteMany({
                where: {
                    OR: [
                        { recipientId: userId1, actorId: userId2 },
                        { recipientId: userId2, actorId: userId1 },
                    ],
                },
            });
            console.log(`[BLOCK] Deleted notifications between ${userId1} and ${userId2}`);
        }
        catch (error) {
            console.error('[BLOCK] Error deleting notifications:', error);
        }
    }
    /**
     * Cancel appointments between two users
     */
    async cancelAppointmentsBetweenUsers(userId1, userId2) {
        try {
            await prisma.appointment.updateMany({
                where: {
                    OR: [
                        { patientId: userId1, doctorId: userId2 },
                        { patientId: userId2, doctorId: userId1 },
                    ],
                    status: {
                        in: ['PENDING', 'APPROVED'],
                    },
                },
                data: {
                    status: 'CANCELLED',
                },
            });
            console.log(`[BLOCK] Cancelled appointments between ${userId1} and ${userId2}`);
        }
        catch (error) {
            console.error('[BLOCK] Error cancelling appointments:', error);
        }
    }
    /**
     * Get blocked user IDs for filtering queries
     */
    async getBlockedUserIds(userId) {
        const [blockedByMe, blockedMe] = await Promise.all([
            prisma.block.findMany({
                where: { blockerId: userId },
                select: { blockedId: true },
            }),
            prisma.block.findMany({
                where: { blockedId: userId },
                select: { blockerId: true },
            }),
        ]);
        const blockedIds = [
            ...blockedByMe.map((b) => b.blockedId),
            ...blockedMe.map((b) => b.blockerId),
        ];
        return [...new Set(blockedIds)]; // Remove duplicates
    }
}
exports.BlockService = BlockService;
exports.blockService = new BlockService();
