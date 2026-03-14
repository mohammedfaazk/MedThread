const { PrismaClient } = require('@medthread/database');

async function checkAppointments() {
  const prisma = new PrismaClient();
  
  try {
    console.log('=== CHECKING APPOINTMENTS AND CONVERSATIONS ===\n');
    
    // Check appointments with conversations
    const appointments = await prisma.appointment.findMany({
      include: {
        patient: { select: { id: true, username: true, email: true } },
        doctor: { 
          select: { 
            id: true, 
            username: true, 
            email: true, 
            doctorVerificationStatus: true 
          } 
        },
        conversation: {
          include: {
            messages: {
              take: 1,
              orderBy: { createdAt: 'desc' }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });
    
    console.log(`Found ${appointments.length} appointments:\n`);
    
    appointments.forEach((apt, index) => {
      console.log(`${index + 1}. Appointment ID: ${apt.id}`);
      console.log(`   Status: ${apt.status}`);
      console.log(`   Patient: ${apt.patient.username} (${apt.patient.email})`);
      console.log(`   Doctor: ${apt.doctor.username} (${apt.doctor.email})`);
      console.log(`   Doctor Status: ${apt.doctor.doctorVerificationStatus}`);
      console.log(`   Has Conversation: ${apt.conversation ? 'YES' : 'NO'}`);
      if (apt.conversation) {
        console.log(`   Conversation ID: ${apt.conversation.id}`);
        console.log(`   Messages: ${apt.conversation.messages.length}`);
      }
      console.log(`   Start Time: ${apt.startTime}`);
      console.log(`   End Time: ${apt.endTime}`);
      console.log('   ---');
    });
    
    // Check conversations without appointments
    const orphanConversations = await prisma.conversation.findMany({
      where: { appointmentId: null },
      include: {
        messages: { take: 1 }
      }
    });
    
    console.log(`\nFound ${orphanConversations.length} conversations without appointments`);
    
    // Check doctor verification status
    const doctors = await prisma.user.findMany({
      where: { role: 'DOCTOR' },
      select: {
        id: true,
        username: true,
        email: true,
        doctorVerificationStatus: true
      }
    });
    
    console.log(`\n=== DOCTOR VERIFICATION STATUS ===`);
    doctors.forEach(doctor => {
      console.log(`${doctor.username}: ${doctor.doctorVerificationStatus}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAppointments();