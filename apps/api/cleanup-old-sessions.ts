import { prisma } from '@medthread/database';

async function cleanupOldSessions() {
  console.log('🧹 Cleaning up old active sessions...\n');

  try {
    // Close all sessions that are still marked as active (endTime = null)
    // This is useful for cleaning up sessions from before the fix was implemented
    const result = await prisma.userSession.updateMany({
      where: {
        endTime: null
      },
      data: {
        endTime: new Date()
      }
    });

    console.log(`✅ Closed ${result.count} old active sessions`);
    console.log('\n✨ Cleanup complete!');
    console.log('📊 All users will now need to login again to be counted as active.\n');

  } catch (error: any) {
    console.error('❌ Error cleaning up sessions:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

cleanupOldSessions();
