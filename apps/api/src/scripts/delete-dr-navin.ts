import { prisma } from '@medthread/database';

/**
 * Script to delete Dr. Navin from the database
 * Usage: npx tsx src/scripts/delete-dr-navin.ts
 */

async function deleteDrNavin() {
  console.log(`🔍 Looking for Dr. Navin...`);

  // Try different possible usernames
  const possibleUsernames = ['navin', 'dr.navin', 'drnavin', 'dr_navin'];
  
  let user = null;
  for (const username of possibleUsernames) {
    user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
      }
    });
    
    if (user) {
      console.log(`✓ Found user: ${username}`);
      break;
    }
  }

  // Also try to find by email
  if (!user) {
    const userByEmail = await prisma.user.findFirst({
      where: {
        OR: [
          { email: { contains: 'navin', mode: 'insensitive' } },
          { username: { contains: 'navin', mode: 'insensitive' } }
        ]
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
      }
    });
    
    if (userByEmail) {
      user = userByEmail;
      console.log(`✓ Found user by search: ${user.username}`);
    }
  }

  if (!user) {
    console.log(`❌ Dr. Navin not found in database`);
    console.log(`\nSearched for usernames: ${possibleUsernames.join(', ')}`);
    console.log(`Also searched emails and usernames containing "navin"`);
    return;
  }

  console.log(`\n📋 User Details:`);
  console.log(`   ID: ${user.id}`);
  console.log(`   Username: ${user.username}`);
  console.log(`   Email: ${user.email}`);
  console.log(`   Role: ${user.role}`);

  console.log(`\n⚠️  This will permanently delete this user and ALL associated data!`);
  console.log(`   Proceeding in 3 seconds...`);
  
  await new Promise(resolve => setTimeout(resolve, 3000));

  console.log(`\n🗑️  Starting deletion process...`);

  try {
    // Use a transaction to ensure all-or-nothing deletion
    await prisma.$transaction(async (tx) => {
      // Delete in order to respect foreign key constraints
      
      const notifications = await tx.notification.deleteMany({ where: { userId: user.id } });
      console.log(`   ✓ Deleted ${notifications.count} notifications`);

      const reports = await tx.report.deleteMany({ where: { userId: user.id } });
      console.log(`   ✓ Deleted ${reports.count} reports`);

      const messagesSent = await tx.message.deleteMany({ where: { senderId: user.id } });
      const messagesReceived = await tx.message.deleteMany({ where: { receiverId: user.id } });
      console.log(`   ✓ Deleted ${messagesSent.count + messagesReceived.count} messages`);

      const blocksAsBlocker = await tx.block.deleteMany({ where: { blockerId: user.id } });
      const blocksAsBlocked = await tx.block.deleteMany({ where: { blockedId: user.id } });
      console.log(`   ✓ Deleted ${blocksAsBlocker.count + blocksAsBlocked.count} blocks`);

      const followsAsFollower = await tx.follow.deleteMany({ where: { followerId: user.id } });
      const followsAsFollowing = await tx.follow.deleteMany({ where: { followingId: user.id } });
      console.log(`   ✓ Deleted ${followsAsFollower.count + followsAsFollowing.count} follows`);

      const communityMembers = await tx.communityMember.deleteMany({ where: { userId: user.id } });
      console.log(`   ✓ Deleted ${communityMembers.count} community memberships`);

      const communityMods = await tx.communityModerator.deleteMany({ where: { userId: user.id } });
      console.log(`   ✓ Deleted ${communityMods.count} moderator roles`);

      const hiddenPosts = await tx.hiddenPost.deleteMany({ where: { userId: user.id } });
      console.log(`   ✓ Deleted ${hiddenPosts.count} hidden posts`);

      const savedComments = await tx.savedComment.deleteMany({ where: { userId: user.id } });
      console.log(`   ✓ Deleted ${savedComments.count} saved comments`);

      const savedPosts = await tx.savedPost.deleteMany({ where: { userId: user.id } });
      console.log(`   ✓ Deleted ${savedPosts.count} saved posts`);

      const awardsGiven = await tx.awardGiven.deleteMany({ where: { giverId: user.id } });
      console.log(`   ✓ Deleted ${awardsGiven.count} awards given`);

      const votes = await tx.vote.deleteMany({ where: { userId: user.id } });
      console.log(`   ✓ Deleted ${votes.count} votes`);

      const comments = await tx.comment.deleteMany({ where: { authorId: user.id } });
      console.log(`   ✓ Deleted ${comments.count} comments`);

      const posts = await tx.post.deleteMany({ where: { authorId: user.id } });
      console.log(`   ✓ Deleted ${posts.count} posts`);

      const availabilities = await tx.availability.deleteMany({ where: { doctorId: user.id } });
      console.log(`   ✓ Deleted ${availabilities.count} availabilities`);

      const appointmentsAsDoctor = await tx.appointment.deleteMany({ where: { doctorId: user.id } });
      const appointmentsAsPatient = await tx.appointment.deleteMany({ where: { patientId: user.id } });
      console.log(`   ✓ Deleted ${appointmentsAsDoctor.count + appointmentsAsPatient.count} appointments`);

      const threadReplies = await tx.threadReply.deleteMany({ where: { authorId: user.id } });
      console.log(`   ✓ Deleted ${threadReplies.count} thread replies`);

      const timelineEvents = await tx.caseTimelineEvent.deleteMany({ where: { userId: user.id } });
      console.log(`   ✓ Deleted ${timelineEvents.count} timeline events`);

      const medicalThreads = await tx.medicalThread.deleteMany({ where: { patientId: user.id } });
      console.log(`   ✓ Deleted ${medicalThreads.count} medical threads`);

      await tx.user.delete({ where: { id: user.id } });
      console.log(`   ✓ Deleted user account`);
    });

    console.log(`\n✅ Successfully deleted Dr. Navin (${user.username}) and all associated data`);

  } catch (error) {
    console.error(`\n❌ Error during deletion:`, error);
    throw error;
  }
}

// Run the deletion
deleteDrNavin()
  .then(() => {
    console.log('\n🎉 Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Failed:', error);
    process.exit(1);
  });
