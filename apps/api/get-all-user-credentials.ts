import { prisma } from '@medthread/database';

async function getAllUserCredentials() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        verified: true,
        createdAt: true,
      },
      orderBy: [
        { role: 'asc' },
        { email: 'asc' }
      ]
    });

    console.log('\n=== ALL USER CREDENTIALS ===\n');
    
    const adminUsers = users.filter(u => u.role === 'ADMIN');
    const doctors = users.filter(u => u.role === 'DOCTOR');
    const patients = users.filter(u => u.role === 'PATIENT');

    if (adminUsers.length > 0) {
      console.log('📋 ADMIN USERS:');
      adminUsers.forEach(user => {
        console.log(`  Email: ${user.email}`);
        console.log(`  Username: ${user.username}`);
        console.log(`  Password: admin123`);
        console.log(`  Verified: ${user.verified}`);
        console.log('  ---');
      });
    }

    if (doctors.length > 0) {
      console.log('\n👨‍⚕️ DOCTORS:');
      doctors.forEach(user => {
        console.log(`  Email: ${user.email}`);
        console.log(`  Username: ${user.username}`);
        console.log(`  Password: ${user.email.split('@')[0]}123 (or check individual)`);
        console.log(`  Verified: ${user.verified}`);
        console.log('  ---');
      });
    }

    if (patients.length > 0) {
      console.log('\n👤 PATIENTS:');
      patients.forEach(user => {
        console.log(`  Email: ${user.email}`);
        console.log(`  Username: ${user.username}`);
        console.log(`  Password: ${user.email.split('@')[0]}123`);
        console.log(`  Verified: ${user.verified}`);
        console.log('  ---');
      });
    }

    console.log(`\n📊 TOTAL USERS: ${users.length}`);
    console.log(`   Admins: ${adminUsers.length}`);
    console.log(`   Doctors: ${doctors.length}`);
    console.log(`   Patients: ${patients.length}`);

    console.log('\n⚠️ NOTE: Passwords shown are the standard pattern.');
    console.log('   Some users may have custom passwords set.');
    console.log('   Standard pattern: [username]123 (e.g., navin@gmail.com = navin123)');

  } catch (error) {
    console.error('Error fetching users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

getAllUserCredentials();
