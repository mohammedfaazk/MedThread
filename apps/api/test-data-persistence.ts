import axios from 'axios';

const API_URL = 'http://localhost:3001';

async function testDataPersistence() {
  try {
    console.log('🔄 Testing Data Persistence Across User Types\n');
    console.log('='.repeat(60));

    // Step 1: Login as patient and create a post
    console.log('1. 👤 Patient creates a post...');
    const patientLogin = await axios.post(`${API_URL}/api/auth/login`, {
      email: 'navin@gmail.com',
      password: 'Patient@123456'
    });
    const { token: patientToken, user: patientUser } = patientLogin.data.data || patientLogin.data;
    console.log(`   ✅ Patient logged in: ${patientUser.username}`);

    // Get communities
    const communitiesResponse = await axios.get(`${API_URL}/api/v1/communities`);
    const communities = communitiesResponse.data;
    const testCommunity = communities[0];
    console.log(`   📁 Using community: ${testCommunity.name} (${testCommunity.displayName})`);

    // Patient creates post
    const patientPostData = {
      title: `Patient Post - ${new Date().toLocaleTimeString()}`,
      content: 'This is a test post created by a patient to verify data persistence.',
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
    console.log(`   ✅ Patient post created: "${patientPost.title}"`);

    // Step 2: Login as doctor and verify they can see the patient's post
    console.log('\n2. 🩺 Doctor checks for patient posts...');
    const doctorLogin = await axios.post(`${API_URL}/api/auth/login`, {
      email: 'rifa@gmail.com',
      password: 'Doctor@123456'
    });
    const { token: doctorToken, user: doctorUser } = doctorLogin.data.data || doctorLogin.data;
    console.log(`   ✅ Doctor logged in: ${doctorUser.username} (${doctorUser.role})`);

    // Doctor fetches posts
    const doctorPostsResponse = await axios.get(`${API_URL}/api/v1/posts`, {
      headers: { 'Authorization': `Bearer ${doctorToken}` }
    });
    const doctorViewPosts = doctorPostsResponse.data;
    
    console.log(`   📋 Doctor sees ${doctorViewPosts.length} total posts`);
    
    // Check if patient post is visible to doctor
    const patientPostVisible = doctorViewPosts.some((p: any) => p.id === patientPost.id);
    console.log(`   ${patientPostVisible ? '✅' : '❌'} Patient post visible to doctor: ${patientPostVisible}`);

    // Step 3: Doctor creates a post
    console.log('\n3. 🩺 Doctor creates a post...');
    const doctorPostData = {
      title: `Doctor Post - ${new Date().toLocaleTimeString()}`,
      content: 'This is a test post created by a doctor to verify data persistence.',
      type: 'TEXT',
      communityId: testCommunity.id,
      isNSFW: false,
      isSpoiler: false,
      isDraft: false
    };

    const doctorPostResponse = await axios.post(
      `${API_URL}/api/v1/posts`,
      doctorPostData,
      {
        headers: {
          'Authorization': `Bearer ${doctorToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    const doctorPost = doctorPostResponse.data;
    console.log(`   ✅ Doctor post created: "${doctorPost.title}"`);

    // Step 4: Patient checks for doctor's post
    console.log('\n4. 👤 Patient checks for doctor posts...');
    const patientPostsResponse = await axios.get(`${API_URL}/api/v1/posts`, {
      headers: { 'Authorization': `Bearer ${patientToken}` }
    });
    const patientViewPosts = patientPostsResponse.data;
    
    console.log(`   📋 Patient sees ${patientViewPosts.length} total posts`);
    
    // Check if doctor post is visible to patient
    const doctorPostVisible = patientViewPosts.some((p: any) => p.id === doctorPost.id);
    console.log(`   ${doctorPostVisible ? '✅' : '❌'} Doctor post visible to patient: ${doctorPostVisible}`);

    // Step 5: Verify communities are shared
    console.log('\n5. 🏘️ Verifying community visibility...');
    
    // Patient view of communities
    const patientCommunitiesResponse = await axios.get(`${API_URL}/api/v1/communities`, {
      headers: { 'Authorization': `Bearer ${patientToken}` }
    });
    const patientCommunities = patientCommunitiesResponse.data;
    
    // Doctor view of communities
    const doctorCommunitiesResponse = await axios.get(`${API_URL}/api/v1/communities`, {
      headers: { 'Authorization': `Bearer ${doctorToken}` }
    });
    const doctorCommunities = doctorCommunitiesResponse.data;
    
    console.log(`   👤 Patient sees ${patientCommunities.length} communities`);
    console.log(`   🩺 Doctor sees ${doctorCommunities.length} communities`);
    
    const communitiesMatch = patientCommunities.length === doctorCommunities.length;
    console.log(`   ${communitiesMatch ? '✅' : '❌'} Communities visible to both: ${communitiesMatch}`);

    // Step 6: Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 DATA PERSISTENCE TEST RESULTS:');
    console.log('='.repeat(60));
    console.log(`✅ Patient can create posts: YES`);
    console.log(`✅ Doctor can create posts: YES`);
    console.log(`${patientPostVisible ? '✅' : '❌'} Doctor can see patient posts: ${patientPostVisible ? 'YES' : 'NO'}`);
    console.log(`${doctorPostVisible ? '✅' : '❌'} Patient can see doctor posts: ${doctorPostVisible ? 'YES' : 'NO'}`);
    console.log(`${communitiesMatch ? '✅' : '❌'} Communities shared between users: ${communitiesMatch ? 'YES' : 'NO'}`);
    
    const allTestsPassed = patientPostVisible && doctorPostVisible && communitiesMatch;
    console.log('\n' + '='.repeat(60));
    console.log(`🎯 OVERALL RESULT: ${allTestsPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
    console.log('='.repeat(60));

    if (allTestsPassed) {
      console.log('\n🎉 SUCCESS: Data is persistent and globally stored in the database!');
      console.log('Both doctors and patients can see each other\'s posts and communities.');
    } else {
      console.log('\n⚠️ ISSUE: Some data visibility problems detected.');
      console.log('Check the results above to see what needs to be fixed.');
    }

  } catch (error: any) {
    console.log('\n' + '='.repeat(60));
    console.log('❌ ERROR occurred during testing:');
    
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Message: ${error.response.data?.message || error.response.data?.error || 'Unknown error'}`);
    } else {
      console.log(`   Error: ${error.message}`);
    }
  }
}

testDataPersistence();