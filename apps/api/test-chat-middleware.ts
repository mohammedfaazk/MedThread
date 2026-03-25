import { PrismaClient } from '@medthread/database';
import { canAccessConversation } from './src/middleware/chatPermission';

const prisma = new PrismaClient();

async function testChatMiddleware() {
  console.log('🔍 Testing Chat Middleware Logic...\n');

  try {
    // Get dr.rifa.hassan
    const doctor = await prisma.user.findUnique({
      where: { username: 'dr.rifa.hassan' }
    });

    if (!doctor) {
      console.log('❌ Doctor not found');
      return;
    }

    console.log(`Testing with doctor: ${doctor.username} (${doctor.doctorVerificationStatus})\n`);

    // Get all conversations
    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: {
            id: doctor.id
          }
        }
      },
      include: {
        participants: {
          select: {
            username: true
          }
        },
        appointment: {
          select: {
            id: true,
            status: true
          }
        }
      }
    });

    console.log(`Found ${conversations.length} conversations:\n`);

    for (const conv of conversations) {
      const otherParticipant = conv.participants.find(p => p.username !== doctor.username);
      console.log(`📝 Conversation ${conv.id}`);
      console.log(`   Participants: ${conv.participants.map(p => p.username).join(', ')}`);
      console.log(`   Has Appointment: ${conv.appointment ? 'Yes' : 'No'}`);
      if (conv.appointment) {
        console.log(`   Appointment Status: ${conv.appointment.status}`);
      }

      // Test middleware
      const result = await canAccessConversation(doctor.id, conv.id);
      
      console.log(`   Middleware Result: ${result.allowed ? '✅ ALLOWED' : '❌ DENIED'}`);
      if (!result.allowed) {
        console.log(`   Reason: ${result.reason}`);
        console.log(`   Code: ${result.code}`);
      }
      console.log('');
    }

    // Test with a patient
    const patient = await prisma.user.findUnique({
      where: { username: 'Ariana' }
    });

    if (patient) {
      console.log(`\nTesting with patient: ${patient.username}\n`);
      
      const patientConv = conversations.find(c => 
        c.participants.some(p => p.username === patient.username)
      );

      if (patientConv) {
        console.log(`📝 Conversation ${patientConv.id}`);
        const result = await canAccessConversation(patient.id, patientConv.id);
        console.log(`   Middleware Result: ${result.allowed ? '✅ ALLOWED' : '❌ DENIED'}`);
        if (!result.allowed) {
          console.log(`   Reason: ${result.reason}`);
          console.log(`   Code: ${result.code}`);
        }
      }
    }

    console.log('\n✅ Middleware test complete!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testChatMiddleware();
