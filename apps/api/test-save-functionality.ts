import axios from 'axios';

const API_URL = 'http://localhost:3001';

async function testSaveFunctionality() {
  console.log('🧪 Testing Save Post Functionality\n');

  // Login as navin
  console.log('1️⃣ Logging in as navin@gmail.com...');
  const loginResponse = await axios.post(`${API_URL}/api/v1/auth/login`, {
    email: 'navin@gmail.com',
    password: 'Patient@123456'
  });

  const token = loginResponse.data.data?.token || loginResponse.data.token;
  console.log('✅ Logged in successfully');
  console.log('   Token:', token ? 'Present' : 'Missing');
  console.log('   Response:', JSON.stringify(loginResponse.data, null, 2));
  console.log('');

  // Get posts
  console.log('2️⃣ Fetching posts...');
  const postsResponse = await axios.get(`${API_URL}/api/v1/posts`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const posts = postsResponse.data.data;
  console.log(`✅ Found ${posts.length} posts\n`);

  if (posts.length === 0) {
    console.log('❌ No posts found to test with');
    return;
  }

  const testPost = posts[0];
  console.log(`3️⃣ Testing with post: "${testPost.title}"`);
  console.log(`   Post ID: ${testPost.id}`);
  console.log(`   Currently saved: ${testPost.isSaved}\n`);

  // Save the post
  console.log('4️⃣ Saving the post...');
  const saveResponse = await axios.post(
    `${API_URL}/api/v1/posts/${testPost.id}/save`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
  console.log(`✅ Save response:`, saveResponse.data);
  console.log('');

  // Fetch posts again to verify
  console.log('5️⃣ Fetching posts again to verify saved status...');
  const verifyResponse = await axios.get(`${API_URL}/api/v1/posts`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const verifiedPost = verifyResponse.data.data.find((p: any) => p.id === testPost.id);
  console.log(`✅ Post saved status after save: ${verifiedPost.isSaved}\n`);

  // Check bookmarks endpoint
  console.log('6️⃣ Checking bookmarks endpoint...');
  const bookmarksResponse = await axios.get(`${API_URL}/api/v1/posts/bookmarks`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const bookmarkedPosts = bookmarksResponse.data.data;
  console.log(`✅ Found ${bookmarkedPosts.length} bookmarked posts`);
  
  const isInBookmarks = bookmarkedPosts.some((p: any) => p.id === testPost.id);
  console.log(`   Test post in bookmarks: ${isInBookmarks}\n`);

  // Unsave the post
  console.log('7️⃣ Unsaving the post...');
  const unsaveResponse = await axios.post(
    `${API_URL}/api/v1/posts/${testPost.id}/save`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
  console.log(`✅ Unsave response:`, unsaveResponse.data);
  console.log('');

  // Verify unsaved
  console.log('8️⃣ Verifying post is unsaved...');
  const finalVerifyResponse = await axios.get(`${API_URL}/api/v1/posts`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const finalPost = finalVerifyResponse.data.data.find((p: any) => p.id === testPost.id);
  console.log(`✅ Post saved status after unsave: ${finalPost.isSaved}\n`);

  // Final bookmarks check
  const finalBookmarksResponse = await axios.get(`${API_URL}/api/v1/posts/bookmarks`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const finalBookmarks = finalBookmarksResponse.data.data;
  const stillInBookmarks = finalBookmarks.some((p: any) => p.id === testPost.id);
  console.log(`   Test post still in bookmarks: ${stillInBookmarks}\n`);

  console.log('✅ All tests completed!');
}

testSaveFunctionality().catch(error => {
  console.error('❌ Test failed:', error.response?.data || error.message);
});
