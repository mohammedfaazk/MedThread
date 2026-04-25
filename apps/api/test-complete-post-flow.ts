#!/usr/bin/env node

/**
 * Complete test of the post creation flow
 * Tests: Register -> Login -> Create Community -> Create Post
 */

import axios from 'axios';
import jwt from 'jsonwebtoken';

const API_URL = process.env.API_URL || 'http://localhost:3001';
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';

const testEmail = `test-${Date.now()}@example.com`;
const testUsername = `testuser${Date.now()}`;
const testPassword = 'TestPassword123';

async function runTests() {
  try {
    console.log('🧪 Starting complete post creation flow test...\n');
    console.log('📋 Test Configuration:');
    console.log(`   API URL: ${API_URL}`);
    console.log(`   JWT Secret: ${JWT_SECRET.substring(0, 20)}...`);
    console.log(`   Test Email: ${testEmail}`);
    console.log(`   Test Username: ${testUsername}\n`);

    // Step 1: Register
    console.log('1️⃣  REGISTER - Creating new user...');
    const registerRes = await axios.post(`${API_URL}/api/auth/register`, {
      email: testEmail,
      username: testUsername,
      password: testPassword,
      role: 'PATIENT'
    });

    const token = registerRes.data.data.token;
    const userId = registerRes.data.data.user.id;
    console.log('✅ User registered successfully');
    console.log(`   User ID: ${userId}`);
    console.log(`   Token: ${token.substring(0, 50)}...`);

    // Step 2: Verify token
    console.log('\n2️⃣  TOKEN VERIFICATION - Verifying JWT token...');
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      console.log('✅ Token verified successfully');
      console.log(`   Decoded userId: ${decoded.userId}`);
      console.log(`   Decoded role: ${decoded.role}`);
    } catch (error: any) {
      console.error('❌ Token verification failed:', error.message);
      throw error;
    }

    // Step 3: Create community
    console.log('\n3️⃣  CREATE COMMUNITY - Creating test community...');
    const communityRes = await axios.post(
      `${API_URL}/api/v1/communities`,
      {
        name: `testcommunity${Date.now()}`,
        displayName: 'Test Community',
        description: 'Test community for post creation'
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const communityId = communityRes.data.data?.id || communityRes.data.id;
    console.log('✅ Community created successfully');
    console.log(`   Community ID: ${communityId}`);

    // Step 4: Create post
    console.log('\n4️⃣  CREATE POST - Creating test post...');
    console.log('   Request Details:');
    console.log(`   - URL: POST ${API_URL}/api/v1/posts`);
    console.log(`   - Authorization: Bearer ${token.substring(0, 50)}...`);
    console.log(`   - Body: { title, content, communityId }`);

    const postRes = await axios.post(
      `${API_URL}/api/v1/posts`,
      {
        title: 'Test Post for 401 Debug',
        content: 'This is a test post to verify the 401 error is fixed',
        communityId: communityId
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const postId = postRes.data.data?.id;
    console.log('✅ Post created successfully!');
    console.log(`   Post ID: ${postId}`);

    // Step 5: Verify post was created
    console.log('\n5️⃣  VERIFY POST - Fetching created post...');
    const getPostRes = await axios.get(`${API_URL}/api/v1/posts/${postId}`);
    console.log('✅ Post retrieved successfully');
    console.log(`   Post Title: ${getPostRes.data.data.title}`);
    console.log(`   Post Author: ${getPostRes.data.data.author.username}`);

    console.log('\n✨ All tests passed! The 401 error has been fixed.\n');
    console.log('📊 Summary:');
    console.log(`   ✓ User registration`);
    console.log(`   ✓ Token generation and verification`);
    console.log(`   ✓ Community creation`);
    console.log(`   ✓ Post creation with authentication`);
    console.log(`   ✓ Post retrieval`);

  } catch (error: any) {
    console.error('\n❌ Test failed:', error.message);
    if (error.response) {
      console.error('\n📊 Error Response:');
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Data:`, error.response.data);
      console.error(`   Headers:`, error.response.headers);
    }
    process.exit(1);
  }
}

runTests();
