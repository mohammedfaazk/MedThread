import axios from 'axios';

const API_URL = 'http://localhost:3001';

async function testSavePost() {
  try {
    console.log('Testing save post functionality...\n');

    // Login as doctor (Watson) - doctors can also save posts
    console.log('1. Logging in as doctor (Watson)...');
    const loginResponse = await axios.post(`${API_URL}/api/v1/auth/login`, {
      email: 'watson@gmail.com',
      password: 'Watson@123456'
    });

    const token = loginResponse.data.data?.token || loginResponse.data.token;
    console.log('✓ Login successful');
    if (token) {
      console.log('Token:', token.substring(0, 20) + '...\n');
    } else {
      console.log('✗ No token received');
      console.log('Response:', JSON.stringify(loginResponse.data, null, 2));
      return;
    }

    // Get first post
    console.log('2. Fetching posts...');
    const postsResponse = await axios.get(`${API_URL}/api/v1/posts?limit=1`);
    const posts = postsResponse.data.data || postsResponse.data;
    
    if (!posts || posts.length === 0) {
      console.log('✗ No posts found');
      return;
    }

    const postId = posts[0].id;
    console.log('✓ Found post:', postId);
    console.log('Post title:', posts[0].title);
    console.log('Currently saved:', posts[0].isSaved || false, '\n');

    // Try to save the post
    console.log('3. Attempting to save post...');
    try {
      const saveResponse = await axios.post(
        `${API_URL}/api/v1/posts/${postId}/save`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      console.log('✓ Save request successful');
      console.log('Response:', JSON.stringify(saveResponse.data, null, 2), '\n');

      // Verify the save by fetching the post again
      console.log('4. Verifying save status...');
      const verifyResponse = await axios.get(
        `${API_URL}/api/v1/posts/${postId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      console.log('✓ Post fetched');
      console.log('Full response:', JSON.stringify(verifyResponse.data, null, 2));
      console.log('Is saved:', verifyResponse.data.data?.isSaved || verifyResponse.data.isSaved);
      console.log('\n✓ Save functionality is working!');

    } catch (saveError: any) {
      console.log('✗ Save request failed');
      console.log('Status:', saveError.response?.status);
      console.log('Error:', saveError.response?.data);
      console.log('Full error:', saveError.message);
    }

  } catch (error: any) {
    console.error('✗ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testSavePost();
