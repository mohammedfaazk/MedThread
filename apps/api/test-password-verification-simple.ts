import axios from 'axios';
import jwt from 'jsonwebtoken';

const API_URL = 'http://localhost:3001';
const JWT_SECRET = process.env.JWT_SECRET || 'change-this-to-a-secure-random-string-in-production';

async function testPasswordVerification() {
  try {
    console.log('🔍 Testing password verification endpoint...\n');

    // Test with a known doctor user (fatima)
    const doctorId = 'cmmlhkn0900008nyjyf6x720l'; // fatima's ID from previous tests
    const doctorRole = 'DOCTOR';
    const correctPassword = 'Doctor@123456'; // Assuming this is the password

    // Generate JWT token
    const token = jwt.sign({ userId: doctorId, role: doctorRole }, JWT_SECRET);
    console.log(`🔑 Generated token for doctor: ${doctorId}`);

    // Test 1: Correct password
    console.log('\n🧪 Test 1: Correct password...');
    try {
      const response = await axios.post(`${API_URL}/api/auth/verify-password`, {
        password: correctPassword
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ Correct password test passed');
      console.log('Response:', response.data);
    } catch (error: any) {
      console.log('❌ Correct password test failed');
      console.log('Status:', error.response?.status);
      console.log('Data:', error.response?.data);
    }

    // Test 2: Wrong password
    console.log('\n🧪 Test 2: Wrong password...');
    try {
      const response = await axios.post(`${API_URL}/api/auth/verify-password`, {
        password: 'WrongPassword123'
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('❌ Wrong password test should have failed but passed');
      console.log('Response:', response.data);
    } catch (error: any) {
      console.log('✅ Wrong password test correctly failed');
      console.log('Status:', error.response?.status);
      console.log('Data:', error.response?.data);
    }

    // Test 3: No password
    console.log('\n🧪 Test 3: No password...');
    try {
      const response = await axios.post(`${API_URL}/api/auth/verify-password`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('❌ No password test should have failed but passed');
      console.log('Response:', response.data);
    } catch (error: any) {
      console.log('✅ No password test correctly failed');
      console.log('Status:', error.response?.status);
      console.log('Data:', error.response?.data);
    }

    // Test 4: No token
    console.log('\n🧪 Test 4: No token...');
    try {
      const response = await axios.post(`${API_URL}/api/auth/verify-password`, {
        password: correctPassword
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('❌ No token test should have failed but passed');
      console.log('Response:', response.data);
    } catch (error: any) {
      console.log('✅ No token test correctly failed');
      console.log('Status:', error.response?.status);
      console.log('Data:', error.response?.data);
    }

  } catch (error) {
    console.error('❌ Error testing password verification:', error);
  }
}

// Check if server is running
async function checkServer() {
  try {
    await axios.get(`${API_URL}/health`);
    console.log('✅ Server is running\n');
    return true;
  } catch (error) {
    console.log('❌ Server is not running. Please start the API server first.\n');
    return false;
  }
}

async function main() {
  const serverRunning = await checkServer();
  if (serverRunning) {
    await testPasswordVerification();
  }
}

main();