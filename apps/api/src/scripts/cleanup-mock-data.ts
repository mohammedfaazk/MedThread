/**
 * Cleanup Mock Data Script
 * 
 * Removes all mock data created by comprehensive-seed.ts
 * Run with: tsx apps/api/src/scripts/cleanup-mock-data.ts
 */

import { prisma } from '@medthread/database';

async function cleanup() {
  console.log('🧹 Starting mock data cleanup...\n');

  try {
    // Delete in correct order to respect foreign key constraints
    
    console.log('Deleting patient feedback...');
    const feedback = await prisma.patientFeedback.deleteMany({
      where: {
        patient: { email: { contains: '@medthread-mock.com' } }
      }
    });
    console.log(`   ✓ Deleted ${feedback.count} feedback records`);

    console.log('Deleting messages...');
    const messages = await prisma.message.deleteMany({
      where: {
        sender: { email: { contains: '@medthread-mock.com' } }
      }
    });
    console.log(`   ✓ Deleted ${messages.count} messages`);

    console.log('Deleting conversations...');
    const conversations = await prisma.conversation.deleteMany({
      where: {
        appointment: {
          patient: { email: { contains: '@medthread-mock.com' } }
        }
      }
    });
    console.log(`   ✓ Deleted ${conversations.count} conversations`);

    console.log('Deleting appointments...');
    const appointments = await prisma.appointment.deleteMany({
      where: {
        patient: { email: { contains: '@medthread-mock.com' } }
      }
    });
    console.log(`   ✓ Deleted ${appointments.count} appointments`);

    console.log('Deleting post priorities...');
    const priorities = await prisma.postPriority.deleteMany({
      where: {
        post: {
          author: { email: { contains: '@medthread-mock.com' } }
        }
      }
    });
    console.log(`   ✓ Deleted ${priorities.count} post priorities`);

    console.log('Deleting comments...');
    const comments = await prisma.comment.deleteMany({
      where: {
        author: { email: { contains: '@medthread-mock.com' } }
      }
    });
    console.log(`   ✓ Deleted ${comments.count} comments`);

    console.log('Deleting posts...');
    const posts = await prisma.post.deleteMany({
      where: {
        author: { email: { contains: '@medthread-mock.com' } }
      }
    });
    console.log(`   ✓ Deleted ${posts.count} posts`);

    console.log('Deleting community members...');
    const members = await prisma.communityMember.deleteMany({
      where: {
        user: { email: { contains: '@medthread-mock.com' } }
      }
    });
    console.log(`   ✓ Deleted ${members.count} community memberships`);

    console.log('Deleting users...');
    const users = await prisma.user.deleteMany({
      where: {
        email: { contains: '@medthread-mock.com' }
      }
    });
    console.log(`   ✓ Deleted ${users.count} users`);

    console.log('\n✅ Mock data cleanup completed!\n');

  } catch (error: any) {
    console.error('\n❌ Cleanup failed:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

cleanup()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
