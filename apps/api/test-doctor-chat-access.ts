import { PrismaClient } from '@medthread/database';

const prisma = new PrismaClient();

async function testDoctorChatAccess() {
  console.log('🔍 Testing Doctor Chat Access...\n');

  try {
    // Get dr.rifa.hassan who has APPROVED status
    const doctor = await prisma.user.findUnique({
      where: { username: 'dr.rifa.hassan' },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        doctorVerificationStatus: true
      }
    });

    if (!doctor) {
      console.log('❌ Doctor not found');
      return;
    }

    console.log('✅ Doctor found:');
    console.log(`   Username: ${doctor.username}`);
    console.log(`   Role: ${doctor.role}`);
    console.log(`   Verification Status: ${doctor.doctorVerificationStatus}\n`);

    // Get all conversations for this doctor
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
            id: true,
            username: true,
            role: true
          }
        },
        appointment: {
          select: {
            id: true,
            status: true,
            startTime: true,
            endTime: true,
            doctorId: true,
            patientId: true,
            doctor: {
              select: {
                username: true,
                doctorVerificationStatus: true
              }
            },
            patient: {
              select: {
                username: true
              }
            }
          }
        },
        messages: {
          take: 1,
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    console.log(`📊 Found ${conversations.length} conversations for ${doctor.username}:\n`);

    for (const conv of conversations) {
      console.log(`Conversation ID: ${conv.id}`);
      console.log(`Participants:`);
      conv.participants.forEach(p => {
        console.log(`  - ${p.username} (${p.role})`);
      });
      
      if (conv.appointment) {
        console.log(`✅ Has Appointment:`);
        console.log(`   ID: ${conv.appointment.id}`);
        console.log(`   Status: ${conv.appointment.status}`);
        console.log(`   Doctor: ${conv.appointment.doctor.username} (${conv.appointment.doctor.doctorVerificationStatus})`);
        console.log(`   Patient: ${conv.appointment.patient.username}`);
        console.log(`   Start: ${conv.appointment.startTime}`);
        console.log(`   End: ${conv.appointment.endTime}`);
        
        // Check if appointment is expired
        const now = new Date();
        const endTime = new Date(conv.appointment.endTime);
        const gracePeriodDays = 7;
        const expiryTime = new Date(endTime.getTime() + gracePeriodDays * 24 * 60 * 60 * 1000);
        const isExpired = now > expiryTime;
        
        console.log(`   Expired: ${isExpired ? '❌ YES' : '✅ NO'}`);
        if (isExpired) {
          console.log(`   Expiry Date: ${expiryTime.toISOString()}`);
        }
        
        // Validate chat access
        const canAccess = 
          conv.appointment.doctor.doctorVerificationStatus === 'APPROVED' &&
          conv.appointment.status === 'APPROVED' &&
          !isExpired;
        
        console.log(`   Chat Access: ${canAccess ? '✅ ALLOWED' : '❌ DENIED'}`);
        
        if (!canAccess) {
          const reasons = [];
          if (conv.appointment.doctor.doctorVerificationStatus !== 'APPROVED') {
            reasons.push(`Doctor not verified (${conv.appointment.doctor.doctorVerificationStatus})`);
          }
          if (conv.appointment.status !== 'APPROVED') {
            reasons.push(`Appointment not approved (${conv.appointment.status})`);
          }
          if (isExpired) {
            reasons.push('Appointment expired');
          }
          console.log(`   Reasons: ${reasons.join(', ')}`);
        }
      } else {
        console.log(`❌ No Appointment - Chat access will be DENIED`);
        console.log(`   Reason: Conversations require an associated appointment`);
      }
      
      console.log(`Messages: ${conv.messages.length > 0 ? 'Has messages' : 'No messages'}`);
      console.log('');
    }

    // Check if there are any appointments without conversations
    const appointmentsWithoutConv = await prisma.appointment.findMany({
      where: {
        doctorId: doctor.id,
        status: 'APPROVED',
        conversation: null
      },
      include: {
        patient: {
          select: {
            username: true
          }
        }
      }
    });

    if (appointmentsWithoutConv.length > 0) {
      console.log(`\n⚠️  Found ${appointmentsWithoutConv.length} approved appointments WITHOUT conversations:\n`);
      appointmentsWithoutConv.forEach(apt => {
        console.log(`Appointment ID: ${apt.id}`);
        console.log(`Patient: ${apt.patient.username}`);
        console.log(`Status: ${apt.status}`);
        console.log(`Start: ${apt.startTime}`);
        console.log('');
      });
    }

    // Summary
    console.log('\n📋 SUMMARY:');
    const conversationsWithAppointment = conversations.filter(c => c.appointment);
    const conversationsWithoutAppointment = conversations.filter(c => !c.appointment);
    const accessibleConversations = conversations.filter(c => {
      if (!c.appointment) return false;
      const now = new Date();
      const endTime = new Date(c.appointment.endTime);
      const expiryTime = new Date(endTime.getTime() + 7 * 24 * 60 * 60 * 1000);
      return c.appointment.doctor.doctorVerificationStatus === 'APPROVED' &&
             c.appointment.status === 'APPROVED' &&
             now <= expiryTime;
    });

    console.log(`Total Conversations: ${conversations.length}`);
    console.log(`With Appointment: ${conversationsWithAppointment.length}`);
    console.log(`Without Appointment: ${conversationsWithoutAppointment.length}`);
    console.log(`Accessible (can chat): ${accessibleConversations.length}`);
    console.log(`Blocked (cannot chat): ${conversations.length - accessibleConversations.length}`);

    if (conversationsWithoutAppointment.length > 0) {
      console.log(`\n⚠️  ISSUE: ${conversationsWithoutAppointment.length} conversation(s) have no appointment`);
      console.log('   These conversations will be blocked by the chat permission middleware');
      console.log('   Solution: Either link them to appointments or remove the appointment requirement');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDoctorChatAccess();
