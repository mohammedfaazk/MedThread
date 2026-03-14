#!/usr/bin/env node

const axios = require('axios');

const API_URL = 'http://localhost:3001';

async function testSignup() {
  console.log('🧪 Testing Signup Fix...\n');

  try {
    // Test 1: Patient signup with pincode
    console.log('👤 Step 1: Testing patient signup with pincode...');
    
    const patientData = {
      email: `testpatient_${Date.now()}@example.com`,
      username: `testpatient_${Date.now()}`,
      password: 'testpassword123',
      role: 'PATIENT',
      pincode: '560001'
    };
    
    try {
      const patientResponse = await axios.post(`${API_URL}/api/auth/register`, patientData);
      console.log('✅ Patient signup successful:', patientResponse.data.success);
      console.log('   User ID:', patientResponse.data.data.user.id);
      console.log('   Username:', patientResponse.data.data.user.username);
    } catch (patientError) {
      console.log('❌ Patient signup failed:', patientError.response?.data || patientError.message);
    }

    // Test 2: Doctor signup with pincode
    console.log('\n🩺 Step 2: Testing doctor signup with pincode...');
    
    const doctorData = {
      email: `testdoctor_${Date.now()}@example.com`,
      username: `testdoctor_${Date.now()}`,
      password: 'testpassword123',
      role: 'DOCTOR',
      pincode: '110001'
    };
    
    try {
      const doctorResponse = await axios.post(`${API_URL}/api/auth/register`, doctorData);
      console.log('✅ Doctor signup successful:', doctorResponse.data.success);
      console.log('   User ID:', doctorResponse.data.data.user.id);
      console.log('   Username:', doctorResponse.data.data.user.username);
      console.log('   Verification Status:', doctorResponse.data.data.user.doctorVerificationStatus);
    } catch (doctorError) {
      console.log('❌ Doctor signup failed:', doctorError.response?.data || doctorError.message);
    }

    // Test 3: Signup without pincode (should still work)
    console.log('\n👤 Step 3: Testing signup without pincode...');
    
    const noPincodeData = {
      email: `testuser_${Date.now()}@example.com`,
      username: `testuser_${Date.now()}`,
      password: 'testpassword123',
      role: 'PATIENT'
    };
    
    try {
      const noPincodeResponse = await axios.post(`${API_URL}/api/auth/register`, noPincodeData);
      console.log('✅ Signup without pincode successful:', noPincodeResponse.data.success);
      console.log('   User ID:', noPincodeResponse.data.data.user.id);
    } catch (noPincodeError) {
      console.log('❌ Signup without pincode failed:', noPincodeError.response?.data || noPincodeError.message);
    }

    // Test 4: Test regional filtering
    console.log('\n🌍 Step 4: Testing regional filtering...');
    
    try {
      const regionalResponse = await axios.get(`${API_URL}/api/enhanced-analytics/top-doctors?region=560001&limit=5`);
      console.log('✅ Regional filtering successful');
      console.log('   Doctors in region 560001:', regionalResponse.data.data.length);
      
      if (regionalResponse.data.data.length > 0) {
        console.log('   Sample doctor:', {
          username: regionalResponse.data.data[0].username,
          pincode: regionalResponse.data.data[0].pincode,
          specialty: regionalResponse.data.data[0].specialty
        });
      }
    } catch (regionalError) {
      console.log('❌ Regional filtering failed:', regionalError.response?.data || regionalError.message);
    }

    // Test 5: Test invalid pincode validation
    console.log('\n❌ Step 5: Testing invalid pincode validation...');
    
    const invalidPincodeData = {
      email: `testinvalid_${Date.now()}@example.com`,
      username: `testinvalid_${Date.now()}`,
      password: 'testpassword123',
      role: 'PATIENT',
      pincode: '12345' // Invalid - only 5 digits
    };
    
    try {
      const invalidResponse = await axios.post(`${API_URL}/api/auth/register`, invalidPincodeData);
      console.log('❌ Should have failed but succeeded:', invalidResponse.data);
    } catch (invalidError) {
      console.log('✅ Correctly rejected invalid pincode:', invalidError.response?.data?.error || invalidError.response?.data?.message);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testSignup();