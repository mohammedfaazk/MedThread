/**
 * Calculate Platform Metrics from existing session data
 */

import { PrismaClient } from '@medthread/database';

const prisma = new PrismaClient();

async function calculateMetrics() {
  console.log('📊 Calculating Platform Metrics from Session Data...\n');

  try {
    // Get all sessions
    const sessions = await prisma.userSession.findMany();
    console.log(`✅ Found ${sessions.length} sessions`);

    // Delete old metrics
    await prisma.platformMetrics.deleteMany({});
    console.log('🗑️  Cleared old metrics');

    // Group sessions by date
    const sessionsByDate: Record<string, any[]> = {};
    
    sessions.forEach(session => {
      const date = new Date(session.startTime);
      date.setHours(0, 0, 0, 0);
      const dateKey = date.toISOString();
      
      if (!sessionsByDate[dateKey]) {
        sessionsByDate[dateKey] = [];
      }
      sessionsByDate[dateKey].push(session);
    });

    console.log(`📅 Processing ${Object.keys(sessionsByDate).length} days of data...\n`);

    // Calculate metrics for each day
    for (const [dateKey, daySessions] of Object.entries(sessionsByDate)) {
      const date = new Date(dateKey);
      
      // Count unique users
      const uniqueUsers = new Set(daySessions.map(s => s.userId).filter(Boolean));
      const activeUsers = uniqueUsers.size;
      
      // Find peak hour
      const hourCounts: Record<number, number> = {};
      daySessions.forEach(s => {
        const hour = new Date(s.startTime).getHours();
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      });
      
      const peakUsageHour = parseInt(
        Object.entries(hourCounts)
          .sort(([, a], [, b]) => b - a)[0]?.[0] || '0'
      );
      
      // Get total counts
      const totalUsers = await prisma.user.count();
      const totalDoctors = await prisma.user.count({ where: { role: 'DOCTOR' } });
      
      // Create metric record
      await prisma.platformMetrics.create({
        data: {
          date,
          totalUsers,
          activeUsers,
          newUsers: 0,
          totalDoctors,
          activeDoctors: 0,
          newDoctors: 0,
          totalPosts: 0,
          totalAppointments: 0,
          totalSymptomReports: 0,
          peakUsageHour,
          metadata: {
            sessionsCount: daySessions.length,
            hourCounts
          }
        }
      });
      
      console.log(`   ${date.toDateString()}: ${activeUsers} active users, peak hour: ${peakUsageHour}:00`);
    }

    console.log('\n✅ Platform metrics calculated successfully!');
    
    // Test the service
    console.log('\n🧪 Testing peak usage analytics...');
    const metrics = await prisma.platformMetrics.findMany({
      orderBy: { date: 'desc' },
      take: 30
    });
    
    const peakHours: Record<number, number> = {};
    const peakDays: Record<number, number> = {};
    
    metrics.forEach(m => {
      if (m.peakUsageHour !== null) {
        peakHours[m.peakUsageHour] = (peakHours[m.peakUsageHour] || 0) + 1;
      }
      const day = new Date(m.date).getDay();
      peakDays[day] = (peakDays[day] || 0) + m.activeUsers;
    });
    
    console.log('\nTop 5 Peak Hours:');
    Object.entries(peakHours)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .forEach(([hour, count]) => {
        console.log(`   ${hour}:00 - ${count} days`);
      });
    
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    console.log('\nPeak Days:');
    Object.entries(peakDays)
      .sort(([, a], [, b]) => b - a)
      .forEach(([day, count]) => {
        console.log(`   ${dayNames[parseInt(day)]}: ${count} total active users`);
      });
    
    const avgActiveUsers = metrics.reduce((sum, m) => sum + m.activeUsers, 0) / metrics.length;
    console.log(`\nAverage Active Users: ${avgActiveUsers.toFixed(1)} per day`);

  } catch (error) {
    console.error('❌ Error calculating metrics:', error);
  } finally {
    await prisma.$disconnect();
  }
}

calculateMetrics();
