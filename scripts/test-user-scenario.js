#!/usr/bin/env node

/**
 * Test script that simulates the exact user scenario
 */

const axios = require('axios');

const API_URL = 'http://localhost:3001';

async function testUserScenario() {
  console.log('👨‍⚕️ Testing User Doctor Signup Scenario...\n');

  // Simulate what a real user might enter
  const realUserData = {
    full_name: 'Dr. Michael Johnson',
    email: `real.user.test.${Date.now()}@gmail.com`,
    phone: '+91 9876543210',
    password: 'MyPassword123',
    confirm_password: 'MyPassword123',
    pincode: '110001'
  };

  console.log('📝 User form data:');
  console.log('   Full Name:', realUserData.full_name);
  console.log('   Email:', realUserData.email);
  console.log('   Phone:', realUserData.phone);
  console.log('   Pincode:', realUserData.pincode);

  // Generate username the same way the frontend does
  const username = realUserData.full_name
    .toLowerCase()
    .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special characters
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .substring(0, 30); // Ensure max 30 characters

  console.log('   Generated Username:', username);
  console.log('   Username Length:', username.length);
  console.log('   Username Valid:', /^[a-zA-Z0-9_]+$/.test(username));

  // Prepare API payload
  const apiPayload = {
    email: realUserData.email,
    username: username,
    password: realUserData.password,
    role: 'DOCTOR',
    pincode: realUserData.pincode || undefined
  };

  console.log('\n📤 Sending registration request...');

  try {
    const response = await axios.post(`${API_URL}/api/auth/register`, apiPayload);
    
    console.log('✅ SUCCESS! Doctor registration completed successfully!');
    console.log('📊 Response:', {
      success: response.data.success,
      userId: response.data.data.user.id,
      email: response.data.data.user.email,
      role: response.data.data.user.role,
      username: response.data.data.user.username
    });

    console.log('\n🎉 The user should now be able to:');
    console.log('   1. Navigate to http://localhost:3000/signup/doctor');
    console.log('   2. Fill out the form including the pincode field');
    console.log('   3. Successfully submit the registration');
    console.log('   4. Receive confirmation and proceed to verification');

  } catch (error) {
    console.log('❌ FAILED! Registration error:');
    console.log('📊 Status:', error.response?.status);
    console.log('📊 Error:', error.response?.data);
    
    if (error.response?.data?.details) {
      console.log('📋 Validation details:');
      error.response.data.details.forEach((detail, index) => {
        console.log(`   ${index + 1}. Field: ${detail.field}, Message: ${detail.message}`);
      });
    }
  }
}

// Run the test
testUserScenario();