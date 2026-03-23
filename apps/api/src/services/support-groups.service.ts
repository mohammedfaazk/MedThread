import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const supportGroupsService = {
  // Create support group
  async createGroup(data: any) {
    return await prisma.supportGroup.create({
      data: {
        name: data.name,
        condition: data.condition,
        description: data.description,
        isPrivate: data.isPrivate || false,
        moderators: [data.createdBy],
        members: [{
          userId: data.createdBy,
          joinedAt: new Date().toISOString(),
          isAnonymous: false
        }],
        memberCount: 1,
        rules: data.rules || [],
        createdBy: data.createdBy
      }
    });
  },

  // Get all groups
  async getGroups(filters?: any) {
    const where: any = {};

    if (filters?.condition) {
      where.condition = { contains: filters.condition, mode: 'insensitive' };
    }

    if (filters?.isPrivate !== undefined) {
      where.isPrivate = filters.isPrivate;
    }

    return await prisma.supportGroup.findMany({
      where,
      orderBy: { memberCount: 'desc' },
      take: filters?.limit || 50
    });
  },

  // Get single group
  async getGroup(groupId: string) {
    return await prisma.supportGroup.findUnique({
      where: { id: groupId }
    });
  },

  // Join group
  async joinGroup(groupId: string, userId: string, isAnonymous: boolean = false) {
    const group = await this.getGroup(groupId);
    if (!group) throw new Error('Group not found');

    const members = Array.isArray(group.members) ? group.members : [];
    
    // Check if already a member
    if (members.some((m: any) => m.userId === userId)) {
      throw new Error('Already a member');
    }

    members.push({
      userId,
      joinedAt: new Date().toISOString(),
      isAnonymous
    });

    return await prisma.supportGroup.update({
      where: { id: groupId },
      data: {
        members,
        memberCount: members.length
      }
    });
  },

  // Leave group
  async leaveGroup(groupId: string, userId: string) {
    const group = await this.getGroup(groupId);
    if (!group) throw new Error('Group not found');

    const members = Array.isArray(group.members) ? group.members : [];
    const filtered = members.filter((m: any) => m.userId !== userId);

    return await prisma.supportGroup.update({
      where: { id: groupId },
      data: {
        members: filtered,
        memberCount: filtered.length
      }
    });
  },

  // Create post in group
  async createPost(groupId: string, data: any) {
    return await prisma.supportGroupPost.create({
      data: {
        groupId,
        authorId: data.authorId,
        isAnonymous: data.isAnonymous || false,
        title: data.title,
        content: data.content,
        type: data.type || 'QUESTION'
      }
    });
  },

  // Get group posts
  async getGroupPosts(groupId: string, filters?: any) {
    const where: any = { groupId };

    if (filters?.type) {
      where.type = filters.type;
    }

    return await prisma.supportGroupPost.findMany({
      where,
      orderBy: filters?.sort === 'popular' 
        ? { upvotes: 'desc' }
        : { createdAt: 'desc' },
      take: filters?.limit || 50
    });
  },

  // Update post
  async updatePost(postId: string, updates: any) {
    return await prisma.supportGroupPost.update({
      where: { id: postId },
      data: updates
    });
  },

  // Delete post
  async deletePost(postId: string) {
    return await prisma.supportGroupPost.delete({
      where: { id: postId }
    });
  },

  // Upvote post
  async upvotePost(postId: string) {
    const post = await prisma.supportGroupPost.findUnique({
      where: { id: postId }
    });

    if (!post) throw new Error('Post not found');

    return await prisma.supportGroupPost.update({
      where: { id: postId },
      data: { upvotes: post.upvotes + 1 }
    });
  },

  // Get user's groups
  async getUserGroups(userId: string) {
    const allGroups = await prisma.supportGroup.findMany();
    
    return allGroups.filter(group => {
      const members = Array.isArray(group.members) ? group.members : [];
      return members.some((m: any) => m.userId === userId);
    });
  },

  // Search groups
  async searchGroups(query: string) {
    return await prisma.supportGroup.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { condition: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } }
        ]
      },
      orderBy: { memberCount: 'desc' },
      take: 20
    });
  }
};
