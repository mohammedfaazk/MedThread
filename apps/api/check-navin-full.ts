import { PrismaClient } from '@medthread/database';

const prisma = new PrismaClient();

async function checkNavin() {
  try {
    const user = await prisma.user.findUnique({
      where: { username: 'navin' },
      select: {
        id: true,
        username: true,
        email: true,
        passwordHash: true,
        role: true
      }
    });

    console.log('Navin user data:');
    console.log(JSON.stringify(user, null, 2));

    // Also check if there are any saved posts
    const savedPosts = await prisma.savedPost.findMany({
      where: { userId: user?.id },
      take: 5
    });

    console.log('\nSaved posts count:', savedPosts.length);
    if (savedPosts.length > 0) {
      console.log('Sample saved posts:', savedPosts.map(sp => sp.postId));
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkNavin();
