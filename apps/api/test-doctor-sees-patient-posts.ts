import axios from 'axios';

const API_URL = 'http://localhost:3001';

async function testDoctorSeesPatientPosts() {
  try {
    console.log('🩺 Testing Doctor Visibility of Patient Posts\n');
    console.log('='.repeat(60));

    // Step 1: Login as patient and create a post
    console.log('1. Patient creates a post...');
    const patientLogin = await axios.post(`${API_URL}/api/auth/login`, {
      email: 'navin@gmail.com',
      password: 'Patient@123456'
    });
    const { token: patientToken, user: patientUser } = patientLogin.data.data || patientLogin.data;
    console.log(`✅ Patient logged in: ${patientUser.username}`);

    // Get communities
    const communitiesResponse = await axios.get(`${API_URL}/api/v1/communities`);
    const communities = communitiesResponse.data;
    const testCommunity = communities[0];
    console.log(`   Using community: ${testCommunity.name}`);

    // Patient creates post
    const patientPostData = {
      title: 'Patient Question About Symptoms',
      content: 'I have been experiencing some symptoms and would like medical advice.',
      type: 'TEXT',
      communityId: testCommunity.id,
      isNSFW: false,
      isSpoiler: false,
      isDraft: false
    };

    const patientPostResponse = await axios.post(
      `${API_URL}/api/v1/posts`,
      patientPostData,
      {
        headers: {
          'Authorization': `Bearer ${patientToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    const patientPost = patientPostResponse.data;
    console.log(`✅ Patient post created: "${patientPost.title}"`);

    // Step 2: Login as doctor
    console.log('\n2. Doctor logs in...');
    const doctorLogin = await axios.post(`${API_URL}/api/auth/login`, {
      email: 'rifa@gmail.com',
      password: 'Doctor@123456'
    });
    const { token: doctorToken, user: doctorUser } = doctorLogin.data.data || doctorLogin.data;
    console.log(`✅ Doctor logged in: ${doctorUser.username} (${doctorUser.role})`);

    // Step 3: Doctor fetches posts (same way frontend does)
    console.log('\n3. Doctor fetches posts from community...');
    
    // Test different API calls that the frontend might make
    const testCases = [
      { name: 'All posts (no filters)', url: `${API_URL}/api/v1/posts` },
      { name: 'Community posts', url: `${API_URL}/api/v1/posts?community=${testCommunity.name}` },
      { name: 'Hot posts', url: `${API_URL}/api/v1/posts?sort=hot` },
      { name: 'New posts', url: `${API_URL}/api/v1/posts?sort=new` },
      { name: 'Community + Hot', url: `${API_URL}/api/v1/posts?community=${testCommunity.name}&sort=hot` },
    ];

    for (const testCase of testCases) {
      console.log(`\n   Testing: ${testCase.name}`);
      try {
        const response = await axios.get(testCase.url, {
          headers: { 'Authorization': `Bearer ${doctorToken}` }
        });
        const posts = response.data;
        
        console.log(`   ✅ Found ${posts.length} posts`);
        
        // Check if patient post is visible
        const patientPostVisible = posts.some((p: any) => p.id === patientPost.id);
        console.log(`   Patient post visible: ${patientPostVisible ? '✅ YES' : '❌ NO'}`);
        
        // Show all posts with their authors
        posts.forEach((post: any, index: number) => {
          const authorRole = post.author?.role || 'UNKNOWN';
          const authorName = post.author?.username || 'Unknown';
          console.log(`     ${index + 1}. "${post.title}" by ${authorName} (${authorRole})`);
        });
        
      } catch (error: any) {
        console.log(`   ❌ Error: ${error.response?.data?.message || error.message}`);
      }
    }

    // Step 4: Test with explicit authorType filters
    console.log('\n4. Testing with explicit authorType filters...');
    
    const filterTests = [
      { name: 'All authors', filter: 'all' },
      { name: 'Doctor authors only', filter: 'doctor' },
      { name: 'Patient authors only', filter: 'patient' },
    ];

    for (const filterTest of filterTests) {
      console.log(`\n   Testing authorType=${filterTest.filter}:`);
      try {
        const response = await axios.get(
          `${API_URL}/api/v1/posts?community=${testCommunity.name}&authorType=${filterTest.filter}`,
          { headers: { 'Authorization': `Bearer ${doctorToken}` } }
        );
        const posts = response.data;
        
        console.log(`   ✅ Found ${posts.length} posts`);
        posts.forEach((post: any, index: number) => {
          const authorRole = post.author?.role || 'UNKNOWN';
          const authorName = post.author?.username || 'Unknown';
          console.log(`     ${index + 1}. "${post.title}" by ${authorName} (${authorRole})`);
        });
        
      } catch (error: any) {
        console.log(`   ❌ Error: ${error.response?.data?.message || error.message}`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('🎯 CONCLUSION: Check the results above to see if patient posts are visible to doctors');

  } catch (error: any) {
    console.log('\n' + '='.repeat(60));
    console.log('❌ ERROR occurred:');
    
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Message: ${error.response.data?.message || error.response.data?.error || 'Unknown error'}`);
    } else {
      console.log(`   Error: ${error.message}`);
    }
  }
}

testDoctorSeesPatientPosts();