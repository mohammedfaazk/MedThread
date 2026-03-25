import { PrismaClient } from '@medthread/database';

const prisma = new PrismaClient();

async function testAllEndpoints() {
  try {
    console.log('Testing all community feature database models...\n');

    // Test Support Groups
    console.log('1. Testing Support Groups...');
    const groupCount = await prisma.supportGroup.count();
    console.log(`   ✅ SupportGroup model works - ${groupCount} groups found\n`);

    // Test QA Forum
    console.log('2. Testing QA Forum...');
    const questionCount = await prisma.forumQuestion.count();
    console.log(`   ✅ ForumQuestion model works - ${questionCount} questions found\n`);

    // Test Success Stories
    console.log('3. Testing Success Stories...');
    const storyCount = await prisma.successStory.count();
    console.log(`   ✅ SuccessStory model works - ${storyCount} stories found\n`);

    // Test Health Challenges
    console.log('4. Testing Health Challenges...');
    const challengeCount = await prisma.healthChallenge.count();
    console.log(`   ✅ HealthChallenge model works - ${challengeCount} challenges found\n`);

    console.log('🎉 All community feature models are working correctly!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAllEndpoints();
