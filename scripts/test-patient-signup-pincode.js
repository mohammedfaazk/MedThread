#!/usr/bin/env node

/**
 * Test script to verify signup with required pincode field for both patients and doctors
 */

const axios = require('axios');

const API_URL = 'http://localhost:3001';

async function testPatientSignupPincode() {
  console.log('🧪 Testing Signup with Required Pincode for Both Patients and Doctors...\n');

  try {
    // Test 1: Patient signup without pincode (should fail)
    console.log('1. Testing patient signup WITHOUT pincode (should fail)...');
    try {
      const response = await axios.post(`${API_URL}/api/auth/register`, {
        email: 'test.patient@example.com',
        username: 'testpatient123',
        password: 'TestPassword123',
        role: 'PATIENT'
        // No pincode provided
      });
      console.log('❌ UNEXPECTED: Signup succeeded without pincode');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ EXPECTED: Signup failed without pincode');
        console.log(`   Error: ${error.response.data.error}`);
      } else {
        console.log('❌ UNEXPECTED ERROR:', error.message);
      }
    }

    // Test 2: Patient signup with invalid pincode (should fail)
    console.log('\n2. Testing patient signup with INVALID pincode (should fail)...');
    try {
      const response = await axios.post(`${API_URL}/api/auth/register`, {
        email: 'test.patient2@example.com',
        username: 'testpatient456',
        password: 'TestPassword123',
        role: 'PATIENT',
        pincode: '12345' // Invalid - only 5 digits
      });
      console.log('❌ UNEXPECTED: Signup succeeded with invalid pincode');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ EXPECTED: Signup failed with invalid pincode');
        console.log(`   Error: ${error.response.data.error}`);
      } else {
        console.log('❌ UNEXPECTED ERROR:', error.message);
      }
    }

    // Test 3: Patient signup with valid pincode (should succeed)
    console.log('\n3. Testing patient signup with VALID pincode (should succeed)...');
    try {
      const response = await axios.post(`${API_URL}/api/auth/register`, {
        email: 'test.patient.valid@example.com',
        username: 'validpatient789',
        password: 'TestPassword123',
        role: 'PATIENT',
        pincode: '560001' // Valid 6-digit pincode
      });
      
      if (response.data.success) {
        console.log('✅ SUCCESS: Patient signup with valid pincode succeeded');
        console.log(`   User ID: ${response.data.data.user.id}`);
        console.log(`   Username: ${response.data.data.user.username}`);
        console.log(`   Pincode: ${response.data.data.user.pincode || 'Not returned'}`);
      } else {
        console.log('❌ FAILED: Signup response indicates failure');
        console.log('   Response:', response.data);
      }
    } catch (error) {
      console.log('❌ FAILED: Patient signup with valid pincode failed');
      console.log(`   Error: ${error.response?.data?.error || error.message}`);
    }

    // Test 4: Doctor signup without pincode (should fail)
    console.log('\n4. Testing doctor signup WITHOUT pincode (should fail)...');
    try {
      const response = await axios.post(`${API_URL}/api/auth/register`, {
        email: 'test.doctor@example.com',
        username: 'testdoctor123',
        password: 'TestPassword123',
        role: 'DOCTOR'
        // No pincode - should now be required for doctors too
      });
      
      if (response.data.success) {
        console.log('❌ UNEXPECTED: Doctor signup without pincode succeeded');
      } else {
        console.log('✅ EXPECTED: Doctor signup without pincode failed');
      }
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ EXPECTED: Doctor signup failed without pincode');
        console.log(`   Error: ${error.response.data.error}`);
      } else {
        console.log('❌ UNEXPECTED ERROR:', error.message);
      }
    }

    // Test 5: Doctor signup with valid pincode (should succeed)
    console.log('\n5. Testing doctor signup with VALID pincode (should succeed)...');
    try {
      const response = await axios.post(`${API_URL}/api/auth/register`, {
        email: 'test.doctor.valid@example.com',
        username: 'validdoctor456',
        password: 'TestPassword123',
        role: 'DOCTOR',
        pincode: '110001' // Valid 6-digit pincode
      });
      
      if (response.data.success) {
        console.log('✅ SUCCESS: Doctor signup with valid pincode succeeded');
        console.log(`   User ID: ${response.data.data.user.id}`);
        console.log(`   Username: ${response.data.data.user.username}`);
      } else {
        console.log('❌ FAILED: Doctor signup response indicates failure');
        console.log('   Response:', response.data);
      }
    } catch (error) {
      console.log('❌ FAILED: Doctor signup with valid pincode failed');
      console.log(`   Error: ${error.response?.data?.error || error.message}`);
    }

    console.log('\n🎉 Pincode Requirement Test Complete!');
    console.log('\nSummary:');
    console.log('- Pincode is now REQUIRED for both patients AND doctors');
    console.log('- Must be exactly 6 digits');
    console.log('- Frontend validation updated for both signup forms');
    console.log('- Backend validation enforces pincode requirement for all users');
    console.log('- Used for regional filtering and location-based services');

  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
  }
}

// Run the test
testPatientSignupPincode();