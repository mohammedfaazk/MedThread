import { prisma } from '@medthread/database';

async function checkUserActivity() {
  console.log('🔍 Checking user activity...\n');

  try {
    // Get all users with their last activity
    const users = await prisma.user.findMany({
      where: {
        role: { in: ['DOCTOR', 'PATIENT'] }
      },
      select: {
        username: true,
        email: true,
        role: true,
        updatedAt: true,
        createdAt: true
      },
      orderBy: {
        updatedAt: 'desc'
      },
      take: 10
    });

    console.log(`📊 Most recently active users:\n`);

    const now = new Date();
    const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000);

    users.forEach((user, index) => {
      const timeSinceActivity = now.getTime() - user.updatedAt.getTime();
      const minutesAgo = Math.floor(timeSinceActivity / 1000 / 60);
      const isRecent = user.updatedAt >= fifteenMinutesAgo;

      console.log(`${index + 1}. ${user.username} (${user.role})`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Last Activity: ${user.updatedAt}`);
      console.log(`   Time Ago: ${minutesAgo} minutes`);
      console.log(`   Status: ${isRecent ? '🟢 ACTIVE (< 15 min)' : '🔴 INACTIVE (> 15 min)'}\n`);
    });

    // Count users active in last 15 minutes
    const recentlyActive = users.filter(u => u.updatedAt >= fifteenMinutesAgo);
    console.log(`📈 Summary:`);
    console.log(`   Users active in last 15 min: ${recentlyActive.length}`);
    console.log(`   Doctors: ${recentlyActive.filter(u => u.role === 'DOCTOR').length}`);
    console.log(`   Patients: ${recentlyActive.filter(u => u.role === 'PATIENT').length}\n`);

    // Check for active sessions
    const activeSessions = await prisma.userSession.count({
      where: { endTime: null }
    });
    console.log(`   Active sessions: ${activeSessions}\n`);

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

checkUserActivity();
