import { prisma } from '@medthread/database';

async function checkConversation() {
  try {
    const appointmentId = 'cmn5rhryr000vgyflps0akr6e'; // Navin's approved appointment
    
    console.log('Checking conversation for appointment:', appointmentId);
    
    const conversation = await prisma.conversation.findFirst({
      where: { appointmentId },
      include: {
        appointment: {
          include: {
            patient: { select: { username: true, email: true } },
            doctor: { select: { username: true, email: true, doctorVerificationStatus: true } }
          }
        }
      }
    });
    
    if (conversation) {
      console.log('\n✓ Conversation found:', conversation.id);
      console.log('  Patient:', conversation.appointment.patient.username);
      console.log('  Doctor:', conversation.appointment.doctor.username);
      console.log('  Doctor Status:', conversation.appointment.doctor.doctorVerificationStatus);
      console.log('  Appointment Status:', conversation.appointment.status);
    } else {
      console.log('\n❌ No conversation found for this appointment');
      console.log('Creating conversation...');
      
      const appointment = await prisma.appointment.findUnique({
        where: { id: appointmentId },
        include: {
          patient: { select: { username: true } },
          doctor: { select: { username: true } }
        }
      });
      
      if (appointment) {
        const newConversation = await prisma.conversation.create({
          data: {
            appointmentId: appointment.id,
            participants: {
              connect: [
                { id: appointment.patientId },
                { id: appointment.doctorId }
              ]
            }
          }
        });
        
        console.log('✓ Created conversation:', newConversation.id);
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkConversation();
