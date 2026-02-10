import { prisma } from '@medthread/database';
import { NotFoundError, ForbiddenError, ValidationError } from '../utils/errors';

interface CreatePostInput {
  title: string;
  content?: string;
  type: 'TEXT' | 'IMAGE' | 'VIDEO' | 'LINK' | 'POLL' | 'GALLERY';
  communityId: string;
  authorId: string;
  url?: string;
  mediaUrls?: string[];
  flairId?: string;
  isNSFW?: boolean;
  isSpoiler?: boolean;
}

interface UpdatePostInput {
  title?: string;
  content?: string;
  isNSFW?: boolean;
  isSpoiler?: boolean;
}

export class PostService {
  async createPost(data: CreatePostInput) {
    // Verify community exists
    const community = await prisma.community.findUnique({
      where: { id: data.communityId }
    });

    if (!community) {
      throw new NotFoundError('Community not found');
    }

    // Check if user is member of private community
    if (community.isPrivate) {
      const membership = await prisma.communityMember.findUnique({
        where: {
          userId_communityId: {
            userId: data.authorId,
            communityId: data.communityId
          }
        }
      });

      if (!membership) {
        throw new ForbiddenError('Must be a member to post in this community');
      }
    }

    const post = await prisma.post.create({
      data: {
        type: data.type,
        title: data.title,
        content: data.content,
        url: data.url,
        mediaUrls: data.mediaUrls || [],
        authorId: data.authorId,
        communityId: data.communityId,
        flairId: data.flairId,
        isNSFW: data.isNSFW || false,
        isSpoiler: data.isSpoiler || false,
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
        },
        community: {
          select: {
            id: true,
            name: true,
            displayName: true,
            icon: true,
          }
        },
        flair: true,
      }
    });

    // Update community member count
    await prisma.community.update({
      where: { id: data.communityId },
      data: { memberCount: { increment: 0 } } // Trigger update
    });

    return post;
  }

  async getPostById(postId: string, userId?: string) {
    const post = await prisma.post.findUnique({
      where: { id: postId },
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
        community: {
          select: {
            id: true,
            name: true,
            displayName: true,
            icon: true,
            isNSFW: true,
          }
        },
        flair: true,
        _count: {
          select: {
            comments: true,
            votes: true,
          }
        }
      }
    });

    if (!post) {
      throw new NotFoundError('Post not found');
    }

    if (post.isRemoved && !userId) {
      throw new NotFoundError('Post not found');
    }

    // Get user's vote if authenticated
    let userVote = null;
    if (userId) {
      const vote = await prisma.vote.findUnique({
        where: {
          userId_postId: {
            userId,
            postId
          }
        }
      });
      userVote = vote?.value || null;
    }

    return {
      ...post,
      userVote
    };
  }

  async getPosts(filters: {
    communityId?: string;
    authorId?: string;
    sortBy?: 'hot' | 'new' | 'top' | 'rising';
    page?: number;
    limit?: number;
    userId?: string;
  }) {
    const {
      communityId,
      authorId,
      sortBy = 'hot',
      page = 1,
      limit = 20,
      userId
    } = filters;

    const skip = (page - 1) * limit;

    const where: any = {
      isRemoved: false,
    };

    if (communityId) where.communityId = communityId;
    if (authorId) where.authorId = authorId;

    let orderBy: any = {};
    switch (sortBy) {
      case 'new':
        orderBy = { createdAt: 'desc' };
        break;
      case 'top':
        orderBy = { score: 'desc' };
        break;
      case 'rising':
        orderBy = [{ score: 'desc' }, { createdAt: 'desc' }];
        break;
      case 'hot':
      default:
        // Hot algorithm: score / (hours_since_post + 2)^1.5
        orderBy = { score: 'desc' };
        break;
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              username: true,
              role: true,
              verified: true,
              avatar: true,
            }
          },
          community: {
            select: {
              id: true,
              name: true,
              displayName: true,
              icon: true,
            }
          },
          flair: true,
          _count: {
            select: {
              comments: true,
            }
          }
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.post.count({ where })
    ]);

    // Get user votes if authenticated
    let userVotes: Record<string, number> = {};
    if (userId) {
      const votes = await prisma.vote.findMany({
        where: {
          userId,
          postId: { in: posts.map(p => p.id) }
        }
      });
      userVotes = votes.reduce((acc, vote) => {
        acc[vote.postId!] = vote.value;
        return acc;
      }, {} as Record<string, number>);
    }

    return {
      posts: posts.map(post => ({
        ...post,
        userVote: userVotes[post.id] || null
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async updatePost(postId: string, userId: string, data: UpdatePostInput) {
    const post = await prisma.post.findUnique({
      where: { id: postId }
    });

    if (!post) {
      throw new NotFoundError('Post not found');
    }

    if (post.authorId !== userId) {
      throw new ForbiddenError('Not authorized to update this post');
    }

    if (post.isLocked) {
      throw new ForbiddenError('Post is locked and cannot be edited');
    }

    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: {
        ...data,
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
        },
        community: {
          select: {
            id: true,
            name: true,
            displayName: true,
          }
        }
      }
    });

    return updatedPost;
  }

  async deletePost(postId: string, userId: string, userRole: string) {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        community: {
          include: {
            moderators: {
              where: { userId }
            }
          }
        }
      }
    });

    if (!post) {
      throw new NotFoundError('Post not found');
    }

    const isAuthor = post.authorId === userId;
    const isModerator = post.community.moderators.length > 0;
    const isAdmin = userRole === 'ADMIN';

    if (!isAuthor && !isModerator && !isAdmin) {
      throw new ForbiddenError('Not authorized to delete this post');
    }

    await prisma.post.delete({
      where: { id: postId }
    });

    return { message: 'Post deleted successfully' };
  }

  async votePost(postId: string, userId: string, value: 1 | -1) {
    const post = await prisma.post.findUnique({
      where: { id: postId }
    });

    if (!post) {
      throw new NotFoundError('Post not found');
    }

    if (post.isArchived) {
      throw new ForbiddenError('Cannot vote on archived post');
    }

    // Check existing vote
    const existingVote = await prisma.vote.findUnique({
      where: {
        userId_postId: {
          userId,
          postId
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
            userId_postId: {
              userId,
              postId
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
            userId_postId: {
              userId,
              postId
            }
          },
          data: { value }
        });
        scoreDelta = value * 2; // From -1 to 1 or vice versa
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
          postId,
          value
        }
      });
      scoreDelta = value;
      if (value === 1) upvoteDelta = 1;
      else downvoteDelta = 1;
    }

    // Update post score
    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: {
        score: { increment: scoreDelta },
        upvotes: { increment: upvoteDelta },
        downvotes: { increment: downvoteDelta }
      }
    });

    // Update author karma
    await prisma.user.update({
      where: { id: post.authorId },
      data: {
        postKarma: { increment: scoreDelta },
        totalKarma: { increment: scoreDelta }
      }
    });

    return updatedPost;
  }

  async savePost(postId: string, userId: string) {
    const post = await prisma.post.findUnique({
      where: { id: postId }
    });

    if (!post) {
      throw new NotFoundError('Post not found');
    }

    const existingSave = await prisma.savedPost.findUnique({
      where: {
        userId_postId: {
          userId,
          postId
        }
      }
    });

    if (existingSave) {
      await prisma.savedPost.delete({
        where: {
          userId_postId: {
            userId,
            postId
          }
        }
      });
      return { saved: false };
    } else {
      await prisma.savedPost.create({
        data: {
          userId,
          postId
        }
      });
      return { saved: true };
    }
  }

  async hidePost(postId: string, userId: string) {
    const post = await prisma.post.findUnique({
      where: { id: postId }
    });

    if (!post) {
      throw new NotFoundError('Post not found');
    }

    const existingHide = await prisma.hiddenPost.findUnique({
      where: {
        userId_postId: {
          userId,
          postId
        }
      }
    });

    if (existingHide) {
      await prisma.hiddenPost.delete({
        where: {
          userId_postId: {
            userId,
            postId
          }
        }
      });
      return { hidden: false };
    } else {
      await prisma.hiddenPost.create({
        data: {
          userId,
          postId
        }
      });
      return { hidden: true };
    }
  }
}

export const postService = new PostService();
