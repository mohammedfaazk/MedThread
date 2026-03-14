#!/usr/bin/env node

/**
 * Debug script to identify the exact validation error in doctor signup
 */

const axios = require('axios');

const API_URL = 'http://localhost:3001';

async function debugDoctorSignupError() {
  console.log('🔍 Debugging Doctor Signup Validation Error...\n');

  try {
    // Test with minimal valid data first
    console.log('1️⃣ Testing with minimal valid data...');
    const minimalData = {
      email: `debug.test.${Date.now()}@example.com`,
      username: `debugtest${Date.now().toString().slice(-8)}`,
      password: 'password123',
      role: 'DOCTOR'
    };

    console.log('📝 Minimal test data:', minimalData);

    try {
      const response1 = await axios.post(`${API_URL}/api/auth/register`, minimalData);
      console.log('✅ Minimal data registration successful!');
    } catch (error1) {
      console.log('❌ Minimal data failed:');
      console.log('📊 Status:', error1.response?.status);
      console.log('📊 Error:', error1.response?.data);
    }

    // Test with empty pincode
    console.log('\n2️⃣ Testing with empty pincode...');
    const emptyPincodeData = {
      email: `debug.test2.${Date.now()}@example.com`,
      username: `debugtest2${Date.now().toString().slice(-7)}`,
      password: 'password123',
      role: 'DOCTOR',
      pincode: ''
    };

    console.log('📝 Empty pincode data:', emptyPincodeData);

    try {
      const response2 = await axios.post(`${API_URL}/api/auth/register`, emptyPincodeData);
      console.log('✅ Empty pincode registration successful!');
    } catch (error2) {
      console.log('❌ Empty pincode failed:');
      console.log('📊 Status:', error2.response?.status);
      console.log('📊 Error:', error2.response?.data);
    }

    // Test with valid pincode
    console.log('\n3️⃣ Testing with valid pincode...');
    const validPincodeData = {
      email: `debug.test3.${Date.now()}@example.com`,
      username: `debugtest3${Date.now().toString().slice(-7)}`,
      password: 'password123',
      role: 'DOCTOR',
      pincode: '110001'
    };

    console.log('📝 Valid pincode data:', validPincodeData);

    try {
      const response3 = await axios.post(`${API_URL}/api/auth/register`, validPincodeData);
      console.log('✅ Valid pincode registration successful!');
    } catch (error3) {
      console.log('❌ Valid pincode failed:');
      console.log('📊 Status:', error3.response?.status);
      console.log('📊 Error:', error3.response?.data);
    }

    // Test with typical frontend data (simulating what the form sends)
    console.log('\n4️⃣ Testing with typical frontend form data...');
    const frontendData = {
      email: `debug.frontend.${Date.now()}@example.com`,
      username: `dr_john_doe_${Date.now().toString().slice(-6)}`.toLowerCase().replace(/\s+/g, '_'),
      password: 'TestPassword123',
      role: 'DOCTOR',
      pincode: '110001'
    };

    console.log('📝 Frontend-style data:', frontendData);

    try {
      const response4 = await axios.post(`${API_URL}/api/auth/register`, frontendData);
      console.log('✅ Frontend-style registration successful!');
    } catch (error4) {
      console.log('❌ Frontend-style failed:');
      console.log('📊 Status:', error4.response?.status);
      console.log('📊 Error:', error4.response?.data);
      
      if (error4.response?.data?.details) {
        console.log('📋 Validation details:');
        error4.response.data.details.forEach((detail, index) => {
          console.log(`   ${index + 1}. Field: ${detail.field}, Message: ${detail.message}`);
        });
      }
    }

    console.log('\n🎯 Debug completed! Check the errors above to identify the issue.');

  } catch (error) {
    console.error('❌ Debug script failed:', error.message);
  }
}

// Run the debug
debugDoctorSignupError();