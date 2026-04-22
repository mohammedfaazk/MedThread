import { PrismaClient } from '@medthread/database';

const prisma = new PrismaClient();

async function test() {
  console.log('Testing Platform Analytics Data\n');
  
  // Check sessions
  const sessionCount = await prisma.userSession.count();
  console.log(`Total sessions: ${sessionCount}`);
  
  const recentSessions = await prisma.userSession.findMany({
    take: 5,
    orderBy: { startTime: 'desc' }
  });
  
  console.log('\nRecent sessions:');
  recentSessions.forEach(s => {
    console.log(`  ${s.startTime.toISOString()} - ${s.duration}s - ${s.pageViews} views`);
  });
  
  // Group by hour
  const sessions = await prisma.userSession.findMany();
  const hourCounts: Record<number, number> = {};
  
  sessions.forEach(s => {
    const hour = new Date(s.startTime).getHours();
    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
  });
  
  console.log('\nSessions by hour:');
  Object.entries(hourCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .forEach(([hour, count]) => {
      console.log(`  ${hour}:00 - ${count} sessions`);
    });
  
  await prisma.$disconnect();
}

test();
