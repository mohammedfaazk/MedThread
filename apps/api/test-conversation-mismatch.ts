import { PrismaClient } from '@medthread/database';
import jwt from 'jsonwebtoken';
import axios from 'axios';

const prisma = new PrismaClient();
const API_URL = 'http://localhost:3001';
const JWT_SECRET = process.env.JWT_SECRET || 'change-this-to-a-secure-random-string-in-production';

async function testConversationMismatch() {
  try {
    console.log('🔍 Testing conversation ID mismatch issue...\n');

    // Get the doctor user
    const doctor = await prisma.user.findFirst({
      where: { role: 'DOCTOR' }
    });

    if (!doctor) {
      console.log('❌ No doctor found');
      return;
    }

    console.log(`👨‍⚕️ Testing with doctor: ${doctor.username} (${doctor.id})`);

    // Generate JWT token for doctor
    const doctorToken = jwt.sign({ userId: doctor.id, role: doctor.role }, JWT_SECRET);

    // Test 1: Get conversations using v2 API (what ChatWindow uses)
    console.log('\n🧪 Test 1: GET /api/v2/chat/conversations (v2 API - database)...');
    try {
      const response = await axios.get(`${API_URL}/api/v2/chat/conversations`, {
        headers: { Authorization: `Bearer ${doctorToken}` }
      });
      console.log(`✅ V2 API conversations: ${response.data.data.length} found`);
      response.data.data.forEach((conv: any, i: number) => {
        console.log(`   ${i + 1}. ID: ${conv.id}`);
        console.log(`      Patient: ${conv.appointment?.patient?.username}`);
        console.log(`      Doctor: ${conv.appointment?.doctor?.username}`);
      });
    } catch (error: any) {
      console.log(`❌ V2 API Error: ${error.response?.status} - ${error.response?.data?.error || error.message}`);
    }

    // Test 2: Get conversations using old API (what doctor dashboard was using)
    console.log('\n🧪 Test 2: GET /api/chat/conversations (old API - mock store)...');
    try {
      const response = await axios.get(`${API_URL}/api/chat/conversations?userId=${doctor.id}`);
      console.log(`✅ Old API conversations: ${response.data.length} found`);
      response.data.forEach((conv: any, i: number) => {
        console.log(`   ${i + 1}. ID: ${conv.id}`);
        const patient = conv.participants?.find((p: any) => p.id !== doctor.id);
        console.log(`      Patient: ${patient?.username}`);
      });
    } catch (error: any) {
      console.log(`❌ Old API Error: ${error.response?.status} - ${error.response?.data?.error || error.message}`);
    }

    // Test 3: Try to access a mock store conversation ID via v2 API
    const mockConvId = 'conv-cmmlikqe20002ugvhy2b2e0ep';
    console.log(`\n🧪 Test 3: Try to access mock conversation ${mockConvId} via v2 API...`);
    try {
      const response = await axios.get(`${API_URL}/api/v2/chat/conversations/${mockConvId}/access`, {
        headers: { Authorization: `Bearer ${doctorToken}` }
      });
      console.log(`✅ Mock conversation accessible: ${JSON.stringify(response.data.data)}`);
    } catch (error: any) {
      console.log(`❌ Mock conversation not accessible: ${error.response?.status} - ${error.response?.data?.error || error.message}`);
    }

    console.log('\n📋 Summary:');
    console.log('- V2 API uses database with real conversation IDs');
    console.log('- Old API uses mock store with conv- prefixed IDs');
    console.log('- Frontend must use consistent API endpoints');
    console.log('- Doctor dashboard should use v2 API for consistency');

  } catch (error) {
    console.error('❌ Error testing conversation mismatch:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConversationMismatch();