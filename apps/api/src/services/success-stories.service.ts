import { prisma } from '@medthread/database';
import { notificationService } from './notification.service';

interface CreateStoryData {
  title: string;
  story: string;
  condition: string;
  treatment?: string;
  duration?: string;
  beforePhotos?: string[];
  afterPhotos?: string[];
  authorId: string;
}

export class SuccessStoriesService {
  /**
   * Create a success story
   */
  async createStory(data: CreateStoryData) {
    try {
      const story = await prisma.successStory.create({
        data: {
          title: data.title,
          story: data.story,
          condition: data.condition,
          treatment: data.treatment,
          duration: data.duration,
          beforePhotos: data.beforePhotos || null,
          afterPhotos: data.afterPhotos || null,
          authorId: data.authorId,
          status: 'APPROVED', // Auto-approve in development
          likes: 0,
          views: 0,
          isVerified: false
        },
        include: {
          author: {
            select: {
              id: true
            }
          }
        }
      });

      // Notify admins for review
      await this.notifyModerators(story);

      return story;
    } catch (error) {
      console.error('[SuccessStories] Error creating story:', error);
      throw error;
    }
  }

  /**
   * Get all approved stories
   */
  async getStories(filters?: {
    condition?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    try {
      const page = filters?.page || 1;
      const limit = filters?.limit || 20;
      const skip = (page - 1) * limit;

      const where: any = { status: 'APPROVED' };

      if (filters?.condition) {
        where.condition = {
          contains: filters.condition,
          mode: 'insensitive'
        };
      }

      if (filters?.search) {
        where.OR = [
          { title: { contains: filters.search, mode: 'insensitive' } },
          { content: { contains: filters.search, mode: 'insensitive' } }
        ];
      }

      const [stories, total] = await Promise.all([
        prisma.successStory.findMany({
          where,
          include: {
            author: {
              select: {
                id: true,
                username: true,
                avatar: true
              }
            }
          },
          orderBy: [
            { isVerified: 'desc' },
            { likes: 'desc' },
            { createdAt: 'desc' }
          ],
          skip,
          take: limit
        }),
        prisma.successStory.count({ where })
      ]);

      return {
        stories,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('[SuccessStories] Error getting stories:', error);
      throw error;
    }
  }

  /**
   * Get single story
   */
  async getStory(storyId: string) {
    try {
      // Increment view count
      await prisma.successStory.update({
        where: { id: storyId },
        data: { views: { increment: 1 } }
      });

      const story = await prisma.successStory.findUnique({
        where: { id: storyId },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              avatar: true
            }
          },
          comments: {
            include: {
              author: {
                select: {
                  id: true,
                  username: true,
                  role: true
                }
              }
            },
            orderBy: { createdAt: 'desc' }
          }
        }
      });

      return story;
    } catch (error) {
      console.error('[SuccessStories] Error getting story:', error);
      throw error;
    }
  }

  /**
   * Like a story
   */
  async likeStory(storyId: string, userId: string) {
    try {
      const existingLike = await prisma.storyLike.findFirst({
        where: {
          storyId,
          userId
        }
      });

      if (existingLike) {
        // Unlike
        await prisma.storyLike.delete({
          where: { id: existingLike.id }
        });

        await prisma.successStory.update({
          where: { id: storyId },
          data: { likes: { decrement: 1 } }
        });

        return { liked: false };
      } else {
        // Like
        await prisma.storyLike.create({
          data: {
            storyId,
            userId
          }
        });

        await prisma.successStory.update({
          where: { id: storyId },
          data: { likes: { increment: 1 } }
        });

        // Notify story author
        const story = await prisma.successStory.findUnique({
          where: { id: storyId },
          select: { authorId: true, title: true }
        });

        if (story && story.authorId !== userId) {
          await notificationService.sendNotification(story.authorId, {
            title: 'Someone liked your story!',
            body: `Your story "${story.title}" received a like`,
            type: 'STORY_LIKE',
            data: { storyId }
          });
        }

        return { liked: true };
      }
    } catch (error) {
      console.error('[SuccessStories] Error liking story:', error);
      throw error;
    }
  }

  /**
   * Add comment to story
   */
  async addComment(storyId: string, userId: string, content: string) {
    try {
      const comment = await prisma.storyComment.create({
        data: {
          storyId,
          authorId: userId,
          content
        },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              role: true
            }
          }
        }
      });

      // Notify story author
      const story = await prisma.successStory.findUnique({
        where: { id: storyId },
        select: { authorId: true, title: true }
      });

      if (story && story.authorId !== userId) {
        await notificationService.sendNotification(story.authorId, {
          title: 'New comment on your story',
          body: `Someone commented on "${story.title}"`,
          type: 'STORY_COMMENT',
          data: { storyId, commentId: comment.id }
        });
      }

      return comment;
    } catch (error) {
      console.error('[SuccessStories] Error adding comment:', error);
      throw error;
    }
  }

  /**
   * Approve story (moderator only)
   */
  async approveStory(storyId: string, moderatorId: string) {
    try {
      const moderator = await prisma.user.findUnique({
        where: { id: moderatorId },
        select: { role: true }
      });

      if (moderator?.role !== 'ADMIN' && moderator?.role !== 'DOCTOR') {
        throw new Error('Only moderators can approve stories');
      }

      const story = await prisma.successStory.update({
        where: { id: storyId },
        data: {
          status: 'APPROVED',
          reviewedBy: moderatorId,
          reviewedAt: new Date()
        }
      });

      // Notify author
      await notificationService.sendNotification(story.authorId, {
        title: 'Your story was approved!',
        body: 'Your success story is now visible to the community',
        type: 'STORY_APPROVED',
        data: { storyId }
      });

      return story;
    } catch (error) {
      console.error('[SuccessStories] Error approving story:', error);
      throw error;
    }
  }

  /**
   * Reject story (moderator only)
   */
  async rejectStory(storyId: string, moderatorId: string, reason: string) {
    try {
      const moderator = await prisma.user.findUnique({
        where: { id: moderatorId },
        select: { role: true }
      });

      if (moderator?.role !== 'ADMIN' && moderator?.role !== 'DOCTOR') {
        throw new Error('Only moderators can reject stories');
      }

      const story = await prisma.successStory.update({
        where: { id: storyId },
        data: {
          status: 'REJECTED',
          reviewedBy: moderatorId,
          reviewedAt: new Date(),
          rejectionReason: reason
        }
      });

      // Notify author
      await notificationService.sendNotification(story.authorId, {
        title: 'Story not approved',
        body: `Your story was not approved. Reason: ${reason}`,
        type: 'STORY_REJECTED',
        data: { storyId, reason }
      });

      return story;
    } catch (error) {
      console.error('[SuccessStories] Error rejecting story:', error);
      throw error;
    }
  }

  /**
   * Verify story (admin only - for authentic stories)
   */
  async verifyStory(storyId: string, adminId: string) {
    try {
      const admin = await prisma.user.findUnique({
        where: { id: adminId },
        select: { role: true }
      });

      if (admin?.role !== 'ADMIN') {
        throw new Error('Only admins can verify stories');
      }

      const story = await prisma.successStory.update({
        where: { id: storyId },
        data: { isVerified: true }
      });

      return story;
    } catch (error) {
      console.error('[SuccessStories] Error verifying story:', error);
      throw error;
    }
  }

  /**
   * Get pending stories for moderation
   */
  async getPendingStories() {
    try {
      const stories = await prisma.successStory.findMany({
        where: { status: 'PENDING' },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              avatar: true
            }
          }
        },
        orderBy: { createdAt: 'asc' }
      });

      return stories;
    } catch (error) {
      console.error('[SuccessStories] Error getting pending stories:', error);
      throw error;
    }
  }

  /**
   * Get featured stories
   */
  async getFeaturedStories(limit: number = 5) {
    try {
      const stories = await prisma.successStory.findMany({
        where: {
          status: 'APPROVED',
          isVerified: true
        },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              avatar: true
            }
          }
        },
        orderBy: [
          { likes: 'desc' },
          { views: 'desc' }
        ],
        take: limit
      });

      return stories;
    } catch (error) {
      console.error('[SuccessStories] Error getting featured stories:', error);
      throw error;
    }
  }

  /**
   * Notify moderators about new story
   */
  private async notifyModerators(story: any) {
    try {
      const moderators = await prisma.user.findMany({
        where: {
          OR: [
            { role: 'ADMIN' },
            { role: 'DOCTOR' }
          ]
        },
        select: { id: true }
      });

      for (const moderator of moderators) {
        await notificationService.sendNotification(moderator.id, {
          title: 'New Success Story for Review',
          body: `"${story.title}" is pending moderation`,
          type: 'STORY_PENDING',
          data: { storyId: story.id }
        });
      }
    } catch (error) {
      console.error('[SuccessStories] Error notifying moderators:', error);
    }
  }
}

export const successStoriesService = new SuccessStoriesService();


