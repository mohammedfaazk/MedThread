"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.communityService = exports.CommunityService = void 0;
const database_1 = require("@medthread/database");
const errors_1 = require("../utils/errors");
const notification_service_1 = require("./notification.service");
const client_1 = require("@prisma/client");
class CommunityService {
    async createCommunity(data) {
        // Validate community name
        const nameRegex = /^[a-zA-Z0-9_]{3,21}$/;
        if (!nameRegex.test(data.name)) {
            throw new errors_1.ValidationError('Community name must be 3-21 characters and contain only letters, numbers, and underscores');
        }
        // Check if community already exists
        const existing = await database_1.prisma.community.findUnique({
            where: { name: data.name.toLowerCase() }
        });
        if (existing) {
            throw new errors_1.ConflictError('Community name already taken');
        }
        const community = await database_1.prisma.community.create({
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
            database_1.prisma.communityMember.create({
                data: {
                    userId: data.creatorId,
                    communityId: community.id,
                }
            }),
            database_1.prisma.communityModerator.create({
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
    async getCommunityByName(name, userId) {
        const community = await database_1.prisma.community.findUnique({
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
            throw new errors_1.NotFoundError('Community not found');
        }
        // Check if user is member (for private communities)
        let isMember = false;
        let isModerator = false;
        if (userId) {
            const [membership, modStatus] = await Promise.all([
                database_1.prisma.communityMember.findUnique({
                    where: {
                        userId_communityId: {
                            userId,
                            communityId: community.id
                        }
                    }
                }),
                database_1.prisma.communityModerator.findUnique({
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
            throw new errors_1.ForbiddenError('This is a private community');
        }
        return {
            ...community,
            isMember,
            isModerator,
        };
    }
    async getCommunities(filters) {
        const { search, sortBy = 'members', page = 1, limit = 20 } = filters;
        const skip = (page - 1) * limit;
        const where = {
            isPrivate: false, // Only show public communities in listing
        };
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { displayName: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }
        let orderBy = {};
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
            database_1.prisma.community.findMany({
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
            database_1.prisma.community.count({ where })
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
    async updateCommunity(communityId, userId, data) {
        // Check if user is moderator
        const moderator = await database_1.prisma.communityModerator.findUnique({
            where: {
                userId_communityId: {
                    userId,
                    communityId
                }
            }
        });
        if (!moderator) {
            throw new errors_1.ForbiddenError('Must be a moderator to update community');
        }
        const permissions = moderator.permissions;
        if (!permissions.all && !permissions.settings) {
            throw new errors_1.ForbiddenError('Insufficient permissions');
        }
        const community = await database_1.prisma.community.update({
            where: { id: communityId },
            data
        });
        return community;
    }
    async joinCommunity(communityId, userId) {
        const community = await database_1.prisma.community.findUnique({
            where: { id: communityId }
        });
        if (!community) {
            throw new errors_1.NotFoundError('Community not found');
        }
        if (community.isPrivate) {
            throw new errors_1.ForbiddenError('Cannot join private community without invitation');
        }
        // Check if already a member
        const existing = await database_1.prisma.communityMember.findUnique({
            where: {
                userId_communityId: {
                    userId,
                    communityId
                }
            }
        });
        if (existing) {
            throw new errors_1.ConflictError('Already a member of this community');
        }
        await database_1.prisma.communityMember.create({
            data: {
                userId,
                communityId
            }
        });
        // Update member count
        await database_1.prisma.community.update({
            where: { id: communityId },
            data: {
                memberCount: { increment: 1 }
            }
        });
        return { message: 'Joined community successfully' };
    }
    async leaveCommunity(communityId, userId) {
        const membership = await database_1.prisma.communityMember.findUnique({
            where: {
                userId_communityId: {
                    userId,
                    communityId
                }
            }
        });
        if (!membership) {
            throw new errors_1.NotFoundError('Not a member of this community');
        }
        // Check if user is the only moderator
        const moderators = await database_1.prisma.communityModerator.findMany({
            where: { communityId }
        });
        const isModerator = moderators.some(m => m.userId === userId);
        if (isModerator && moderators.length === 1) {
            throw new errors_1.ForbiddenError('Cannot leave community as the only moderator. Transfer ownership first.');
        }
        await database_1.prisma.communityMember.delete({
            where: {
                userId_communityId: {
                    userId,
                    communityId
                }
            }
        });
        // Remove moderator status if applicable
        if (isModerator) {
            await database_1.prisma.communityModerator.delete({
                where: {
                    userId_communityId: {
                        userId,
                        communityId
                    }
                }
            });
        }
        // Update member count
        await database_1.prisma.community.update({
            where: { id: communityId },
            data: {
                memberCount: { decrement: 1 }
            }
        });
        return { message: 'Left community successfully' };
    }
    async getCommunityMembers(communityId, page = 1, limit = 50) {
        const skip = (page - 1) * limit;
        const [members, total] = await Promise.all([
            database_1.prisma.communityMember.findMany({
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
            database_1.prisma.communityMember.count({ where: { communityId } })
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
    async getCommunityModerators(communityId) {
        const moderators = await database_1.prisma.communityModerator.findMany({
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
    async inviteModerator(communityId, inviterId, inviteeId, permissions) {
        // Check if inviter is a moderator with permission
        const inviterMod = await database_1.prisma.communityModerator.findUnique({
            where: {
                userId_communityId: {
                    userId: inviterId,
                    communityId
                }
            }
        });
        if (!inviterMod) {
            throw new errors_1.ForbiddenError('Must be a moderator to invite others');
        }
        const inviterPerms = inviterMod.permissions;
        if (!inviterPerms.all && !inviterPerms.users) {
            throw new errors_1.ForbiddenError('Insufficient permissions to invite moderators');
        }
        // Check if invitee is already a moderator
        const existingMod = await database_1.prisma.communityModerator.findUnique({
            where: {
                userId_communityId: {
                    userId: inviteeId,
                    communityId
                }
            }
        });
        if (existingMod) {
            throw new errors_1.ConflictError('User is already a moderator');
        }
        // Get community and invitee details
        const [community, invitee] = await Promise.all([
            database_1.prisma.community.findUnique({ where: { id: communityId } }),
            database_1.prisma.user.findUnique({ where: { id: inviteeId } })
        ]);
        if (!community) {
            throw new errors_1.NotFoundError('Community not found');
        }
        if (!invitee) {
            throw new errors_1.NotFoundError('User not found');
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
        await database_1.prisma.communityModerator.create({
            data: {
                userId: inviteeId,
                communityId,
                permissions: defaultPermissions
            }
        });
        // Create COMMUNITY_INVITE notification
        try {
            await notification_service_1.notificationService.createNotification({
                type: client_1.NotificationType.COMMUNITY_INVITE,
                recipientIds: [inviteeId],
                actorId: inviterId,
                metadata: {
                    title: 'Community Moderator Invite',
                    body: `You've been invited to moderate m/${community.name}`,
                    link: `/m/${community.name}`,
                    communityName: community.displayName || community.name,
                }
            });
        }
        catch (notifError) {
            console.error('Failed to create community invite notification:', notifError);
        }
        return { message: 'Moderator invited successfully' };
    }
}
exports.CommunityService = CommunityService;
exports.communityService = new CommunityService();
