/**
 * Test if health-risk routes are accessible
 */

import axios from 'axios';

const API_URL = 'http://localhost:3001';

async function testRoutes() {
  console.log('🧪 Testing Health Risk Routes...\n');

  // Test user (you can change this to any valid user)
  const userId = 'cmmt5kmlf0001ztoyimqiyzrf';
  const token = 'test-token'; // We'll test without auth first

  try {
    // Test 1: Check if route exists (should get 401 or 403, not 404)
    console.log('1️⃣ Testing /api/health-risk/predictions/:userId');
    try {
      const response = await axios.get(`${API_URL}/api/health-risk/predictions/${userId}`);
      console.log('✅ Route exists! Status:', response.status);
    } catch (error: any) {
      if (error.response) {
        if (error.response.status === 404) {
          console.log('❌ Route NOT FOUND (404)');
        } else if (error.response.status === 401 || error.response.status === 403) {
          console.log('✅ Route exists! (Got auth error as expected)');
        } else {
          console.log(`⚠️ Route exists but returned: ${error.response.status}`);
        }
      } else {
        console.log('❌ Network error:', error.message);
      }
    }

    // Test 2: Check v1 route
    console.log('\n2️⃣ Testing /api/v1/health-risk/predictions/:userId');
    try {
      const response = await axios.get(`${API_URL}/api/v1/health-risk/predictions/${userId}`);
      console.log('✅ Route exists! Status:', response.status);
    } catch (error: any) {
      if (error.response) {
        if (error.response.status === 404) {
          console.log('❌ Route NOT FOUND (404)');
        } else if (error.response.status === 401 || error.response.status === 403) {
          console.log('✅ Route exists! (Got auth error as expected)');
        } else {
          console.log(`⚠️ Route exists but returned: ${error.response.status}`);
        }
      } else {
        console.log('❌ Network error:', error.message);
      }
    }

    // Test 3: Check assess route
    console.log('\n3️⃣ Testing /api/health-risk/assess');
    try {
      const response = await axios.post(`${API_URL}/api/health-risk/assess`, {});
      console.log('✅ Route exists! Status:', response.status);
    } catch (error: any) {
      if (error.response) {
        if (error.response.status === 404) {
          console.log('❌ Route NOT FOUND (404)');
        } else if (error.response.status === 401 || error.response.status === 403) {
          console.log('✅ Route exists! (Got auth error as expected)');
        } else {
          console.log(`⚠️ Route exists but returned: ${error.response.status}`);
        }
      } else {
        console.log('❌ Network error:', error.message);
      }
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Route testing complete!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error: any) {
    console.error('❌ Test failed:', error.message);
  }
}

testRoutes();
