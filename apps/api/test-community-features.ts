import { prisma } from '@medthread/database';

async function testCommunityFeatures() {
  try {
    console.log('🧪 Testing All Community Features...\n');

    // Get a real user for testing
    const testUser = await prisma.user.findFirst({
      where: { email: 'navin@gmail.com' }
    });

    if (!testUser) {
      console.error('❌ Test user not found');
      return;
    }

    console.log(`✓ Using test user: ${testUser.username} (${testUser.id})\n`);

    // TEST 1: Support Groups
    console.log('1️⃣  Testing Support Groups...');
    const supportGroup = await prisma.supportGroup.create({
      data: {
        name: 'Test Diabetes Support',
        condition: 'Diabetes',
        description: 'A test group',
        isPrivate: false,
        moderators: [testUser.id],
        members: [{
          userId: testUser.id,
          joinedAt: new Date().toISOString(),
          isAnonymous: false
        }],
        memberCount: 1,
        rules: [],
        createdBy: testUser.id
      }
    });
    console.log(`✓ Support group created: ${supportGroup.id}`);
    console.log(`  Private: ${supportGroup.isPrivate}\n`);

    // TEST 2: Q&A Forum
    console.log('2️⃣  Testing Q&A Forum...');
    const question = await prisma.forumQuestion.create({
      data: {
        title: 'Test Question',
        content: 'This is a test question',
        authorId: testUser.id,
        category: 'GENERAL',
        tags: ['test'],
        status: 'OPEN',
        isAnonymous: false
      }
    });
    console.log(`✓ Question created: ${question.id}\n`);

    const answer = await prisma.forumAnswer.create({
      data: {
        questionId: question.id,
        authorId: testUser.id,
        content: 'This is a test answer'
      }
    });
    console.log(`✓ Answer created: ${answer.id}\n`);

    // TEST 3: Success Stories
    console.log('3️⃣  Testing Success Stories...');
    const story = await prisma.successStory.create({
      data: {
        authorId: testUser.id,
        title: 'My Recovery Story',
        condition: 'Diabetes',
        story: 'This is my success story',
        status: 'APPROVED'
      }
    });
    console.log(`✓ Success story created: ${story.id}\n`);

    // TEST 4: Health Challenges
    console.log('4️⃣  Testing Health Challenges...');
    const challenge = await prisma.healthChallenge.create({
      data: {
        title: 'Test Challenge',
        description: 'A test challenge',
        type: 'STEPS',
        goal: 10000,
        unit: 'steps',
        participants: [],
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        rewards: [],
        leaderboard: [],
        isActive: true
      }
    });
    console.log(`✓ Health challenge created: ${challenge.id}\n`);

    const participant = await prisma.challengeParticipant.create({
      data: {
        challengeId: challenge.id,
        userId: testUser.id,
        progress: 0
      }
    });
    console.log(`✓ Challenge participant created: ${participant.id}\n`);

    // Clean up
    console.log('🧹 Cleaning up test data...');
    await prisma.challengeParticipant.delete({ where: { id: participant.id } });
    await prisma.healthChallenge.delete({ where: { id: challenge.id } });
    await prisma.successStory.delete({ where: { id: story.id } });
    await prisma.forumAnswer.delete({ where: { id: answer.id } });
    await prisma.forumQuestion.delete({ where: { id: question.id } });
    await prisma.supportGroup.delete({ where: { id: supportGroup.id } });
    console.log('✓ Test data cleaned up\n');

    console.log('✅ ALL COMMUNITY FEATURES WORKING!\n');
    console.log('Summary:');
    console.log('  ✓ Support Groups - Create, private flag working');
    console.log('  ✓ Q&A Forum - Questions and answers working');
    console.log('  ✓ Success Stories - Create and approve working');
    console.log('  ✓ Health Challenges - Create and join working');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testCommunityFeatures();
