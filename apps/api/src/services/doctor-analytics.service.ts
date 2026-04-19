import { prisma } from '@medthread/database';
import { getSocketInstance } from '../socket';
import { broadcastDoctorPerformance, broadcastDoctorRating } from '../handlers/analytics.handler';

interface DoctorMetrics {
  doctorId: string;
  totalResponses?: number;
  totalPatientsHelped?: number;
  avgResponseTime?: number;
  helpfulnessScore?: number;
  appointmentsCompleted?: number;
}

export class DoctorAnalyticsService {
  /**
   * Update doctor performance metrics
   */
  async updateDoctorPerformance(metrics: DoctorMetrics) {
    const existing = await prisma.doctorPerformance.findUnique({
      where: { doctorId: metrics.doctorId }
    });

    if (existing) {
      return await prisma.doctorPerformance.update({
        where: { doctorId: metrics.doctorId },
        data: {
          ...metrics,
          calculatedAt: new Date()
        }
      });
    }

    return await prisma.doctorPerformance.create({
      data: {
        doctorId: metrics.doctorId,
        totalResponses: metrics.totalResponses || 0,
        totalPatientsHelped: metrics.totalPatientsHelped || 0,
        avgResponseTime: metrics.avgResponseTime,
        helpfulnessScore: metrics.helpfulnessScore,
        appointmentsCompleted: metrics.appointmentsCompleted || 0,
        calculatedAt: new Date()
      }
    });
  }

  /**
   * Calculate doctor engagement metrics
   */
  async calculateDoctorEngagement(doctorId: string) {
    const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Get thread replies
    const replies = await prisma.threadReply.count({
      where: {
        authorId: doctorId,
        createdAt: { gte: last30Days }
      }
    });

    // Get appointments
    const appointments = await prisma.appointment.findMany({
      where: {
        doctorId,
        createdAt: { gte: last30Days }
      }
    });

    const completed = appointments.filter(a => a.status === 'COMPLETED').length;
    const cancelled = appointments.filter(a => a.status === 'CANCELLED').length;

    // Get ratings
    const ratings = await prisma.doctorRating.findMany({
      where: {
        doctorId,
        createdAt: { gte: last30Days }
      }
    });

    const avgRating = ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
      : 0;

    // Calculate engagement score (0-100)
    const engagementScore = Math.min(100, (replies * 2) + (completed * 5) + (avgRating * 10));

    await this.updateDoctorPerformance({
      doctorId,
      totalResponses: replies,
      totalPatientsHelped: completed,
      appointmentsCompleted: completed,
      appointmentsCancelled: cancelled,
      helpfulnessScore: avgRating,
      totalRatings: ratings.length
    });

    // Broadcast real-time update
    const io = getSocketInstance();
    if (io) {
      const performance = await prisma.doctorPerformance.findUnique({
        where: { doctorId }
      });
      if (performance) {
        broadcastDoctorPerformance(io, performance);
      }
    }

    return {
      replies,
      appointments: appointments.length,
      completed,
      cancelled,
      avgRating,
      engagementScore
    };
  }

  /**
   * Get top doctors leaderboard
   */
  async getTopDoctors(limit: number = 10, sortBy: string = 'helpfulnessScore') {
    const orderBy: any = {};
    orderBy[sortBy] = 'desc';

    const topDoctors = await prisma.doctorPerformance.findMany({
      orderBy,
      take: limit
    });

    // Enrich with user data
    const doctorIds = topDoctors.map(d => d.doctorId);
    const users = await prisma.user.findMany({
      where: { id: { in: doctorIds } },
      select: {
        id: true,
        username: true,
        avatar: true,
        specialty: true,
        yearsOfExperience: true
      }
    });

    return topDoctors.map(perf => ({
      ...perf,
      doctor: users.find(u => u.id === perf.doctorId)
    }));
  }

  /**
   * Get doctor growth metrics
   */
  async getDoctorGrowthMetrics(timeRange: { startDate: Date; endDate: Date }) {
    const newDoctors = await prisma.user.count({
      where: {
        role: 'DOCTOR',
        createdAt: {
          gte: timeRange.startDate,
          lte: timeRange.endDate
        }
      }
    });

    const activeDoctors = await prisma.doctorPerformance.count({
      where: {
        lastActiveAt: {
          gte: timeRange.startDate,
          lte: timeRange.endDate
        }
      }
    });

    return { newDoctors, activeDoctors };
  }

  /**
   * Track doctor rating
   */
  async trackDoctorRating(data: {
    doctorId: string;
    patientId: string;
    appointmentId?: string;
    threadId?: string;
    rating: number;
    helpfulness?: number;
    communication?: number;
    expertise?: number;
    feedback?: string;
  }) {
    const rating = await prisma.doctorRating.create({
      data
    });

    // Update doctor performance immediately
    await this.calculateDoctorEngagement(data.doctorId);

    // Broadcast real-time update
    const io = getSocketInstance();
    if (io) {
      broadcastDoctorRating(io, rating);
    }

    // 🎯 Trigger sentiment analysis if feedback text exists (non-blocking)
    if (data.feedback && data.feedback.trim().length > 0) {
      const { onDoctorRatingCreated } = await import('../hooks/review-sentiment-hook');
      onDoctorRatingCreated(data.doctorId, data.feedback, data.rating).catch(error => {
        console.error('[DoctorAnalytics] Failed to update sentiment score:', error);
      });
    }

    return rating;
  }

  /**
   * Get doctor response time analytics
   */
  async getDoctorResponseTimes(doctorId?: string) {
    const where = doctorId ? { doctorId } : {};
    
    return await prisma.doctorPerformance.findMany({
      where,
      select: {
        doctorId: true,
        avgResponseTime: true
      },
      orderBy: { avgResponseTime: 'asc' }
    });
  }
}

export const doctorAnalyticsService = new DoctorAnalyticsService();
