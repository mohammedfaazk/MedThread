import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    console.log('🔍 Checking users in database...');
    
    // Get all users with seeded marker
    const seededUsers = await prisma.user.findMany({
      where: {
        bio: {
          contains: '🌱'
        }
      },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        bio: true,
        verified: true,
        doctorVerificationStatus: true
      },
      orderBy: [
        { role: 'asc' },
        { email: 'asc' }
      ]
    });

    console.log(`Found ${seededUsers.length} seeded users:`);
    console.log('');

    seededUsers.forEach(user => {
      console.log(`📧 ${user.email}`);
      console.log(`   Username: ${user.username}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Verified: ${user.verified}`);
      if (user.role === 'DOCTOR') {
        console.log(`   Doctor Status: ${user.doctorVerificationStatus}`);
      }
      console.log('');
    });

    // Also check if there are any users with the specific emails we created
    const doctorEmails = [
      'dr.sarah.chen@medthread.com',
      'dr.michael.rodriguez@medthread.com',
      'dr.emily.watson@medthread.com',
      'dr.james.thompson@medthread.com',
      'dr.lisa.patel@medthread.com'
    ];

    console.log('🔍 Checking specific doctor emails...');
    for (const email of doctorEmails) {
      const user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          username: true,
          role: true,
          verified: true
        }
      });
      
      if (user) {
        console.log(`✅ Found: ${email} (${user.username})`);
      } else {
        console.log(`❌ Missing: ${email}`);
      }
    }

    // Check patient emails
    const patientEmails = [
      'patient1@example.com',
      'patient2@example.com', 
      'patient3@example.com'
    ];

    console.log('');
    console.log('🔍 Checking patient emails...');
    for (const email of patientEmails) {
      const user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          username: true,
          role: true
        }
      });
      
      if (user) {
        console.log(`✅ Found: ${email} (${user.username})`);
      } else {
        console.log(`❌ Missing: ${email}`);
      }
    }

  } catch (error) {
    console.error('❌ Error checking users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();