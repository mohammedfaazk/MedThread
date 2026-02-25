"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sessionService = exports.SessionService = void 0;
const database_1 = require("@medthread/database");
class SessionService {
    /**
     * Create or update user session
     */
    async createSession(sessionId, userId, metadata) {
        try {
            await database_1.prisma.$executeRaw `
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
        }
        catch (error) {
            console.error('Error creating session:', error);
        }
    }
    /**
     * End user session
     */
    async endSession(sessionId) {
        try {
            await database_1.prisma.$executeRaw `
        UPDATE "UserSession"
        SET 
          "endTime" = CURRENT_TIMESTAMP,
          "duration" = EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - "startTime"))::INTEGER
        WHERE "id" = ${sessionId} AND "endTime" IS NULL
      `;
        }
        catch (error) {
            console.error('Error ending session:', error);
        }
    }
    /**
     * Get active sessions count
     */
    async getActiveSessions() {
        const result = await database_1.prisma.$queryRaw `
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
    async getUserSessions(userId, limit = 10) {
        return await database_1.prisma.$queryRaw `
      SELECT *
      FROM "UserSession"
      WHERE "userId" = ${userId}
      ORDER BY "startTime" DESC
      LIMIT ${limit}
    `;
    }
}
exports.SessionService = SessionService;
exports.sessionService = new SessionService();
