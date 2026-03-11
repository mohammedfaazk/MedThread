import { PrismaClient } from '@medthread/database';

const prisma = new PrismaClient();

async function debugConversationId() {
  try {
    console.log('🔍 Debugging conversation ID issue...\n');

    // Get all conversations with their appointments
    const conversations = await prisma.conversation.findMany({
      include: {
        appointment: {
          include: {
            patient: { select: { id: true, username: true } },
            doctor: { select: { id: true, username: true } }
          }
        }
      }
    });

    console.log(`📋 Found ${conversations.length} conversations:`);
    conversations.forEach(conv => {
      console.log(`  - Conversation ID: ${conv.id}`);
      console.log(`    Appointment ID: ${conv.appointmentId}`);
      if (conv.appointment) {
        console.log(`    Patient: ${conv.appointment.patient.username} (${conv.appointment.patientId})`);
        console.log(`    Doctor: ${conv.appointment.doctor.username} (${conv.appointment.doctorId})`);
      }
      console.log('');
    });

    // Check the specific conversation ID from the URL
    const urlConversationId = 'conv-cmmlikqe20002ugvhy2b2e0ep';
    console.log(`🔍 Checking specific conversation ID: ${urlConversationId}`);
    
    const specificConv = await prisma.conversation.findUnique({
      where: { id: urlConversationId },
      include: {
        appointment: {
          include: {
            patient: { select: { id: true, username: true } },
            doctor: { select: { id: true, username: true } }
          }
        }
      }
    });

    if (specificConv) {
      console.log('✅ Conversation found!');
      console.log(`   Patient: ${specificConv.appointment?.patient.username}`);
      console.log(`   Doctor: ${specificConv.appointment?.doctor.username}`);
    } else {
      console.log('❌ Conversation NOT found in database');
    }

    // Check if there's an appointment with that ID
    const appointment = await prisma.appointment.findUnique({
      where: { id: 'cmmlikqe20002ugvhy2b2e0ep' },
      include: {
        patient: { select: { id: true, username: true } },
        doctor: { select: { id: true, username: true } },
        conversation: true
      }
    });

    if (appointment) {
      console.log('\n📅 Found appointment with matching ID:');
      console.log(`   Appointment ID: ${appointment.id}`);
      console.log(`   Patient: ${appointment.patient.username}`);
      console.log(`   Doctor: ${appointment.doctor.username}`);
      console.log(`   Status: ${appointment.status}`);
      console.log(`   Has conversation: ${appointment.conversation ? 'YES' : 'NO'}`);
      if (appointment.conversation) {
        console.log(`   Conversation ID: ${appointment.conversation.id}`);
      }
    } else {
      console.log('\n❌ No appointment found with that ID');
    }

  } catch (error) {
    console.error('❌ Error debugging conversation ID:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugConversationId();