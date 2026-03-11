import { PrismaClient } from '@medthread/database';
import jwt from 'jsonwebtoken';
import axios from 'axios';

const prisma = new PrismaClient();
const API_URL = 'http://localhost:3001';
const JWT_SECRET = process.env.JWT_SECRET || 'change-this-to-a-secure-random-string-in-production';

async function testMessageSending() {
  try {
    console.log('🔍 Testing message sending to identify the error...\n');

    // Get test users and conversation
    const conversation = await prisma.conversation.findFirst({
      include: {
        appointment: {
          include: {
            patient: { select: { id: true, username: true, role: true } },
            doctor: { select: { id: true, username: true, role: true } }
          }
        }
      }
    });

    if (!conversation || !conversation.appointment) {
      console.log('❌ No conversation found');
      return;
    }

    const patientId = conversation.appointment.patientId;
    const doctorId = conversation.appointment.doctorId;
    const conversationId = conversation.id;

    console.log(`👥 Testing with conversation ${conversationId}`);
    console.log(`   Patient: ${conversation.appointment.patient.username} (${patientId})`);
    console.log(`   Doctor: ${conversation.appointment.doctor.username} (${doctorId})`);

    // Generate JWT tokens
    const patientToken = jwt.sign({ userId: patientId, role: conversation.appointment.patient.role }, JWT_SECRET);
    const doctorToken = jwt.sign({ userId: doctorId, role: conversation.appointment.doctor.role }, JWT_SECRET);

    // Test 1: Send a normal message
    console.log('\n🧪 Test 1: Sending normal message...');
    try {
      const response = await axios.post(`${API_URL}/api/v2/chat/messages`, {
        conversationId,
        content: 'Test message to check for errors',
        type: 'TEXT'
      }, {
        headers: { 
          Authorization: `Bearer ${patientToken}`,
          'Content-Type': 'application/json'
        }
      });
      console.log(`✅ Message sent successfully: ${response.data.data.id}`);
    } catch (error: any) {
      console.log(`❌ Error sending message:`);
      console.log(`   Status: ${error.response?.status}`);
      console.log(`   Headers: ${JSON.stringify(error.response?.headers)}`);
      console.log(`   Data: ${JSON.stringify(error.response?.data)}`);
      
      // Try to get raw response text
      if (error.response?.data && typeof error.response.data === 'string') {
        console.log(`   Raw response: ${error.response.data.substring(0, 200)}...`);
      }
    }

    // Test 2: Send multiple messages quickly to trigger rate limit
    console.log('\n🧪 Test 2: Testing rate limit (sending 5 messages quickly)...');
    for (let i = 1; i <= 5; i++) {
      try {
        const response = await axios.post(`${API_URL}/api/v2/chat/messages`, {
          conversationId,
          content: `Rate limit test message ${i}`,
          type: 'TEXT'
        }, {
          headers: { 
            Authorization: `Bearer ${patientToken}`,
            'Content-Type': 'application/json'
          }
        });
        console.log(`✅ Message ${i} sent: ${response.data.data.id}`);
      } catch (error: any) {
        console.log(`❌ Message ${i} failed:`);
        console.log(`   Status: ${error.response?.status}`);
        console.log(`   Content-Type: ${error.response?.headers?.['content-type']}`);
        
        if (error.response?.data) {
          if (typeof error.response.data === 'string') {
            console.log(`   Raw response: ${error.response.data.substring(0, 100)}...`);
          } else {
            console.log(`   JSON response: ${JSON.stringify(error.response.data)}`);
          }
        }
        break; // Stop on first error
      }
      
      // Small delay between messages
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Test 3: Check current message count
    console.log('\n🧪 Test 3: Checking current message count...');
    const messageCount = await prisma.message.count({
      where: { conversationId }
    });
    console.log(`📊 Total messages in conversation: ${messageCount}`);

    // Test 4: Check recent messages for rate limiting
    const recentMessages = await prisma.message.count({
      where: {
        conversationId,
        senderId: patientId,
        createdAt: {
          gte: new Date(Date.now() - 60000) // Last minute
        }
      }
    });
    console.log(`📊 Messages from patient in last minute: ${recentMessages}`);

  } catch (error) {
    console.error('❌ Error testing message sending:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testMessageSending();