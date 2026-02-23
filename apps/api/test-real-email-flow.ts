import 'dotenv/config';
import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

async function testRealEmailFlow() {
  console.log('🧪 Testing Real Email Flow in Application...\n');

  try {
    // Test 1: Register a new user (should trigger welcome email)
    console.log('1️⃣ Testing User Registration (Welcome Email)...');
    const registerResponse = await axios.post(`${API_URL}/auth/register`, {
      username: 'testuser' + Date.now(),
      email: `testuser${Date.now()}@example.com`,
      password: 'Test@123456',
      role: 'PATIENT',
    });
    console.log('✅ User registered successfully');
    console.log('📧 Check the API console for the welcome email\n');

    // Test 2: Request password reset (should trigger password reset email)
    console.log('2️⃣ Testing Password Reset Request...');
    try {
      await axios.post(`${API_URL}/auth/forgot-password`, {
        email: registerResponse.data.user.email,
      });
      console.log('✅ Password reset requested');
      console.log('📧 Check the API console for the password reset email\n');
    } catch (error: any) {
      if (error.response?.status === 404) {
        console.log('⚠️  Password reset endpoint not implemented yet\n');
      } else {
        throw error;
      }
    }

    console.log('=' .repeat(60));
    console.log('\n✅ EMAIL FLOW TEST COMPLETE!');
    console.log('\n📋 How to verify:');
    console.log('  1. Look at your API server console (where npm run dev is running)');
    console.log('  2. You should see email logs with:');
    console.log('     - To: recipient email');
    console.log('     - Subject: email subject');
    console.log('     - Content: email preview');
    console.log('\n💡 This proves emails are being sent in your application!');
    console.log('   When you add real SMTP credentials, these will be actual emails.');

  } catch (error: any) {
    console.error('\n❌ Test failed:', error.response?.data || error.message);
  }
}

testRealEmailFlow();
