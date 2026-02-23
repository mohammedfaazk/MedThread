import { prisma } from '@medthread/database';

async function listAllUsers() {
  try {
    console.log('👥 All Users in Database\n');
    console.log('='.repeat(80));

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        passwordHash: true,
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    console.log(`Found ${users.length} users:\n`);

    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.username} (${user.email})`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Has Password: ${user.passwordHash ? '✅ YES' : '❌ NO'}`);
      console.log(`   Password Hash: ${user.passwordHash ? user.passwordHash.substring(0, 30) + '...' : 'NULL'}`);
      console.log('');
    });

    console.log('='.repeat(80));
    console.log('\n📝 Note: You need to know the actual passwords you set for each user.');
    console.log('The system cannot retrieve plain text passwords (they are hashed).\n');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

listAllUsers();
