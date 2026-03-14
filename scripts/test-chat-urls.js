const { PrismaClient } = require('@medthread/database');

async function testChatUrls() {
  const prisma = new PrismaClient();
  
  try {
    console.log('=== TESTING CHAT URLS ===\n');
    
    // Get some approved appointments with conversations
    const appointments = await prisma.appointment.findMany({
      where: {
        status: 'APPROVED',
        conversation: {
          isNot: null
        }
      },
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
      take: 5
    });
    
    console.log(`Found ${appointments.length} approved appointments with conversations:\n`);
    
    appointments.forEach((apt, index) => {
      console.log(`${index + 1}. Appointment: ${apt.id}`);
      console.log(`   Patient: ${apt.patient.username} (${apt.patient.email})`);
      console.log(`   Doctor: ${apt.doctor.username} (${apt.doctor.email})`);
      console.log(`   Doctor Status: ${apt.doctor.doctorVerificationStatus}`);
      console.log(`   Conversation: ${apt.conversation.id}`);
      console.log(`   Messages: ${apt.conversation.messages.length}`);
      console.log(`   Chat URL: http://localhost:3000/chat?conversation=${apt.conversation.id}`);
      console.log(`   Doctor Dashboard: http://localhost:3000/dashboard/doctor`);
      console.log(`   Patient Dashboard: http://localhost:3000/dashboard/patient`);
      console.log('   ---');
    });
    
    console.log('\n=== TEST CREDENTIALS ===');
    console.log('Doctor Credentials:');
    console.log('- dr.sarah.chen@medthread.com / doctor123');
    console.log('- dr.james.thompson@medthread.com / doctor123');
    console.log('- dr.lisa.patel@medthread.com / doctor123');
    console.log('- dr.michael.rodriguez@medthread.com / doctor123');
    console.log('- dr.emily.watson@medthread.com / doctor123');
    
    console.log('\nPatient Credentials:');
    console.log('- patient1@example.com / password123 (healthseeker_2024)');
    console.log('- patient2@example.com / password123 (wellness_warrior)');
    console.log('- patient3@example.com / password123 (fitness_first)');
    
    console.log('\n=== TESTING INSTRUCTIONS ===');
    console.log('1. Login as a doctor using the credentials above');
    console.log('2. Go to the doctor dashboard: http://localhost:3000/dashboard/doctor');
    console.log('3. Click on a conversation in the "Recent Chats" section');
    console.log('4. Or click "View All" in appointments to see all appointments');
    console.log('5. Click "Open Chat" on an approved appointment');
    console.log('6. Verify chat access works correctly');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testChatUrls();