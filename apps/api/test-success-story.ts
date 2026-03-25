import { PrismaClient } from '@medthread/database';

const prisma = new PrismaClient();

async function testSuccessStory() {
  try {
    console.log('Testing Success Story creation...\n');

    // Find a test user
    const user = await prisma.user.findFirst({
      where: { email: 'navin@gmail.com' }
    });

    if (!user) {
      console.log('❌ Test user not found');
      return;
    }

    console.log(`✅ Found user: ${user.username} (${user.id})\n`);

    // Create a test story
    const story = await prisma.successStory.create({
      data: {
        title: 'My Journey to Better Health',
        story: 'This is my inspiring story about overcoming health challenges...',
        condition: 'Diabetes',
        treatment: 'Diet and Exercise',
        duration: '6 months',
        authorId: user.id,
        status: 'APPROVED',
        likes: 0,
        views: 0,
        isVerified: false
      }
    });

    console.log('✅ Story created:', story.id);
    console.log('   Title:', story.title);
    console.log('   Status:', story.status);
    console.log('   Condition:', story.condition);

    // Fetch all approved stories
    const stories = await prisma.successStory.findMany({
      where: { status: 'APPROVED' },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatar: true
          }
        }
      }
    });

    console.log(`\n✅ Found ${stories.length} approved stories`);
    stories.forEach((s, i) => {
      console.log(`   ${i + 1}. ${s.title} by ${s.author.username}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testSuccessStory();
