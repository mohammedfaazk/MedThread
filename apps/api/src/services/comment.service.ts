import { prisma } from '@medthread/database';

interface CreateCommentInput {
  content: string;
  authorId: string;
  postId: string;
  parentId?: string;
}

export const commentService = {
  async createComment(data: CreateCommentInput) {
    // Calculate depth if it's a reply
    let depth = 0;
    if (data.parentId) {
      const parent = await prisma.comment.findUnique({
        where: { id: data.parentId },
        select: { depth: true }
      });
      depth = (parent?.depth || 0) + 1;

      // Limit nesting to 10 levels
      if (depth > 10) {
        throw new Error('Maximum comment nesting depth reached');
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
      }
    });

    // Update author karma
    const { karmaService } = await import('./karma.service');
    await karmaService.updateUserKarma(comment.authorId);

    return {
      score: comment.score,
      upvotes: comment.upvotes,
      downvotes: comment.downvotes,
    };
  },
};
