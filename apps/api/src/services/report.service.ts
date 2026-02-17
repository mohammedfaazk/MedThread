import { prisma } from '@medthread/database';
import { NotFoundError, ConflictError, BadRequestError } from '../utils/errors';
import { randomBytes } from 'crypto';

// Generate a cuid-like ID
function generateId(): string {
  return 'c' + randomBytes(12).toString('base64').replace(/[+/=]/g, '').substring(0, 24);
}

export class ReportService {
  /**
   * Report a post
   */
  async reportPost(userId: string, postId: string, reason: string, details?: string) {
    // Check if user already reported this post
    const existingReport = await prisma.report.findFirst({
      where: {
        userId,
        postId,
        status: 'PENDING'
      }
    });

    if (existingReport) {
      throw new ConflictError('You have already reported this post');
    }

    // Use raw SQL to bypass foreign key validation
    const result = await prisma.$queryRaw`
      INSERT INTO "Report" (id, "userId", "postId", reason, details, status, "createdAt")
      VALUES (
        ${generateId()},
        ${userId},
        ${postId},
        ${reason},
        ${details || null},
        'PENDING',
        NOW()
      )
      RETURNING *
    `;

    return Array.isArray(result) ? result[0] : result;
  }

  /**
   * Report a comment
   */
  async reportComment(userId: string, commentId: string, reason: string, details?: string) {
    // Check if user already reported this comment
    const existingReport = await prisma.report.findFirst({
      where: {
        userId,
        commentId,
        status: 'PENDING'
      }
    });

    if (existingReport) {
      throw new ConflictError('You have already reported this comment');
    }

    // Use raw SQL to bypass foreign key validation
    const result = await prisma.$queryRaw`
      INSERT INTO "Report" (id, "userId", "commentId", reason, details, status, "createdAt")
      VALUES (
        ${generateId()},
        ${userId},
        ${commentId},
        ${reason},
        ${details || null},
        'PENDING',
        NOW()
      )
      RETURNING *
    `;

    return Array.isArray(result) ? result[0] : result;
  }

  /**
   * Report a user
   */
  async reportUser(reporterId: string, reportedUserId: string, reason: string, details?: string) {
    // Cannot report yourself
    if (reporterId === reportedUserId) {
      throw new BadRequestError('You cannot report yourself');
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: reportedUserId }
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Check if user already reported this user
    const existingReport = await prisma.report.findFirst({
      where: {
        userId: reporterId,
        reportedUserId,
        status: 'PENDING'
      } as any
    });

    if (existingReport) {
      throw new ConflictError('You have already reported this user');
    }

    // Create report
    const report = await prisma.report.create({
      data: {
        userId: reporterId,
        reportedUserId,
        reason,
        details,
        status: 'PENDING',
      } as any,
      include: {
        reportedUser: {
          select: {
            username: true,
            email: true,
          }
        }
      } as any
    });

    return report;
  }

  /**
   * Get user's reports
   */
  async getUserReports(userId: string, filters: {
    page?: number;
    limit?: number;
  }) {
    const {
      page = 1,
      limit = 20
    } = filters;

    const skip = (page - 1) * limit;

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where: { userId },
        include: {
          post: {
            select: {
              id: true,
              title: true,
            }
          },
          comment: {
            select: {
              id: true,
              content: true,
            }
          },
          reportedUser: {
            select: {
              id: true,
              username: true,
            }
          }
        } as any,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.report.count({ where: { userId } })
    ]);

    return {
      reports,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
}

export const reportService = new ReportService();
