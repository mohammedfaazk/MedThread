import axios from 'axios';

const API_URL = 'http://localhost:3001';

async function testPasswordVerification() {
  try {
    console.log('🔑 Testing Password Verification Issue\n');

    // Step 1: Login to get a valid token
    console.log('1. Logging in to get token...');
    const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
      email: 'rifa@gmail.com',
      password: 'Doctor@123456'
    });

    const loginData = loginResponse.data.data || loginResponse.data;
    const token = loginData.token;
    const user = loginData.user;

    console.log(`✅ Login successful: ${user.username} (${user.role})`);
    console.log(`🎫 Token: ${token.substring(0, 20)}...`);

    // Step 2: Test password verification with correct password
    console.log('\n2. Testing password verification with CORRECT password...');
    
    const verifyData = {
      password: 'Doctor@123456'
    };

    console.log('📤 Sending request to /api/auth/verify-password');
    console.log('📋 Request data:', verifyData);
    console.log('🔐 Authorization header:', `Bearer ${token.substring(0, 20)}...`);

    try {
      const verifyResponse = await axios.post(
        `${API_URL}/api/auth/verify-password`,
        verifyData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('✅ SUCCESS: Password verification passed');
      console.log('📥 Response:', verifyResponse.data);

    } catch (verifyError: any) {
      console.log('❌ FAILED: Password verification failed');
      console.log('📥 Error status:', verifyError.response?.status);
      console.log('📥 Error data:', verifyError.response?.data);
      console.log('📥 Full error:', verifyError.message);

      // Let's check if the endpoint exists
      if (verifyError.response?.status === 404) {
        console.log('\n🔍 Endpoint not found. Checking available auth routes...');
        
        try {
          // Try to hit a known endpoint to see if the server is responding
          const testResponse = await axios.get(`${API_URL}/api/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          console.log('✅ /api/auth/me endpoint works:', testResponse.status);
        } catch (meError: any) {
          console.log('❌ /api/auth/me endpoint also fails:', meError.response?.status);
        }
      }
    }

    // Step 3: Test with wrong password to ensure validation works
    console.log('\n3. Testing password verification with WRONG password...');
    
    try {
      const wrongPasswordResponse = await axios.post(
        `${API_URL}/api/auth/verify-password`,
        { password: 'WrongPassword123' },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('⚠️ WARNING: Wrong password was accepted (this should not happen)');
      console.log('📥 Response:', wrongPasswordResponse.data);

    } catch (wrongError: any) {
      if (wrongError.response?.status === 401) {
        console.log('✅ CORRECT: Wrong password was rejected');
        console.log('📥 Error message:', wrongError.response?.data?.error);
      } else {
        console.log('❌ Unexpected error with wrong password:', wrongError.response?.status);
        console.log('📥 Error data:', wrongError.response?.data);
      }
    }

  } catch (error: any) {
    console.log('\n❌ CRITICAL ERROR:');
    console.log('Status:', error.response?.status);
    console.log('Message:', error.response?.data?.error || error.message);
    console.log('Full error:', error.response?.data);
  }
}

testPasswordVerification();