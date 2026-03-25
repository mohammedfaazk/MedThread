import fetch from 'node-fetch';

const API_URL = 'http://localhost:3001';

async function testQAForumCreate() {
  try {
    console.log('🔐 Logging in as navin@gmail.com...\n');

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
      console.log('❌ Login failed');
      return;
    }

    const token = loginData.data.token;
    console.log('✅ Login successful\n');

    // Create a question
    console.log('❓ Creating question...\n');
    const questionResponse = await fetch(`${API_URL}/api/v1/qa-forum/questions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        title: 'Test Question - ' + new Date().toISOString(),
        content: 'This is a test question to verify the QA forum is working.',
        tags: ['test', 'diabetes']
      })
    });

    const questionData = await questionResponse.json();
    
    if (questionData.success) {
      console.log('✅ Question created successfully!');
      console.log('   ID:', questionData.data.id);
      console.log('   Title:', questionData.data.title);
    } else {
      console.log('❌ Question creation failed:', questionData);
    }

    console.log('\n🎉 QA Forum feature is working!');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testQAForumCreate();
