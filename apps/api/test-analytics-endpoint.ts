import fetch from 'node-fetch';

async function testAnalyticsEndpoint() {
  try {
    // First, login as admin to get token
    console.log('🔐 Logging in as admin...');
    const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@medthread.com',
        password: 'Admin@123'
      })
    });

    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.statusText}`);
    }

    const loginData = await loginResponse.json();
    console.log('🔍 Login response:', JSON.stringify(loginData, null, 2));
    const token = loginData.data?.token || loginData.token;
    console.log('✅ Login successful');
    
    if (!token) {
      throw new Error('No token in login response');
    }
    
    // Decode token to see what's inside
    const tokenParts = token.split('.');
    const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
    console.log('🔍 Token payload:', payload);

    // Test active-users endpoint
    console.log('\n📊 Testing active-users endpoint...');
    const analyticsResponse = await fetch('http://localhost:3001/api/admin-analytics/active-users?period=today', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!analyticsResponse.ok) {
      throw new Error(`Analytics request failed: ${analyticsResponse.statusText}`);
    }

    const analyticsData = await analyticsResponse.json();
    console.log('✅ Analytics endpoint working!');
    console.log('📈 Data:', JSON.stringify(analyticsData, null, 2));

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testAnalyticsEndpoint();
