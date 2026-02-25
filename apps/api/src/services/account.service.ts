import { prisma } from '@medthread/database';
import { NotFoundError, ValidationError } from '../utils/errors';

export class AccountService {
  /**
   * Deactivate user account (soft delete - reversible)
   */
  async deactivateAccount(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        isSuspended: true,
      }
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (user.isSuspended) {
      throw new ValidationError('Account is already deactivated');
    }

    // Deactivate account (soft delete)
    await prisma.user.update({
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
  async reactivateAccount(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        isSuspended: true,
      }
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (!user.isSuspended) {
      throw new ValidationError('Account is not deactivated');
    }

    await prisma.user.update({
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
  async deleteAccountPermanently(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
      }
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Use transaction to ensure all-or-nothing deletion
    await prisma.$transaction(async (tx) => {
      // Delete in order to respect foreign key constraints
      
      // 1. Notifications
      await tx.notifications.deleteMany({ where: { recipientId: userId } });

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
  async getAccountDeletionPreview(userId: string) {
    const user = await prisma.user.findUnique({
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
      throw new NotFoundError('User not found');
    }

    // Count all associated data
    const [
      postsCount,
      commentsCount,
      votesCount,
      awardsGivenCount,
      savedPostsCount,
      savedCommentsCount,
      communitiesCount,
      followersCount,
      followingCount,
      appointmentsCount,
      messagesCount,
      notificationsCount,
    ] = await Promise.all([
      prisma.post.count({ where: { authorId: userId } }),
      prisma.comment.count({ where: { authorId: userId } }),
      prisma.vote.count({ where: { userId } }),
      prisma.awardGiven.count({ where: { giverId: userId } }),
      prisma.savedPost.count({ where: { userId } }),
      prisma.savedComment.count({ where: { userId } }),
      prisma.communityMember.count({ where: { userId } }),
      prisma.follow.count({ where: { followingId: userId } }),
      prisma.follow.count({ where: { followerId: userId } }),
      prisma.appointment.count({ 
        where: { 
          OR: [
            { doctorId: userId },
            { patientId: userId }
          ]
        } 
      }),
      prisma.message.count({ 
        where: { 
          OR: [
            { senderId: userId },
            { receiverId: userId }
          ]
        } 
      }),
      prisma.notifications.count({ where: { recipientId: userId } }),
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

export const accountService = new AccountService();


