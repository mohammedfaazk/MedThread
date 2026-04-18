import { prisma } from '@medthread/database';

async function checkSessions() {
  console.log('🔍 Checking active sessions...\n');

  try {
    const activeSessions = await prisma.userSession.findMany({
      where: { endTime: null },
      include: {
        User: {
          select: {
            username: true,
            email: true,
            role: true
          }
        }
      },
      orderBy: {
        startTime: 'desc'
      }
    });

    console.log(`📊 Active Sessions: ${activeSessions.length}\n`);

    if (activeSessions.length > 0) {
      activeSessions.forEach((session, index) => {
        console.log(`${index + 1}. Session ID: ${session.id}`);
        console.log(`   User: ${session.User?.username} (${session.User?.role})`);
        console.log(`   Email: ${session.User?.email}`);
        console.log(`   Started: ${session.startTime}`);
        console.log(`   Duration: ${Math.floor((Date.now() - session.startTime.getTime()) / 1000 / 60)} minutes\n`);
      });
    } else {
      console.log('❌ No active sessions found.\n');
      console.log('This means all users have logged out or sessions were closed.\n');
    }

    // Check all sessions (including closed ones)
    const allSessions = await prisma.userSession.findMany({
      orderBy: {
        startTime: 'desc'
      },
      take: 5,
      include: {
        User: {
          select: {
            username: true,
            role: true
          }
        }
      }
    });

    console.log(`📋 Last 5 Sessions (including closed):\n`);
    allSessions.forEach((session, index) => {
      const status = session.endTime ? '🔴 CLOSED' : '🟢 ACTIVE';
      const duration = session.endTime 
        ? Math.floor((session.endTime.getTime() - session.startTime.getTime()) / 1000 / 60)
        : Math.floor((Date.now() - session.startTime.getTime()) / 1000 / 60);
      
      console.log(`${index + 1}. ${session.User?.username} (${session.User?.role}) - ${status}`);
      console.log(`   Started: ${session.startTime}`);
      console.log(`   Ended: ${session.endTime || 'Still active'}`);
      console.log(`   Duration: ${duration} minutes\n`);
    });

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

checkSessions();
