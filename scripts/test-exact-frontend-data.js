#!/usr/bin/env node

/**
 * Test script that simulates the exact data the frontend doctor signup form sends
 */

const axios = require('axios');

const API_URL = 'http://localhost:3001';

async function testExactFrontendData() {
  console.log('🧪 Testing Exact Frontend Doctor Signup Data...\n');

  // Simulate typical form data that might cause issues
  const testCases = [
    {
      name: 'Long Name Test',
      formData: {
        full_name: 'Dr. Alexander Christopher Montgomery Smith',
        email: `long.name.test.${Date.now()}@example.com`,
        phone: '9876543210',
        password: 'TestPassword123',
        confirm_password: 'TestPassword123',
        pincode: '110001'
      }
    },
    {
      name: 'Special Characters in Name',
      formData: {
        full_name: 'Dr. John O\'Connor-Smith',
        email: `special.chars.${Date.now()}@example.com`,
        phone: '9876543210',
        password: 'TestPassword123',
        confirm_password: 'TestPassword123',
        pincode: '110001'
      }
    },
    {
      name: 'Empty Pincode',
      formData: {
        full_name: 'Dr. Jane Smith',
        email: `empty.pincode.${Date.now()}@example.com`,
        phone: '9876543210',
        password: 'TestPassword123',
        confirm_password: 'TestPassword123',
        pincode: ''
      }
    },
    {
      name: 'No Pincode Field',
      formData: {
        full_name: 'Dr. Bob Johnson',
        email: `no.pincode.${Date.now()}@example.com`,
        phone: '9876543210',
        password: 'TestPassword123',
        confirm_password: 'TestPassword123'
        // No pincode field at all
      }
    },
    {
      name: 'Typical Valid Case',
      formData: {
        full_name: 'Dr. Sarah Wilson',
        email: `typical.${Date.now()}@example.com`,
        phone: '9876543210',
        password: 'TestPassword123',
        confirm_password: 'TestPassword123',
        pincode: '110001'
      }
    }
  ];

  for (const testCase of testCases) {
    console.log(`\n🧪 Testing: ${testCase.name}`);
    
    // Generate username the same way the frontend does
    const username = testCase.formData.full_name
      .toLowerCase()
      .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special characters
      .replace(/\s+/g, '_') // Replace spaces with underscores
      .substring(0, 30); // Ensure max 30 characters
    
    // Prepare API payload the same way the frontend does
    const apiPayload = {
      email: testCase.formData.email,
      username: username,
      password: testCase.formData.password,
      role: 'DOCTOR',
      pincode: testCase.formData.pincode || undefined
    };

    console.log('📝 Form data:', {
      full_name: testCase.formData.full_name,
      email: testCase.formData.email,
      pincode: testCase.formData.pincode || 'undefined'
    });
    
    console.log('📤 API payload:', {
      ...apiPayload,
      password: '[HIDDEN]'
    });
    
    console.log('📏 Username length:', username.length);
    console.log('🔤 Username valid chars:', /^[a-zA-Z0-9_]+$/.test(username));

    try {
      const response = await axios.post(`${API_URL}/api/auth/register`, apiPayload);
      console.log('✅ Registration successful!');
    } catch (error) {
      console.log('❌ Registration failed:');
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

  console.log('\n🎉 All test cases completed!');
}

// Run the test
testExactFrontendData();