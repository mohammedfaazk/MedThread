import { prisma } from '@medthread/database';
import { getSocketInstance } from '../socket';
import { broadcastSymptomReport, broadcastHealthTrends, broadcastGeographicAlert } from '../handlers/analytics.handler';

interface SymptomReportInput {
  userId?: string;
  sessionId: string;
  symptoms: Array<{ name: string; severity: string }>;
  location?: { city?: string; region?: string; country?: string; lat?: number; lng?: number };
  age?: number;
  gender?: string;
  temperature?: number;
  duration?: string;
}

interface TimeRange {
  startDate: Date;
  endDate: Date;
}

export class HealthAnalyticsService {
  /**
   * Track symptom report from patient
   */
  async trackSymptomReport(input: SymptomReportInput) {
    const report = await prisma.symptomReport.create({
      data: {
        userId: input.userId,
        sessionId: input.sessionId,
        symptoms: input.symptoms,
        location: input.location || {},
        age: input.age,
        gender: input.gender,
        temperature: input.temperature,
        duration: input.duration,
        metadata: {}
      }
    });

    // Broadcast real-time update
    const io = getSocketInstance();
    if (io) {
      broadcastSymptomReport(io, report);
      
      // Trigger immediate trend recalculation
      this.calculateHealthTrendsRealtime();
    }

    return report;
  }

  /**
   * Get trending health issues
   */
  async getTrendingSymptoms(timeWindow: string = 'daily', limit: number = 10) {
    const now = new Date();
    let startDate = new Date();

    switch (timeWindow) {
      case 'hourly':
        startDate.setHours(now.getHours() - 1);
        break;
      case 'daily':
        startDate.setDate(now.getDate() - 1);
        break;
      case 'weekly':
        startDate.setDate(now.getDate() - 7);
        break;
      default:
        startDate.setDate(now.getDate() - 1);
    }

    const reports = await prisma.symptomReport.findMany({
      where: {
        createdAt: { gte: startDate }
      },
      select: { symptoms: true }
    });

    // Aggregate symptoms
    const symptomCounts: Record<string, number> = {};
    reports.forEach(report => {
      const symptoms = report.symptoms as Array<{ name: string; severity: string }>;
      symptoms.forEach(s => {
        symptomCounts[s.name] = (symptomCounts[s.name] || 0) + 1;
      });
    });

    return Object.entries(symptomCounts)
      .map(([symptom, count]) => ({ symptom, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  /**
   * Get geographic health alerts
   */
  async getGeographicAlerts(region?: string) {
    const where = region ? { region } : {};
    
    return await prisma.geographicHealthData.findMany({
      where: {
        ...where,
        alertLevel: { in: ['HIGH', 'CRITICAL'] }
      },
      orderBy: { calculatedAt: 'desc' },
      take: 20
    });
  }

  /**
   * Generate health advisory based on trends
   */
  async generateHealthAdvisory(symptom: string, region?: string) {
    const trends = await prisma.healthTrend.findMany({
      where: {
        symptom,
        region: region || undefined,
        calculatedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      },
      orderBy: { calculatedAt: 'desc' },
      take: 1
    });

    if (trends.length === 0) return null;

    const trend = trends[0];
    return {
      symptom,
      region: region || 'All regions',
      count: trend.count,
      severity: trend.severity,
      trend: trend.trendDirection,
      percentChange: trend.percentChange,
      advisory: this.generateAdvisoryText(symptom, trend)
    };
  }

  private generateAdvisoryText(symptom: string, trend: any): string {
    const direction = trend.trendDirection === 'rising' ? 'increasing' : 'decreasing';
    return `${symptom} cases are ${direction} by ${Math.abs(trend.percentChange || 0).toFixed(1)}%. Take preventive measures and consult a doctor if symptoms persist.`;
  }

  /**
   * Calculate and update health trends
   */
  async calculateHealthTrends(timeWindow: string = 'daily') {
    const trending = await this.getTrendingSymptoms(timeWindow, 50);
    
    for (const item of trending) {
      await prisma.healthTrend.create({
        data: {
          symptom: item.symptom,
          count: item.count,
          timeWindow,
          calculatedAt: new Date(),
          metadata: {}
        }
      });
    }

    // Broadcast update
    const io = getSocketInstance();
    if (io) {
      broadcastHealthTrends(io, trending);
    }
  }

  /**
   * Calculate trends in real-time (lightweight)
   */
  async calculateHealthTrendsRealtime() {
    const trending = await this.getTrendingSymptoms('hourly', 10);
    
    const io = getSocketInstance();
    if (io) {
      broadcastHealthTrends(io, trending);
    }
  }

  /**
   * Get symptom pattern analysis
   */
  async getSymptomPatterns(timeRange: TimeRange) {
    const reports = await prisma.symptomReport.findMany({
      where: {
        createdAt: {
          gte: timeRange.startDate,
          lte: timeRange.endDate
        }
      }
    });

    // Analyze patterns by time of day, day of week, etc.
    const patterns = {
      byHour: new Array(24).fill(0),
      byDayOfWeek: new Array(7).fill(0),
      byAge: {} as Record<string, number>,
      byGender: {} as Record<string, number>
    };

    reports.forEach(report => {
      const hour = new Date(report.createdAt).getHours();
      const day = new Date(report.createdAt).getDay();
      
      patterns.byHour[hour]++;
      patterns.byDayOfWeek[day]++;
      
      if (report.age) {
        const ageGroup = Math.floor(report.age / 10) * 10;
        patterns.byAge[`${ageGroup}-${ageGroup + 9}`] = (patterns.byAge[`${ageGroup}-${ageGroup + 9}`] || 0) + 1;
      }
      
      if (report.gender) {
        patterns.byGender[report.gender] = (patterns.byGender[report.gender] || 0) + 1;
      }
    });

    return patterns;
  }

  /**
   * Get top health issues dashboard
   */
  async getTopHealthIssues(limit: number = 10) {
    const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const trends = await prisma.healthTrend.findMany({
      where: {
        calculatedAt: { gte: last30Days }
      },
      orderBy: { count: 'desc' },
      take: limit
    });

    return trends;
  }
}

export const healthAnalyticsService = new HealthAnalyticsService();
