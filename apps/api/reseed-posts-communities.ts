import { prisma } from '@medthread/database';

async function reseedData() {
  try {
    console.log('🌱 Starting data reseed...');

    // Create communities
    console.log('📍 Creating communities...');
    const communities = await Promise.all([
      prisma.community.upsert({
        where: { name: 'general' },
        update: {},
        create: {
          name: 'general',
          displayName: 'General Discussion',
          description: 'General health and wellness discussions',
          icon: '💬',
          isNSFW: false,
          isPrivate: false
        }
      }),
      prisma.community.upsert({
        where: { name: 'health-tips' },
        update: {},
        create: {
          name: 'health-tips',
          displayName: 'Health Tips',
          description: 'Share and discuss health tips and wellness advice',
          icon: '💡',
          isNSFW: false,
          isPrivate: false
        }
      }),
      prisma.community.upsert({
        where: { name: 'fitness' },
        update: {},
        create: {
          name: 'fitness',
          displayName: 'Fitness & Exercise',
          description: 'Fitness routines, exercises, and workout tips',
          icon: '💪',
          isNSFW: false,
          isPrivate: false
        }
      }),
      prisma.community.upsert({
        where: { name: 'nutrition' },
        update: {},
        create: {
          name: 'nutrition',
          displayName: 'Nutrition & Diet',
          description: 'Nutrition advice, diet plans, and healthy eating',
          icon: '🥗',
          isNSFW: false,
          isPrivate: false
        }
      }),
      prisma.community.upsert({
        where: { name: 'mental-health' },
        update: {},
        create: {
          name: 'mental-health',
          displayName: 'Mental Health',
          description: 'Mental health support and wellness discussions',
          icon: '🧠',
          isNSFW: false,
          isPrivate: false
        }
      })
    ]);

    console.log(`✅ Created ${communities.length} communities`);

    // Get a user to create posts
    const user = await prisma.user.findFirst({
      where: { role: 'DOCTOR' }
    });

    if (!user) {
      console.log('❌ No doctor user found. Please create a doctor account first.');
      return;
    }

    console.log(`📝 Creating posts for user: ${user.username}`);

    // Create sample posts
    const posts = await Promise.all([
      prisma.post.create({
        data: {
          title: 'Welcome to MedThread!',
          content: 'This is a community for health discussions and wellness tips. Feel free to share your experiences and ask questions!',
          authorId: user.id,
          communityId: communities[0].id,
          type: 'TEXT',
          isNSFW: false,
          isSpoiler: false,
          isPrivate: false
        }
      }),
      prisma.post.create({
        data: {
          title: '5 Simple Tips for Better Sleep',
          content: '1. Maintain a consistent sleep schedule\n2. Keep your bedroom cool and dark\n3. Avoid screens before bed\n4. Exercise regularly\n5. Limit caffeine intake',
          authorId: user.id,
          communityId: communities[1].id,
          type: 'TEXT',
          isNSFW: false,
          isSpoiler: false,
          isPrivate: false
        }
      }),
      prisma.post.create({
        data: {
          title: 'Starting a Fitness Journey',
          content: 'If you\'re new to fitness, start with 30 minutes of moderate exercise 3-4 times a week. Consistency is key!',
          authorId: user.id,
          communityId: communities[2].id,
          type: 'TEXT',
          isNSFW: false,
          isSpoiler: false,
          isPrivate: false
        }
      }),
      prisma.post.create({
        data: {
          title: 'Healthy Eating on a Budget',
          content: 'Focus on whole foods like rice, beans, seasonal vegetables, and eggs. These are nutritious and affordable.',
          authorId: user.id,
          communityId: communities[3].id,
          type: 'TEXT',
          isNSFW: false,
          isSpoiler: false,
          isPrivate: false
        }
      }),
      prisma.post.create({
        data: {
          title: 'Mindfulness for Stress Relief',
          content: 'Try spending 10 minutes daily on mindfulness meditation. It can significantly reduce stress and anxiety.',
          authorId: user.id,
          communityId: communities[4].id,
          type: 'TEXT',
          isNSFW: false,
          isSpoiler: false,
          isPrivate: false
        }
      })
    ]);

    console.log(`✅ Created ${posts.length} posts`);
    console.log('🎉 Data reseed completed successfully!');
  } catch (error) {
    console.error('❌ Error reseeding data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

reseedData();
