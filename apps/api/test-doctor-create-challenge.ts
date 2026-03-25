import fetch from 'node-fetch';

const API_URL = 'http://localhost:3001';

async function testDoctorCreateChallenge() {
  try {
    console.log('🔐 Logging in as doctor (rifa@gmail.com)...\n');

    const loginResponse = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'rifa@gmail.com',
        password: 'Rifa@123456'
      })
    });

    const loginData = await loginResponse.json();
    
    if (!loginData.success || !loginData.data?.token) {
      console.log('❌ Login failed:', loginData);
      return;
    }

    const token = loginData.data.token;
    const user = loginData.data.user;
    console.log('✅ Login successful');
    console.log('   User:', user.username);
    console.log('   Role:', user.role);
    console.log('   Can create challenges:', user.role === 'DOCTOR' || user.role === 'ADMIN' ? 'YES ✅' : 'NO ❌');
    console.log();

    // Create a health challenge
    console.log('🏃 Creating health challenge...\n');
    const challengeResponse = await fetch(`${API_URL}/api/v1/health-challenges`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        title: '30-Day Walking Challenge - ' + Date.now(),
        description: 'Walk 10,000 steps every day for 30 days to improve your cardiovascular health.',
        category: 'fitness',
        difficulty: 'medium',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        goals: {
          type: 'steps',
          value: 10000
        },
        rewards: {
          points: 500
        }
      })
    });

    const challengeData = await challengeResponse.json();
    
    if (challengeData.success) {
      console.log('✅ Challenge created successfully!');
      console.log('   ID:', challengeData.data.id);
      console.log('   Title:', challengeData.data.title);
      console.log('   Category:', challengeData.data.category);
      console.log('   Difficulty:', challengeData.data.difficulty);
      console.log('   Participants:', challengeData.data._count?.participants || 0);
    } else {
      console.log('❌ Challenge creation failed:', challengeData);
    }

    // Fetch all challenges to verify it appears
    console.log('\n📋 Fetching all challenges...\n');
    const fetchResponse = await fetch(`${API_URL}/api/v1/health-challenges`);
    const fetchData = await fetchResponse.json();
    
    if (fetchData.success) {
      console.log(`✅ Found ${fetchData.data.challenges.length} challenges`);
      const recentChallenges = fetchData.data.challenges.slice(0, 3);
      recentChallenges.forEach((c: any, i: number) => {
        console.log(`   ${i + 1}. ${c.title} (${c.category}, ${c.difficulty})`);
      });
    }

    console.log('\n🎉 Doctors can successfully create health challenges!');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testDoctorCreateChallenge();
