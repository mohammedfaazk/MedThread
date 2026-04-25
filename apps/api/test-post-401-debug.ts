import axios from 'axios';
import jwt from 'jsonwebtoken';

const API_URL = 'http://localhost:3001';
const JWT_SECRET = 'dev-secret-change-in-production';

async function testPostCreation() {
  try {
    console.log('🧪 Testing POST creation with 401 debug...\n');

    // Step 1: Create a test user
    console.log('1️⃣  Creating test user...');
    const registerRes = await axios.post(`${API_URL}/api/auth/register`, {
      email: `test-${Date.now()}@example.com`,
      username: `testuser${Date.now()}`,
      password: 'TestPassword123',
      role: 'PATIENT'
    });

    const token = registerRes.data.data.token;
    const userId = registerRes.data.data.user.id;
    console.log('✅ User created:', userId);
    console.log('📝 Token:', token.substring(0, 50) + '...');

    // Step 2: Verify token
    console.log('\n2️⃣  Verifying token...');
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      console.log('✅ Token verified:', decoded);
    } catch (error: any) {
      console.error('❌ Token verification failed:', error.message);
    }

    // Step 3: Create a community first
    console.log('\n3️⃣  Creating test community...');
    const communityRes = await axios.post(
      `${API_URL}/api/v1/communities`,
      {
        name: `testcommunity${Date.now()}`,
        displayName: 'Test Community',
        description: 'Test community for debugging'
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const communityId = communityRes.data.data?.id || communityRes.data.id;
    console.log('✅ Community created:', communityId);

    // Step 4: Try to create a post
    console.log('\n4️⃣  Creating test post...');
    console.log('📤 Request headers:');
    console.log('   Authorization: Bearer ' + token.substring(0, 50) + '...');
    console.log('   Content-Type: application/json');
    console.log('📦 Request body:');
    console.log({
      title: 'Test Post',
      content: 'This is a test post',
      communityId: communityId
    });

    const postRes = await axios.post(
      `${API_URL}/api/v1/posts`,
      {
        title: 'Test Post',
        content: 'This is a test post',
        communityId: communityId
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Post created successfully!');
    console.log('📝 Post ID:', postRes.data.data?.id);
    console.log('\n✨ All tests passed!');
  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    if (error.response) {
      console.error('📊 Response status:', error.response.status);
      console.error('📊 Response data:', error.response.data);
      console.error('📊 Response headers:', error.response.headers);
    }
    process.exit(1);
  }
}

testPostCreation();
