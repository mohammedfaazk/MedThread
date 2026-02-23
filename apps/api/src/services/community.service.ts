import { prisma } from '@medthread/database';
import { NotFoundError, ForbiddenError, ConflictError, ValidationError } from '../utils/errors';
import { notificationService } from './notification.service';
import { NotificationType } from '@prisma/client';

interface CreateCommunityInput {
  name: string;
  displayName: string;
  description?: string;
  isNSFW?: boolean;
  isPrivate?: boolean;
  creatorId: string;
}

interface UpdateCommunityInput {
  displayName?: string;
  description?: string;
  icon?: string;
  banner?: string;
  rules?: any;
  theme?: any;
}

export class CommunityService {
  async createCommunity(data: CreateCommunityInput) {
    // Validate community name
    const nameRegex = /^[a-zA-Z0-9_]{3,21}$/;
    if (!nameRegex.test(data.name)) {
      throw new ValidationError('Community name must be 3-21 characters and contain only letters, numbers, and underscores');
    }

    // Check if community already exists
    const existing = await prisma.community.findUnique({
      where: { name: data.name.toLowerCase() }
    });

    if (existing) {
      throw new ConflictError('Community name already taken');
    }

    const community = await prisma.community.create({
      data: {
        name: data.name.toLowerCase(),
        displayName: data.displayName,
        description: data.description,
        isNSFW: data.isNSFW || false,
        isPrivate: data.isPrivate || false,
        memberCount: 1,
      }
    });

    // Add creator as member and moderator
    await Promise.all([
      prisma.communityMember.create({
        data: {
          userId: data.creatorId,
          communityId: community.id,
        }
      }),
      prisma.communityModerator.create({
        data: {
          userId: data.creatorId,
          communityId: community.id,
          permissions: {
            all: true,
            posts: true,
            comments: true,
            users: true,
            settings: true,
            flair: true,
          }
        }
      })
    ]);

    return community;
  }

  async getCommunityByName(name: string, userId?: string) {
    const community = await prisma.community.findUnique({
      where: { name: name.toLowerCase() },
      include: {
        _count: {
          select: {
            members: true,
            posts: true,
          }
        }
      }
    });

    if (!community) {
      throw new NotFoundError('Community not found');
    }

    // Check if user is member (for private communities)
    let isMember = false;
    let isModerator = false;
    if (userId) {
      const [membership, modStatus] = await Promise.all([
        prisma.communityMember.findUnique({
          where: {
            userId_communityId: {
              userId,
              communityId: community.id
            }
          }
        }),
        prisma.communityModerator.findUnique({
          where: {
            userId_communityId: {
              userId,
              communityId: community.id
            }
          }
        })
      ]);
      isMember = !!membership;
      isModerator = !!modStatus;
    }

    if (community.isPrivate && !isMember && !isModerator) {
      throw new ForbiddenError('This is a private community');
    }

    return {
      ...community,
      isMember,
      isModerator,
    };
  }

  async getCommunities(filters: {
    search?: string;
    sortBy?: 'members' | 'new' | 'active';
    page?: number;
    limit?: number;
  }) {
    const {
      search,
      sortBy = 'members',
      page = 1,
      limit = 20
    } = filters;

    const skip = (page - 1) * limit;

    const where: any = {
      isPrivate: false, // Only show public communities in listing
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { displayName: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    let orderBy: any = {};
    switch (sortBy) {
      case 'new':
        orderBy = { createdAt: 'desc' };
        break;
      case 'active':
        orderBy = { updatedAt: 'desc' };
        break;
      case 'members':
      default:
        orderBy = { memberCount: 'desc' };
        break;
    }

    const [communities, total] = await Promise.all([
      prisma.community.findMany({
        where,
        include: {
          _count: {
            select: {
              members: true,
              posts: true,
            }
          }
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.community.count({ where })
    ]);

    return {
      communities,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async updateCommunity(communityId: string, userId: string, data: UpdateCommunityInput) {
    // Check if user is moderator
    const moderator = await prisma.communityModerator.findUnique({
      where: {
        userId_communityId: {
          userId,
          communityId
        }
      }
    });

    if (!moderator) {
      throw new ForbiddenError('Must be a moderator to update community');
    }

    const permissions = moderator.permissions as any;
    if (!permissions.all && !permissions.settings) {
      throw new ForbiddenError('Insufficient permissions');
    }

    const community = await prisma.community.update({
      where: { id: communityId },
      data
    });

    return community;
  }

  async joinCommunity(communityId: string, userId: string) {
    const community = await prisma.community.findUnique({
      where: { id: communityId }
    });

    if (!community) {
      throw new NotFoundError('Community not found');
    }

    if (community.isPrivate) {
      throw new ForbiddenError('Cannot join private community without invitation');
    }

    // Check if already a member
    const existing = await prisma.communityMember.findUnique({
      where: {
        userId_communityId: {
          userId,
          communityId
        }
      }
    });

    if (existing) {
      throw new ConflictError('Already a member of this community');
    }

    await prisma.communityMember.create({
      data: {
        userId,
        communityId
      }
    });

    // Update member count
    await prisma.community.update({
      where: { id: communityId },
      data: {
        memberCount: { increment: 1 }
      }
    });

    return { message: 'Joined community successfully' };
  }

  async leaveCommunity(communityId: string, userId: string) {
    const membership = await prisma.communityMember.findUnique({
      where: {
        userId_communityId: {
          userId,
          communityId
        }
      }
    });

    if (!membership) {
      throw new NotFoundError('Not a member of this community');
    }

    // Check if user is the only moderator
    const moderators = await prisma.communityModerator.findMany({
      where: { communityId }
    });

    const isModerator = moderators.some(m => m.userId === userId);
    if (isModerator && moderators.length === 1) {
      throw new ForbiddenError('Cannot leave community as the only moderator. Transfer ownership first.');
    }

    await prisma.communityMember.delete({
      where: {
        userId_communityId: {
          userId,
          communityId
        }
      }
    });

    // Remove moderator status if applicable
    if (isModerator) {
      await prisma.communityModerator.delete({
        where: {
          userId_communityId: {
            userId,
            communityId
          }
        }
      });
    }

    // Update member count
    await prisma.community.update({
      where: { id: communityId },
      data: {
        memberCount: { decrement: 1 }
      }
    });

    return { message: 'Left community successfully' };
  }

  async getCommunityMembers(communityId: string, page = 1, limit = 50) {
    const skip = (page - 1) * limit;

    const [members, total] = await Promise.all([
      prisma.communityMember.findMany({
        where: { communityId },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatar: true,
              role: true,
              verified: true,
              totalKarma: true,
            }
          }
        },
        orderBy: { joinedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.communityMember.count({ where: { communityId } })
    ]);

    return {
      members: members.map(m => m.user),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getCommunityModerators(communityId: string) {
    const moderators = await prisma.communityModerator.findMany({
      where: { communityId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
            role: true,
            verified: true,
          }
        }
      },
      orderBy: { addedAt: 'asc' }
    });

    return moderators.map(m => ({
      ...m.user,
      permissions: m.permissions,
      addedAt: m.addedAt,
    }));
  }

  async inviteModerator(communityId: string, inviterId: string, inviteeId: string, permissions?: any) {
    // Check if inviter is a moderator with permission
    const inviterMod = await prisma.communityModerator.findUnique({
      where: {
        userId_communityId: {
          userId: inviterId,
          communityId
        }
      }
    });

    if (!inviterMod) {
      throw new ForbiddenError('Must be a moderator to invite others');
    }

    const inviterPerms = inviterMod.permissions as any;
    if (!inviterPerms.all && !inviterPerms.users) {
      throw new ForbiddenError('Insufficient permissions to invite moderators');
    }

    // Check if invitee is already a moderator
    const existingMod = await prisma.communityModerator.findUnique({
      where: {
        userId_communityId: {
          userId: inviteeId,
          communityId
        }
      }
    });

    if (existingMod) {
      throw new ConflictError('User is already a moderator');
    }

    // Get community and invitee details
    const [community, invitee] = await Promise.all([
      prisma.community.findUnique({ where: { id: communityId } }),
      prisma.user.findUnique({ where: { id: inviteeId } })
    ]);

    if (!community) {
      throw new NotFoundError('Community not found');
    }

    if (!invitee) {
      throw new NotFoundError('User not found');
    }

    // Add as moderator
    const defaultPermissions = permissions || {
      all: false,
      posts: true,
      comments: true,
      users: false,
      settings: false,
      flair: true,
    };

    await prisma.communityModerator.create({
      data: {
        userId: inviteeId,
        communityId,
        permissions: defaultPermissions
      }
    });

    // Create COMMUNITY_INVITE notification
    try {
      await notificationService.createNotification({
        type: NotificationType.COMMUNITY_INVITE,
        recipientIds: [inviteeId],
        actorId: inviterId,
        metadata: {
          title: 'Community Moderator Invite',
          body: `You've been invited to moderate m/${community.name}`,
          link: `/m/${community.name}`,
          communityName: community.displayName || community.name,
        }
      });
    } catch (notifError) {
      console.error('Failed to create community invite notification:', notifError);
    }

    return { message: 'Moderator invited successfully' };
  }
}

export const communityService = new CommunityService();
