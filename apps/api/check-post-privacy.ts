import { prisma } from '@medthread/database';

async function checkPostPrivacy() {
  try {
    console.log('=== Checking Post Privacy Settings ===\n');
    
    // Get all posts with their privacy settings
    const posts = await prisma.post.findMany({
      where: {
        isRemoved: false,
        isDraft: false,
      },
      select: {
        id: true,
        title: true,
        isPrivate: true,
        authorId: true,
        author: {
          select: {
            id: true,
            username: true,
            role: true,
          }
        },
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 20
    });
    
    console.log(`Found ${posts.length} posts:\n`);
    
    posts.forEach((post, index) => {
      console.log(`${index + 1}. Post ID: ${post.id}`);
      console.log(`   Title: ${post.title}`);
      console.log(`   Author: ${post.author.username} (${post.author.role})`);
      console.log(`   Author ID: ${post.authorId}`);
      console.log(`   Is Private: ${post.isPrivate}`);
      console.log(`   Created: ${post.createdAt}`);
      console.log('');
    });
    
    // Count by privacy
    const publicCount = posts.filter(p => !p.isPrivate).length;
    const privateCount = posts.filter(p => p.isPrivate).length;
    
    console.log('=== Summary ===');
    console.log(`Public posts: ${publicCount}`);
    console.log(`Private posts: ${privateCount}`);
    console.log(`Total posts: ${posts.length}`);
    
  } catch (error) {
    console.error('Error checking post privacy:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPostPrivacy();
