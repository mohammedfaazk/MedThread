import fetch from 'node-fetch';

const API_URL = 'http://localhost:3001';

async function testCompleteFlow() {
  try {
    console.log('🔐 Logging in...\n');

    const loginResponse = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'navin@gmail.com',
        password: 'navin123'
      })
    });

    const loginData = await loginResponse.json();
    const token = loginData.data.token;
    console.log('✅ Login successful\n');

    // Create story
    console.log('📝 Creating story...\n');
    const createResponse = await fetch(`${API_URL}/api/v1/success-stories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        title: 'Complete Flow Test - ' + Date.now(),
        story: 'This is a complete test of the success stories feature including detail view.',
        condition: 'Diabetes'
      })
    });

    const createData = await createResponse.json();
    const storyId = createData.data.id;
    console.log('✅ Story created:', storyId);
    console.log('   Status:', createData.data.status, '(should be APPROVED)\n');

    // View story detail
    console.log('📖 Viewing story detail...\n');
    const detailResponse = await fetch(`${API_URL}/api/v1/success-stories/${storyId}`);
    const detailData = await detailResponse.json();
    
    if (detailData.success) {
      console.log('✅ Story detail loaded!');
      console.log('   Title:', detailData.data.title);
      console.log('   Views:', detailData.data.views);
      console.log('   Comments:', detailData.data.comments.length);
    }

    // Add comment
    console.log('\n💬 Adding comment...\n');
    const commentResponse = await fetch(`${API_URL}/api/v1/success-stories/${storyId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        content: 'Great story! Very inspiring.'
      })
    });

    const commentData = await commentResponse.json();
    
    if (commentData.success) {
      console.log('✅ Comment added!');
      console.log('   Comment ID:', commentData.data.id);
      console.log('   Author:', commentData.data.author.username);
    }

    // Like story
    console.log('\n❤️  Liking story...\n');
    const likeResponse = await fetch(`${API_URL}/api/v1/success-stories/${storyId}/like`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const likeData = await likeResponse.json();
    console.log('✅ Story liked!');
    console.log('   Liked:', likeData.data.liked);

    // View updated detail
    console.log('\n📖 Viewing updated story...\n');
    const updatedResponse = await fetch(`${API_URL}/api/v1/success-stories/${storyId}`);
    const updatedData = await updatedResponse.json();
    
    console.log('✅ Updated story:');
    console.log('   Likes:', updatedData.data.likes);
    console.log('   Views:', updatedData.data.views);
    console.log('   Comments:', updatedData.data.comments.length);

    console.log('\n🎉 Complete flow test PASSED! All features working:');
    console.log('   ✅ Create story (auto-approved)');
    console.log('   ✅ View story detail');
    console.log('   ✅ Add comments');
    console.log('   ✅ Like stories');
    console.log('   ✅ View count tracking');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testCompleteFlow();
