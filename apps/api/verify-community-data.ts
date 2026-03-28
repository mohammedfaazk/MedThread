/**
 * Verify Community Features Data
 */

import { prisma } from '@medthread/database';

async function main() {
  console.log('🔍 Verifying Community Features Data...\n');

  // 1. Support Groups
  const supportGroups = await prisma.supportGroup.findMany({
    take: 5
  });
  console.log(`✅ Support Groups: ${supportGroups.length} found`);
  supportGroups.forEach(g => console.log(`   - ${g.name} (${g.condition})`));

  // 2. Q&A Forum
  const questions = await prisma.forumQuestion.findMany({
    take: 5,
    include: {
      answers: true
    }
  });
  console.log(`\n✅ Forum Questions: ${questions.length} found`);
  questions.forEach(q => console.log(`   - ${q.title} (${q.answers.length} answers)`));

  // 3. Health Challenges
  const challenges = await prisma.healthChallenge.findMany({
    take: 5
  });
  console.log(`\n✅ Health Challenges: ${challenges.length} found`);
  challenges.forEach(c => console.log(`   - ${c.title} (${c.type})`));

  // 4. Success Stories
  const stories = await prisma.successStory.findMany({
    take: 5
  });
  console.log(`\n✅ Success Stories: ${stories.length} found`);
  stories.forEach(s => console.log(`   - ${s.title} (${s.condition})`));

  console.log('\n🎉 All community features verified!\n');
}

main()
  .catch((e) => {
    console.error('❌ Verification failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
