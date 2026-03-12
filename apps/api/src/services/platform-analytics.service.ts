import { prisma } from '@medthread/database';

export class PlatformAnalyticsService {
  /**
   * Calculate and store daily platform metrics
   */
  async calculateDailyMetrics(date: Date = new Date()) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Total users
    const totalUsers = await prisma.user.count();
    
    // Active users (logged in today)
    const activeUsers = await prisma.userSession.count({
      where: {
        startTime: { gte: startOfDay, lte: endOfDay }
      }
    });

    // New users
    const newUsers = await prisma.user.count({
      where: {
        createdAt: { gte: startOfDay, lte: endOfDay }
      }
    });

    // Doctor metrics
    const totalDoctors = await prisma.user.count({
      where: { role: 'DOCTOR' }
    });

    const activeDoctors = await prisma.doctorPerformance.count({
      where: {
        lastActiveAt: { gte: startOfDay, lte: endOfDay }
      }
    });

    const newDoctors = await prisma.user.count({
      where: {
        role: 'DOCTOR',
        createdAt: { gte: startOfDay, lte: endOfDay }
      }
    });

    // Content metrics
    const totalPosts = await prisma.post.count({
      where: {
        createdAt: { gte: startOfDay, lte: endOfDay }
      }
    });

    const totalAppointments = await prisma.appointment.count({
      where: {
        createdAt: { gte: startOfDay, lte: endOfDay }
      }
    });

    const totalSymptomReports = await prisma.symptomReport.count({
      where: {
        createdAt: { gte: startOfDay, lte: endOfDay }
      }
    });

    // Peak usage hour
    const hourlyActivity = await this.getHourlyActivity(startOfDay, endOfDay);
    const peakUsageHour = hourlyActivity.indexOf(Math.max(...hourlyActivity));

    // Store metrics
    return await prisma.platformMetrics.upsert({
      where: { date: startOfDay },
      create: {
        date: startOfDay,
        totalUsers,
        activeUsers,
        newUsers,
        totalDoctors,
        activeDoctors,
        newDoctors,
        totalPosts,
        totalAppointments,
        totalSymptomReports,
        peakUsageHour
      },
      update: {
        totalUsers,
        activeUsers,
        newUsers,
        totalDoctors,
        activeDoctors,
        newDoctors,
        totalPosts,
        totalAppointments,
        totalSymptomReports,
        peakUsageHour
      }
    });
  }

  /**
   * Get hourly activity distribution
   */
  private async getHourlyActivity(startOfDay: Date, endOfDay: Date): Promise<number[]> {
    const sessions = await prisma.userSession.findMany({
      where: {
        startTime: { gte: startOfDay, lte: endOfDay }
      },
      select: { startTime: true }
    });

    const hourCounts = new Array(24).fill(0);
    sessions.forEach(session => {
      const hour = new Date(session.startTime).getHours();
      hourCounts[hour]++;
    });

    return hourCounts;
  }

  /**
   * Get peak usage analytics
   */
  async getPeakUsageAnalytics(days: number = 30) {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const metrics = await prisma.platformMetrics.findMany({
      where: {
        date: { gte: startDate }
      },
      orderBy: { date: 'asc' }
    });

    return {
      peakHours: this.aggregatePeakHours(metrics),
      peakDays: this.aggregatePeakDays(metrics),
      averageActiveUsers: metrics.reduce((sum, m) => sum + m.activeUsers, 0) / metrics.length
    };
  }

  private aggregatePeakHours(metrics: any[]): Record<number, number> {
    const hourCounts: Record<number, number> = {};
    metrics.forEach(m => {
      if (m.peakUsageHour !== null) {
        hourCounts[m.peakUsageHour] = (hourCounts[m.peakUsageHour] || 0) + 1;
      }
    });
    return hourCounts;
  }

  private aggregatePeakDays(metrics: any[]): Record<number, number> {
    const dayCounts: Record<number, number> = {};
    metrics.forEach(m => {
      const day = new Date(m.date).getDay();
      dayCounts[day] = (dayCounts[day] || 0) + m.activeUsers;
    });
    return dayCounts;
  }

  /**
   * Get response time metrics
   */
  async getResponseTimeMetrics() {
    const avgResponseTime = await prisma.doctorPerformance.aggregate({
      _avg: { avgResponseTime: true }
    });

    return {
      platformAverage: avgResponseTime._avg.avgResponseTime || 0
    };
  }

  /**
   * Detect platform bottlenecks
   */
  async detectBottlenecks() {
    const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // High bounce rate pages
    const highBouncePosts = await prisma.postAnalytics.findMany({
      where: {
        bounceRate: { gte: 70 },
        lastUpdated: { gte: last7Days }
      },
      take: 10,
      orderBy: { bounceRate: 'desc' }
    });

    // Slow response times
    const slowDoctors = await prisma.doctorPerformance.findMany({
      where: {
        avgResponseTime: { gte: 120 } // 2+ hours
      },
      take: 10,
      orderBy: { avgResponseTime: 'desc' }
    });

    return {
      highBouncePosts,
      slowDoctors
    };
  }

  /**
   * Get resource allocation recommendations
   */
  async getResourceRecommendations() {
    // Find specialties with high demand but low doctor count
    const symptomReports = await prisma.symptomReport.findMany({
      where: {
        createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      }
    });

    // Analyze which specialties are most needed
    const specialtyDemand: Record<string, number> = {};
    symptomReports.forEach(report => {
      const symptoms = report.symptoms as Array<{ name: string }>;
      symptoms.forEach(s => {
        const specialty = this.mapSymptomToSpecialty(s.name);
        specialtyDemand[specialty] = (specialtyDemand[specialty] || 0) + 1;
      });
    });

    // Get current doctor distribution
    const doctorsBySpecialty = await prisma.user.groupBy({
      by: ['specialty'],
      where: {
        role: 'DOCTOR',
        specialty: { not: null }
      },
      _count: true
    });

    const recommendations = Object.entries(specialtyDemand)
      .map(([specialty, demand]) => {
        const doctorCount = doctorsBySpecialty.find(d => d.specialty === specialty)?._count || 0;
        const ratio = doctorCount > 0 ? demand / doctorCount : demand;
        return { specialty, demand, doctorCount, ratio };
      })
      .sort((a, b) => b.ratio - a.ratio)
      .slice(0, 5);

    return recommendations;
  }

  private mapSymptomToSpecialty(symptom: string): string {
    const mapping: Record<string, string> = {
      'fever': 'General Medicine',
      'cough': 'Pulmonology',
      'headache': 'Neurology',
      'chest pain': 'Cardiology',
      'skin rash': 'Dermatology'
    };
    return mapping[symptom.toLowerCase()] || 'General Medicine';
  }
}

export const platformAnalyticsService = new PlatformAnalyticsService();
