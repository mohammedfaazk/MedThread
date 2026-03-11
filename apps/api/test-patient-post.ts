import axios from 'axios';

const API_URL = 'http://localhost:3001';

async function testPatientPostCreation() {
  try {
    console.log('🧪 Testing Patient Post Creation\n');
    console.log('='.repeat(50));

    // Step 1: Login as patient
    console.log('1. Logging in as patient...');
    const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
      email: 'navin@gmail.com',
      password: 'Patient@123456'
    });

    const { token, user } = loginResponse.data.data || loginResponse.data;
    console.log(`✅ Login successful!`);
    console.log(`   User: ${user.username} (${user.email})`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Token: ${token.substring(0, 20)}...`);

    // Step 2: Get communities
    console.log('\n2. Fetching communities...');
    const communitiesResponse = await axios.get(`${API_URL}/api/v1/communities`);
    const communities = communitiesResponse.data;
    console.log(`✅ Found ${communities.length} communities`);
    
    if (communities.length === 0) {
      console.log('❌ No communities found. Cannot create post.');
      return;
    }

    const firstCommunity = communities[0];
    console.log(`   Using community: ${firstCommunity.name} (${firstCommunity.displayName})`);

    // Step 3: Create a test post
    console.log('\n3. Creating test post...');
    const postData = {
      title: 'Test Post from Patient',
      content: 'This is a test post created by a patient user to verify the API is working correctly.',
      type: 'TEXT',
      communityId: firstCommunity.id,
      isNSFW: false,
      isSpoiler: false,
      isDraft: false
    };

    const createPostResponse = await axios.post(
      `${API_URL}/api/v1/posts`,
      postData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const newPost = createPostResponse.data;
    console.log('✅ Post created successfully!');
    console.log(`   Post ID: ${newPost.id}`);
    console.log(`   Title: ${newPost.title}`);
    console.log(`   Author: ${newPost.author?.username || 'Unknown'}`);
    console.log(`   Community: ${newPost.community?.name || 'Unknown'}`);

    console.log('\n' + '='.repeat(50));
    console.log('🎉 SUCCESS: Patient can create posts!');

  } catch (error: any) {
    console.log('\n' + '='.repeat(50));
    console.log('❌ ERROR occurred:');
    
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Message: ${error.response.data?.message || error.response.data?.error || 'Unknown error'}`);
      console.log(`   Data:`, error.response.data);
    } else {
      console.log(`   Error: ${error.message}`);
    }
  }
}

testPatientPostCreation();