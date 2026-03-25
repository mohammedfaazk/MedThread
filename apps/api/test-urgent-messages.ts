import { PrismaClient } from '@medthread/database';

const prisma = new PrismaClient();

async function testUrgentMessages() {
  console.log('🔍 Testing Urgent Message Feature...\n');

  try {
    // Get a conversation
    const conversation = await prisma.conversation.findFirst({
      include: {
        participants: {
          select: {
            id: true,
            username: true
          }
        }
      }
    });

    if (!conversation) {
      console.log('❌ No conversations found');
      return;
    }

    console.log(`✅ Found conversation: ${conversation.id}`);
    console.log(`   Participants: ${conversation.participants.map(p => p.username).join(', ')}\n`);

    // Check existing messages with urgent flags
    const urgentMessages = await prisma.message.findMany({
      where: {
        conversationId: conversation.id,
        isUrgent: true
      },
      include: {
        sender: {
          select: {
            username: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    });

    console.log(`📊 Found ${urgentMessages.length} urgent messages in this conversation:\n`);

    if (urgentMessages.length > 0) {
      urgentMessages.forEach((msg, index) => {
        console.log(`${index + 1}. Message ID: ${msg.id}`);
        console.log(`   Sender: ${msg.sender.username}`);
        console.log(`   Content: ${msg.content.substring(0, 50)}...`);
        console.log(`   Is Urgent: ${msg.isUrgent}`);
        console.log(`   Urgency Level: ${msg.urgencyLevel || 'Not set'}`);
        console.log(`   Created: ${msg.createdAt}`);
        console.log('');
      });
    } else {
      console.log('   No urgent messages found. Let\'s check all messages:\n');
      
      const allMessages = await prisma.message.findMany({
        where: {
          conversationId: conversation.id
        },
        select: {
          id: true,
          content: true,
          isUrgent: true,
          urgencyLevel: true,
          createdAt: true,
          sender: {
            select: {
              username: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 10
      });

      console.log(`   Total messages in conversation: ${allMessages.length}\n`);
      
      allMessages.forEach((msg, index) => {
        console.log(`${index + 1}. ${msg.sender.username}: ${msg.content.substring(0, 40)}...`);
        console.log(`   isUrgent: ${msg.isUrgent}, urgencyLevel: ${msg.urgencyLevel || 'null'}`);
        console.log('');
      });
    }

    // Check the Message model schema
    console.log('\n📋 Checking Message model fields:');
    const sampleMessage = await prisma.message.findFirst({
      where: {
        conversationId: conversation.id
      }
    });

    if (sampleMessage) {
      console.log('   Fields in Message model:');
      console.log(`   - id: ${typeof sampleMessage.id}`);
      console.log(`   - content: ${typeof sampleMessage.content}`);
      console.log(`   - isUrgent: ${typeof sampleMessage.isUrgent} (value: ${sampleMessage.isUrgent})`);
      console.log(`   - urgencyLevel: ${typeof sampleMessage.urgencyLevel} (value: ${sampleMessage.urgencyLevel})`);
      console.log(`   - isRead: ${typeof sampleMessage.isRead}`);
      console.log(`   - type: ${typeof sampleMessage.type}`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testUrgentMessages();
