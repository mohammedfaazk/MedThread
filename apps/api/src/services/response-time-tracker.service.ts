import { prisma } from '@medthread/database';

export class ResponseTimeTrackerService {
  /**
   * Track response time when doctor sends first message in a conversation
   */
  async trackResponseTime(conversationId: string, doctorId: string): Promise<void> {
    try {
      const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
            take: 10
          },
          appointment: {
            include: {
              patient: true,
              doctor: true
            }
          }
        }
      });

      if (!conversation || !conversation.appointment) return;

      // Find first patient message and first doctor message
      const firstPatientMessage = conversation.messages.find(
        m => m.senderId === conversation.appointment!.patientId
      );
      const firstDoctorMessage = conversation.messages.find(
        m => m.senderId === doctorId
      );

      if (!firstPatientMessage || !firstDoctorMessage) return;

      // Calculate response time in minutes
      const responseTimeMs = new Date(firstDoctorMessage.createdAt).getTime() - 
                            new Date(firstPatientMessage.createdAt).getTime();
      const responseTimeMinutes = Math.round(responseTimeMs / (1000 * 60));

      // Update doctor's activity metrics
      await this.updateDoctorMetrics(doctorId, responseTimeMinutes);

    } catch (error) {
      console.error('[ResponseTimeTracker] Error tracking response time:', error);
    }
  }

  /**
   * Update doctor's average response time
   */
  private async updateDoctorMetrics(doctorId: string, responseTimeMinutes: number): Promise<void> {
    try {
      const metrics = await prisma.doctorActivityMetrics.findUnique({
        where: { doctorId }
      });

      if (!metrics) {
        // Create new metrics
        await prisma.doctorActivityMetrics.create({
          data: {
            doctorId,
            avgResponseTime: responseTimeMinutes,
            totalResponses: 1,
            fastResponseCount: responseTimeMinutes <= 30 ? 1 : 0,
            lastResponseAt: new Date()
          }
        });
      } else {
        // Update existing metrics with rolling average
        const totalResponses = metrics.totalResponses + 1;
        const newAvgResponseTime = Math.round(
          (metrics.avgResponseTime * metrics.totalResponses + responseTimeMinutes) / totalResponses
        );

        await prisma.doctorActivityMetrics.update({
          where: { doctorId },
          data: {
            avgResponseTime: newAvgResponseTime,
            totalResponses,
            fastResponseCount: responseTimeMinutes <= 30 
              ? metrics.fastResponseCount + 1 
              : metrics.fastResponseCount,
            lastResponseAt: new Date()
          }
        });
      }
    } catch (error) {
      console.error('[ResponseTimeTracker] Error updating metrics:', error);
    }
  }

  /**
   * Get doctor's response time stats
   */
  async getDoctorResponseStats(doctorId: string) {
    try {
      const metrics = await prisma.doctorActivityMetrics.findUnique({
        where: { doctorId }
      });

      if (!metrics) {
        return {
          avgResponseTime: null,
          totalResponses: 0,
          fastResponseRate: 0,
          responseTimeLabel: 'No data yet'
        };
      }

      const fastResponseRate = metrics.totalResponses > 0
        ? Math.round((metrics.fastResponseCount / metrics.totalResponses) * 100)
        : 0;

      let responseTimeLabel = 'Slow';
      if (metrics.avgResponseTime <= 15) responseTimeLabel = 'Very Fast';
      else if (metrics.avgResponseTime <= 30) responseTimeLabel = 'Fast';
      else if (metrics.avgResponseTime <= 60) responseTimeLabel = 'Moderate';

      return {
        avgResponseTime: metrics.avgResponseTime,
        totalResponses: metrics.totalResponses,
        fastResponseRate,
        responseTimeLabel,
        lastResponseAt: metrics.lastResponseAt
      };
    } catch (error) {
      console.error('[ResponseTimeTracker] Error getting stats:', error);
      return null;
    }
  }
}

export const responseTimeTracker = new ResponseTimeTrackerService();
