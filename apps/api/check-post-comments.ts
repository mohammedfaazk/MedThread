import { PrismaClient } from '@medthread/database';

const prisma = new PrismaClient();

async function checkPostComments() {
  try {
    console.log('🔍 Checking posts with comments...\n');

    const posts = await prisma.post.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            comments: true,
          }
        },
        comments: {
          take: 3,
          select: {
            id: true,
            content: true,
            createdAt: true,
          }
        }
      }
    });

    console.log(`Found ${posts.length} recent posts:\n`);
    
    posts.forEach(post => {
      console.log(`Post: ${post.title}`);
      console.log(`ID: ${post.id}`);
      console.log(`Comment count (_count): ${post._count.comments}`);
      console.log(`Actual comments: ${post.comments.length}`);
      if (post.comments.length > 0) {
        console.log('Sample comments:');
        post.comments.forEach(c => {
          console.log(`  - ${c.content.substring(0, 50)}...`);
        });
      }
      console.log('---\n');
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPostComments();
