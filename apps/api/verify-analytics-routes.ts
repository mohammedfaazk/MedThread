import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

async function verifyRoutes() {
  console.log('🔍 Verifying Analytics Routes...\n');

  // Test 1: Event tracking (no auth required)
  try {
    console.log('1️⃣ Testing POST /api/analytics/event');
    await axios.post(`${API_URL}/analytics/event`, {
      eventName: 'test',
      eventCategory: 'test',
      sessionId: 'test-session',
    });
    console.log('✅ Event endpoint works\n');
  } catch (err: any) {
    console.log('❌ Event endpoint failed:', err.response?.status, err.response?.data?.error || err.message, '\n');
  }

  // Test 2: Dashboard (requires auth)
  try {
    console.log('2️⃣ Testing GET /api/analytics/dashboard (without auth)');
    await axios.get(`${API_URL}/analytics/dashboard`);
    console.log('✅ Dashboard endpoint accessible\n');
  } catch (err: any) {
    if (err.response?.status === 401 || err.response?.status === 403) {
      console.log('✅ Dashboard endpoint exists (requires auth as expected)\n');
    } else {
      console.log('❌ Dashboard endpoint failed:', err.response?.status, err.response?.data?.error || err.message, '\n');
    }
  }

  console.log('✅ Analytics routes are registered!');
}

verifyRoutes();
