import { prisma } from '@medthread/database';
import bcrypt from 'bcryptjs';

async function checkUserExists() {
  try {
    console.log('🔍 Checking if user exists...\n');

    const user = await prisma.user.findUnique({
      where: { email: 'meghamaryvinu@licet.ac.in' },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        passwordHash: true,
        doctorVerificationStatus: true,
      }
    });

    if (!user) {
      console.log('❌ User not found');
      
      // Let's check what users do exist
      console.log('\n📋 Checking existing users...');
      const allUsers = await prisma.user.findMany({
        select: {
          email: true,
          username: true,
          role: true,
        },
        take: 10
      });
      
      console.log(`Found ${allUsers.length} users:`);
      allUsers.forEach((u, i) => {
        console.log(`  ${i + 1}. ${u.email} (${u.username}) - ${u.role}`);
      });
      
      return;
    }

    console.log('✅ User found!');
    console.log(`   Email: ${user.email}`);
    console.log(`   Username: ${user.username}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Doctor Status: ${user.doctorVerificationStatus || 'N/A'}`);
    console.log(`   Has Password: ${user.passwordHash ? 'YES' : 'NO'}`);

    // Test common passwords
    if (user.passwordHash) {
      const passwords = ['Admin@123456', 'Password@123', 'admin123', 'password'];
      
      console.log('\n🔐 Testing common passwords...');
      for (const password of passwords) {
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        console.log(`   "${password}": ${isMatch ? '✅ MATCH' : '❌ No match'}`);
        if (isMatch) break;
      }
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUserExists();