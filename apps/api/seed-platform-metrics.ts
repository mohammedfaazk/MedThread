/**
 * Seed Platform Metrics Data
 * Creates user session data for platform analytics
 */

import { PrismaClient } from '@medthread/database';

const prisma = new PrismaClient();

async function seedPlatformMetrics() {
  console.log('📊 Seeding Platform Metrics Data...\n');

  try {
    // Get all users
    const users = await prisma.user.findMany({
      take: 100
    });

    console.log(`✅ Found ${users.length} users`);

    if (users.length === 0) {
      console.log('⚠️  No users found. Creating sample users...');
      
      for (let i = 1; i <= 20; i++) {
        await prisma.user.create({
          data: {
            username: `user${i}`,
            email: `user${i}@test.com`,
            passwordHash: 'hashedpassword',
            role: 'PATIENT'
          }
        });
      }
      
      const newUsers = await prisma.user.findMany();
      users.push(...newUsers);
    }

    // Delete old session data
    await prisma.userSession.deleteMany({});
    console.log('🗑️  Cleared old session data');

    // Create sessions for the last 30 days
    const sessions = [];
    const now = new Date();

    for (let day = 0; day < 30; day++) {
      const date = new Date(now);
      date.setDate(date.getDate() - day);

      // Create 20-50 sessions per day
      const sessionsPerDay = Math.floor(Math.random() * 30) + 20;

      for (let i = 0; i < sessionsPerDay; i++) {
        const user = users[Math.floor(Math.random() * users.length)];
        const hour = Math.floor(Math.random() * 24);
        const startTime = new Date(date);
        startTime.setHours(hour, Math.floor(Math.random() * 60), 0);
        
        const duration = Math.floor(Math.random() * 1800) + 300; // 5-35 minutes
        const endTime = new Date(startTime.getTime() + duration * 1000);
        
        const pageViews = Math.floor(Math.random() * 10) + 1;
        const events = Math.floor(Math.random() * 20) + 5;

        sessions.push({
          id: `session_${day}_${i}`,
          userId: user.id,
          startTime,
          endTime,
          duration,
          pageViews,
          events,
          ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
          userAgent: 'Mozilla/5.0',
          device: ['desktop', 'mobile', 'tablet'][Math.floor(Math.random() * 3)],
          browser: ['Chrome', 'Firefox', 'Safari', 'Edge'][Math.floor(Math.random() * 4)],
          os: ['Windows', 'macOS', 'Linux', 'iOS', 'Android'][Math.floor(Math.random() * 5)]
        });
      }
    }

    console.log(`📝 Creating ${sessions.length} user sessions...`);

    // Insert sessions in batches
    const batchSize = 500;
    for (let i = 0; i < sessions.length; i += batchSize) {
      const batch = sessions.slice(i, i + batchSize);
      await prisma.userSession.createMany({
        data: batch,
        skipDuplicates: true
      });
      console.log(`   Inserted ${Math.min(i + batchSize, sessions.length)}/${sessions.length} sessions`);
    }

    console.log('✅ User session data seeded successfully!\n');

    // Calculate peak usage
    const peakHours: Record<number, number> = {};
    const peakDays: Record<number, number> = {};

    sessions.forEach(session => {
      const hour = new Date(session.startTime).getHours();
      const day = new Date(session.startTime).getDay();
      
      peakHours[hour] = (peakHours[hour] || 0) + 1;
      peakDays[day] = (peakDays[day] || 0) + 1;
    });

    console.log('📈 Peak Usage Analysis:');
    console.log('\nTop 3 Peak Hours:');
    Object.entries(peakHours)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .forEach(([hour, count], index) => {
        console.log(`   ${index + 1}. ${hour}:00 - ${parseInt(hour) + 1}:00: ${count} sessions`);
      });

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    console.log('\nPeak Days:');
    Object.entries(peakDays)
      .sort(([, a], [, b]) => b - a)
      .forEach(([day, count]) => {
        console.log(`   ${dayNames[parseInt(day)]}: ${count} sessions`);
      });

    console.log(`\n✅ Platform metrics data ready!`);
    console.log(`   Total sessions: ${sessions.length}`);
    console.log(`   Average per day: ${Math.round(sessions.length / 30)}`);

  } catch (error) {
    console.error('❌ Error seeding platform metrics:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedPlatformMetrics();
