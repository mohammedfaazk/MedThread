"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.accountService = exports.AccountService = void 0;
const database_1 = require("@medthread/database");
const errors_1 = require("../utils/errors");
class AccountService {
    /**
     * Deactivate user account (soft delete - reversible)
     */
    async deactivateAccount(userId) {
        const user = await database_1.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                username: true,
                email: true,
                isSuspended: true,
            }
        });
        if (!user) {
            throw new errors_1.NotFoundError('User not found');
        }
        if (user.isSuspended) {
            throw new errors_1.ValidationError('Account is already deactivated');
        }
        // Deactivate account (soft delete)
        await database_1.prisma.user.update({
            where: { id: userId },
            data: {
                isSuspended: true,
                isShadowBanned: true,
            }
        });
        return {
            success: true,
            message: 'Account deactivated successfully. You can reactivate it by logging in again.',
            username: user.username,
            email: user.email,
        };
    }
    /**
     * Reactivate user account
     */
    async reactivateAccount(userId) {
        const user = await database_1.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                username: true,
                isSuspended: true,
            }
        });
        if (!user) {
            throw new errors_1.NotFoundError('User not found');
        }
        if (!user.isSuspended) {
            throw new errors_1.ValidationError('Account is not deactivated');
        }
        await database_1.prisma.user.update({
            where: { id: userId },
            data: {
                isSuspended: false,
                isShadowBanned: false,
            }
        });
        return {
            success: true,
            message: 'Account reactivated successfully',
            username: user.username,
        };
    }
    /**
     * Permanently delete user account and all associated data
     */
    async deleteAccountPermanently(userId) {
        const user = await database_1.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                username: true,
                email: true,
            }
        });
        if (!user) {
            throw new errors_1.NotFoundError('User not found');
        }
        // Use transaction to ensure all-or-nothing deletion
        await database_1.prisma.$transaction(async (tx) => {
            // Delete in order to respect foreign key constraints
            // 1. Notifications
            await tx.notification.deleteMany({ where: { userId } });
            // 2. Reports
            await tx.report.deleteMany({ where: { userId } });
            // 3. Messages
            await tx.message.deleteMany({ where: { senderId: userId } });
            await tx.message.deleteMany({ where: { receiverId: userId } });
            // 4. Blocks
            await tx.block.deleteMany({ where: { blockerId: userId } });
            await tx.block.deleteMany({ where: { blockedId: userId } });
            // 5. Follows
            await tx.follow.deleteMany({ where: { followerId: userId } });
            await tx.follow.deleteMany({ where: { followingId: userId } });
            // 6. Community memberships
            await tx.communityMember.deleteMany({ where: { userId } });
            // 7. Community moderator roles
            await tx.communityModerator.deleteMany({ where: { userId } });
            // 8. Hidden posts
            await tx.hiddenPost.deleteMany({ where: { userId } });
            // 9. Saved comments
            await tx.savedComment.deleteMany({ where: { userId } });
            // 10. Saved posts
            await tx.savedPost.deleteMany({ where: { userId } });
            // 11. Awards given
            await tx.awardGiven.deleteMany({ where: { giverId: userId } });
            // 12. Votes
            await tx.vote.deleteMany({ where: { userId } });
            // 13. Comments (cascade deletes awards on comments)
            await tx.comment.deleteMany({ where: { authorId: userId } });
            // 14. Posts (cascade deletes awards on posts)
            await tx.post.deleteMany({ where: { authorId: userId } });
            // 15. Availabilities
            await tx.availability.deleteMany({ where: { doctorId: userId } });
            // 16. Appointments
            await tx.appointment.deleteMany({ where: { doctorId: userId } });
            await tx.appointment.deleteMany({ where: { patientId: userId } });
            // 17. Thread replies
            await tx.threadReply.deleteMany({ where: { authorId: userId } });
            // 18. Timeline events
            await tx.caseTimelineEvent.deleteMany({ where: { userId } });
            // 19. Medical threads
            await tx.medicalThread.deleteMany({ where: { patientId: userId } });
            // 20. Finally, delete the user
            await tx.user.delete({ where: { id: userId } });
        });
        return {
            success: true,
            message: 'Account permanently deleted',
            username: user.username,
            email: user.email,
        };
    }
    /**
     * Get account deletion preview (what will be deleted)
     */
    async getAccountDeletionPreview(userId) {
        const user = await database_1.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
                createdAt: true,
            }
        });
        if (!user) {
            throw new errors_1.NotFoundError('User not found');
        }
        // Count all associated data
        const [postsCount, commentsCount, votesCount, awardsGivenCount, savedPostsCount, savedCommentsCount, communitiesCount, followersCount, followingCount, appointmentsCount, messagesCount, notificationsCount,] = await Promise.all([
            database_1.prisma.post.count({ where: { authorId: userId } }),
            database_1.prisma.comment.count({ where: { authorId: userId } }),
            database_1.prisma.vote.count({ where: { userId } }),
            database_1.prisma.awardGiven.count({ where: { giverId: userId } }),
            database_1.prisma.savedPost.count({ where: { userId } }),
            database_1.prisma.savedComment.count({ where: { userId } }),
            database_1.prisma.communityMember.count({ where: { userId } }),
            database_1.prisma.follow.count({ where: { followingId: userId } }),
            database_1.prisma.follow.count({ where: { followerId: userId } }),
            database_1.prisma.appointment.count({
                where: {
                    OR: [
                        { doctorId: userId },
                        { patientId: userId }
                    ]
                }
            }),
            database_1.prisma.message.count({
                where: {
                    OR: [
                        { senderId: userId },
                        { receiverId: userId }
                    ]
                }
            }),
            database_1.prisma.notification.count({ where: { userId } }),
        ]);
        return {
            user: {
                username: user.username,
                email: user.email,
                role: user.role,
                memberSince: user.createdAt,
            },
            dataToDelete: {
                posts: postsCount,
                comments: commentsCount,
                votes: votesCount,
                awardsGiven: awardsGivenCount,
                savedPosts: savedPostsCount,
                savedComments: savedCommentsCount,
                communities: communitiesCount,
                followers: followersCount,
                following: followingCount,
                appointments: appointmentsCount,
                messages: messagesCount,
                notifications: notificationsCount,
            },
            totalItems: postsCount + commentsCount + votesCount + awardsGivenCount +
                savedPostsCount + savedCommentsCount + communitiesCount +
                followersCount + followingCount + appointmentsCount +
                messagesCount + notificationsCount,
        };
    }
}
exports.AccountService = AccountService;
exports.accountService = new AccountService();
