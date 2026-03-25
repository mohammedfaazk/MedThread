import { prisma } from '@medthread/database';
import { notificationService } from './notification.service';

interface CreateReportData {
  reporterId: string;
  reportedUserId?: string;
  reportedContentId?: string;
  contentType: 'USER' | 'POST' | 'COMMENT' | 'MESSAGE' | 'QUESTION' | 'ANSWER' | 'STORY';
  reason: string;
  category: 'SPAM' | 'HARASSMENT' | 'MISINFORMATION' | 'INAPPROPRIATE' | 'MEDICAL_CONCERN' | 'OTHER';
  description?: string;
  evidence?: string[];
}

export class ReportingBlockingService {
  /**
   * Create a report
   */
  async createReport(data: CreateReportData) {
    try {
      // Check for duplicate reports
      const existingReport = await prisma.report.findFirst({
        where: {
          reporterId: data.reporterId,
          reportedUserId: data.reportedUserId,
          reportedContentId: data.reportedContentId,
          status: { in: ['PENDING', 'UNDER_REVIEW'] }
        }
      });

      if (existingReport) {
        throw new Error('You have already reported this');
      }

      const report = await prisma.report.create({
        data: {
          reporterId: data.reporterId,
          reportedUserId: data.reportedUserId,
          reportedContentId: data.reportedContentId,
          contentType: data.contentType,
          reason: data.reason,
          category: data.category,
          description: data.description,
          evidence: data.evidence || [],
          status: 'PENDING',
          priority: this.calculatePriority(data.category)
        },
        include: {
          reporter: {
            select: {
              id: true,
              username: true,
              role: true
            }
          },
          reportedUser: {
            select: {
              id: true,
              username: true,
              role: true
            }
          }
        }
      });

      // Notify moderators
      await this.notifyModerators(report);

      // Auto-action for high-priority reports
      if (report.priority === 'HIGH' || report.priority === 'CRITICAL') {
        await this.handleHighPriorityReport(report);
      }

      return report;
    } catch (error) {
      console.error('[ReportingBlocking] Error creating report:', error);
      throw error;
    }
  }

  /**
   * Calculate report priority
   */
  private calculatePriority(category: string): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    switch (category) {
      case 'MEDICAL_CONCERN':
        return 'CRITICAL';
      case 'HARASSMENT':
      case 'MISINFORMATION':
        return 'HIGH';
      case 'INAPPROPRIATE':
        return 'MEDIUM';
      default:
        return 'LOW';
    }
  }

  /**
   * Get all reports with filters
   */
  async getReports(filters?: {
    status?: string;
    category?: string;
    priority?: string;
    page?: number;
    limit?: number;
  }) {
    try {
      const page = filters?.page || 1;
      const limit = filters?.limit || 50;
      const skip = (page - 1) * limit;

      const where: any = {};

      if (filters?.status) {
        where.status = filters.status;
      }

      if (filters?.category) {
        where.category = filters.category;
      }

      if (filters?.priority) {
        where.priority = filters.priority;
      }

      const [reports, total] = await Promise.all([
        prisma.report.findMany({
          where,
          include: {
            reporter: {
              select: {
                id: true,
                username: true,
                role: true,
                profilePicture: true
              }
            },
            reportedUser: {
              select: {
                id: true,
                username: true,
                role: true,
                profilePicture: true
              }
            },
            reviewer: {
              select: {
                id: true,
                username: true,
                role: true
              }
            }
          },
          orderBy: [
            { priority: 'desc' },
            { createdAt: 'asc' }
          ],
          skip,
          take: limit
        }),
        prisma.report.count({ where })
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
    } catch (error) {
      console.error('[ReportingBlocking] Error getting reports:', error);
      throw error;
    }
  }

  /**
   * Review a report
   */
  async reviewReport(
    reportId: string,
    reviewerId: string,
    action: 'DISMISS' | 'WARN' | 'SUSPEND' | 'BAN' | 'DELETE_CONTENT',
    notes?: string
  ) {
    try {
      const report = await prisma.report.update({
        where: { id: reportId },
        data: {
          status: 'RESOLVED',
          reviewerId,
          reviewedAt: new Date(),
          action,
          reviewNotes: notes
        },
        include: {
          reportedUser: true,
          reporter: true
        }
      });

      // Take action based on review
      switch (action) {
        case 'WARN':
          await this.warnUser(report.reportedUserId!, notes);
          break;
        case 'SUSPEND':
          await this.suspendUser(report.reportedUserId!, 7, notes); // 7 days
          break;
        case 'BAN':
          await this.banUser(report.reportedUserId!, notes);
          break;
        case 'DELETE_CONTENT':
          await this.deleteContent(report.reportedContentId!, report.contentType);
          break;
      }

      // Notify reporter
      await notificationService.sendNotification(report.reporterId, {
        title: 'Report Reviewed',
        body: 'Your report has been reviewed and action has been taken',
        type: 'REPORT_RESOLVED',
        data: {
          reportId,
          action
        }
      });

      return report;
    } catch (error) {
      console.error('[ReportingBlocking] Error reviewing report:', error);
      throw error;
    }
  }

  /**
   * Warn user
   */
  private async warnUser(userId: string, reason?: string) {
    try {
      await prisma.userWarning.create({
        data: {
          userId,
          reason: reason || 'Community guidelines violation',
          issuedAt: new Date()
        }
      });

      await notificationService.sendNotification(userId, {
        title: '⚠️ Warning',
        body: `You received a warning: ${reason || 'Community guidelines violation'}`,
        type: 'USER_WARNING',
        data: { reason: reason || '' }
      });
    } catch (error) {
      console.error('[ReportingBlocking] Error warning user:', error);
    }
  }

  /**
   * Suspend user
   */
  private async suspendUser(userId: string, days: number, reason?: string) {
    try {
      const suspendUntil = new Date();
      suspendUntil.setDate(suspendUntil.getDate() + days);

      await prisma.user.update({
        where: { id: userId },
        data: {
          isSuspended: true,
          suspendedUntil: suspendUntil,
          suspensionReason: reason
        }
      });

      await notificationService.sendNotification(userId, {
        title: '🚫 Account Suspended',
        body: `Your account has been suspended for ${days} days. Reason: ${reason || 'Community guidelines violation'}`,
        urgent: true,
        type: 'ACCOUNT_SUSPENDED',
        data: {
          days: days.toString(),
          reason: reason || '',
          until: suspendUntil.toISOString()
        }
      });
    } catch (error) {
      console.error('[ReportingBlocking] Error suspending user:', error);
    }
  }

  /**
   * Ban user permanently
   */
  private async banUser(userId: string, reason?: string) {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: {
          isBanned: true,
          bannedAt: new Date(),
          banReason: reason
        }
      });

      await notificationService.sendNotification(userId, {
        title: '🚫 Account Banned',
        body: `Your account has been permanently banned. Reason: ${reason || 'Severe community guidelines violation'}`,
        urgent: true,
        type: 'ACCOUNT_BANNED',
        data: { reason: reason || '' }
      });
    } catch (error) {
      console.error('[ReportingBlocking] Error banning user:', error);
    }
  }

  /**
   * Delete content
   */
  private async deleteContent(contentId: string, contentType: string) {
    try {
      switch (contentType) {
        case 'POST':
          await prisma.post.update({
            where: { id: contentId },
            data: { isDeleted: true }
          });
          break;
        case 'COMMENT':
          await prisma.comment.update({
            where: { id: contentId },
            data: { isDeleted: true }
          });
          break;
        case 'QUESTION':
          await prisma.forumQuestion.update({
            where: { id: contentId },
            data: { status: 'DELETED' }
          });
          break;
        case 'ANSWER':
          await prisma.forumAnswer.update({
            where: { id: contentId },
            data: { isDeleted: true }
          });
          break;
        case 'STORY':
          await prisma.successStory.update({
            where: { id: contentId },
            data: { status: 'DELETED' }
          });
          break;
      }
    } catch (error) {
      console.error('[ReportingBlocking] Error deleting content:', error);
    }
  }

  /**
   * Block user
   */
  async blockUser(blockerId: string, blockedId: string) {
    try {
      // Check if already blocked
      const existing = await prisma.userBlock.findFirst({
        where: {
          blockerId,
          blockedId
        }
      });

      if (existing) {
        throw new Error('User already blocked');
      }

      const block = await prisma.userBlock.create({
        data: {
          blockerId,
          blockedId
        }
      });

      return block;
    } catch (error) {
      console.error('[ReportingBlocking] Error blocking user:', error);
      throw error;
    }
  }

  /**
   * Unblock user
   */
  async unblockUser(blockerId: string, blockedId: string) {
    try {
      await prisma.userBlock.deleteMany({
        where: {
          blockerId,
          blockedId
        }
      });

      return { success: true };
    } catch (error) {
      console.error('[ReportingBlocking] Error unblocking user:', error);
      throw error;
    }
  }

  /**
   * Get blocked users
   */
  async getBlockedUsers(userId: string) {
    try {
      const blocks = await prisma.userBlock.findMany({
        where: { blockerId: userId },
        include: {
          blocked: {
            select: {
              id: true,
              username: true,
              fullName: true,
              profilePicture: true
            }
          }
        }
      });

      return blocks.map(b => b.blocked);
    } catch (error) {
      console.error('[ReportingBlocking] Error getting blocked users:', error);
      throw error;
    }
  }

  /**
   * Check if user is blocked
   */
  async isBlocked(userId: string, targetUserId: string): Promise<boolean> {
    try {
      const block = await prisma.userBlock.findFirst({
        where: {
          OR: [
            { blockerId: userId, blockedId: targetUserId },
            { blockerId: targetUserId, blockedId: userId }
          ]
        }
      });

      return !!block;
    } catch (error) {
      console.error('[ReportingBlocking] Error checking block status:', error);
      return false;
    }
  }

  /**
   * Notify moderators about new report
   */
  private async notifyModerators(report: any) {
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
          title: `New ${report.priority} Priority Report`,
          body: `${report.category}: ${report.reason}`,
          type: 'NEW_REPORT',
          urgent: report.priority === 'CRITICAL' || report.priority === 'HIGH',
          data: {
            reportId: report.id,
            category: report.category,
            priority: report.priority
          }
        });
      }
    } catch (error) {
      console.error('[ReportingBlocking] Error notifying moderators:', error);
    }
  }

  /**
   * Handle high-priority reports
   */
  private async handleHighPriorityReport(report: any) {
    try {
      // Auto-hide content for medical concerns
      if (report.category === 'MEDICAL_CONCERN' && report.reportedContentId) {
        await this.deleteContent(report.reportedContentId, report.contentType);
      }

      // Check user's report history
      if (report.reportedUserId) {
        const reportCount = await prisma.report.count({
          where: {
            reportedUserId: report.reportedUserId,
            status: 'RESOLVED',
            action: { in: ['WARN', 'SUSPEND', 'BAN'] }
          }
        });

        // Auto-suspend repeat offenders
        if (reportCount >= 3) {
          await this.suspendUser(report.reportedUserId, 7, 'Multiple violations');
        }
      }
    } catch (error) {
      console.error('[ReportingBlocking] Error handling high-priority report:', error);
    }
  }

  /**
   * Get report statistics
   */
  async getReportStats() {
    try {
      const [total, pending, resolved, byCategory, byPriority] = await Promise.all([
        prisma.report.count(),
        prisma.report.count({ where: { status: 'PENDING' } }),
        prisma.report.count({ where: { status: 'RESOLVED' } }),
        prisma.report.groupBy({
          by: ['category'],
          _count: true
        }),
        prisma.report.groupBy({
          by: ['priority'],
          _count: true
        })
      ]);

      return {
        total,
        pending,
        resolved,
        byCategory,
        byPriority
      };
    } catch (error) {
      console.error('[ReportingBlocking] Error getting stats:', error);
      throw error;
    }
  }
}

export const reportingBlockingService = new ReportingBlockingService();
