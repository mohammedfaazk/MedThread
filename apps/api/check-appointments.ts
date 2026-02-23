import { prisma } from '@medthread/database';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function checkAppointments() {
  try {
    console.log('\n=== CHECKING APPOINTMENTS ===\n');
    
    const appointments = await prisma.appointment.findMany({
      include: {
        patient: { select: { username: true, email: true } },
        doctor: { select: { username: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log(`Total appointments: ${appointments.length}\n`);
    
    if (appointments.length > 0) {
      appointments.forEach((apt, idx) => {
        console.log(`${idx + 1}. Appointment ID: ${apt.id}`);
        console.log(`   Patient: ${apt.patient.username} (${apt.patient.email})`);
        console.log(`   Doctor: ${apt.doctor.username} (${apt.doctor.email})`);
        console.log(`   Status: ${apt.status}`);
        console.log(`   Start: ${apt.startTime}`);
        console.log(`   Reason: ${apt.reason || 'N/A'}`);
        console.log('');
      });
    } else {
      console.log('No appointments found in database.\n');
    }
    
    // Check conversations
    const conversations = await prisma.conversation.findMany({
      include: {
        participants: { select: { username: true } },
        messages: true
      }
    });
    
    console.log(`Total conversations: ${conversations.length}\n`);
    
    if (conversations.length > 0) {
      conversations.forEach((conv, idx) => {
        console.log(`${idx + 1}. Conversation ID: ${conv.id}`);
        console.log(`   Appointment ID: ${conv.appointmentId || 'N/A'}`);
        console.log(`   Participants: ${conv.participants.map(p => p.username).join(', ')}`);
        console.log(`   Messages: ${conv.messages.length}`);
        console.log('');
      });
    }
    
  } catch (error: any) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkAppointments();
