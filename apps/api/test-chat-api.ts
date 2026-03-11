import { PrismaClient } from '@medthread/database';
import { chatService } from './src/services/chat.service';

const prisma = new PrismaClient();

async function testChatAPI() {
  try {
    console.log('🔍 Testing chat API functionality...\n');

    // Get test users and conversation
    const conversation = await prisma.conversation.findFirst({
      include: {
        appointment: {
          include: {
            patient: { select: { id: true, username: true } },
            doctor: { select: { id: true, username: true } }
          }
        }
      }
    });

    if (!conversation || !conversation.appointment) {
      console.log('❌ No conversation with appointment found');
      return;
    }

    const patientId = conversation.appointment.patientId;
    const doctorId = conversation.appointment.doctorId;
    const conversationId = conversation.id;

    console.log(`👥 Testing with conversation ${conversationId}`);
    console.log(`   Patient: ${conversation.appointment.patient.username} (${patientId})`);
    console.log(`   Doctor: ${conversation.appointment.doctor.username} (${doctorId})`);

    // Test 1: getUserConversations
    console.log('\n🧪 Test 1: getUserConversations for patient...');
    const patientConversations = await chatService.getUserConversations(patientId);
    console.log(`✅ Patient has ${patientConversations.length} conversations`);

    console.log('\n🧪 Test 2: getUserConversations for doctor...');
    const doctorConversations = await chatService.getUserConversations(doctorId);
    console.log(`✅ Doctor has ${doctorConversations.length} conversations`);

    // Test 3: Send a message from patient to doctor
    console.log('\n🧪 Test 3: Sending message from patient...');
    const message1 = await chatService.createMessage({
      conversationId,
      senderId: patientId,
      content: 'Hello doctor, I have a question about my symptoms.',
    });
    console.log(`✅ Message sent: ${message1.id}`);

    // Test 4: Send a reply from doctor
    console.log('\n🧪 Test 4: Sending reply from doctor...');
    const message2 = await chatService.createMessage({
      conversationId,
      senderId: doctorId,
      content: 'Hello! I\'d be happy to help. What symptoms are you experiencing?',
    });
    console.log(`✅ Reply sent: ${message2.id}`);

    // Test 5: Get messages
    console.log('\n🧪 Test 5: Getting conversation messages...');
    const messages = await chatService.getMessages({
      conversationId,
      limit: 10
    });
    console.log(`✅ Retrieved ${messages.messages.length} messages`);
    messages.messages.forEach((msg, i) => {
      console.log(`   ${i + 1}. ${msg.sender.username}: ${msg.content}`);
    });

    // Test 6: Check unread counts
    console.log('\n🧪 Test 6: Checking unread counts...');
    const patientUnread = await chatService.getUnreadCount(patientId, conversationId);
    const doctorUnread = await chatService.getUnreadCount(doctorId, conversationId);
    console.log(`✅ Patient unread: ${patientUnread}, Doctor unread: ${doctorUnread}`);

    // Test 7: Mark messages as read
    console.log('\n🧪 Test 7: Marking messages as read for doctor...');
    await chatService.markAsRead(conversationId, doctorId);
    const doctorUnreadAfter = await chatService.getUnreadCount(doctorId, conversationId);
    console.log(`✅ Doctor unread after marking read: ${doctorUnreadAfter}`);

    console.log('\n✅ All chat API tests completed successfully!');

  } catch (error) {
    console.error('❌ Error testing chat API:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testChatAPI();