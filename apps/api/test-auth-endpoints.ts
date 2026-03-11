import axios from 'axios';

const API_URL = 'http://localhost:3001';

async function testAuthEndpoints() {
  try {
    console.log('🔐 Testing Authentication Endpoints\n');
    console.log('='.repeat(50));

    // Step 1: Login as doctor
    console.log('1. 🩺 Doctor login...');
    const doctorLogin = await axios.post(`${API_URL}/api/auth/login`, {
      email: 'rifa@gmail.com',
      password: 'Doctor@123456'
    });
    const { token: doctorToken, user: doctorUser } = doctorLogin.data.data || doctorLogin.data;
    console.log(`   ✅ Doctor logged in: ${doctorUser.username}`);

    // Step 2: Test verify-password endpoint
    console.log('\n2. 🔑 Testing password verification...');
    try {
      const verifyResponse = await axios.post(
        `${API_URL}/api/auth/verify-password`,
        { password: 'Doctor@123456' },
        {
          headers: {
            'Authorization': `Bearer ${doctorToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log(`   ✅ Password verification successful: ${verifyResponse.data.message}`);
    } catch (error: any) {
      console.log(`   ❌ Password verification failed: ${error.response?.data?.error || error.message}`);
    }

    // Step 3: Test with wrong password
    console.log('\n3. 🚫 Testing with wrong password...');
    try {
      const wrongPasswordResponse = await axios.post(
        `${API_URL}/api/auth/verify-password`,
        { password: 'WrongPassword123' },
        {
          headers: {
            'Authorization': `Bearer ${doctorToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log(`   ⚠️ Wrong password accepted (this should not happen)`);
    } catch (error: any) {
      if (error.response?.status === 401) {
        console.log(`   ✅ Wrong password correctly rejected: ${error.response.data.error}`);
      } else {
        console.log(`   ❌ Unexpected error: ${error.response?.data?.error || error.message}`);
      }
    }

    // Step 4: Test analytics endpoint
    console.log('\n4. 📊 Testing analytics endpoint...');
    try {
      const analyticsResponse = await axios.post(
        `${API_URL}/api/analytics/pageview`,
        {
          page: '/test-page',
          title: 'Test Page',
          sessionId: 'test-session-123'
        },
        {
          headers: {
            'Authorization': `Bearer ${doctorToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log(`   ✅ Analytics tracking successful`);
    } catch (error: any) {
      console.log(`   ❌ Analytics tracking failed: ${error.response?.data?.error || error.message}`);
    }

    console.log('\n' + '='.repeat(50));
    console.log('🎯 AUTHENTICATION ENDPOINTS TEST COMPLETED');
    console.log('='.repeat(50));

  } catch (error: any) {
    console.log('\n' + '='.repeat(50));
    console.log('❌ ERROR occurred during testing:');
    
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Message: ${error.response.data?.message || error.response.data?.error || 'Unknown error'}`);
    } else {
      console.log(`   Error: ${error.message}`);
    }
  }
}

testAuthEndpoints();