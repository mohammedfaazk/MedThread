import { PrismaClient } from '@medthread/database';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function testSpecificPassword() {
  console.log('\n🔍 TESTING SPECIFIC PASSWORD FOR RIFA HASSAN');
  console.log('═'.repeat(80));
  
  const user = await prisma.user.findUnique({
    where: { email: 'rifa@gmail.com' },
    select: {
      id: true,
      username: true,
      email: true,
      passwordHash: true
    }
  });
  
  if (!user) {
    console.log('❌ User not found');
    return;
  }
  
  console.log(`✅ User found: ${user.username} (${user.email})`);
  console.log(`\nTesting different passwords:\n`);
  
  const passwordsToTest = [
    'Rifa@123456',      // Documented password
    'Doctor@123456',    // What user thinks it is
    'rifa@123456',      // Lowercase
    'RIFA@123456',      // Uppercase
    'Rifa123456',       // No @
    'rifa123',          // Simple
  ];
  
  for (const pwd of passwordsToTest) {
    const isValid = await bcrypt.compare(pwd, user.passwordHash);
    const status = isValid ? '✅ WORKS' : '❌ FAILS';
    console.log(`${status} - "${pwd}"`);
  }
  
  console.log('\n═'.repeat(80));
  
  await prisma.$disconnect();
}

testSpecificPassword();
