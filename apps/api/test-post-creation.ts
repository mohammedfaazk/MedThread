import axios from 'axios';

const API_URL = process.env.API_URL || 'http://localhost:3001';

async function testPostCreation() {
  try {
    console.log('🧪 Testing Post Creation API\n');

    // Step 1: Login as patient
    console.log('1. Logging in as patient...');
    const loginResponse = await axios.post(`${API_URL}/api/v1/auth/login`, {
      email: 'patient@test.com',
      password: 'Patient@123456'
    });

    const token = loginResponse.data.token;
    console.log('✅ Logged in successfully');

    // Step 2: Get communities
    console.log('\n2. Fetching communities...');
    const communitiesResponse = await axios.get(`${API_URL}/api/v1/communities`);
    const communities = communitiesResponse.data.communities || communitiesResponse.data;
    
    if (!communities || communities.length === 0) {
      console.log('❌ No communities found!');
      console.log('Creating a test community...');
      
      // Create a community
      const createCommunityResponse = await axios.post(
        `${API_URL}/api/v1/communities`,
        {
          name: 'test-community',
          displayName: 'Test Community',
          description: 'A test community for post creation'
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      const newCommunity = createCommunityResponse.data.community || createCommunityResponse.data;
      console.log('✅ Created community:', newCommunity.name);
      communities.push(newCommunity);
    } else {
      console.log(`✅ Found ${communities.length} communities`);
    }

    const testCommunity = communities[0];
    console.log(`   Using community: ${testCommunity.name} (${testCommunity.id})`);

    // Step 3: Create a post
    console.log('\n3. Creating a test post...');
    const postData = {
      title: 'Test Post - ' + new Date().toISOString(),
      content: 'This is a test post to verify the API is working correctly.',
      communityId: testCommunity.id,
      type: 'TEXT',
      isNSFW: false,
      isSpoiler: false,
      isPrivate: false,
      tags: ['test'],
      mediaUrls: []
    };

    console.log('   Post data:', JSON.stringify(postData, null, 2));

    const createPostResponse = await axios.post(
      `${API_URL}/api/v1/posts`,
      postData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const newPost = createPostResponse.data.data || createPostResponse.data;
    console.log('✅ Post created successfully!');
    console.log('   Post ID:', newPost.id);
    console.log('   Title:', newPost.title);
    console.log('   Community:', newPost.community?.name);

    // Step 4: Verify post exists
    console.log('\n4. Verifying post exists...');
    const getPostResponse = await axios.get(`${API_URL}/api/v1/posts/${newPost.id}`);
    const fetchedPost = getPostResponse.data.data || getPostResponse.data;
    console.log('✅ Post verified:', fetchedPost.title);

    console.log('\n✅ All tests passed! Post creation is working correctly.');

  } catch (error: any) {
    console.error('\n❌ Test failed!');
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error:', error.response.data);
      console.error('Headers:', error.response.headers);
    } else if (error.request) {
      console.error('No response received from server');
      console.error('Is the API server running on', API_URL, '?');
    } else {
      console.error('Error:', error.message);
    }
    
    process.exit(1);
  }
}

testPostCreation();
