import { prisma } from '@medthread/database';
import { notificationService } from './notification.service';

interface CreateCommentInput {
  content: string;
  authorId: string;
  postId: string;
  parentId?: string;
}

export const commentService = {
  /**
   * Parse @mentions from comment content
   * Returns array of unique mentioned usernames
   */
  parseMentions(content: string): string[] {
    const mentionRegex = /@(\w+)/g;
    const mentions = new Set<string>();
    let match;
    
    while ((match = mentionRegex.exec(content)) !== null) {
      mentions.add(match[1]);
    }
    
    return Array.from(mentions);
  },

  async createComment(data: CreateCommentInput) {
    // Calculate depth if it's a reply
    let depth = 0;
    let parentComment = null;
    if (data.parentId) {
      parentComment = await prisma.comment.findUnique({
        where: { id: data.parentId },
        select: { 
          depth: true,
          authorId: true,
          author: {
            select: {
              username: true
            }
          }
        }
      });
      depth = (parentComment?.depth || 0) + 1;

      // Limit nesting to 10 levels
      if (depth > 10) {
        throw new Error('Maximum comment nesting depth reached');
      }
    }

    // Get post details for notifications
    const post = await prisma.post.findUnique({
      where: { id: data.postId },
      select: {
        id: true,
        title: true,
        authorId: true,
        community: {
          select: {
            name: true,
            displayName: true
          }
        }
      }
    });

    if (!post) {
      throw new Error('Post not found');
    }

    const comment = await prisma.comment.create({
      data: {
        content: data.content,
        authorId: data.authorId,
        postId: data.postId,
        parentId: data.parentId,
        depth,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            role: true,
            avatar: true,
            totalKarma: true,
            doctorVerificationStatus: true,
          }
        },
        _count: {
          select: {
            replies: true,
            votes: true,
          }
        }
      }
    });

    // Update post comment count
    await prisma.post.update({
      where: { id: data.postId },
      data: {
        commentCount: { increment: 1 }
      }
    });

    // Trigger REPLY notification
    try {
      let replyRecipientId: string | null = null;
      
      if (data.parentId && parentComment) {
        // Reply to a comment
        replyRecipientId = parentComment.authorId;
      } else {
        // Top-level comment on a post
        replyRecipientId = post.authorId;
      }

      // Only send notification if not replying to self
      if (replyRecipientId && replyRecipientId !== data.authorId) {
        await notificationService.createNotification({
          type: 'REPLY',
          recipientIds: [replyRecipientId],
          actorId: data.authorId,
          contentId: comment.id,
          contentType: 'COMMENT',
          metadata: {
            title: 'New reply',
            body: `${comment.author.username} replied to your ${data.parentId ? 'comment' : 'post'}`,
            preview: data.content.substring(0, 100),
            link: `/post/${data.postId}?comment=${comment.id}`,
            communityName: post.community.displayName,
            postTitle: post.title,
          }
        });
      }
    } catch (error) {
      console.error('Error creating REPLY notification:', error);
      // Don't fail comment creation if notification fails
    }

    // Trigger MENTION notifications
    try {
      const mentionedUsernames = this.parseMentions(data.content);
      
      if (mentionedUsernames.length > 0) {
        // Find users by username
        const mentionedUsers = await prisma.user.findMany({
          where: {
            username: {
              in: mentionedUsernames,
              mode: 'insensitive'
            }
          },
          select: {
            id: true,
            username: true
          }
        });

        // Filter out the comment author (don't notify self)
        const recipientIds = mentionedUsers
          .filter(user => user.id !== data.authorId)
          .map(user => user.id);

        if (recipientIds.length > 0) {
          await notificationService.createNotification({
            type: 'MENTION',
            recipientIds,
            actorId: data.authorId,
            contentId: comment.id,
            contentType: 'COMMENT',
            metadata: {
              title: 'You were mentioned',
              body: `${comment.author.username} mentioned you in a comment`,
              preview: data.content.substring(0, 100),
              link: `/post/${data.postId}?comment=${comment.id}`,
              communityName: post.community.displayName,
              postTitle: post.title,
            }
          });
        }
      }
    } catch (error) {
      console.error('Error creating MENTION notifications:', error);
      // Don't fail comment creation if notification fails
    }

    return comment;
  },

  async getCommentsByPost(postId: string, userId?: string) {
    const comments = await prisma.comment.findMany({
      where: {
        postId,
        isRemoved: false,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            role: true,
            avatar: true,
            totalKarma: true,
            specialty: true,
            doctorVerificationStatus: true,
          }
        },
        _count: {
          select: {
            replies: true,
            votes: true,
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Get user votes if userId provided
    let userVotes: Record<string, number> = {};
    if (userId) {
      const votes = await prisma.vote.findMany({
        where: {
          userId,
          commentId: { in: comments.map(c => c.id) }
        }
      });
      userVotes = votes.reduce((acc, vote) => {
        acc[vote.commentId!] = vote.value;
        return acc;
      }, {} as Record<string, number>);
    }

    // Build comment tree
    return this.buildCommentTree(comments, userVotes);
  },

  async getCommentsByAuthor(authorId: string, limit: number = 20, offset: number = 0) {
    const comments = await prisma.comment.findMany({
      where: {
        authorId,
        isRemoved: false,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            role: true,
            avatar: true,
            totalKarma: true,
            specialty: true,
            doctorVerificationStatus: true,
          }
        },
        post: {
          select: {
            id: true,
            title: true,
            community: {
              select: {
                name: true,
                displayName: true
              }
            }
          }
        },
        _count: {
          select: {
            replies: true,
            votes: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      skip: offset
    });

    return comments;
  },

  buildCommentTree(comments: any[], userVotes: Record<string, number> = {}) {
    const commentMap = new Map();
    const rootComments: any[] = [];

    // First pass: create map
    comments.forEach(comment => {
      commentMap.set(comment.id, {
        ...comment,
        replies: [],
        userVote: userVotes[comment.id] || null,
      });
    });

    // Second pass: build tree
    comments.forEach(comment => {
      const commentNode = commentMap.get(comment.id);
      if (comment.parentId) {
        const parent = commentMap.get(comment.parentId);
        if (parent) {
          parent.replies.push(commentNode);
        }
      } else {
        rootComments.push(commentNode);
      }
    });

    return rootComments;
  },

  async updateComment(commentId: string, userId: string, content: string) {
    // Verify ownership
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { authorId: true }
    });

    if (!comment) {
      throw new Error('Comment not found');
    }

    if (comment.authorId !== userId) {
      throw new Error('Unauthorized');
    }

    return await prisma.comment.update({
      where: { id: commentId },
      data: {
        content,
        editedAt: new Date(),
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            role: true,
            avatar: true,
            doctorVerificationStatus: true,
          }
        }
      }
    });
  },

  async deleteComment(commentId: string, userId: string) {
    // Verify ownership
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { authorId: true, postId: true }
    });

    if (!comment) {
      throw new Error('Comment not found');
    }

    if (comment.authorId !== userId) {
      throw new Error('Unauthorized');
    }

    // Soft delete
    const deleted = await prisma.comment.update({
      where: { id: commentId },
      data: {
        isRemoved: true,
        content: '[deleted]',
      }
    });

    // Update post comment count
    await prisma.post.update({
      where: { id: comment.postId },
      data: {
        commentCount: { decrement: 1 }
      }
    });

    return deleted;
  },

  async voteComment(commentId: string, userId: string, value: number) {
    if (value !== 1 && value !== -1) {
      throw new Error('Vote value must be 1 or -1');
    }

    // Check if vote exists
    const existingVote = await prisma.vote.findUnique({
      where: {
        userId_commentId: {
          userId,
          commentId
        }
      }
    });

    let voteChange = 0;

    if (existingVote) {
      if (existingVote.value === value) {
        // Remove vote (toggle off)
        await prisma.vote.delete({
          where: { id: existingVote.id }
        });
        voteChange = -value;
      } else {
        // Update vote
        await prisma.vote.update({
          where: { id: existingVote.id },
          data: { value }
        });
        voteChange = value - existingVote.value;
      }
    } else {
      // Create new vote
      await prisma.vote.create({
        data: { userId, commentId, value }
      });
      voteChange = value;
    }

    // Update comment score
    const comment = await prisma.comment.update({
      where: { id: commentId },
      data: {
        upvotes: value === 1 ? { increment: voteChange > 0 ? 1 : -1 } : undefined,
        downvotes: value === -1 ? { increment: voteChange < 0 ? 1 : -1 } : undefined,
        score: { increment: voteChange }
      },
      select: {
        score: true,
        upvotes: true,
        downvotes: true,
        authorId: true,
        postId: true,
        content: true,
        post: {
          select: {
            title: true,
            community: {
              select: {
                name: true,
                displayName: true
              }
            }
          }
        }
      }
    });

    // Update author karma
    const { karmaService } = await import('./karma.service');
    await karmaService.updateUserKarma(comment.authorId);

    // Trigger UPVOTE_MILESTONE notification
    if (value === 1 && voteChange > 0) {
      try {
        // Get user's upvote threshold preference
        const { PreferencesService } = await import('./notification-preferences.service');
        const preferencesService = new PreferencesService();
        const preferences = await preferencesService.getPreferences(comment.authorId);
        
        const threshold = preferences.upvoteThreshold || 10; // Default to 10
        
        // Check if we just hit a milestone
        const previousUpvotes = comment.upvotes - 1;
        const currentUpvotes = comment.upvotes;
        
        // Trigger notification if we crossed a threshold (10, 25, 50, 100, 250, 500, 1000, etc.)
        const milestones = [10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000];
        const crossedMilestone = milestones.find(
          milestone => previousUpvotes < milestone && currentUpvotes >= milestone && milestone >= threshold
        );
        
        if (crossedMilestone && comment.authorId !== userId) {
          await notificationService.createNotification({
            type: 'UPVOTE_MILESTONE',
            recipientIds: [comment.authorId],
            actorId: userId,
            contentId: commentId,
            contentType: 'COMMENT',
            metadata: {
              title: 'Milestone reached!',
              body: `Your comment reached ${crossedMilestone} upvotes`,
              preview: comment.content.substring(0, 100),
              link: `/post/${comment.postId}?comment=${commentId}`,
              communityName: comment.post.community.displayName,
              postTitle: comment.post.title,
              milestone: crossedMilestone,
              upvotes: currentUpvotes,
            }
          });
        }
      } catch (error) {
        console.error('Error creating UPVOTE_MILESTONE notification:', error);
        // Don't fail vote if notification fails
      }
    }

    return {
      score: comment.score,
      upvotes: comment.upvotes,
      downvotes: comment.downvotes,
    };
  },
};
