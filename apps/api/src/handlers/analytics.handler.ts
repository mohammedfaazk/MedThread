import { Server, Socket } from 'socket.io';
import { healthAnalyticsService } from '../services/health-analytics.service';
import { doctorAnalyticsService } from '../services/doctor-analytics.service';
import { platformAnalyticsService } from '../services/platform-analytics.service';

export const analyticsHandler = (io: Server, socket: Socket) => {
  console.log(`[Analytics] Client connected: ${socket.id}`);

  // Join analytics room
  socket.on('analytics:subscribe', async (data: { type: string }) => {
    const room = `analytics:${data.type}`;
    socket.join(room);
    console.log(`[Analytics] Client ${socket.id} subscribed to ${room}`);

    // Send initial data
    try {
      if (data.type === 'health') {
        const trending = await healthAnalyticsService.getTrendingSymptoms('daily', 10);
        const alerts = await healthAnalyticsService.getGeographicAlerts();
        socket.emit('analytics:health:initial', { trending, alerts });
      } else if (data.type === 'doctor') {
        const leaderboard = await doctorAnalyticsService.getTopDoctors(10, 'helpfulnessScore');
        socket.emit('analytics:doctor:initial', { leaderboard });
      } else if (data.type === 'platform') {
        const peakUsage = await platformAnalyticsService.getPeakUsageAnalytics(30);
        const bottlenecks = await platformAnalyticsService.detectBottlenecks();
        socket.emit('analytics:platform:initial', { peakUsage, bottlenecks });
      }
    } catch (error) {
      console.error('[Analytics] Error sending initial data:', error);
    }
  });

  // Unsubscribe from analytics
  socket.on('analytics:unsubscribe', (data: { type: string }) => {
    const room = `analytics:${data.type}`;
    socket.leave(room);
    console.log(`[Analytics] Client ${socket.id} unsubscribed from ${room}`);
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`[Analytics] Client disconnected: ${socket.id}`);
  });
};

/**
 * Broadcast new symptom report to all health analytics subscribers
 */
export const broadcastSymptomReport = (io: Server, report: any) => {
  io.to('analytics:health').emit('analytics:health:symptom-report', report);
};

/**
 * Broadcast updated health trends
 */
export const broadcastHealthTrends = (io: Server, trends: any) => {
  io.to('analytics:health').emit('analytics:health:trends-update', trends);
};

/**
 * Broadcast geographic alert
 */
export const broadcastGeographicAlert = (io: Server, alert: any) => {
  io.to('analytics:health').emit('analytics:health:alert', alert);
};

/**
 * Broadcast doctor performance update
 */
export const broadcastDoctorPerformance = (io: Server, performance: any) => {
  io.to('analytics:doctor').emit('analytics:doctor:performance-update', performance);
};

/**
 * Broadcast new doctor rating
 */
export const broadcastDoctorRating = (io: Server, rating: any) => {
  io.to('analytics:doctor').emit('analytics:doctor:rating', rating);
};

/**
 * Broadcast platform metrics update
 */
export const broadcastPlatformMetrics = (io: Server, metrics: any) => {
  io.to('analytics:platform').emit('analytics:platform:metrics-update', metrics);
};
