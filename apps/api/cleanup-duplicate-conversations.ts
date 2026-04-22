import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL || process.env.DATABASE_URL
    }
  }
});

async function cleanupDuplicateConversations() {
  console.log('🧹 Cleaning up duplicate conversations...\n');

  try {
    // Get all conversations with their participants
    const conversations = await prisma.conversation.findMany({
      include: {
        participants: {
          select: {
            id: true,
            role: true
          }
        },
        messages: {
          select: {
            id: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc' // Keep the most recent conversation (first in list)
      }
    });

    console.log(`📊 Found ${conversations.length} total conversations\n`);

    // Group conversations by participant pairs
    const conversationGroups = new Map<string, typeof conversations>();

    for (const conversation of conversations) {
      if (conversation.participants.length !== 2) {
        console.log(`⚠️  Skipping conversation ${conversation.id} - has ${conversation.participants.length} participants`);
        continue;
      }

      // Sort participant IDs to create a consistent key
      const participantIds = conversation.participants
        .map(p => p.id)
        .sort()
        .join('-');

      if (!conversationGroups.has(participantIds)) {
        conversationGroups.set(participantIds, []);
      }

      conversationGroups.get(participantIds)!.push(conversation);
    }

    console.log(`👥 Found ${conversationGroups.size} unique participant pairs\n`);

    let deletedCount = 0;
    let keptCount = 0;

    // Process each group
    for (const [participantKey, convos] of conversationGroups.entries()) {
      if (convos.length > 1) {
        console.log(`\n🔍 Found ${convos.length} conversations for participants: ${participantKey}`);
        
        // Keep the first (most recent) conversation
        const keepConvo = convos[0];
        const deleteConvos = convos.slice(1);

        console.log(`   ✅ Keeping conversation: ${keepConvo.id} (created: ${keepConvo.createdAt}, ${keepConvo.messages.length} messages)`);
        keptCount++;

        // Delete the duplicate conversations
        for (const deleteConvo of deleteConvos) {
          console.log(`   ❌ Deleting duplicate: ${deleteConvo.id} (created: ${deleteConvo.createdAt}, ${deleteConvo.messages.length} messages)`);
          
          try {
            // Delete messages first
            await prisma.message.deleteMany({
              where: {
                conversationId: deleteConvo.id
              }
            });

            // Delete the conversation
            await prisma.conversation.delete({
              where: {
                id: deleteConvo.id
              }
            });

            deletedCount++;
          } catch (error) {
            console.error(`   ⚠️  Failed to delete conversation ${deleteConvo.id}:`, error);
          }
        }
      } else {
        keptCount++;
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('📋 Summary:');
    console.log(`   ✅ Kept: ${keptCount} conversations`);
    console.log(`   ❌ Deleted: ${deletedCount} duplicate conversations`);
    console.log('='.repeat(50));

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupDuplicateConversations();
