import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL || process.env.DATABASE_URL
    }
  }
});

async function diagnoseConversations() {
  console.log('🔍 Diagnosing conversations...\n');

  try {
    // Get all conversations with participants
    const conversations = await prisma.conversation.findMany({
      include: {
        participants: {
          select: {
            id: true,
            username: true,
            role: true
          }
        },
        messages: {
          select: {
            id: true,
            createdAt: true
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    console.log(`📊 Total conversations: ${conversations.length}\n`);

    // Group by participant usernames
    const grouped = new Map<string, typeof conversations>();

    for (const conv of conversations) {
      const usernames = conv.participants
        .map(p => p.username)
        .sort()
        .join(' + ');
      
      if (!grouped.has(usernames)) {
        grouped.set(usernames, []);
      }
      grouped.get(usernames)!.push(conv);
    }

    console.log('📋 Conversations grouped by participants:\n');
    
    for (const [users, convos] of grouped.entries()) {
      console.log(`\n👥 ${users} (${convos.length} conversation${convos.length > 1 ? 's' : ''})`);
      
      for (const conv of convos) {
        const lastMessage = conv.messages[0];
        console.log(`   ID: ${conv.id}`);
        console.log(`   Created: ${conv.createdAt}`);
        console.log(`   Updated: ${conv.updatedAt}`);
        console.log(`   Last message: ${lastMessage ? lastMessage.createdAt : 'No messages'}`);
        console.log(`   Participants: ${conv.participants.map(p => `${p.username} (${p.role})`).join(', ')}`);
        console.log('');
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

diagnoseConversations();
