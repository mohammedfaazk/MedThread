import { prisma } from '@medthread/database';
import bcrypt from 'bcrypt';
import { NotFoundError, ForbiddenError, ConflictError } from '../utils/errors';

export class AdminService {
  /**
   * Create initial admin user (should be run once during setup)
   */
  async createAdminUser(data: {
    email: string;
    username: string;
    password: string;
  }) {
    // Check if admin already exists
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });

    if (existingAdmin) {
      throw new ConflictError('Admin user already exists');
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    const admin = await prisma.user.create({
      data: {
        email: data.email,
        username: data.username,
        passwordHash,
        role: 'ADMIN',
        verified: true,
        emailVerified: true,
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
      }
    });

    return admin;
  }

  /**
   * Get platform statistics for admin dashboard
   */
  async getPlatformStats() {
    const [
      totalUsers,
      totalPosts,
      totalComments,
      totalCommunities,
      activeUsers24h,
      newUsersToday,
      totalDoctors,
      verifiedDoctors,
      pendingVerifications,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.post.count(),
      prisma.comment.count(),
      prisma.community.count(),
      prisma.user.count({
        where: {
          updatedAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        }
      }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      }),
      prisma.user.count({ where: { role: 'DOCTOR' } }),
      prisma.user.count({
        where: {
          role: 'DOCTOR',
          doctorVerificationStatus: 'APPROVED'
        }
      }),
      prisma.user.count({
        where: {
          role: 'DOCTOR',
          doctorVerificationStatus: { in: ['PENDING', 'UNDER_REVIEW'] }
        }
      }),
    ]);

    return {
      users: {
        total: totalUsers,
        active24h: activeUsers24h,
        newToday: newUsersToday,
      },
      content: {
        totalPosts,
        totalComments,
        totalCommunities,
      },
      doctors: {
        total: totalDoctors,
        verified: verifiedDoctors,
        pendingVerification: pendingVerifications,
      },
    };
  }

  /**
   * Get all users with filters (Admin only)
   */
  async getUsers(filters: {
    role?: string;
    search?: string;
    isSuspended?: boolean;
    page?: number;
    limit?: number;
  }) {
    const {
      role,
      search,
      isSuspended,
      page = 1,
      limit = 50
    } = filters;

    const skip = (page - 1) * limit;

    const where: any = {};

    if (role) where.role = role;
    if (isSuspended !== undefined) where.isSuspended = isSuspended;
    if (search) {
      where.OR = [
        { username: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          verified: true,
          doctorVerificationStatus: true,
          specialty: true,
          totalKarma: true,
          isSuspended: true,
          isShadowBanned: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              posts: true,
              comments: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.user.count({ where })
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Suspend user account (Admin only)
   */
  async suspendUser(userId: string, reason: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (user.role === 'ADMIN') {
      throw new ForbiddenError('Cannot suspend admin users');
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        isSuspended: true,
        verificationNotes: reason,
      },
      select: {
        id: true,
        username: true,
        email: true,
        isSuspended: true,
      }
    });

    return {
      message: 'User suspended successfully',
      user: updatedUser,
    };
  }

  /**
   * Unsuspend user account (Admin only)
   */
  async unsuspendUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        isSuspended: false,
      },
      select: {
        id: true,
        username: true,
        email: true,
        isSuspended: true,
      }
    });

    return {
      message: 'User unsuspended successfully',
      user: updatedUser,
    };
  }

  /**
   * Delete user account (Admin only)
   */
  async deleteUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (user.role === 'ADMIN') {
      throw new ForbiddenError('Cannot delete admin users');
    }

    await prisma.user.delete({
      where: { id: userId }
    });

    return {
      message: 'User deleted successfully',
    };
  }

  /**
   * Get reported content (Admin only)
   */
  async getReports(filters: {
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const {
      status = 'PENDING',
      page = 1,
      limit = 50
    } = filters;

    const skip = (page - 1) * limit;

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where: { status },
        include: {
          user: {
            select: {
              id: true,
              username: true,
            }
          },
          post: {
            select: {
              id: true,
              title: true,
              author: {
                select: {
                  username: true,
                }
              }
            }
          },
          comment: {
            select: {
              id: true,
              content: true,
              author: {
                select: {
                  username: true,
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.report.count({ where: { status } })
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

  /**
   * Resolve report (Admin only)
   */
  async resolveReport(reportId: string, action: 'APPROVED' | 'REJECTED', notes?: string) {
    const report = await prisma.report.findUnique({
      where: { id: reportId }
    });

    if (!report) {
      throw new NotFoundError('Report not found');
    }

    const updatedReport = await prisma.report.update({
      where: { id: reportId },
      data: {
        status: action,
        details: notes,
      }
    });

    return {
      message: `Report ${action.toLowerCase()} successfully`,
      report: updatedReport,
    };
  }
}

export const adminService = new AdminService();
