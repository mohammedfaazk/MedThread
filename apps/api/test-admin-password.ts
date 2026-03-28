import { prisma } from '@medthread/database';
import bcrypt from 'bcryptjs';

async function testAdminPassword() {
  try {
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@medthread.com' }
    });

    if (!admin) {
      console.log('❌ Admin not found');
      return;
    }

    console.log('Testing password hash:', admin.passwordHash);

    // Test various passwords
    const passwords = [
      'Admin@123',
      'admin123',
      'Admin123',
      'admin@123',
      'password',
      'Password123',
      'MedthreadDev',
      'medthread',
      'admin'
    ];

    console.log('\n🔐 Testing passwords...\n');
    for (const pwd of passwords) {
      try {
        const isValid = await bcrypt.compare(pwd, admin.passwordHash);
        console.log(`"${pwd}": ${isValid ? '✅ VALID' : '❌ Invalid'}`);
        if (isValid) {
          console.log(`\n✅✅✅ WORKING PASSWORD: "${pwd}" ✅✅✅\n`);
          break;
        }
      } catch (error) {
        console.log(`"${pwd}": ❌ Error - ${error}`);
      }
    }

  } catch (error: any) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testAdminPassword();
