import { prisma } from '@medthread/database';
import { DoctorVerificationStatus } from '@medthread/database';

export class FollowService {
  /**
   * Follow a user (verified doctors only)
   */
  async followUser(followerId: string, followingId: string) {
    // Validation: Cannot follow self
    if (followerId === followingId) {
      throw new Error('Cannot follow yourself');
    }

    // Check if user to follow exists and is a verified doctor
    const userToFollow = await prisma.user.findUnique({
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

    if (userToFollow.doctorVerificationStatus !== DoctorVerificationStatus.APPROVED) {
      throw new Error('Can only follow verified doctors');
    }

    // Check if blocked
    const isBlocked = await prisma.block.findFirst({
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
    const existingFollow = await prisma.follow.findUnique({
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
    const follow = await prisma.follow.create({
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
      const { notificationService } = await import('./notification.service');
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
    } catch (error) {
      console.error('Error creating follow notification:', error);
    }

    // Check follower badges in background
    try {
      const { badgeService } = await import('./badge.service');
      badgeService.checkFollowerBadges(followingId).catch(err => {
        console.error('Error checking follower badges:', err);
      });
    } catch (error) {
      console.error('Error creating follow notification:', error);
    }

    // Check follower badges in background
    try {
      const { badgeService } = await import('./badge.service');
      badgeService.checkFollowerBadges(followingId).catch(err => {
        console.error('Error checking follower badges:', err);
      });
    } catch (error) {
      console.error('Error importing badge service:', error);
    }

    return follow;
  }

  /**
   * Unfollow a user
   */
  async unfollowUser(followerId: string, followingId: string) {
    const follow = await prisma.follow.findUnique({
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

    await prisma.follow.delete({
      where: {
        id: follow.id,
      },
    });

    return { success: true };
  }

  /**
   * Check if user is following another user
   */
  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const follow = await prisma.follow.findUnique({
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
  async getFollowers(userId: string, cursor?: string, limit: number = 20) {
    const followers = await prisma.follow.findMany({
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
  async getFollowing(userId: string, cursor?: string, limit: number = 20) {
    const following = await prisma.follow.findMany({
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
  async getFollowCounts(userId: string) {
    const [followersCount, followingCount] = await Promise.all([
      prisma.follow.count({ where: { followingId: userId } }),
      prisma.follow.count({ where: { followerId: userId } }),
    ]);

    return {
      followersCount,
      followingCount,
    };
  }

  /**
   * Get posts from followed users (feed aggregation)
   */
  async getFollowingFeed(userId: string, cursor?: string, limit: number = 20) {
    // Get list of followed user IDs
    const following = await prisma.follow.findMany({
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
    const posts = await prisma.post.findMany({
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
  async getVerifiedDoctorsToFollow(
    userId: string,
    specialty?: string,
    cursor?: string,
    limit: number = 20
  ) {
    // Get users already following
    const following = await prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    });

    const followingIds = following.map((f) => f.followingId);

    // Get blocked users
    const blocked = await prisma.block.findMany({
      where: {
        OR: [{ blockerId: userId }, { blockedId: userId }],
      },
      select: { blockerId: true, blockedId: true },
    });

    const blockedIds = [
      ...blocked.map((b) => b.blockedId),
      ...blocked.map((b) => b.blockerId),
    ].filter((id) => id !== userId);

    const doctors = await prisma.user.findMany({
      where: {
        role: 'DOCTOR',
        doctorVerificationStatus: DoctorVerificationStatus.APPROVED,
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
  async checkFollowingMultiple(followerId: string, userIds: string[]) {
    const follows = await prisma.follow.findMany({
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
    }, {} as Record<string, boolean>);
  }
}

export const followService = new FollowService();
