import { PrismaClient } from '@medthread/database';
import { compare } from 'bcryptjs';

const prisma = new PrismaClient();

async function checkUsers() {
  const users = await prisma.user.findMany({
    select: { email: true, role: true, passwordHash: true }
  });
  
  console.log('Users:', users.length);
  
  for (const user of users) {
    console.log(`${user.email} (${user.role})`);
    
    // Test password
    if (user.email === 'admin@medthread.com') {
      const match = await compare('admin123', user.passwordHash);
      console.log(`  Password match: ${match}`);
    }
  }
  
  await prisma.$disconnect();
}

checkUsers();
