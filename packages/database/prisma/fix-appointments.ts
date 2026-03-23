import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixAppointments() {
  console.log('🔧 Fixing appointment statuses for chat access...');
  
  try {
    // Get all seeded appointments (appointments involving seeded users)
    const seededUsers = await prisma.user.findMany({
      where: {
        bio: {
          contains: '🌱'
        }
      },
      select: {
        id: true,
        username: true,
        role: true
      }
    });

    const seededUserIds = seededUsers.map(u => u.id);
    
    // Find appointments involving seeded users
    const appointments = await prisma.appointment.findMany({
      where: {
        OR: [
          { doctorId: { in: seededUserIds } },
          { patientId: { in: seededUserIds } }
        ]
      },
      include: {
        doctor: {
          select: { username: true, role: true }
        },
        patient: {
          select: { username: true, role: true }
        },
        conversation: true
      }
    });

    console.log(`Found ${appointments.length} appointments involving seeded users`);

    // Update all appointments to APPROVED status
    const updateResult = await prisma.appointment.updateMany({
      where: {
        OR: [
          { doctorId: { in: seededUserIds } },
          { patientId: { in: seededUserIds } }
        ]
      },
      data: {
        status: 'APPROVED'
      }
    });

    console.log(`✅ Updated ${updateResult.count} appointments to APPROVED status`);

    // Create conversations for appointments that don't have them
    let conversationsCreated = 0;
    for (const appointment of appointments) {
      if (!appointment.conversation) {
        const conversation = await prisma.conversation.create({
          data: {
            appointmentId: appointment.id,
            participants: {
              connect: [
                { id: appointment.doctorId },
                { id: appointment.patientId }
              ]
            }
          }
        });
        
        console.log(`✅ Created conversation ${conversation.id} for appointment ${appointment.id}`);
        conversationsCreated++;
      }
    }

    console.log(`✅ Created ${conversationsCreated} new conversations`);

    // Create some sample messages in conversations for testing
    const conversationsWithAppointments = await prisma.conversation.findMany({
      where: {
        appointment: {
          OR: [
            { doctorId: { in: seededUserIds } },
            { patientId: { in: seededUserIds } }
          ]
        }
      },
      include: {
        appointment: {
          include: {
            doctor: { select: { id: true, username: true } },
            patient: { select: { id: true, username: true } }
          }
        }
      }
    });

    console.log(`Found ${conversationsWithAppointments.length} conversations to populate with messages`);

    // Add sample messages to conversations
    for (const conversation of conversationsWithAppointments.slice(0, 5)) { // Limit to first 5 for demo
      const appointment = conversation.appointment!;
      
      // Check if conversation already has messages
      const existingMessages = await prisma.message.count({
        where: { conversationId: conversation.id }
      });

      if (existingMessages === 0) {
        // Create sample conversation
        const messages = [
          {
            senderId: appointment.patient.id,
            receiverId: appointment.doctor.id,
            content: `Hello Dr. ${appointment.doctor.username}, thank you for accepting my appointment. I wanted to discuss my symptoms with you.`,
            createdAt: new Date(Date.now() - 60 * 60 * 1000) // 1 hour ago
          },
          {
            senderId: appointment.doctor.id,
            receiverId: appointment.patient.id,
            content: `Hello ${appointment.patient.username}! I'm glad to help. Please describe your symptoms in detail so I can better understand your condition.`,
            createdAt: new Date(Date.now() - 50 * 60 * 1000) // 50 minutes ago
          },
          {
            senderId: appointment.patient.id,
            receiverId: appointment.doctor.id,
            content: `I've been experiencing some discomfort and wanted to get your professional opinion on the best course of treatment.`,
            createdAt: new Date(Date.now() - 40 * 60 * 1000) // 40 minutes ago
          },
          {
            senderId: appointment.doctor.id,
            receiverId: appointment.patient.id,
            content: `Based on what you've described, I recommend we start with a conservative approach. I'll provide you with a detailed treatment plan.`,
            createdAt: new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
          },
          {
            senderId: appointment.patient.id,
            receiverId: appointment.doctor.id,
            content: `That sounds great! Thank you for your time and expertise. I really appreciate your help.`,
            createdAt: new Date(Date.now() - 20 * 60 * 1000) // 20 minutes ago
          }
        ];

        for (const messageData of messages) {
          await prisma.message.create({
            data: {
              ...messageData,
              conversationId: conversation.id,
              type: 'TEXT'
            }
          });
        }

        console.log(`✅ Added ${messages.length} sample messages to conversation ${conversation.id}`);
      }
    }

    console.log('');
    console.log('🎉 Appointment and chat setup completed!');
    console.log('');
    console.log('📋 Summary:');
    console.log(`   • ${updateResult.count} appointments set to APPROVED status`);
    console.log(`   • ${conversationsCreated} new conversations created`);
    console.log(`   • Sample messages added to conversations`);
    console.log('');
    console.log('✅ Doctors can now access chats for approved appointments!');
    console.log('');
    console.log('🔍 Test chat access with these accounts:');
    
    // Show some example conversations
    const sampleConversations = await prisma.conversation.findMany({
      where: {
        appointment: {
          OR: [
            { doctorId: { in: seededUserIds } },
            { patientId: { in: seededUserIds } }
          ]
        }
      },
      include: {
        appointment: {
          include: {
            doctor: { select: { username: true, email: true } },
            patient: { select: { username: true, email: true } }
          }
        }
      },
      take: 3
    });

    sampleConversations.forEach((conv, index) => {
      console.log(`${index + 1}. Conversation ID: ${conv.id}`);
      console.log(`   Doctor: ${conv.appointment!.doctor.email} (${conv.appointment!.doctor.username})`);
      console.log(`   Patient: ${conv.appointment!.patient.email} (${conv.appointment!.patient.username})`);
      console.log(`   Chat URL: http://localhost:3000/chat?conversation=${conv.id}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error fixing appointments:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

fixAppointments();