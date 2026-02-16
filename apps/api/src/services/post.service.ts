import { prisma } from '@medthread/database';
import { PostType } from '@prisma/client';

interface CreatePostInput {
  title: string;
  content?: string;
  type?: PostType;
  url?: string;
  mediaUrls?: string[];
  authorId: string;
  communityId: string;
  flairId?: string;
  isNSFW?: boolean;
  isSpoiler?: boolean;
  isDraft?: boolean;
}

interface GetPostsOptions {
  community?: string;
  sort?: 'hot' | 'new' | 'top' | 'rising';
  limit?: number;
  offset?: number;
  authorId?: string;
  tags?: string[];
  specialty?: string;
  authorType?: 'doctor' | 'patient' | 'all';
  dateFrom?: Date;
  dateTo?: Date;
  postType?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'LINK' | 'POLL';
}

export const postService = {
  async createPost(data: CreatePostInput) {
    const post = await prisma.post.create({
      data: {
        title: data.title,
        content: data.content,
        type: data.type || 'TEXT',
        url: data.url,
        mediaUrls: data.mediaUrls || [],
        authorId: data.authorId,
        communityId: data.communityId,
        flairId: data.flairId,
        isNSFW: data.isNSFW || false,
        isSpoiler: data.isSpoiler || false,
        isDraft: data.isDraft || false,
        publishedAt: data.isDraft ? null : new Date(),
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
            votes: true,
          }
        }
      }
    });

    return post;
  },

  async getPosts(options: GetPostsOptions) {
    const { 
      community, 
      sort = 'hot', 
      limit = 20, 
      offset = 0, 
      authorId, 
      tags,
      specialty,
      authorType,
      dateFrom,
      dateTo,
      postType
    } = options;

    let orderBy: any;
    
    switch (sort) {
      case 'new':
        orderBy = { createdAt: 'desc' };
        break;
      case 'top':
        orderBy = { score: 'desc' };
        break;
      case 'hot':
      case 'rising':
        // For hot/rising, we'll sort by createdAt and apply algorithm in memory
        orderBy = { createdAt: 'desc' };
        break;
      default:
        orderBy = { createdAt: 'desc' };
    }

    const where: any = {
      isRemoved: false,
      isArchived: false,
      isDraft: false,
    };

    // Filter by community
    if (community) {
      where.community = { name: community };
    }

    // Filter by author
    if (authorId) {
      where.authorId = authorId;
    }

    // Filter by specialty (medical)
    if (specialty) {
      where.author = {
        specialty: { contains: specialty, mode: 'insensitive' }
      };
    }

    // Filter by author type (doctor/patient)
    if (authorType && authorType !== 'all') {
      if (authorType === 'doctor') {
        where.author = {
          ...where.author,
          OR: [
            { role: 'VERIFIED_DOCTOR' },
            { 
              AND: [
                { role: 'DOCTOR' },
                { doctorVerificationStatus: 'APPROVED' }
              ]
            }
          ]
        };
      } else if (authorType === 'patient') {
        where.author = {
          ...where.author,
          role: { not: 'VERIFIED_DOCTOR' },
          OR: [
            { role: { not: 'DOCTOR' } },
            { doctorVerificationStatus: { not: 'APPROVED' } }
          ]
        };
      }
    }

    // Filter by date range
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt.gte = dateFrom;
      }
      if (dateTo) {
        where.createdAt.lte = dateTo;
      }
    }

    // Filter by post type
    if (postType) {
      where.type = postType;
    }

    const posts = await prisma.post.findMany({
      where,
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
            votes: true,
          }
        }
      },
      orderBy,
      take: limit,
      skip: offset
    });

    // Apply hot/rising algorithm if needed
    if (sort === 'hot' || sort === 'rising') {
      return this.applyRankingAlgorithm(posts, sort);
    }

    return posts;
  },

  async getPostById(postId: string, userId?: string) {
    const post = await prisma.post.findUnique({
      where: { id: postId },
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
        community: {
          select: {
            id: true,
            name: true,
            displayName: true,
            icon: true,
            description: true,
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
      throw new Error('Post not found');
    }

    // Get user's vote if userId provided
    let userVote = null;
    let isSaved = false;
    let isHidden = false;

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

      const saved = await prisma.savedPost.findUnique({
        where: {
          userId_postId: {
            userId,
            postId
          }
        }
      });
      isSaved = !!saved;

      const hidden = await prisma.hiddenPost.findUnique({
        where: {
          userId_postId: {
            userId,
            postId
          }
        }
      });
      isHidden = !!hidden;
    }

    return {
      ...post,
      userVote,
      isSaved,
      isHidden,
    };
  },

  async updatePost(postId: string, userId: string, data: Partial<CreatePostInput>) {
    // Verify ownership
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true }
    });

    if (!post) {
      throw new Error('Post not found');
    }

    if (post.authorId !== userId) {
      throw new Error('Unauthorized');
    }

    return await prisma.post.update({
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
            avatar: true,
            doctorVerificationStatus: true,
          }
        },
        community: true,
        flair: true,
      }
    });
  },

  async deletePost(postId: string, userId: string) {
    // Verify ownership
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true }
    });

    if (!post) {
      throw new Error('Post not found');
    }

    if (post.authorId !== userId) {
      throw new Error('Unauthorized');
    }

    // Soft delete
    return await prisma.post.update({
      where: { id: postId },
      data: {
        isRemoved: true,
        content: '[deleted]',
      }
    });
  },

  async votePost(postId: string, userId: string, value: number) {
    if (value !== 1 && value !== -1) {
      throw new Error('Vote value must be 1 or -1');
    }

    // Check if vote exists
    const existingVote = await prisma.vote.findUnique({
      where: {
        userId_postId: {
          userId,
          postId
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
        data: { userId, postId, value }
      });
      voteChange = value;
    }

    // Update post score
    const post = await prisma.post.update({
      where: { id: postId },
      data: {
        upvotes: value === 1 ? { increment: voteChange > 0 ? 1 : -1 } : undefined,
        downvotes: value === -1 ? { increment: voteChange < 0 ? 1 : -1 } : undefined,
        score: { increment: voteChange }
      },
      select: {
        score: true,
        upvotes: true,
        downvotes: true,
      }
    });

    // Update author karma
    const postAuthor = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true }
    });

    if (postAuthor) {
      // Use centralized karma service
      const { karmaService } = await import('./karma.service');
      await karmaService.updateUserKarma(postAuthor.authorId);
    }

    return post;
  },

  async savePost(postId: string, userId: string) {
    const existing = await prisma.savedPost.findUnique({
      where: {
        userId_postId: {
          userId,
          postId
        }
      }
    });

    if (existing) {
      // Unsave
      await prisma.savedPost.delete({
        where: { id: existing.id }
      });
      return { saved: false };
    } else {
      // Save
      await prisma.savedPost.create({
        data: { userId, postId }
      });
      return { saved: true };
    }
  },

  async hidePost(postId: string, userId: string) {
    const existing = await prisma.hiddenPost.findUnique({
      where: {
        userId_postId: {
          userId,
          postId
        }
      }
    });

    if (existing) {
      // Unhide
      await prisma.hiddenPost.delete({
        where: { id: existing.id }
      });
      return { hidden: false };
    } else {
      // Hide
      await prisma.hiddenPost.create({
        data: { userId, postId }
      });
      return { hidden: true };
    }
  },

  applyRankingAlgorithm(posts: any[], algorithm: 'hot' | 'rising') {
    const now = new Date().getTime();

    const rankedPosts = posts.map(post => {
      const createdAt = new Date(post.createdAt).getTime();
      const hoursOld = (now - createdAt) / (1000 * 60 * 60);

      let rankScore = 0;

      if (algorithm === 'hot') {
        // Hot algorithm: score / (hours + 2)^1.5
        rankScore = post.score / Math.pow(hoursOld + 2, 1.5);
      } else if (algorithm === 'rising') {
        // Rising algorithm: score / (hours + 1)
        rankScore = post.score / (hoursOld + 1);
      }

      return {
        ...post,
        rankScore
      };
    });

    // Sort by rank score
    return rankedPosts.sort((a, b) => b.rankScore - a.rankScore);
  },

  async getDrafts(userId: string) {
    return await prisma.post.findMany({
      where: {
        authorId: userId,
        isDraft: true,
        isRemoved: false,
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
      },
      orderBy: { updatedAt: 'desc' }
    });
  },

  async publishDraft(postId: string, userId: string) {
    // Verify ownership
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true, isDraft: true }
    });

    if (!post) {
      throw new Error('Post not found');
    }

    if (post.authorId !== userId) {
      throw new Error('Unauthorized');
    }

    if (!post.isDraft) {
      throw new Error('Post is not a draft');
    }

    return await prisma.post.update({
      where: { id: postId },
      data: {
        isDraft: false,
        publishedAt: new Date(),
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
        },
        community: true,
        flair: true,
      }
    });
  },

  async getSavedPosts(userId: string, limit = 20, offset = 0) {
    const savedPosts = await prisma.savedPost.findMany({
      where: { userId },
      include: {
        post: {
          include: {
            author: {
              select: {
                id: true,
                username: true,
                role: true,
                avatar: true,
                doctorVerificationStatus: true,
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
                votes: true,
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    });

    return savedPosts.map(sp => sp.post);
  },

  async getHiddenPosts(userId: string, limit = 20, offset = 0) {
    const hiddenPosts = await prisma.hiddenPost.findMany({
      where: { userId },
      include: {
        post: {
          include: {
            author: {
              select: {
                id: true,
                username: true,
                role: true,
                avatar: true,
                doctorVerificationStatus: true,
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
                votes: true,
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    });

    return hiddenPosts.map(hp => hp.post);
  },
};
