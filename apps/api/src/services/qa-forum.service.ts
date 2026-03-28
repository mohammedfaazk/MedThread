import { prisma } from '@medthread/database';
import { notificationService } from './notification.service';

interface CreateQuestionData {
  title: string;
  content: string;
  category: string;
  tags: string[];
  isAnonymous: boolean;
  authorId: string;
}

interface CreateAnswerData {
  content: string;
  authorId: string;
  questionId: string;
}

export class QAForumService {
  /**
   * Create a new question
   */
  async createQuestion(data: CreateQuestionData) {
    try {
      const question = await prisma.forumQuestion.create({
        data: {
          title: data.title,
          content: data.content,
          category: data.category,
          tags: data.tags,
          isAnonymous: data.isAnonymous,
          authorId: data.authorId,
          status: 'OPEN',
          viewCount: 0,
          upvotes: 0,
          downvotes: 0
        },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              role: true,
              avatar: true,
              specialty: true
            }
          }
        }
      });

      // Notify relevant doctors based on category
      await this.notifyRelevantDoctors(question);

      return question;
    } catch (error) {
      console.error('[QAForum] Error creating question:', error);
      throw error;
    }
  }

  /**
   * Get questions with filters
   */
  async getQuestions(filters: {
    category?: string;
    status?: string;
    tags?: string[];
    search?: string;
    page?: number;
    limit?: number;
  }) {
    try {
      const page = filters.page || 1;
      const limit = filters.limit || 20;
      const skip = (page - 1) * limit;

      const where: any = {};

      if (filters.category) {
        where.category = filters.category;
      }

      if (filters.status) {
        where.status = filters.status;
      }

      if (filters.tags && filters.tags.length > 0) {
        where.tags = {
          hasSome: filters.tags
        };
      }

      if (filters.search) {
        where.OR = [
          { title: { contains: filters.search, mode: 'insensitive' } },
          { content: { contains: filters.search, mode: 'insensitive' } }
        ];
      }

      const [questions, total] = await Promise.all([
        prisma.forumQuestion.findMany({
          where,
          include: {
            author: {
              select: {
                id: true,
                username: true,
                role: true,
                avatar: true,
                specialty: true
              }
            },
            _count: {
              select: {
                answers: true
              }
            }
          },
          orderBy: [
            { isPinned: 'desc' },
            { createdAt: 'desc' }
          ],
          skip,
          take: limit
        }),
        prisma.forumQuestion.count({ where })
      ]);

      return {
        questions,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('[QAForum] Error getting questions:', error);
      throw error;
    }
  }

  /**
   * Get single question with answers
   */
  async getQuestion(questionId: string) {
    try {
      // Increment view count
      await prisma.forumQuestion.update({
        where: { id: questionId },
        data: { viewCount: { increment: 1 } }
      });

      const question = await prisma.forumQuestion.findUnique({
        where: { id: questionId },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              role: true,
              avatar: true,
              specialty: true
            }
          },
          answers: {
            include: {
              author: {
                select: {
                  id: true,
                  username: true,
                  role: true,
                  avatar: true,
                  specialty: true
                }
              }
            },
            orderBy: [
              { isAccepted: 'desc' },
              { upvotes: 'desc' },
              { createdAt: 'asc' }
            ]
          }
        }
      });

      return question;
    } catch (error) {
      console.error('[QAForum] Error getting question:', error);
      throw error;
    }
  }

  /**
   * Create an answer
   */
  async createAnswer(data: CreateAnswerData) {
    try {
      const answer = await prisma.forumAnswer.create({
        data: {
          content: data.content,
          authorId: data.authorId,
          questionId: data.questionId,
          upvotes: 0,
          downvotes: 0,
          isAccepted: false
        },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              role: true,
              avatar: true,
              specialty: true
            }
          }
        }
      });

      // Notify question author
      const question = await prisma.forumQuestion.findUnique({
        where: { id: data.questionId },
        select: { authorId: true, title: true }
      });

      if (question && question.authorId !== data.authorId) {
        await notificationService.sendNotification(question.authorId, {
          title: 'New Answer to Your Question',
          body: `Someone answered your question: "${question.title}"`,
          type: 'REPLY',
          data: {
            questionId: data.questionId,
            answerId: answer.id
          },
          actorId: data.authorId
        });
      }

      return answer;
    } catch (error) {
      console.error('[QAForum] Error creating answer:', error);
      throw error;
    }
  }

  /**
   * Accept an answer (question author only)
   */
  async acceptAnswer(answerId: string, userId: string) {
    try {
      const answer = await prisma.forumAnswer.findUnique({
        where: { id: answerId },
        include: {
          question: {
            select: { authorId: true, id: true }
          }
        }
      });

      if (!answer) {
        throw new Error('Answer not found');
      }

      if (answer.question.authorId !== userId) {
        throw new Error('Only question author can accept answers');
      }

      // Unaccept other answers
      await prisma.forumAnswer.updateMany({
        where: { questionId: answer.question.id },
        data: { isAccepted: false }
      });

      // Accept this answer
      const updatedAnswer = await prisma.forumAnswer.update({
        where: { id: answerId },
        data: { isAccepted: true }
      });

      // Update question status
      await prisma.forumQuestion.update({
        where: { id: answer.question.id },
        data: { status: 'ANSWERED' }
      });

      // Notify answer author
      await notificationService.sendNotification(answer.authorId, {
        title: 'Your Answer Was Accepted!',
        body: 'Your answer was marked as the best answer',
        type: 'ANSWER_ACCEPTED',
        data: {
          answerId,
          questionId: answer.question.id
        }
      });

      return updatedAnswer;
    } catch (error) {
      console.error('[QAForum] Error accepting answer:', error);
      throw error;
    }
  }

  /**
   * Vote on question
   */
  async voteQuestion(questionId: string, userId: string, voteType: 'up' | 'down') {
    try {
      const existingVote = await prisma.forumVote.findFirst({
        where: {
          userId,
          questionId,
          contentType: 'QUESTION'
        }
      });

      if (existingVote) {
        // Update existing vote
        if (existingVote.voteType === voteType) {
          // Remove vote
          await prisma.forumVote.delete({
            where: { id: existingVote.id }
          });

          await prisma.forumQuestion.update({
            where: { id: questionId },
            data: {
              [voteType === 'up' ? 'upvotes' : 'downvotes']: { decrement: 1 }
            }
          });
        } else {
          // Change vote
          await prisma.forumVote.update({
            where: { id: existingVote.id },
            data: { voteType }
          });

          await prisma.forumQuestion.update({
            where: { id: questionId },
            data: {
              upvotes: { [voteType === 'up' ? 'increment' : 'decrement']: 1 },
              downvotes: { [voteType === 'down' ? 'increment' : 'decrement']: 1 }
            }
          });
        }
      } else {
        // Create new vote
        await prisma.forumVote.create({
          data: {
            userId,
            questionId,
            contentType: 'QUESTION',
            voteType
          }
        });

        await prisma.forumQuestion.update({
          where: { id: questionId },
          data: {
            [voteType === 'up' ? 'upvotes' : 'downvotes']: { increment: 1 }
          }
        });
      }

      return { success: true };
    } catch (error) {
      console.error('[QAForum] Error voting question:', error);
      throw error;
    }
  }

  /**
   * Vote on answer
   */
  async voteAnswer(answerId: string, userId: string, voteType: 'up' | 'down') {
    try {
      const existingVote = await prisma.forumVote.findFirst({
        where: {
          userId,
          answerId,
          contentType: 'ANSWER'
        }
      });

      if (existingVote) {
        if (existingVote.voteType === voteType) {
          await prisma.forumVote.delete({
            where: { id: existingVote.id }
          });

          await prisma.forumAnswer.update({
            where: { id: answerId },
            data: {
              [voteType === 'up' ? 'upvotes' : 'downvotes']: { decrement: 1 }
            }
          });
        } else {
          await prisma.forumVote.update({
            where: { id: existingVote.id },
            data: { voteType }
          });

          await prisma.forumAnswer.update({
            where: { id: answerId },
            data: {
              upvotes: { [voteType === 'up' ? 'increment' : 'decrement']: 1 },
              downvotes: { [voteType === 'down' ? 'increment' : 'decrement']: 1 }
            }
          });
        }
      } else {
        await prisma.forumVote.create({
          data: {
            userId,
            answerId,
            contentType: 'ANSWER',
            voteType
          }
        });

        await prisma.forumAnswer.update({
          where: { id: answerId },
          data: {
            [voteType === 'up' ? 'upvotes' : 'downvotes']: { increment: 1 }
          }
        });
      }

      return { success: true };
    } catch (error) {
      console.error('[QAForum] Error voting answer:', error);
      throw error;
    }
  }

  /**
   * Pin/unpin question (moderator only)
   */
  async togglePin(questionId: string, userId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true }
      });

      if (user?.role !== 'ADMIN' && user?.role !== 'DOCTOR') {
        throw new Error('Only moderators can pin questions');
      }

      const question = await prisma.forumQuestion.findUnique({
        where: { id: questionId },
        select: { isPinned: true }
      });

      const updated = await prisma.forumQuestion.update({
        where: { id: questionId },
        data: { isPinned: !question?.isPinned }
      });

      return updated;
    } catch (error) {
      console.error('[QAForum] Error toggling pin:', error);
      throw error;
    }
  }

  /**
   * Notify relevant doctors about new question
   */
  private async notifyRelevantDoctors(question: any) {
    try {
      // Find doctors with matching specialty
      const doctors = await prisma.user.findMany({
        where: {
          role: 'DOCTOR',
          isVerified: true,
          specialty: {
            contains: question.category,
            mode: 'insensitive'
          }
        },
        select: { id: true }
      });

      // Send notifications
      for (const doctor of doctors) {
        await notificationService.sendNotification(doctor.id, {
          title: 'New Question in Your Specialty',
          body: question.title,
          type: 'FORUM_QUESTION',
          data: {
            questionId: question.id,
            category: question.category
          }
        });
      }
    } catch (error) {
      console.error('[QAForum] Error notifying doctors:', error);
    }
  }

  /**
   * Get trending questions
   */
  async getTrendingQuestions(limit: number = 10) {
    try {
      const questions = await prisma.forumQuestion.findMany({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          }
        },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              role: true,
              avatar: true
            }
          },
          _count: {
            select: { answers: true }
          }
        },
        orderBy: [
          { viewCount: 'desc' },
          { upvotes: 'desc' }
        ],
        take: limit
      });

      return questions;
    } catch (error) {
      console.error('[QAForum] Error getting trending questions:', error);
      throw error;
    }
  }
}

export const qaForumService = new QAForumService();
