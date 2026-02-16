import { prisma } from '@medthread/database';
import { NotFoundError, ValidationError } from '../utils/errors';

interface ProfessionalProfile {
  registrationNumber?: string;
  languagesSpoken?: string[];
  consultationFee?: number;
  clinicName?: string;
  clinicWebsite?: string;
  professionalBio?: string;
  education?: Array<{
    degree: string;
    institution: string;
    year: number;
    field?: string;
  }>;
  certifications?: Array<{
    name: string;
    issuingOrganization: string;
    issueDate: string;
    expiryDate?: string;
    credentialId?: string;
  }>;
  publications?: Array<{
    title: string;
    journal: string;
    year: number;
    authors: string[];
    doi?: string;
    url?: string;
  }>;
  professionalAwards?: Array<{
    title: string;
    organization: string;
    year: number;
    description?: string;
  }>;
}

interface PerformanceMetrics {
  caseResolutionRate: number;
  averagePatientSatisfaction: number;
  responseAccuracyRating: number;
  specializationDepthScore: number;
  averageResponseTime: number;
}

export class DoctorProfileEnhancedService {
  /**
   * Update doctor's professional profile
   */
  async updateProfessionalProfile(doctorId: string, profile: ProfessionalProfile) {
    const doctor = await prisma.user.findUnique({
      where: { id: doctorId },
      select: { role: true, doctorVerificationStatus: true }
    });

    if (!doctor || doctor.role !== 'DOCTOR') {
      throw new ValidationError('Only doctors can update professional profile');
    }

    // For now, store in existing JSON fields until schema is updated
    const updatedDoctor = await prisma.user.update({
      where: { id: doctorId },
      data: {
        bio: profile.professionalBio,
        phone: profile.registrationNumber, // Temporary mapping
        verificationDocuments: {
          ...profile,
          updatedAt: new Date()
        } as any
      }
    });

    return updatedDoctor;
  }

  /**
   * Calculate and update doctor's performance metrics
   */
  async calculatePerformanceMetrics(doctorId: string): Promise<PerformanceMetrics> {
    // Get all threads where doctor replied
    const doctorReplies = await prisma.threadReply.findMany({
      where: { authorId: doctorId },
      include: {
        thread: {
          select: {
            isResolved: true,
            status: true,
            createdAt: true
          }
        }
      }
    });

    // Calculate case resolution rate
    const totalCases = doctorReplies.length;
    const resolvedCases = doctorReplies.filter(r => r.thread.isResolved).length;
    const caseResolutionRate = totalCases > 0 ? (resolvedCases / totalCases) * 100 : 0;

    // Calculate average response time
    const responseTimes = await Promise.all(
      doctorReplies.map(async (reply) => {
        const threadCreatedAt = reply.thread.createdAt;
        const replyCreatedAt = reply.createdAt;
        return (replyCreatedAt.getTime() - threadCreatedAt.getTime()) / (1000 * 60); // minutes
      })
    );
    const averageResponseTime = responseTimes.length > 0
      ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
      : 0;

    // Calculate response accuracy (based on upvotes and helpful marks)
    const accurateResponses = doctorReplies.filter(r => r.isHelpful || r.upvotes > 5).length;
    const responseAccuracyRating = totalCases > 0 ? (accurateResponses / totalCases) * 100 : 0;

    // Calculate specialization depth (unique topics covered)
    const uniqueTopics = new Set(doctorReplies.map(r => r.thread.tags).flat()).size;
    const specializationDepthScore = Math.min(uniqueTopics * 2, 100); // Max 100

    // Get patient satisfaction from reviews (placeholder - will implement with reviews)
    const averagePatientSatisfaction = 0; // TODO: Calculate from PatientReview model

    const metrics: PerformanceMetrics = {
      caseResolutionRate: Math.round(caseResolutionRate * 10) / 10,
      averagePatientSatisfaction,
      responseAccuracyRating: Math.round(responseAccuracyRating * 10) / 10,
      specializationDepthScore,
      averageResponseTime: Math.round(averageResponseTime)
    };

    return metrics;
  }

  /**
   * Get doctor's contribution stats
   */
  async getContributionStats(doctorId: string) {
    const [
      totalCasesHandled,
      emergencyFlagsDetected,
      lastContribution
    ] = await Promise.all([
      prisma.threadReply.count({
        where: { authorId: doctorId }
      }),
      prisma.threadReply.count({
        where: {
          authorId: doctorId,
          thread: {
            severityScore: { in: ['HIGH', 'CRITICAL'] }
          }
        }
      }),
      prisma.threadReply.findFirst({
        where: { authorId: doctorId },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true }
      })
    ]);

    // Calculate monthly streak
    const monthlyStreak = await this.calculateContributionStreak(doctorId);

    return {
      totalCasesHandled,
      emergencyFlagsDetected,
      monthlyContributionStreak: monthlyStreak,
      lastContributionDate: lastContribution?.createdAt
    };
  }

  /**
   * Calculate monthly contribution streak
   */
  private async calculateContributionStreak(doctorId: string): Promise<number> {
    const now = new Date();
    let streak = 0;
    let currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    while (true) {
      const nextMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
      
      const contributionsInMonth = await prisma.threadReply.count({
        where: {
          authorId: doctorId,
          createdAt: {
            gte: currentMonth,
            lt: nextMonth
          }
        }
      });

      if (contributionsInMonth > 0) {
        streak++;
        currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
      } else {
        break;
      }

      // Limit to 24 months
      if (streak >= 24) break;
    }

    return streak;
  }

  /**
   * Get complete doctor profile for public view
   */
  async getPublicProfile(username: string) {
    const doctor = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        doctorVerificationStatus: true,
        specialty: true,
        subSpecialty: true,
        yearsOfExperience: true,
        hospitalAffiliation: true,
        clinicAddress: true,
        bio: true,
        avatar: true,
        totalKarma: true,
        verifiedAt: true,
        createdAt: true,
        verificationDocuments: true,
        medicalLicenseNumber: true,
        licenseIssuingAuthority: true
      }
    });

    if (!doctor || doctor.role !== 'DOCTOR') {
      throw new NotFoundError('Doctor not found');
    }

    // Get performance metrics
    const metrics = await this.calculatePerformanceMetrics(doctor.id);

    // Get contribution stats
    const stats = await this.getContributionStats(doctor.id);

    // Get top conditions answered
    const topConditions = await this.getTopConditions(doctor.id);

    // Get recent activity
    const recentActivity = await prisma.threadReply.findMany({
      where: { authorId: doctor.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        thread: {
          select: {
            id: true,
            title: true,
            createdAt: true,
            isResolved: true
          }
        }
      }
    });

    return {
      profile: doctor,
      metrics,
      stats,
      topConditions,
      recentActivity,
      profileUrl: `/doctor/${username}`
    };
  }

  /**
   * Get top conditions answered by doctor
   */
  private async getTopConditions(doctorId: string, limit = 5) {
    const replies = await prisma.threadReply.findMany({
      where: { authorId: doctorId },
      include: {
        thread: {
          select: { tags: true }
        }
      }
    });

    const conditionCounts = new Map<string, number>();
    
    replies.forEach(reply => {
      reply.thread.tags.forEach(tag => {
        conditionCounts.set(tag, (conditionCounts.get(tag) || 0) + 1);
      });
    });

    return Array.from(conditionCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([condition, count]) => ({ condition, count }));
  }

  /**
   * Award badge to doctor
   */
  async awardBadge(doctorId: string, badge: {
    name: string;
    description: string;
    icon: string;
    earnedAt: Date;
  }) {
    const doctor = await prisma.user.findUnique({
      where: { id: doctorId },
      select: { verificationDocuments: true }
    });

    const currentBadges = (doctor?.verificationDocuments as any)?.badges || [];
    
    await prisma.user.update({
      where: { id: doctorId },
      data: {
        verificationDocuments: {
          ...(doctor?.verificationDocuments as any),
          badges: [...currentBadges, badge]
        } as any
      }
    });

    return badge;
  }
}

export const doctorProfileEnhancedService = new DoctorProfileEnhancedService();
