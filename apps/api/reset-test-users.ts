import { PrismaClient } from '@medthread/database';

const prisma = new PrismaClient();

async function reset() {
  await prisma.user.deleteMany({
    where: {
      email: {
        in: ['admin@medthread.com', 'dr.smith@medthread.com', 'john.doe@example.com']
      }
    }
  });
  
  console.log('✅ Deleted test users');
  await prisma.$disconnect();
}

reset();
