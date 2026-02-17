import { prisma } from '@medthread/database';
import bcrypt from 'bcrypt';

async function testNavinLogin() {
  try {
    console.log('🔍 Testing navin user login...\n');

    const user = await prisma.user.findUnique({
      where: { email: 'navin@gmail.com' }
    });

    if (!user) {
      console.log('❌ User not found!');
      return;
    }

    console.log('✅ User found:');
    console.log('ID:', user.id);
    console.log('Email:', user.email);
    console.log('Username:', user.username);
    console.log('Role:', user.role);
    console.log('Has Password:', !!user.passwordHash);

    if (!user.passwordHash) {
      console.log('\n❌ No password set!');
      return;
    }

    // Test common passwords
    const testPasswords = [
      'navin123',
      'Navin@123',
      'Password@123456',
      'Patient@123456',
      'navin@123',
      '123456'
    ];

    console.log('\n🔐 Testing passwords:');
    for (const pwd of testPasswords) {
      const isValid = await bcrypt.compare(pwd, user.passwordHash);
      console.log(`   ${pwd}: ${isValid ? '✅ VALID' : '❌ Invalid'}`);
      if (isValid) {
        console.log(`\n✅ Working password found: ${pwd}`);
        break;
      }
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testNavinLogin();
