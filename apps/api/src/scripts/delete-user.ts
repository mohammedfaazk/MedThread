import { prisma } from '@medthread/database';

/**
 * Script to delete a user and all associated data
 * Usage: npx tsx src/scripts/delete-user.ts <username>
 */

async function deleteUser(username: string) {
  console.log(`🔍 Looking for user: ${username}`);

  // Find the user
  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
    }
  });

  if (!user) {
    console.log(`❌ User "${username}" not found`);
    return;
  }

  console.log(`\n📋 User found:`);
  console.log(`   ID: ${user.id}`);
  console.log(`   Username: ${user.username}`);
  console.log(`   Email: ${user.email}`);
  console.log(`   Role: ${user.role}`);

  console.log(`\n🗑️  Starting deletion process...`);

  try {
    // Delete in order to respect foreign key constraints
    
    // 1. Delete notifications
    const notifications = await prisma.notification.deleteMany({
      where: { userId: user.id }
    });
    console.log(`   ✓ Deleted ${notifications.count} notifications`);

    // 2. Delete reports
    const reports = await prisma.report.deleteMany({
      where: { userId: user.id }
    });
    console.log(`   ✓ Deleted ${reports.count} reports`);

    // 3. Delete messages (sent and received)
    const messagesSent = await prisma.message.deleteMany({
      where: { senderId: user.id }
    });
    const messagesReceived = await prisma.message.deleteMany({
      where: { receiverId: user.id }
    });
    console.log(`   ✓ Deleted ${messagesSent.count + messagesReceived.count} messages`);

    // 4. Delete blocks (blocker and blocked)
    const blocksAsBlocker = await prisma.block.deleteMany({
      where: { blockerId: user.id }
    });
    const blocksAsBlocked = await prisma.block.deleteMany({
      where: { blockedId: user.id }
    });
    console.log(`   ✓ Deleted ${blocksAsBlocker.count + blocksAsBlocked.count} blocks`);

    // 5. Delete follows (follower and following)
    const followsAsFollower = await prisma.follow.deleteMany({
      where: { followerId: user.id }
    });
    const followsAsFollowing = await prisma.follow.deleteMany({
      where: { followingId: user.id }
    });
    console.log(`   ✓ Deleted ${followsAsFollower.count + followsAsFollowing.count} follows`);

    // 6. Delete community memberships
    const communityMembers = await prisma.communityMember.deleteMany({
      where: { userId: user.id }
    });
    console.log(`   ✓ Deleted ${communityMembers.count} community memberships`);

    // 7. Delete community moderator roles
    const communityMods = await prisma.communityModerator.deleteMany({
      where: { userId: user.id }
    });
    console.log(`   ✓ Deleted ${communityMods.count} moderator roles`);

    // 8. Delete hidden posts
    const hiddenPosts = await prisma.hiddenPost.deleteMany({
      where: { userId: user.id }
    });
    console.log(`   ✓ Deleted ${hiddenPosts.count} hidden posts`);

    // 9. Delete saved comments
    const savedComments = await prisma.savedComment.deleteMany({
      where: { userId: user.id }
    });
    console.log(`   ✓ Deleted ${savedComments.count} saved comments`);

    // 10. Delete saved posts
    const savedPosts = await prisma.savedPost.deleteMany({
      where: { userId: user.id }
    });
    console.log(`   ✓ Deleted ${savedPosts.count} saved posts`);

    // 11. Delete awards given
    const awardsGiven = await prisma.awardGiven.deleteMany({
      where: { giverId: user.id }
    });
    console.log(`   ✓ Deleted ${awardsGiven.count} awards given`);

    // 12. Delete votes
    const votes = await prisma.vote.deleteMany({
      where: { userId: user.id }
    });
    console.log(`   ✓ Deleted ${votes.count} votes`);

    // 13. Delete comments (this will cascade delete awards on comments)
    const comments = await prisma.comment.deleteMany({
      where: { authorId: user.id }
    });
    console.log(`   ✓ Deleted ${comments.count} comments`);

    // 14. Delete posts (this will cascade delete awards on posts)
    const posts = await prisma.post.deleteMany({
      where: { authorId: user.id }
    });
    console.log(`   ✓ Deleted ${posts.count} posts`);

    // 15. Delete availabilities
    const availabilities = await prisma.availability.deleteMany({
      where: { doctorId: user.id }
    });
    console.log(`   ✓ Deleted ${availabilities.count} availabilities`);

    // 16. Delete appointments (as doctor and patient)
    const appointmentsAsDoctor = await prisma.appointment.deleteMany({
      where: { doctorId: user.id }
    });
    const appointmentsAsPatient = await prisma.appointment.deleteMany({
      where: { patientId: user.id }
    });
    console.log(`   ✓ Deleted ${appointmentsAsDoctor.count + appointmentsAsPatient.count} appointments`);

    // 17. Delete medical thread replies
    const threadReplies = await prisma.threadReply.deleteMany({
      where: { authorId: user.id }
    });
    console.log(`   ✓ Deleted ${threadReplies.count} thread replies`);

    // 18. Delete case timeline events
    const timelineEvents = await prisma.caseTimelineEvent.deleteMany({
      where: { userId: user.id }
    });
    console.log(`   ✓ Deleted ${timelineEvents.count} timeline events`);

    // 19. Delete medical threads
    const medicalThreads = await prisma.medicalThread.deleteMany({
      where: { patientId: user.id }
    });
    console.log(`   ✓ Deleted ${medicalThreads.count} medical threads`);

    // 20. Finally, delete the user
    await prisma.user.delete({
      where: { id: user.id }
    });
    console.log(`   ✓ Deleted user account`);

    console.log(`\n✅ Successfully deleted user "${username}" and all associated data`);

  } catch (error) {
    console.error(`\n❌ Error during deletion:`, error);
    throw error;
  }
}

// Get username from command line arguments
const username = process.argv[2];

if (!username) {
  console.error('❌ Please provide a username');
  console.log('Usage: npx tsx src/scripts/delete-user.ts <username>');
  process.exit(1);
}

// Run the deletion
deleteUser(username)
  .then(() => {
    console.log('\n🎉 Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Failed:', error);
    process.exit(1);
  });
