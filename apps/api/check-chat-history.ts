import { PrismaClient } from '@medthread/database';

const prisma = new PrismaClient();

async function checkChatHistory() {
  try {
    console.log('=== CHECKING CHAT HISTORY IN DATABASE ===\n');

    // 1. Check Message table
    console.log('1. MESSAGE TABLE:');
    const messageCount = await prisma.message.count();
    console.log(`   Total messages: ${messageCount}`);

    if (messageCount > 0) {
      // Get messages with sender and receiver info
      const messages = await prisma.message.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          sender: {
            select: { id: true, username: true, email: true }
          },
          receiver: {
            select: { id: true, username: true, email: true }
          },
          conversation: {
            select: { id: true, appointmentId: true }
          }
        }
      });

      console.log(`\n   Recent messages (showing up to 10):`);
      messages.forEach((msg, idx) => {
        console.log(`   ${idx + 1}. [${msg.createdAt.toISOString()}]`);
        console.log(`      From: ${msg.sender.username} (${msg.sender.email})`);
        console.log(`      To: ${msg.receiver.username} (${msg.receiver.email})`);
        console.log(`      Type: ${msg.type}`);
        console.log(`      Subject: ${msg.subject || 'N/A'}`);
        console.log(`      Content: ${msg.content.substring(0, 100)}${msg.content.length > 100 ? '...' : ''}`);
        console.log(`      Read: ${msg.isRead}`);
        console.log(`      Conversation ID: ${msg.conversationId || 'N/A'}`);
        console.log('');
      });

      // Count messages by user
      const messagesByUser = await prisma.message.groupBy({
        by: ['senderId'],
        _count: { id: true }
      });

      console.log(`   Messages sent by user:`);
      for (const userMsg of messagesByUser) {
        const user = await prisma.user.findUnique({
          where: { id: userMsg.senderId },
          select: { username: true, email: true }
        });
        console.log(`      ${user?.username} (${user?.email}): ${userMsg._count.id} messages`);
      }
    }

    // 2. Check Conversation table
    console.log('\n2. CONVERSATION TABLE:');
    const conversationCount = await prisma.conversation.count();
    console.log(`   Total conversations: ${conversationCount}`);

    if (conversationCount > 0) {
      const conversations = await prisma.conversation.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          participants: {
            select: { id: true, username: true, email: true }
          },
          appointment: {
            select: { 
              id: true, 
              status: true,
              reason: true,
              startTime: true
            }
          },
          messages: {
            select: { id: true, content: true, createdAt: true },
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        }
      });

      console.log(`\n   Recent conversations (showing up to 10):`);
      conversations.forEach((conv, idx) => {
        console.log(`   ${idx + 1}. Conversation ID: ${conv.id}`);
        console.log(`      Created: ${conv.createdAt.toISOString()}`);
        console.log(`      Participants: ${conv.participants.map(p => p.username).join(', ')}`);
        console.log(`      Appointment ID: ${conv.appointmentId || 'N/A'}`);
        if (conv.appointment) {
          console.log(`      Appointment Status: ${conv.appointment.status}`);
          console.log(`      Appointment Reason: ${conv.appointment.reason || 'N/A'}`);
        }
        console.log(`      Message count: ${conv.messages.length > 0 ? 'Has messages' : 'No messages'}`);
        console.log('');
      });
    }

    // 3. Check message statistics
    console.log('\n3. MESSAGE STATISTICS:');
    const readMessages = await prisma.message.count({ where: { isRead: true } });
    const unreadMessages = await prisma.message.count({ where: { isRead: false } });
    console.log(`   Read messages: ${readMessages}`);
    console.log(`   Unread messages: ${unreadMessages}`);

    const messagesByType = await prisma.message.groupBy({
      by: ['type'],
      _count: { id: true }
    });
    console.log(`\n   Messages by type:`);
    messagesByType.forEach(type => {
      console.log(`      ${type.type}: ${type._count.id}`);
    });

    // 4. Check for messages with conversations
    const messagesWithConversation = await prisma.message.count({
      where: { conversationId: { not: null } }
    });
    const messagesWithoutConversation = await prisma.message.count({
      where: { conversationId: null }
    });
    console.log(`\n   Messages linked to conversations: ${messagesWithConversation}`);
    console.log(`   Direct messages (no conversation): ${messagesWithoutConversation}`);

    console.log('\n=== CHAT HISTORY CHECK COMPLETE ===');

  } catch (error) {
    console.error('Error checking chat history:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkChatHistory();
