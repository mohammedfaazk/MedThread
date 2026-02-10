import { prisma } from '@medthread/database';
import { NotFoundError, ValidationError } from '../utils/errors';

interface UpdateUserInput {
  bio?: string;
  specialty?: string;
  avatar?: string;
  banner?: string;
}

export class UserService {
  async getUserById(userId: string) {
    const user = await prisma.user.findUnique({
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
      throw new NotFoundError('User not found');
    }

    return user;
  }

  async getUserByUsername(username: string) {
    const user = await prisma.user.findUnique({
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
      throw new NotFoundError('User not found');
    }

    return user;
  }

  async updateUser(userId: string, data: UpdateUserInput) {
    const user = await prisma.user.update({
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

  async followUser(followerId: string, followingId: string) {
    if (followerId === followingId) {
      throw new ValidationError('Cannot follow yourself');
    }

    // Check if already following
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId
        }
      }
    });

    if (existingFollow) {
      throw new ValidationError('Already following this user');
    }

    const follow = await prisma.follow.create({
      data: {
        followerId,
        followingId
      }
    });

    return follow;
  }

  async unfollowUser(followerId: string, followingId: string) {
    const follow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId
        }
      }
    });

    if (!follow) {
      throw new NotFoundError('Follow relationship not found');
    }

    await prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId,
          followingId
        }
      }
    });

    return { message: 'Unfollowed successfully' };
  }

  async getUserFollowers(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [followers, total] = await Promise.all([
      prisma.follow.findMany({
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
      prisma.follow.count({ where: { followingId: userId } })
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

  async getUserFollowing(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [following, total] = await Promise.all([
      prisma.follow.findMany({
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
      prisma.follow.count({ where: { followerId: userId } })
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

export const userService = new UserService();
