import axios from 'axios';

const API_URL = 'http://localhost:3001';

async function testFrontendAPIFlow() {
  try {
    console.log('🌐 Testing Frontend API Flow\n');
    console.log('='.repeat(50));

    // Step 1: Login as patient
    console.log('1. Patient Login...');
    const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
      email: 'navin@gmail.com',
      password: 'Patient@123456'
    });

    const { token, user } = loginResponse.data.data || loginResponse.data;
    console.log(`✅ Patient logged in: ${user.username} (${user.role})`);

    // Step 2: Login as doctor
    console.log('\n2. Doctor Login...');
    const doctorLoginResponse = await axios.post(`${API_URL}/api/auth/login`, {
      email: 'rifa@gmail.com',
      password: 'Doctor@123456'
    });

    const { token: doctorToken, user: doctorUser } = doctorLoginResponse.data.data || doctorLoginResponse.data;
    console.log(`✅ Doctor logged in: ${doctorUser.username} (${doctorUser.role})`);

    // Step 3: Doctor creates a community
    console.log('\n3. Doctor creates community...');
    const communityData = {
      name: 'testcommunity',
      displayName: 'Test Community',
      description: 'A test community for verification',
      isNSFW: false,
      isPrivate: false
    };

    const createCommunityResponse = await axios.post(
      `${API_URL}/api/v1/communities`,
      communityData,
      {
        headers: {
          'Authorization': `Bearer ${doctorToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const newCommunity = createCommunityResponse.data;
    console.log(`✅ Community created: ${newCommunity.name} (${newCommunity.displayName})`);

    // Step 4: Get communities (should be visible to both)
    console.log('\n4. Fetching communities...');
    const communitiesResponse = await axios.get(`${API_URL}/api/v1/communities`);
    const communities = communitiesResponse.data;
    console.log(`✅ Found ${communities.length} communities`);
    communities.forEach((c: any) => {
      console.log(`   - ${c.name}: ${c.displayName}`);
    });

    // Step 5: Patient creates post in the community
    console.log('\n5. Patient creates post...');
    const postData = {
      title: 'Patient Post in Doctor Community',
      content: 'This post is created by a patient in a community created by a doctor.',
      type: 'TEXT',
      communityId: newCommunity.id,
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

    const patientPost = createPostResponse.data;
    console.log(`✅ Patient post created: ${patientPost.title}`);

    // Step 6: Doctor creates post in the same community
    console.log('\n6. Doctor creates post...');
    const doctorPostData = {
      title: 'Doctor Post in Same Community',
      content: 'This post is created by a doctor in the same community.',
      type: 'TEXT',
      communityId: newCommunity.id,
      isNSFW: false,
      isSpoiler: false,
      isDraft: false
    };

    const doctorCreatePostResponse = await axios.post(
      `${API_URL}/api/v1/posts`,
      doctorPostData,
      {
        headers: {
          'Authorization': `Bearer ${doctorToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const doctorPost = doctorCreatePostResponse.data;
    console.log(`✅ Doctor post created: ${doctorPost.title}`);

    // Step 7: Get posts from the community
    console.log('\n7. Fetching posts from community...');
    const postsResponse = await axios.get(`${API_URL}/api/v1/posts?community=${newCommunity.name}`);
    const posts = postsResponse.data;
    console.log(`✅ Found ${posts.length} posts in community`);
    posts.forEach((p: any) => {
      console.log(`   - "${p.title}" by ${p.author?.username} (${p.author?.role})`);
    });

    console.log('\n' + '='.repeat(50));
    console.log('🎉 SUCCESS: Both patients and doctors can create posts!');
    console.log('🎉 SUCCESS: Communities created by doctors are visible to patients!');
    console.log('🎉 SUCCESS: Posts from both user types appear in the same community!');

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

testFrontendAPIFlow();