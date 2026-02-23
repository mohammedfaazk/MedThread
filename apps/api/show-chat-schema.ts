import { PrismaClient } from '@medthread/database';

const prisma = new PrismaClient();

async function showChatSchema() {
  console.log('=== CHAT-RELATED DATABASE SCHEMA ===\n');

  console.log('1. MESSAGE TABLE STRUCTURE:');
  console.log('   Fields:');
  console.log('   - id: String (Primary Key, CUID)');
  console.log('   - senderId: String (Foreign Key -> User)');
  console.log('   - receiverId: String (Foreign Key -> User)');
  console.log('   - subject: String? (Optional)');
  console.log('   - content: String (Required)');
  console.log('   - isRead: Boolean (Default: false)');
  console.log('   - conversationId: String? (Foreign Key -> Conversation, Optional)');
  console.log('   - attachment: String? (Optional)');
  console.log('   - type: MessageType (Enum: TEXT, IMAGE, FILE - Default: TEXT)');
  console.log('   - createdAt: DateTime (Default: now())');
  console.log('');
  console.log('   Relations:');
  console.log('   - sender: User (via senderId)');
  console.log('   - receiver: User (via receiverId)');
  console.log('   - conversation: Conversation (via conversationId)');
  console.log('');
  console.log('   Indexes:');
  console.log('   - senderId');
  console.log('   - receiverId');
  console.log('');

  console.log('2. CONVERSATION TABLE STRUCTURE:');
  console.log('   Fields:');
  console.log('   - id: String (Primary Key, CUID)');
  console.log('   - appointmentId: String? (Foreign Key -> Appointment, Optional, Unique)');
  console.log('   - createdAt: DateTime (Default: now())');
  console.log('   - updatedAt: DateTime (Auto-updated)');
  console.log('');
  console.log('   Relations:');
  console.log('   - appointment: Appointment (via appointmentId)');
  console.log('   - messages: Message[] (one-to-many)');
  console.log('   - participants: User[] (many-to-many)');
  console.log('');

  console.log('3. RELATED TABLES:');
  console.log('');
  console.log('   APPOINTMENT TABLE (linked to conversations):');
  console.log('   - id: String (Primary Key)');
  console.log('   - patientId: String (Foreign Key -> User)');
  console.log('   - doctorId: String (Foreign Key -> User)');
  console.log('   - startTime: DateTime');
  console.log('   - endTime: DateTime');
  console.log('   - status: AppointmentStatus (PENDING, APPROVED, REJECTED, COMPLETED, CANCELLED)');
  console.log('   - reason: String?');
  console.log('   - conversation: Conversation? (one-to-one)');
  console.log('');

  console.log('4. MESSAGE TYPE ENUM:');
  console.log('   - TEXT: Plain text message');
  console.log('   - IMAGE: Image attachment');
  console.log('   - FILE: File attachment');
  console.log('');

  console.log('5. HOW THE CHAT SYSTEM WORKS:');
  console.log('   - Direct Messages: Message records with senderId and receiverId');
  console.log('   - Conversations: Group messages under a Conversation (optional)');
  console.log('   - Appointment Chats: Conversations linked to specific appointments');
  console.log('   - Participants: Users can be added to conversations via many-to-many relation');
  console.log('');

  // Check if there are any users in the system
  const userCount = await prisma.user.count();
  console.log(`6. CURRENT DATABASE STATE:`);
  console.log(`   Total users: ${userCount}`);
  
  if (userCount > 0) {
    const users = await prisma.user.findMany({
      take: 5,
      select: { id: true, username: true, email: true, role: true }
    });
    console.log(`\n   Sample users (showing up to 5):`);
    users.forEach((user, idx) => {
      console.log(`   ${idx + 1}. ${user.username} (${user.email}) - Role: ${user.role}`);
    });
  }

  const messageCount = await prisma.message.count();
  const conversationCount = await prisma.conversation.count();
  const appointmentCount = await prisma.appointment.count();

  console.log(`\n   Total messages: ${messageCount}`);
  console.log(`   Total conversations: ${conversationCount}`);
  console.log(`   Total appointments: ${appointmentCount}`);

  console.log('\n=== SCHEMA INSPECTION COMPLETE ===');

  await prisma.$disconnect();
}

showChatSchema();
