import { PrismaClient } from '@medthread/database';
import jwt from 'jsonwebtoken';
import axios from 'axios';

const prisma = new PrismaClient();
const API_URL = 'http://localhost:3001';
const JWT_SECRET = process.env.JWT_SECRET || 'change-this-to-a-secure-random-string-in-production';

async function testChatEndpoints() {
  try {
    console.log('🔍 Testing chat API endpoints...\n');

    // Get test users and conversation
    const conversation = await prisma.conversation.findFirst({
      include: {
        appointment: {
          include: {
            patient: { select: { id: true, username: true } },
            doctor: { select: { id: true, username: true } }
          }
        }
      }
    });

    if (!conversation || !conversation.appointment) {
      console.log('❌ No conversation with appointment found');
      return;
    }

    const patientId = conversation.appointment.patientId;
    const doctorId = conversation.appointment.doctorId;
    const conversationId = conversation.id;

    console.log(`👥 Testing with conversation ${conversationId}`);
    console.log(`   Patient: ${conversation.appointment.patient.username} (${patientId})`);
    console.log(`   Doctor: ${conversation.appointment.doctor.username} (${doctorId})`);

    // Get user roles
    const patient = await prisma.user.findUnique({
      where: { id: patientId },
      select: { role: true }
    });
    const doctor = await prisma.user.findUnique({
      where: { id: doctorId },
      select: { role: true }
    });

    // Generate JWT tokens
    const patientToken = jwt.sign({ userId: patientId, role: patient?.role }, JWT_SECRET);
    const doctorToken = jwt.sign({ userId: doctorId, role: doctor?.role }, JWT_SECRET);

    console.log(`\n🔑 Generated tokens for testing`);

    // Test 1: Get conversations for patient
    console.log('\n🧪 Test 1: GET /api/v2/chat/conversations (patient)...');
    try {
      const response = await axios.get(`${API_URL}/api/v2/chat/conversations`, {
        headers: { Authorization: `Bearer ${patientToken}` }
      });
      console.log(`✅ Patient conversations: ${response.data.data.length} found`);
    } catch (error: any) {
      console.log(`❌ Error: ${error.response?.status} - ${error.response?.data?.error || error.message}`);
    }

    // Test 2: Get conversations for doctor
    console.log('\n🧪 Test 2: GET /api/v2/chat/conversations (doctor)...');
    try {
      const response = await axios.get(`${API_URL}/api/v2/chat/conversations`, {
        headers: { Authorization: `Bearer ${doctorToken}` }
      });
      console.log(`✅ Doctor conversations: ${response.data.data.length} found`);
    } catch (error: any) {
      console.log(`❌ Error: ${error.response?.status} - ${error.response?.data?.error || error.message}`);
    }

    // Test 3: Check conversation access
    console.log('\n🧪 Test 3: GET /api/v2/chat/conversations/:id/access (patient)...');
    try {
      const response = await axios.get(`${API_URL}/api/v2/chat/conversations/${conversationId}/access`, {
        headers: { Authorization: `Bearer ${patientToken}` }
      });
      console.log(`✅ Patient access check: ${JSON.stringify(response.data.data)}`);
    } catch (error: any) {
      console.log(`❌ Error: ${error.response?.status} - ${error.response?.data?.error || error.message}`);
    }

    // Test 4: Check conversation access for doctor
    console.log('\n🧪 Test 4: GET /api/v2/chat/conversations/:id/access (doctor)...');
    try {
      const response = await axios.get(`${API_URL}/api/v2/chat/conversations/${conversationId}/access`, {
        headers: { Authorization: `Bearer ${doctorToken}` }
      });
      console.log(`✅ Doctor access check: ${JSON.stringify(response.data.data)}`);
    } catch (error: any) {
      console.log(`❌ Error: ${error.response?.status} - ${error.response?.data?.error || error.message}`);
    }

    // Test 5: Send message from patient
    console.log('\n🧪 Test 5: POST /api/v2/chat/messages (patient)...');
    try {
      const response = await axios.post(`${API_URL}/api/v2/chat/messages`, {
        conversationId,
        content: 'Test message from patient via API',
        type: 'TEXT'
      }, {
        headers: { 
          Authorization: `Bearer ${patientToken}`,
          'Content-Type': 'application/json'
        }
      });
      console.log(`✅ Message sent: ${response.data.data.id}`);
    } catch (error: any) {
      console.log(`❌ Error: ${error.response?.status} - ${error.response?.data?.error || error.message}`);
      if (error.response?.data?.details) {
        console.log(`   Details: ${JSON.stringify(error.response.data.details)}`);
      }
    }

    // Test 6: Get messages
    console.log('\n🧪 Test 6: GET /api/v2/chat/conversations/:id/messages (doctor)...');
    try {
      const response = await axios.get(`${API_URL}/api/v2/chat/conversations/${conversationId}/messages`, {
        headers: { Authorization: `Bearer ${doctorToken}` }
      });
      console.log(`✅ Messages retrieved: ${response.data.data.length} found`);
      response.data.data.slice(0, 3).forEach((msg: any, i: number) => {
        console.log(`   ${i + 1}. ${msg.sender.username}: ${msg.content}`);
      });
    } catch (error: any) {
      console.log(`❌ Error: ${error.response?.status} - ${error.response?.data?.error || error.message}`);
    }

    console.log('\n✅ Chat endpoint tests completed!');

  } catch (error) {
    console.error('❌ Error testing chat endpoints:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Check if server is running
async function checkServer() {
  try {
    await axios.get(`${API_URL}/health`);
    console.log('✅ Server is running, starting tests...\n');
    return true;
  } catch (error) {
    console.log('❌ Server is not running. Please start the API server first.');
    console.log('   Run: npm run dev in MedThread/apps/api\n');
    return false;
  }
}

async function main() {
  const serverRunning = await checkServer();
  if (serverRunning) {
    await testChatEndpoints();
  }
}

main();