import { prisma } from '@medthread/database';
import { NotFoundError, ForbiddenError, ValidationError } from '../utils/errors';

interface CreateCommentInput {
  postId: string;
  authorId: string;
  content: string;
  parentId?: string;
}

export class CommentService {
  async createComment(data: CreateCommentInput) {
    const post = await prisma.post.findUnique({
      where: { id: data.postId }
    });

    if (!post) {
      throw new NotFoundError('Post not found');
    }

    if (post.isLocked) {
      throw new ForbiddenError('Post is locked, cannot add comments');
    }

    if (post.commentsDisabled) {
      throw new ForbiddenError('Comments are disabled for this post');
    }

    if (post.isArchived) {
      throw new ForbiddenError('Cannot comment on archived post');
    }

    let depth = 0;
    if (data.parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: data.parentId }
      });

      if (!parentComment) {
        throw new NotFoundError('Parent comment not found');
      }

      if (parentComment.postId !== data.postId) {
        throw new ValidationError('Parent comment does not belong to this post');
      }

      depth = parentComment.depth + 1;

      if (depth > 10) {
        throw new ValidationError('Maximum comment depth exceeded');
      }
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
            verified: true,
            avatar: true,
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

    return comment;
  }

  async getCommentsByPostId(postId: string, userId?: string, sortBy: 'best' | 'new' | 'top' | 'controversial' = 'best') {
    const post = await prisma.post.findUnique({
      where: { id: postId }
    });

    if (!post) {
      throw new NotFoundError('Post not found');
    }

    let orderBy: any = {};
    switch (sortBy) {
      case 'new':
        orderBy = { createdAt: 'desc' };
        break;
      case 'top':
        orderBy = { score: 'desc' };
        break;
      case 'controversial':
        // Comments with similar upvotes and downvotes
        orderBy = { score: 'asc' };
        break;
      case 'best':
      default:
        orderBy = [{ score: 'desc' }, { createdAt: 'desc' }];
        break;
    }

    const comments = await prisma.comment.findMany({
      where: {
        postId,
        parentId: null, // Only top-level comments
        isRemoved: false,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            role: true,
            verified: true,
            avatar: true,
            specialty: true,
          }
        },
        replies: {
          include: {
            author: {
              select: {
                id: true,
                username: true,
                role: true,
                verified: true,
                avatar: true,
                specialty: true,
              }
            },
            _count: {
              select: {
                replies: true,
              }
            }
          },
          orderBy: { score: 'desc' },
          take: 3, // Load first 3 replies
        },
        _count: {
          select: {
            replies: true,
          }
        }
      },
      orderBy,
    });

    // Get user votes if authenticated
    let userVotes: Record<string, number> = {};
    if (userId) {
      const allCommentIds = comments.flatMap(c => [c.id, ...c.replies.map(r => r.id)]);
      const votes = await prisma.vote.findMany({
        where: {
          userId,
          commentId: { in: allCommentIds }
        }
      });
      userVotes = votes.reduce((acc, vote) => {
        if (vote.commentId) {
          acc[vote.commentId] = vote.value;
        }
        return acc;
      }, {} as Record<string, number>);
    }

    return comments.map(comment => ({
      ...comment,
      userVote: userVotes[comment.id] || null,
      replies: comment.replies.map(reply => ({
        ...reply,
        userVote: userVotes[reply.id] || null,
      }))
    }));
  }

  async getCommentReplies(commentId: string, userId?: string) {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId }
    });

    if (!comment) {
      throw new NotFoundError('Comment not found');
    }

    const replies = await prisma.comment.findMany({
      where: {
        parentId: commentId,
        isRemoved: false,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            role: true,
            verified: true,
            avatar: true,
            specialty: true,
          }
        },
        _count: {
          select: {
            replies: true,
          }
        }
      },
      orderBy: { score: 'desc' },
    });

    // Get user votes if authenticated
    let userVotes: Record<string, number> = {};
    if (userId) {
      const votes = await prisma.vote.findMany({
        where: {
          userId,
          commentId: { in: replies.map(r => r.id) }
        }
      });
      userVotes = votes.reduce((acc, vote) => {
        if (vote.commentId) {
          acc[vote.commentId] = vote.value;
        }
        return acc;
      }, {} as Record<string, number>);
    }

    return replies.map(reply => ({
      ...reply,
      userVote: userVotes[reply.id] || null,
    }));
  }

  async updateComment(commentId: string, userId: string, content: string) {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: {
        post: true,
      }
    });

    if (!comment) {
      throw new NotFoundError('Comment not found');
    }

    if (comment.authorId !== userId) {
      throw new ForbiddenError('Not authorized to update this comment');
    }

    if (comment.isLocked) {
      throw new ForbiddenError('Comment is locked and cannot be edited');
    }

    if (comment.post.isArchived) {
      throw new ForbiddenError('Cannot edit comment on archived post');
    }

    const updatedComment = await prisma.comment.update({
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
            verified: true,
          }
        }
      }
    });

    return updatedComment;
  }

  async deleteComment(commentId: string, userId: string, userRole: string) {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: {
        post: {
          include: {
            community: {
              include: {
                moderators: {
                  where: { userId }
                }
              }
            }
          }
        }
      }
    });

    if (!comment) {
      throw new NotFoundError('Comment not found');
    }

    const isAuthor = comment.authorId === userId;
    const isModerator = comment.post.community.moderators.length > 0;
    const isAdmin = userRole === 'ADMIN';

    if (!isAuthor && !isModerator && !isAdmin) {
      throw new ForbiddenError('Not authorized to delete this comment');
    }

    await prisma.comment.delete({
      where: { id: commentId }
    });

    // Update post comment count
    await prisma.post.update({
      where: { id: comment.postId },
      data: {
        commentCount: { decrement: 1 }
      }
    });

    return { message: 'Comment deleted successfully' };
  }

  async voteComment(commentId: string, userId: string, value: 1 | -1) {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: {
        post: true,
      }
    });

    if (!comment) {
      throw new NotFoundError('Comment not found');
    }

    if (comment.post.isArchived) {
      throw new ForbiddenError('Cannot vote on comment in archived post');
    }

    // Check existing vote
    const existingVote = await prisma.vote.findUnique({
      where: {
        userId_commentId: {
          userId,
          commentId
        }
      }
    });

    let scoreDelta = 0;
    let upvoteDelta = 0;
    let downvoteDelta = 0;

    if (existingVote) {
      if (existingVote.value === value) {
        // Remove vote
        await prisma.vote.delete({
          where: {
            userId_commentId: {
              userId,
              commentId
            }
          }
        });
        scoreDelta = -value;
        if (value === 1) upvoteDelta = -1;
        else downvoteDelta = -1;
      } else {
        // Change vote
        await prisma.vote.update({
          where: {
            userId_commentId: {
              userId,
              commentId
            }
          },
          data: { value }
        });
        scoreDelta = value * 2;
        if (value === 1) {
          upvoteDelta = 1;
          downvoteDelta = -1;
        } else {
          upvoteDelta = -1;
          downvoteDelta = 1;
        }
      }
    } else {
      // Create new vote
      await prisma.vote.create({
        data: {
          userId,
          commentId,
          value
        }
      });
      scoreDelta = value;
      if (value === 1) upvoteDelta = 1;
      else downvoteDelta = 1;
    }

    // Update comment score
    const updatedComment = await prisma.comment.update({
      where: { id: commentId },
      data: {
        score: { increment: scoreDelta },
        upvotes: { increment: upvoteDelta },
        downvotes: { increment: downvoteDelta }
      }
    });

    // Update author karma
    await prisma.user.update({
      where: { id: comment.authorId },
      data: {
        commentKarma: { increment: scoreDelta },
        totalKarma: { increment: scoreDelta }
      }
    });

    return updatedComment;
  }
}

export const commentService = new CommentService();
