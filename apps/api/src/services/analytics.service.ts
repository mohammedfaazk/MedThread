import { prisma } from '@medthread/database';

interface TrackEventInput {
  eventName: string;
  eventCategory: string;
  userId?: string;
  sessionId: string;
  properties?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  referrer?: string;
  page?: string;
}

interface TrackPageViewInput {
  userId?: string;
  sessionId: string;
  page: string;
  title?: string;
  referrer?: string;
  duration?: number;
}

interface TrackConversionInput {
  userId?: string;
  sessionId: string;
  conversionType: string;
  value?: number;
  metadata?: Record<string, any>;
}

export class AnalyticsService {
  /**
   * Track custom event
   */
  async trackEvent(input: TrackEventInput) {
    try {
      await prisma.$executeRaw`
        INSERT INTO "AnalyticsEvent" (
          "id", "eventName", "eventCategory", "userId", "sessionId",
          "properties", "ipAddress", "userAgent", "referrer", "page"
        ) VALUES (
          gen_random_uuid()::text,
          ${input.eventName},
          ${input.eventCategory},
          ${input.userId || null},
          ${input.sessionId},
          ${JSON.stringify(input.properties || {})}::jsonb,
          ${input.ipAddress || null},
          ${input.userAgent || null},
          ${input.referrer || null},
          ${input.page || null}
        )
      `;

      // Update session event count
      await this.updateSessionStats(input.sessionId);
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  }

  /**
   * Track page view
   */
  async trackPageView(input: TrackPageViewInput) {
    try {
      await prisma.$executeRaw`
        INSERT INTO "PageView" (
          "id", "userId", "sessionId", "page", "title", "referrer", "duration"
        ) VALUES (
          gen_random_uuid()::text,
          ${input.userId || null},
          ${input.sessionId},
          ${input.page},
          ${input.title || null},
          ${input.referrer || null},
          ${input.duration || null}
        )
      `;

      // Update session page view count
      await this.updateSessionStats(input.sessionId);
    } catch (error) {
      console.error('Error tracking page view:', error);
    }
  }

  /**
   * Track conversion event
   */
  async trackConversion(input: TrackConversionInput) {
    try {
      await prisma.$executeRaw`
        INSERT INTO "ConversionEvent" (
          "id", "userId", "sessionId", "conversionType", "value", "metadata"
        ) VALUES (
          gen_random_uuid()::text,
          ${input.userId || null},
          ${input.sessionId},
          ${input.conversionType},
          ${input.value || null},
          ${JSON.stringify(input.metadata || {})}::jsonb
        )
      `;
    } catch (error) {
      console.error('Error tracking conversion:', error);
    }
  }

  /**
   * Update session statistics
   */
  private async updateSessionStats(sessionId: string) {
    try {
      await prisma.$executeRaw`
        UPDATE "UserSession"
        SET 
          "pageViews" = (SELECT COUNT(*) FROM "PageView" WHERE "sessionId" = ${sessionId}),
          "events" = (SELECT COUNT(*) FROM "AnalyticsEvent" WHERE "sessionId" = ${sessionId})
        WHERE "id" = ${sessionId}
      `;
    } catch (error) {
      console.error('Error updating session stats:', error);
    }
  }

  /**
   * Track post view
   */
  async trackPostView(postId: string, userId?: string) {
    try {
      // Update or create post analytics
      await prisma.$executeRaw`
        INSERT INTO "PostAnalytics" ("id", "postId", "views", "uniqueViews")
        VALUES (gen_random_uuid()::text, ${postId}, 1, ${userId ? 1 : 0})
        ON CONFLICT ("postId") 
        DO UPDATE SET 
          "views" = "PostAnalytics"."views" + 1,
          "uniqueViews" = "PostAnalytics"."uniqueViews" + ${userId ? 1 : 0},
          "lastUpdated" = CURRENT_TIMESTAMP
      `;
    } catch (error) {
      console.error('Error tracking post view:', error);
    }
  }

  /**
   * Get user analytics
   */
  async getUserAnalytics(userId: string): Promise<any> {
    const analytics = await prisma.$queryRaw<any[]>`
      SELECT * FROM "UserAnalytics" WHERE "userId" = ${userId}
    `;

    if (analytics.length === 0) {
      // Create initial analytics
      await prisma.$executeRaw`
        INSERT INTO "UserAnalytics" ("id", "userId")
        VALUES (gen_random_uuid()::text, ${userId})
      `;
      return this.getUserAnalytics(userId);
    }

    return analytics[0];
  }

  /**
   * Get post analytics
   */
  async getPostAnalytics(postId: string) {
    const analytics = await prisma.$queryRaw<any[]>`
      SELECT * FROM "PostAnalytics" WHERE "postId" = ${postId}
    `;

    return analytics[0] || {
      views: 0,
      uniqueViews: 0,
      clicks: 0,
      shares: 0,
      avgTimeSpent: 0,
      bounceRate: 0,
    };
  }

  /**
   * Get analytics dashboard data
   */
  async getDashboardAnalytics(startDate: Date, endDate: Date) {
    const [
      totalEvents,
      totalPageViews,
      totalSessions,
      totalConversions,
      topPages,
      topEvents,
    ] = await Promise.all([
      prisma.$queryRaw<any[]>`
        SELECT COUNT(*) as count FROM "AnalyticsEvent"
        WHERE "timestamp" BETWEEN ${startDate} AND ${endDate}
      `,
      prisma.$queryRaw<any[]>`
        SELECT COUNT(*) as count FROM "PageView"
        WHERE "timestamp" BETWEEN ${startDate} AND ${endDate}
      `,
      prisma.$queryRaw<any[]>`
        SELECT COUNT(*) as count FROM "UserSession"
        WHERE "startTime" BETWEEN ${startDate} AND ${endDate}
      `,
      prisma.$queryRaw<any[]>`
        SELECT COUNT(*) as count FROM "ConversionEvent"
        WHERE "timestamp" BETWEEN ${startDate} AND ${endDate}
      `,
      prisma.$queryRaw<any[]>`
        SELECT "page", COUNT(*) as views
        FROM "PageView"
        WHERE "timestamp" BETWEEN ${startDate} AND ${endDate}
        GROUP BY "page"
        ORDER BY views DESC
        LIMIT 10
      `,
      prisma.$queryRaw<any[]>`
        SELECT "eventName", COUNT(*) as count
        FROM "AnalyticsEvent"
        WHERE "timestamp" BETWEEN ${startDate} AND ${endDate}
        GROUP BY "eventName"
        ORDER BY count DESC
        LIMIT 10
      `,
    ]);

    return {
      totalEvents: parseInt(totalEvents[0]?.count || '0'),
      totalPageViews: parseInt(totalPageViews[0]?.count || '0'),
      totalSessions: parseInt(totalSessions[0]?.count || '0'),
      totalConversions: parseInt(totalConversions[0]?.count || '0'),
      topPages,
      topEvents,
    };
  }
}

export const analyticsService = new AnalyticsService();
