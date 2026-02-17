import { prisma } from '@medthread/database';

export class SessionService {
  /**
   * Create or update user session
   */
  async createSession(sessionId: string, userId?: string, metadata?: {
    ipAddress?: string;
    userAgent?: string;
    device?: string;
    browser?: string;
    os?: string;
  }) {
    try {
      await prisma.$executeRaw`
        INSERT INTO "UserSession" (
          "id", "userId", "ipAddress", "userAgent", "device", "browser", "os"
        ) VALUES (
          ${sessionId},
          ${userId || null},
          ${metadata?.ipAddress || null},
          ${metadata?.userAgent || null},
          ${metadata?.device || null},
          ${metadata?.browser || null},
          ${metadata?.os || null}
        )
        ON CONFLICT ("id") DO UPDATE SET
          "userId" = COALESCE(${userId}, "UserSession"."userId"),
          "endTime" = NULL
      `;
    } catch (error) {
      console.error('Error creating session:', error);
    }
  }

  /**
   * End user session
   */
  async endSession(sessionId: string) {
    try {
      await prisma.$executeRaw`
        UPDATE "UserSession"
        SET 
          "endTime" = CURRENT_TIMESTAMP,
          "duration" = EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - "startTime"))::INTEGER
        WHERE "id" = ${sessionId} AND "endTime" IS NULL
      `;
    } catch (error) {
      console.error('Error ending session:', error);
    }
  }

  /**
   * Get active sessions count
   */
  async getActiveSessions() {
    const result = await prisma.$queryRaw<any[]>`
      SELECT COUNT(*) as count
      FROM "UserSession"
      WHERE "endTime" IS NULL
      AND "startTime" > NOW() - INTERVAL '30 minutes'
    `;

    return parseInt(result[0]?.count || '0');
  }

  /**
   * Get user session history
   */
  async getUserSessions(userId: string, limit: number = 10) {
    return await prisma.$queryRaw<any[]>`
      SELECT *
      FROM "UserSession"
      WHERE "userId" = ${userId}
      ORDER BY "startTime" DESC
      LIMIT ${limit}
    `;
  }
}

export const sessionService = new SessionService();
