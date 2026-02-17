import 'dotenv/config';
import { PrismaClient } from '@medthread/database';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function restoreCorrectPasswords() {
  console.log('🔧 Restoring correct passwords...\n');

  const correctPasswords = [
    {
      email: 'admin@medthread.com',
      password: 'Admin@123456',
      role: 'ADMIN',
    },
    {
      email: 'rifa@gmail.com',
      password: 'Rifa@123',
      role: 'DOCTOR',
    },
    {
      email: 'navin@gmail.com',
      password: '12345678',
      role: 'PATIENT',
    },
  ];

  try {
    for (const userData of correctPasswords) {
      const user = await prisma.user.findUnique({
        where: { email: userData.email },
      });

      if (user) {
        console.log(`🔄 Updating ${userData.email}...`);
        
        const hashedPassword = await bcrypt.hash(userData.password, 12);
        await prisma.user.update({
          where: { email: userData.email },
          data: { passwordHash: hashedPassword },
        });
        
        console.log(`✅ Password restored for ${userData.email}`);
        console.log(`   Password: ${userData.password}\n`);
      } else {
        console.log(`⚠️  User ${userData.email} not found - skipping\n`);
      }
    }

    console.log('=' .repeat(80));
    console.log('\n✅ PASSWORDS RESTORED!\n');
    console.log('📋 CORRECT LOGIN CREDENTIALS:\n');
    console.log('ADMIN:');
    console.log('  Email: admin@medthread.com');
    console.log('  Password: Admin@123456\n');
    console.log('DOCTOR:');
    console.log('  Email: rifa@gmail.com');
    console.log('  Password: Rifa@123\n');
    console.log('PATIENT:');
    console.log('  Email: navin@gmail.com');
    console.log('  Password: 12345678\n');
    console.log('=' .repeat(80));

    // Test logins with correct passwords
    console.log('\n🧪 Testing logins with correct passwords...\n');

    for (const userData of correctPasswords) {
      const user = await prisma.user.findUnique({
        where: { email: userData.email },
      });

      if (user && user.passwordHash) {
        const isValid = await bcrypt.compare(userData.password, user.passwordHash);
        if (isValid) {
          console.log(`✅ ${userData.role}: ${userData.email} - Login works!`);
        } else {
          console.log(`❌ ${userData.role}: ${userData.email} - Password mismatch!`);
        }
      } else {
        console.log(`❌ ${userData.role}: ${userData.email} - User not found!`);
      }
    }

    console.log('\n✅ All passwords restored to original values!\n');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

restoreCorrectPasswords();
