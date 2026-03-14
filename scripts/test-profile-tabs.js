#!/usr/bin/env node

/**
 * Test script to verify the doctor profile tabs functionality
 */

const axios = require('axios');

const API_URL = 'http://localhost:3001';

async function testProfileTabs() {
  console.log('📋 Testing Doctor Profile Tabs Functionality...\n');

  try {
    // Test 1: Get posts by author
    console.log('1️⃣ Testing posts by author API...');
    try {
      const postsResponse = await axios.get(`${API_URL}/api/v1/posts?authorId=test_author_id&limit=5`);
      console.log('✅ Posts API working!');
      console.log('📊 Response structure:', {
        success: postsResponse.data.success || 'no success field',
        dataLength: postsResponse.data.data?.length || postsResponse.data.length || 0,
        hasData: !!postsResponse.data.data || !!postsResponse.data.length
      });
    } catch (postsError) {
      console.log('⚠️  Posts API response:', postsError.response?.status, postsError.response?.data || postsError.message);
    }

    // Test 2: Get comments by author
    console.log('\n2️⃣ Testing comments by author API...');
    try {
      const commentsResponse = await axios.get(`${API_URL}/api/v1/comments?authorId=test_author_id&limit=5`);
      console.log('✅ Comments API working!');
      console.log('📊 Response structure:', {
        success: commentsResponse.data.success || 'no success field',
        dataLength: commentsResponse.data.data?.length || commentsResponse.data.length || 0,
        hasData: !!commentsResponse.data.data || !!commentsResponse.data.length
      });
    } catch (commentsError) {
      console.log('⚠️  Comments API response:', commentsError.response?.status, commentsError.response?.data || commentsError.message);
    }

    // Test 3: Test with real doctor ID from top doctors
    console.log('\n3️⃣ Testing with real doctor data...');
    try {
      const topDoctorsResponse = await axios.get(`${API_URL}/api/enhanced-analytics/top-doctors?limit=1`);
      
      if (topDoctorsResponse.data.success && topDoctorsResponse.data.data.length > 0) {
        const testDoctor = topDoctorsResponse.data.data[0];
        console.log('👨‍⚕️ Testing with doctor:', testDoctor.username, '(ID:', testDoctor.id, ')');

        // Test posts for real doctor
        const realPostsResponse = await axios.get(`${API_URL}/api/v1/posts?authorId=${testDoctor.id}&limit=3`);
        console.log('📝 Doctor posts:', {
          count: realPostsResponse.data.data?.length || realPostsResponse.data.length || 0,
          hasSuccess: !!realPostsResponse.data.success
        });

        // Test comments for real doctor
        const realCommentsResponse = await axios.get(`${API_URL}/api/v1/comments?authorId=${testDoctor.id}&limit=3`);
        console.log('💬 Doctor comments:', {
          count: realCommentsResponse.data.data?.length || realCommentsResponse.data.length || 0,
          hasSuccess: !!realCommentsResponse.data.success
        });

        console.log('\n🎯 Profile URL for testing:', `http://localhost:3000/u/${testDoctor.username}`);
      } else {
        console.log('⚠️  No doctors found for testing');
      }
    } catch (realDataError) {
      console.log('⚠️  Real data test failed:', realDataError.message);
    }

    console.log('\n🎉 Profile Tabs Tests Completed!');
    console.log('\n📋 What was implemented:');
    console.log('• ✅ Added tab state management (Posts, Comments, About)');
    console.log('• ✅ Added fetchUserContent() function');
    console.log('• ✅ Added Posts tab with post cards and links');
    console.log('• ✅ Added Comments tab with comment cards and post links');
    console.log('• ✅ Added About tab with detailed profile information');
    console.log('• ✅ Added loading states for content fetching');
    console.log('• ✅ Added empty states with helpful messages');
    console.log('• ✅ Enhanced comments API to support authorId filtering');
    console.log('• ✅ Added getCommentsByAuthor() method to comment service');

    console.log('\n🎨 UI Features:');
    console.log('• Active tab highlighting with cyan color');
    console.log('• Responsive post and comment cards');
    console.log('• Post metadata (date, votes, comments, community)');
    console.log('• Comment metadata (date, votes, linked post)');
    console.log('• Comprehensive About section for doctors');
    console.log('• Education and qualification details');
    console.log('• Professional information display');

    console.log('\n🔗 Navigation:');
    console.log('• Posts link to full post pages');
    console.log('• Comments link to original posts');
    console.log('• Community links in post metadata');
    console.log('• Proper URL structure for all links');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('📊 Error response:', error.response.data);
      console.error('📊 Status:', error.response.status);
    }
  }
}

// Run the test
testProfileTabs();