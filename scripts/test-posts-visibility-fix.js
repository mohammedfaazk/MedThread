#!/usr/bin/env node

/**
 * Test script to verify posts are now visible in doctor profiles
 */

const axios = require('axios');

const API_URL = 'http://localhost:3001';

async function testPostsVisibilityFix() {
  console.log('🔍 Testing Posts Visibility Fix...\n');

  try {
    // Test 1: Get a doctor with posts
    console.log('1️⃣ Finding a doctor with posts...');
    const allPostsResponse = await axios.get(`${API_URL}/api/v1/posts?limit=5`);
    
    if (Array.isArray(allPostsResponse.data) && allPostsResponse.data.length > 0) {
      const postWithDoctor = allPostsResponse.data.find(post => 
        post.author && (post.author.role === 'DOCTOR' || post.author.role === 'VERIFIED_DOCTOR')
      );
      
      if (postWithDoctor) {
        const doctor = postWithDoctor.author;
        console.log('👨‍⚕️ Found doctor with posts:', doctor.username);
        console.log('📊 Doctor info:', {
          id: doctor.id,
          username: doctor.username,
          role: doctor.role,
          specialty: doctor.specialty
        });

        // Test 2: Get posts for this specific doctor
        console.log('\n2️⃣ Testing posts API for this doctor...');
        const doctorPostsResponse = await axios.get(`${API_URL}/api/v1/posts?authorId=${doctor.id}`);
        
        console.log('📝 API Response format:', {
          isArray: Array.isArray(doctorPostsResponse.data),
          hasSuccessField: 'success' in doctorPostsResponse.data,
          dataType: typeof doctorPostsResponse.data,
          length: Array.isArray(doctorPostsResponse.data) ? doctorPostsResponse.data.length : 'N/A'
        });

        if (Array.isArray(doctorPostsResponse.data)) {
          console.log('✅ Posts API returns array directly (correct format)');
          console.log('📊 Doctor posts found:', doctorPostsResponse.data.length);
          
          if (doctorPostsResponse.data.length > 0) {
            console.log('\n📋 Sample posts:');
            doctorPostsResponse.data.slice(0, 2).forEach((post, index) => {
              console.log(`   ${index + 1}. "${post.title}"`);
              console.log(`      Content: ${post.content?.substring(0, 100)}...`);
              console.log(`      Created: ${new Date(post.createdAt).toLocaleDateString()}`);
              console.log(`      Community: ${post.community?.displayName || 'Unknown'}`);
              console.log('');
            });
          }
        } else {
          console.log('❌ Unexpected response format');
        }

        // Test 3: Test comments API format for comparison
        console.log('3️⃣ Testing comments API format...');
        const doctorCommentsResponse = await axios.get(`${API_URL}/api/v1/comments?authorId=${doctor.id}&limit=3`);
        
        console.log('💬 Comments API Response format:', {
          hasSuccessField: 'success' in doctorCommentsResponse.data,
          hasDataField: 'data' in doctorCommentsResponse.data,
          success: doctorCommentsResponse.data.success,
          dataLength: doctorCommentsResponse.data.data?.length || 0
        });

        console.log('\n🎯 Profile URL to test:', `http://localhost:3000/u/${doctor.username}`);
        
      } else {
        console.log('⚠️  No doctor posts found in recent posts');
      }
    } else {
      console.log('⚠️  No posts found in the system');
    }

    console.log('\n🔧 Fix Applied:');
    console.log('• ✅ Updated fetchUserContent() to handle posts API array response');
    console.log('• ✅ Added proper error handling for both APIs');
    console.log('• ✅ Different handling for posts (array) vs comments (success object)');
    console.log('• ✅ Added fallback to empty arrays on error');

    console.log('\n📊 API Response Formats:');
    console.log('• Posts API: Returns array directly → response.data = [...]');
    console.log('• Comments API: Returns success object → response.data = { success: true, data: [...] }');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('📊 Error response:', error.response.data);
      console.error('📊 Status:', error.response.status);
    }
  }
}

// Run the test
testPostsVisibilityFix();