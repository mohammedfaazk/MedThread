import { prisma } from '@medthread/database';

async function listUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true
      }
    });

    console.log('\n📋 Users in database:\n');
    users.forEach(u => {
      console.log(`  ✓ ${u.email} - ${u.username}`);
    });
    console.log(`\n  Total: ${users.length} users\n`);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

listUsers();
