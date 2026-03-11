import { PrismaClient } from '@medthread/database';
import jwt from 'jsonwebtoken';
import axios from 'axios';

const prisma = new PrismaClient();
const API_URL = 'http://localhost:3001';
const JWT_SECRET = process.env.JWT_SECRET || 'change-this-to-a-secure-random-string-in-production';

async function debugConversationFlow() {
  try {
    console.log('🔍 Debugging complete conversation flow...\n');

    // Step 1: Check all conversations in database
    console.log('📋 Step 1: Checking all conversations in database...');
    try {
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

      console.log(`Found ${conversations.length} conversations in database:`);
      conversations.forEach((conv, i) => {
        console.log(`  ${i + 1}. ID: ${conv.id}`);
        console.log(`     Appointment: ${conv.appointmentId}`);
        if (conv.appointment) {
          console.log(`     Patient: ${conv.appointment.patient.username} (${conv.appointment.patientId})`);
          console.log(`     Doctor: ${conv.appointment.doctor.username} (${conv.appointment.doctorId})`);
        }
        console.log('');
      });

      if (conversations.length === 0) {
        console.log('❌ No conversations found in database!');
        return;
      }

      // Step 2: Test API endpoints with real conversation ID
      const testConversation = conversations[0];
      const doctorId = testConversation.appointment?.doctorId;
      const patientId = testConversation.appointment?.patientId;

      if (!doctorId || !patientId) {
        console.log('❌ Conversation missing doctor or patient ID');
        return;
      }

      console.log(`🧪 Step 2: Testing API with conversation ${testConversation.id}...`);

      // Generate tokens
      const doctorToken = jwt.sign({ userId: doctorId, role: 'DOCTOR' }, JWT_SECRET);
      const patientToken = jwt.sign({ userId: patientId, role: 'PATIENT' }, JWT_SECRET);

      // Test 2a: Get conversations for doctor
      console.log('\n🔍 2a. Testing GET /api/v2/chat/conversations (doctor)...');
      try {
        const response = await axios.get(`${API_URL}/api/v2/chat/conversations`, {
          headers: { Authorization: `Bearer ${doctorToken}` }
        });
        console.log(`✅ Doctor sees ${response.data.data.length} conversations`);
        response.data.data.forEach((conv: any, i: number) => {
          console.log(`   ${i + 1}. ${conv.id} - ${conv.appointment?.patient?.username} ↔ ${conv.appointment?.doctor?.username}`);
        });
      } catch (error: any) {
        console.log(`❌ Doctor conversations failed: ${error.response?.status} - ${error.response?.data?.error}`);
      }

      // Test 2b: Get conversations for patient
      console.log('\n🔍 2b. Testing GET /api/v2/chat/conversations (patient)...');
      try {
        const response = await axios.get(`${API_URL}/api/v2/chat/conversations`, {
          headers: { Authorization: `Bearer ${patientToken}` }
        });
        console.log(`✅ Patient sees ${response.data.data.length} conversations`);
        response.data.data.forEach((conv: any, i: number) => {
          console.log(`   ${i + 1}. ${conv.id} - ${conv.appointment?.patient?.username} ↔ ${conv.appointment?.doctor?.username}`);
        });
      } catch (error: any) {
        console.log(`❌ Patient conversations failed: ${error.response?.status} - ${error.response?.data?.error}`);
      }

      // Test 2c: Check conversation access
      console.log(`\n🔍 2c. Testing conversation access for ${testConversation.id}...`);
      try {
        const response = await axios.get(`${API_URL}/api/v2/chat/conversations/${testConversation.id}/access`, {
          headers: { Authorization: `Bearer ${doctorToken}` }
        });
        console.log(`✅ Doctor access: ${JSON.stringify(response.data.data)}`);
      } catch (error: any) {
        console.log(`❌ Doctor access failed: ${error.response?.status} - ${error.response?.data?.error}`);
      }

      // Test 2d: Try to send a message
      console.log(`\n🔍 2d. Testing message sending to ${testConversation.id}...`);
      try {
        const response = await axios.post(`${API_URL}/api/v2/chat/messages`, {
          conversationId: testConversation.id,
          content: 'Debug test message',
          type: 'TEXT'
        }, {
          headers: { 
            Authorization: `Bearer ${doctorToken}`,
            'Content-Type': 'application/json'
          }
        });
        console.log(`✅ Message sent successfully: ${response.data.data.id}`);
      } catch (error: any) {
        console.log(`❌ Message sending failed: ${error.response?.status}`);
        console.log(`   Error: ${error.response?.data?.error || error.message}`);
        if (error.response?.data?.details) {
          console.log(`   Details: ${JSON.stringify(error.response.data.details)}`);
        }
      }

    } catch (dbError) {
      console.log('❌ Database connection failed:', dbError);
      console.log('\n🔍 Checking if server is running...');
      
      // Test server without database
      try {
        const response = await axios.get(`${API_URL}/health`);
        console.log('✅ Server is running');
        
        // Test with a fake conversation ID to see the error
        console.log('\n🧪 Testing with fake conversation ID...');
        const fakeToken = jwt.sign({ userId: 'fake-user', role: 'DOCTOR' }, JWT_SECRET);
        
        try {
          const response = await axios.post(`${API_URL}/api/v2/chat/messages`, {
            conversationId: 'fake-conversation-id',
            content: 'Test message',
            type: 'TEXT'
          }, {
            headers: { 
              Authorization: `Bearer ${fakeToken}`,
              'Content-Type': 'application/json'
            }
          });
        } catch (error: any) {
          console.log(`Expected error: ${error.response?.status} - ${error.response?.data?.error}`);
        }
        
      } catch (serverError) {
        console.log('❌ Server is not running');
      }
    }

  } catch (error) {
    console.error('❌ Error in debug flow:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugConversationFlow();