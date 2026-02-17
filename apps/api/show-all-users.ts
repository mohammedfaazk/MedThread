import 'dotenv/config';
import { PrismaClient } from '@medthread/database';

const prisma = new PrismaClient();

async function showAllUsers() {
  console.log('📋 All Users in Database:\n');
  console.log('=' .repeat(80));

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    console.log(`\nTotal Users: ${users.length}\n`);

    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.username}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Created: ${user.createdAt.toISOString()}`);
      console.log('');
    });

    console.log('=' .repeat(80));
    console.log('\n💡 These are the users that existed BEFORE I made changes.');
    console.log('   Please tell me which users you want to keep and their passwords.\n');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

showAllUsers();
