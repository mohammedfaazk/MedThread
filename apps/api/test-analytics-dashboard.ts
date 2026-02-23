import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

async function testDashboard() {
  console.log('🧪 Testing Analytics Dashboard...\n');

  try {
    // Step 1: Login as admin
    console.log('1️⃣ Logging in as admin...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@medthread.com',
      password: 'Admin@123456',
    });

    const token = loginResponse.data.data.token;
    console.log('✅ Logged in successfully');
    console.log('Token:', token.substring(0, 30) + '...\n');

    // Step 2: Test dashboard endpoint
    console.log('2️⃣ Fetching analytics dashboard...');
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const dashboardResponse = await axios.get(`${API_URL}/analytics/dashboard`, {
      params: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log('✅ Dashboard data fetched successfully!\n');
    console.log('Response:', JSON.stringify(dashboardResponse.data, null, 2));

  } catch (error: any) {
    console.error('❌ Test failed!');
    console.error('Status:', error.response?.status);
    console.error('Error:', error.response?.data || error.message);
  }
}

testDashboard();
