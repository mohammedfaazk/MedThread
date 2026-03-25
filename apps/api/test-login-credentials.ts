import { prisma } from '@medthread/database';
import bcrypt from 'bcryptjs';

async function testLoginCredentials() {
  console.log('🔍 Testing login credentials...\n');

  const testEmails = [
    'admin@medthread.com',
    'rifa@gmail.com',
    'navin@gmail.com'
  ];

  for (const email of testEmails) {
    console.log(`\n📧 Testing: ${email}`);
    
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        username: true,
        passwordHash: true,
        role: true,
        doctorVerificationStatus: true
      }
    });

    if (!user) {
      console.log(`❌ User not found in database`);
      continue;
    }

    console.log(`✅ User found:`);
    console.log(`   Username: ${user.username}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Verification: ${user.doctorVerificationStatus || 'N/A'}`);
    console.log(`   Password hash: ${user.passwordHash.substring(0, 20)}...`);

    // Test password verification
    const testPasswords = [
      'Admin@123456',
      'Doctor@123456',
      'Patient@123456',
      'admin123',
      'doctor123',
      'patient123'
    ];

    console.log(`\n   Testing passwords:`);
    for (const pwd of testPasswords) {
      try {
        const isValid = await bcrypt.compare(pwd, user.passwordHash);
        if (isValid) {
          console.log(`   ✅ Password "${pwd}" works!`);
        }
      } catch (error) {
        // Silent fail
      }
    }
  }

  await prisma.$disconnect();
}

testLoginCredentials().catch(console.error);
