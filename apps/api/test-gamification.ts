/**
 * Test Gamification System
 * Verifies gamification routes and functionality
 */

import axios from 'axios';

const API_URL = process.env.API_URL || 'http://localhost:3001';

async function testGamificationSystem() {
  console.log('🎮 Testing Gamification System...\n');

  try {
    // 1. Test health endpoint
    console.log('1. Testing API health...');
    const health = await axios.get(`${API_URL}/health`);
    console.log('✅ API is healthy:', health.data);

    // 2. Test get all badges (public endpoint)
    console.log('\n2. Testing GET /api/gamification/badges/all...');
    const badgesResponse = await axios.get(`${API_URL}/api/gamification/badges/all`);
    console.log('✅ Badges retrieved:', badgesResponse.data.data?.length || 0, 'badges');
    if (badgesResponse.data.data?.length > 0) {
      console.log('   Sample badge:', badgesResponse.data.data[0].name);
    }

    // 3. Test get leaderboard (public endpoint)
    console.log('\n3. Testing GET /api/gamification/leaderboard...');
    const leaderboardResponse = await axios.get(`${API_URL}/api/gamification/leaderboard?period=weekly_top_doctors&limit=10`);
    console.log('✅ Leaderboard retrieved:', leaderboardResponse.data.data?.length || 0, 'entries');

    console.log('\n✅ All public gamification endpoints working!');
    console.log('\nNote: Protected endpoints require authentication:');
    console.log('  - GET /api/gamification/badges (requires auth)');
    console.log('  - GET /api/gamification/achievements (requires auth)');
    console.log('  - GET /api/gamification/rank (requires auth)');
    console.log('  - POST /api/gamification/check-badges (requires auth)');

  } catch (error: any) {
    console.error('❌ Error testing gamification:', error.response?.data || error.message);
    process.exit(1);
  }
}

testGamificationSystem();
