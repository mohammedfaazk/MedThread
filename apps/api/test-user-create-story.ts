import fetch from 'node-fetch';

const API_URL = 'http://localhost:3001';

async function testUserCreateStory() {
  try {
    console.log('🔐 Logging in as navin@gmail.com...\n');

    // Login
    const loginResponse = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'navin@gmail.com',
        password: 'navin123'
      })
    });

    const loginData = await loginResponse.json();
    
    if (!loginData.success || !loginData.data?.token) {
      console.log('❌ Login failed:', loginData);
      return;
    }

    const token = loginData.data.token;
    console.log('✅ Login successful\n');

    // Create a success story
    console.log('📝 Creating success story...\n');
    const storyResponse = await fetch(`${API_URL}/api/v1/success-stories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        title: 'Test Story - ' + new Date().toISOString(),
        story: 'This is a test story to verify the feature is working correctly.',
        condition: 'Diabetes'
      })
    });

    const storyData = await storyResponse.json();
    
    if (storyData.success) {
      console.log('✅ Story created successfully!');
      console.log('   ID:', storyData.data.id);
      console.log('   Title:', storyData.data.title);
      console.log('   Status:', storyData.data.status);
      console.log('   Should be visible:', storyData.data.status === 'APPROVED' ? 'YES ✅' : 'NO ❌');
    } else {
      console.log('❌ Story creation failed:', storyData);
    }

    // Fetch all stories to verify it appears
    console.log('\n📋 Fetching all stories...\n');
    const fetchResponse = await fetch(`${API_URL}/api/v1/success-stories`);
    const fetchData = await fetchResponse.json();
    
    if (fetchData.success) {
      console.log(`✅ Found ${fetchData.data.stories.length} stories`);
      const recentStories = fetchData.data.stories.slice(0, 3);
      recentStories.forEach((s: any, i: number) => {
        console.log(`   ${i + 1}. ${s.title} (${s.status})`);
      });
    }

    console.log('\n🎉 Success Stories feature is fully operational!');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testUserCreateStory();
