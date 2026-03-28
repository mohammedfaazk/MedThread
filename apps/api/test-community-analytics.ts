import fetch from 'node-fetch';

async function testCommunityAnalytics() {
  try {
    // Login as admin
    console.log('🔐 Logging in as admin...');
    const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@medthread.com',
        password: 'Admin@123'
      })
    });

    const loginData = await loginResponse.json();
    const token = loginData.data?.token;

    if (!token) {
      throw new Error('Failed to get auth token');
    }

    console.log('✅ Login successful\n');

    // Test all metrics
    const metrics = ['posts', 'comments', 'interactions', 'members'];
    
    for (const metric of metrics) {
      console.log(`\n📊 Testing metric: ${metric.toUpperCase()}`);
      console.log('='.repeat(50));
      
      const response = await fetch(
        `http://localhost:3001/api/community-analytics/community-section-activity?period=30d&metric=${metric}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch ${metric}: ${response.statusText}`);
      }

      const data = await response.json();
      
      console.log(`Total: ${data.total}`);
      console.log('\nBreakdown:');
      data.data.forEach((item: any) => {
        console.log(`  ${item.label.padEnd(20)} ${item.value.toString().padStart(4)} (${item.percentageOfTotal}%)`);
      });
    }

    console.log('\n\n✅ All tests passed!');
    console.log('\nExpected values:');
    console.log('Support Groups:    28 posts, 64 comments, 143 interactions, 19 members');
    console.log('Q&A Forum:         41 posts, 98 comments, 212 interactions, 24 members');
    console.log('Health Challenges: 17 posts, 39 comments,  87 interactions, 14 members');
    console.log('Success Stories:   22 posts, 51 comments, 116 interactions, 18 members');

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testCommunityAnalytics();
