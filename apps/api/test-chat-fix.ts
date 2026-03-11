import { PrismaClient } from '@medthread/database';

const prisma = new PrismaClient();

async function testChatFix() {
  try {
    console.log('🔍 Testing chat system fixes...\n');

    // 1. Check approved appointments
    const approvedAppointments = await prisma.appointment.findMany({
      where: { status: 'APPROVED' },
      include: {
        patient: { select: { id: true, username: true } },
        doctor: { select: { id: true, username: true, doctorVerificationStatus: true } },
        conversation: true
      }
    });

    console.log(`📅 Found ${approvedAppointments.length} approved appointments:`);
    approvedAppointments.forEach(apt => {
      console.log(`  - ${apt.patient.username} ↔ ${apt.doctor.username} (${apt.doctor.doctorVerificationStatus})`);
      console.log(`    Conversation: ${apt.conversation ? 'EXISTS' : 'MISSING'}`);
    });

    // 2. Create conversations for approved appointments without them
    for (const appointment of approvedAppointments) {
      if (!appointment.conversation) {
        console.log(`\n🔧 Creating conversation for appointment ${appointment.id}...`);
        
        const conversation = await prisma.conversation.create({
          data: {
            appointmentId: appointment.id
          }
        });
        
        console.log(`✅ Created conversation ${conversation.id}`);
      }
    }

    // 3. Test getUserConversations with fixed schema
    if (approvedAppointments.length > 0) {
      const testUserId = approvedAppointments[0].patientId;
      console.log(`\n🧪 Testing getUserConversations for user ${testUserId}...`);
      
      const conversations = await prisma.conversation.findMany({
        where: {
          appointment: {
            OR: [
              { patientId: testUserId },
              { doctorId: testUserId }
            ]
          }
        },
        include: {
          appointment: {
            include: {
              patient: {
                select: {
                  id: true,
                  username: true,
                  avatar: true,
                  role: true
                }
              },
              doctor: {
                select: {
                  id: true,
                  username: true,
                  avatar: true,
                  role: true,
                  specialty: true
                }
              }
            }
          },
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            include: {
              sender: {
                select: {
                  id: true,
                  username: true,
                  avatar: true
                }
              }
            }
          }
        },
        orderBy: {
          updatedAt: 'desc'
        }
      });

      console.log(`✅ Found ${conversations.length} conversations for user`);
      conversations.forEach(conv => {
        console.log(`  - Conversation ${conv.id} with appointment ${conv.appointmentId}`);
        console.log(`    Participants: ${conv.appointment?.patient.username} ↔ ${conv.appointment?.doctor.username}`);
      });
    }

    console.log('\n✅ Chat system fix test completed successfully!');

  } catch (error) {
    console.error('❌ Error testing chat fix:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testChatFix();