import axios from 'axios';

const API_URL = 'http://localhost:3001';

async function testSavedEndpoint() {
  try {
    console.log('Testing /saved endpoint...\n');

    // Login
    const loginResponse = await axios.post(`${API_URL}/api/v1/auth/login`, {
      email: 'watson@gmail.com',
      password: 'Watson@123456'
    });

    const token = loginResponse.data.data.token;
    console.log('✓ Login successful\n');

    // Test /saved endpoint
    console.log('Fetching from /api/v1/posts/saved...');
    const savedResponse = await axios.get(
      `${API_URL}/api/v1/posts/saved`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    console.log('✓ Response received');
    console.log('Is array:', Array.isArray(savedResponse.data));
    console.log('Number of posts:', savedResponse.data.length);
    
    if (savedResponse.data.length > 0) {
      const post = savedResponse.data[0];
      console.log('\nFirst post:');
      console.log('- ID:', post.id);
      console.log('- Title:', post.title);
      console.log('- Author:', post.author?.username);
      console.log('- Community:', post.community?.name);
      console.log('- Comment count:', post.commentCount);
    }

    console.log('\n✓ /saved endpoint working!');

  } catch (error: any) {
    console.error('✗ Test failed:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testSavedEndpoint();
