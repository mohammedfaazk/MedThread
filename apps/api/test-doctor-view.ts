import axios from 'axios';

const API_URL = 'http://localhost:3001';

async function testDoctorView() {
  try {
    console.log('🩺 Testing Doctor View of Posts\n');

    // Login as doctor
    const doctorLogin = await axios.post(`${API_URL}/api/auth/login`, {
      email: 'rifa@gmail.com',
      password: 'Doctor@123456'
    });
    const { token: doctorToken, user: doctorUser } = doctorLogin.data.data || doctorLogin.data;
    console.log(`✅ Doctor logged in: ${doctorUser.username} (${doctorUser.role})`);

    // Fetch all posts
    console.log('\n📋 Fetching all posts...');
    const response = await axios.get(`${API_URL}/api/v1/posts`, {
      headers: { 'Authorization': `Bearer ${doctorToken}` }
    });
    const posts = response.data;
    
    console.log(`✅ Found ${posts.length} posts total`);
    
    if (posts.length === 0) {
      console.log('❌ No posts found!');
      return;
    }

    console.log('\n📝 Posts visible to doctor:');
    posts.forEach((post: any, index: number) => {
      const authorRole = post.author?.role || 'UNKNOWN';
      const authorName = post.author?.username || 'Unknown';
      const communityName = post.community?.name || 'Unknown';
      console.log(`  ${index + 1}. "${post.title}"`);
      console.log(`     Author: ${authorName} (${authorRole})`);
      console.log(`     Community: ${communityName}`);
      console.log(`     Created: ${post.createdAt}`);
      console.log('');
    });

    // Count by author type
    const doctorPosts = posts.filter((p: any) => p.author?.role === 'DOCTOR' || p.author?.role === 'VERIFIED_DOCTOR');
    const patientPosts = posts.filter((p: any) => p.author?.role === 'PATIENT' || (p.author?.role !== 'DOCTOR' && p.author?.role !== 'VERIFIED_DOCTOR'));
    
    console.log('📊 Summary:');
    console.log(`   Doctor posts: ${doctorPosts.length}`);
    console.log(`   Patient posts: ${patientPosts.length}`);
    console.log(`   Total posts: ${posts.length}`);

    if (patientPosts.length === 0) {
      console.log('\n❌ ISSUE: Doctor cannot see any patient posts!');
    } else {
      console.log('\n✅ SUCCESS: Doctor can see patient posts!');
    }

  } catch (error: any) {
    console.log('❌ ERROR:', error.response?.data?.message || error.message);
  }
}

testDoctorView();