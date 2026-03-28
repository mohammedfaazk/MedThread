import { prisma } from '@medthread/database';

async function seedCommunityAnalyticsData() {
  console.log('🌱 Seeding community analytics data...');

  try {
    // Get or create test users
    const patients = await prisma.user.findMany({
      where: { role: 'PATIENT' },
      take: 30
    });

    if (patients.length < 10) {
      console.log('⚠️  Not enough patient users. Please run comprehensive seed first.');
      return;
    }

    console.log(`Found ${patients.length} patients`);

    // 1. Support Groups (28 posts, 64 comments)
    console.log('\n📝 Creating Support Group posts...');
    const supportCommunity = await prisma.community.findFirst({
      where: { 
        OR: [
          { displayName: { contains: 'Health' } },
          { name: 'health' }
        ]
      }
    });

    if (supportCommunity) {
      for (let i = 0; i < 28; i++) {
        const author = patients[i % patients.length];
        await prisma.post.create({
          data: {
            title: `Support Group Discussion ${i + 1}`,
            content: `This is a support group post about health concerns and mutual support.`,
            authorId: author.id,
            communityId: supportCommunity.id
          }
        });
      }

      // Add comments
      const supportPosts = await prisma.post.findMany({
        where: { communityId: supportCommunity.id },
        orderBy: { createdAt: 'desc' },
        take: 28
      });

      for (let i = 0; i < 64; i++) {
        const post = supportPosts[i % supportPosts.length];
        const commenter = patients[(i + 5) % patients.length];
        await prisma.comment.create({
          data: {
            content: `Support comment ${i + 1}`,
            postId: post.id,
            authorId: commenter.id
          }
        });
      }

      // Add votes (interactions)
      for (let i = 0; i < 143; i++) {
        const post = supportPosts[i % supportPosts.length];
        const voter = patients[(i + 10) % patients.length];
        try {
          await prisma.vote.create({
            data: {
              postId: post.id,
              userId: voter.id,
              value: i % 3 === 0 ? -1 : 1
            }
          });
        } catch (e) {
          // Skip if duplicate
        }
      }
      console.log(`✅ Created 28 posts, 64 comments, 143 votes in ${supportCommunity.displayName}`);
    } else {
      console.log('⚠️  No suitable community found for Support Groups');
    }

    // 2. Q&A Forum (41 questions, 98 answers)
    console.log('\n❓ Creating Q&A Forum questions...');
    for (let i = 0; i < 41; i++) {
      const author = patients[i % patients.length];
      await prisma.forumQuestion.create({
        data: {
          title: `Health Question ${i + 1}`,
          content: `I have a question about health topic ${i + 1}`,
          authorId: author.id,
          tags: ['health', 'question'],
          upvotes: Math.floor(Math.random() * 10)
        }
      });
    }

    const questions = await prisma.forumQuestion.findMany({ take: 41 });
    for (let i = 0; i < 98; i++) {
      const question = questions[i % questions.length];
      const answerer = patients[(i + 3) % patients.length];
      await prisma.forumAnswer.create({
        data: {
          content: `Answer to question ${i + 1}`,
          questionId: question.id,
          authorId: answerer.id,
          upvotes: Math.floor(Math.random() * 5)
        }
      });
    }

    // 3. Health Challenges (17 challenges, 39 participants)
    console.log('\n🏃 Creating Health Challenges...');
    for (let i = 0; i < 17; i++) {
      const creator = patients[i % patients.length];
      const challenge = await prisma.healthChallenge.create({
        data: {
          title: `Health Challenge ${i + 1}`,
          description: `Join this ${i + 1}-day health challenge`,
          type: i % 2 === 0 ? 'EXERCISE' : 'DIET',
          duration: '30 days',
          goal: 100,
          unit: i % 2 === 0 ? 'steps' : 'calories',
          createdBy: creator.id,
          participants: [],
          rewards: [],
          leaderboard: [],
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
      });

      // Add participants
      const participantsCount = Math.floor(39 / 17) + (i < (39 % 17) ? 1 : 0);
      for (let j = 0; j < participantsCount; j++) {
        const participant = patients[(i + j + 5) % patients.length];
        try {
          await prisma.challengeParticipant.create({
            data: {
              challengeId: challenge.id,
              userId: participant.id,
              progress: Math.floor(Math.random() * 100)
            }
          });
        } catch (e) {
          // Skip if duplicate
        }
      }
    }

    // 4. Success Stories (22 stories, 51 comments)
    console.log('\n🌟 Creating Success Stories...');
    for (let i = 0; i < 22; i++) {
      const author = patients[i % patients.length];
      await prisma.successStory.create({
        data: {
          title: `My Success Story ${i + 1}`,
          condition: i % 2 === 0 ? 'Weight Loss' : 'Chronic Disease',
          story: `I overcame my health challenge and here's how I did it. This is my journey to better health.`,
          authorId: author.id,
          likes: Math.floor(Math.random() * 10),
          status: 'APPROVED'
        }
      });
    }

    const stories = await prisma.successStory.findMany({ take: 22 });
    for (let i = 0; i < 51; i++) {
      const story = stories[i % stories.length];
      const commenter = patients[(i + 7) % patients.length];
      await prisma.storyComment.create({
        data: {
          content: `Inspiring story comment ${i + 1}`,
          storyId: story.id,
          authorId: commenter.id
        }
      });
    }

    console.log('\n✅ Community analytics data seeded successfully!');
    console.log('\nExpected values:');
    console.log('Support Groups:    28 posts, 64 comments, 143 interactions');
    console.log('Q&A Forum:         41 questions, 98 answers, ~212 interactions');
    console.log('Health Challenges: 17 challenges, 39 participants');
    console.log('Success Stories:   22 stories, 51 comments');

  } catch (error: any) {
    console.error('❌ Error seeding data:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedCommunityAnalyticsData();
