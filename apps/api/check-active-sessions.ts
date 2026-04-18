import { prisma } from '@medthread/database';

async function checkActiveSessions() {
  console.log('🔍 Checking active sessions...\n');

  try {
    // Get all active sessions
    const activeSessions = await prisma.userSession.findMany({
      where: {
        endTime: null
      },
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

    console.log(`📊 Found ${activeSessions.length} active sessions:\n`);

    if (activeSessions.length === 0) {
      console.log('✅ No active sessions found. All users are logged out.\n');
    } else {
      activeSessions.forEach((session, index) => {
        console.log(`${index + 1}. User: ${session.User?.username || 'Unknown'}`);
        console.log(`   Email: ${session.User?.email || 'N/A'}`);
        console.log(`   Role: ${session.User?.role || 'N/A'}`);
        console.log(`   Session ID: ${session.id}`);
        console.log(`   Started: ${session.startTime}`);
        console.log(`   Status: ACTIVE (endTime is null)\n`);
      });

      // Count by role
      const doctors = activeSessions.filter(s => s.User?.role === 'DOCTOR').length;
      const patients = activeSessions.filter(s => s.User?.role === 'PATIENT').length;
      
      console.log(`📈 Summary:`);
      console.log(`   Doctors: ${doctors}`);
      console.log(`   Patients: ${patients}`);
      console.log(`   Total: ${activeSessions.length}\n`);
    }

    // Also check recent closed sessions
    const recentClosed = await prisma.userSession.findMany({
      where: {
        endTime: { not: null }
      },
      include: {
        User: {
          select: {
            username: true,
            role: true
          }
        }
      },
      orderBy: {
        endTime: 'desc'
      },
      take: 5
    });

    if (recentClosed.length > 0) {
      console.log(`📋 Recent closed sessions (last 5):\n`);
      recentClosed.forEach((session, index) => {
        console.log(`${index + 1}. ${session.User?.username || 'Unknown'} (${session.User?.role || 'N/A'})`);
        console.log(`   Ended: ${session.endTime}\n`);
      });
    }

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

checkActiveSessions();
