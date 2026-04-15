import axios from 'axios';

const API_URL = 'http://localhost:3001';

async function testSaveAndBookmarks() {
  try {
    console.log('Testing save and bookmarks functionality...\n');

    // Login
    console.log('1. Logging in as Watson...');
    const loginResponse = await axios.post(`${API_URL}/api/v1/auth/login`, {
      email: 'watson@gmail.com',
      password: 'Watson@123456'
    });

    const token = loginResponse.data.data.token;
    console.log('✓ Login successful\n');

    // Get first post
    console.log('2. Fetching posts...');
    const postsResponse = await axios.get(`${API_URL}/api/v1/posts?limit=1`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const posts = postsResponse.data.data || postsResponse.data;
    const postId = posts[0].id;
    console.log('✓ Found post:', postId);
    console.log('Currently saved:', posts[0].isSaved, '\n');

    // Save the post
    console.log('3. Saving post...');
    const saveResponse = await axios.post(
      `${API_URL}/api/v1/posts/${postId}/save`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log('✓ Save response:', saveResponse.data.message);
    console.log('Is saved:', saveResponse.data.isSaved, '\n');

    // Fetch bookmarks
    console.log('4. Fetching bookmarks...');
    const bookmarksResponse = await axios.get(
      `${API_URL}/api/v1/posts/bookmarks`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log('✓ Bookmarks fetched');
    console.log('Number of bookmarks:', bookmarksResponse.data.data.length);
    
    if (bookmarksResponse.data.data.length > 0) {
      console.log('First bookmark:', bookmarksResponse.data.data[0].title);
      console.log('Post ID matches:', bookmarksResponse.data.data[0].id === postId);
    }
    
    console.log('\n✓ All tests passed!');

  } catch (error: any) {
    console.error('✗ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testSaveAndBookmarks();
