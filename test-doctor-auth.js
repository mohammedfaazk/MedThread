/**
 * Test Script for Doctor Authentication Flow
 * 
 * This script tests the complete doctor authentication and verification flow:
 * 1. Doctor registration with PENDING status
 * 2. Doctor login with verification status
 * 3. Attempt to post reply (should fail if pending)
 * 4. Admin approval
 * 5. Attempt to post reply (should succeed after approval)
 */

const axios = require('axios');

const API_URL = 'http://localhost:3001';

// Test data
const testDoctor = {
  email: `testdoctor${Date.now()}@test.com`,
  username: `testdoc${Date.now()}`,
  password: 'TestDoc@123456',
  role: 'DOCTOR'
};

const testPatient = {
  email: `testpatient${Date.now()}@test.com`,
  username: `testpat${Date.now()}`,
  password: 'TestPat@123456',
  role: 'PATIENT'
};

let doctorToken = '';
let doctorUserId = '';
let patientToken = '';
let patientUserId = '';
let threadId = '';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testDoctorRegistration() {
  console.log('\n📝 TEST 1: Doctor Registration');
  console.log('================================');
  
  try {
    const response = await axios.post(`${API_URL}/api/auth/register`, testDoctor);
    
    if (response.data.success) {
      doctorToken = response.data.data.token;
      doctorUserId = response.data.data.user.id;
      
      console.log('✅ Doctor registered successfully');
      console.log('   User ID:', doctorUserId);
      console.log('   Role:', response.data.data.user.role);
      console.log('   Verification Status:', response.data.data.user.doctorVerificationStatus);
      
      if (response.data.data.user.doctorVerificationStatus === 'PENDING') {
        console.log('✅ Verification status correctly set to PENDING');
        return true;
      } else {
        console.log('❌ Verification status should be PENDING but got:', response.data.data.user.doctorVerificationStatus);
        return false;
      }
    }
  } catch (error) {
    console.log('❌ Registration failed:', error.response?.data || error.message);
    return false;
  }
}

async function testDoctorLogin() {
  console.log('\n🔐 TEST 2: Doctor Login');
  console.log('================================');
  
  try {
    const response = await axios.post(`${API_URL}/api/auth/login`, {
      email: testDoctor.email,
      password: testDoctor.password
    });
    
    if (response.data.success) {
      doctorToken = response.data.data.token;
      
      console.log('✅ Doctor logged in successfully');
      console.log('   User ID:', response.data.data.user.id);
      console.log('   Role:', response.data.data.user.role);
      console.log('   Verification Status:', response.data.data.user.doctorVerificationStatus);
      
      if (response.data.data.user.doctorVerificationStatus) {
        console.log('✅ Verification status included in login response');
        return true;
      } else {
        console.log('❌ Verification status missing from login response');
        return false;
      }
    }
  } catch (error) {
    console.log('❌ Login failed:', error.response?.data || error.message);
    return false;
  }
}

async function testPatientSetup() {
  console.log('\n👤 SETUP: Creating Patient & Thread');
  console.log('================================');
  
  try {
    // Register patient
    const regResponse = await axios.post(`${API_URL}/api/auth/register`, testPatient);
    patientToken = regResponse.data.data.token;
    patientUserId = regResponse.data.data.user.id;
    console.log('✅ Patient registered:', patientUserId);
    
    // Create a thread
    const threadResponse = await axios.post(`${API_URL}/api/threads`, {
      patientId: patientUserId,
      title: 'Test Medical Thread',
      symptoms: {
        age: 30,
        gender: 'Male',
        existingConditions: [],
        medications: [],
        primarySymptoms: ['Headache'],
        duration: '2 days',
        severity: 'MODERATE',
        description: 'Test symptoms'
      },
      tags: ['test']
    });
    
    threadId = threadResponse.data.id;
    console.log('✅ Thread created:', threadId);
    return true;
  } catch (error) {
    console.log('❌ Patient setup failed:', error.response?.data || error.message);
    return false;
  }
}

async function testPendingDoctorReply() {
  console.log('\n🚫 TEST 3: Pending Doctor Tries to Reply');
  console.log('================================');
  
  try {
    const response = await axios.post(`${API_URL}/api/replies`, {
      threadId: threadId,
      authorId: doctorUserId,
      content: 'This is a test reply from pending doctor'
    });
    
    console.log('❌ FAIL: Pending doctor should NOT be able to reply');
    return false;
  } catch (error) {
    if (error.response?.status === 403) {
      console.log('✅ Correctly blocked pending doctor from replying');
      console.log('   Error:', error.response.data.error);
      console.log('   Message:', error.response.data.message);
      return true;
    } else {
      console.log('❌ Wrong error type:', error.response?.data || error.message);
      return false;
    }
  }
}

async function testApprovedDoctorReply() {
  console.log('\n✅ TEST 4: Approved Doctor Tries to Reply');
  console.log('================================');
  console.log('⚠️  NOTE: This test requires manual admin approval');
  console.log('   Please approve doctor via admin panel, then press Enter...');
  
  // Wait for user input
  await new Promise(resolve => {
    process.stdin.once('data', () => resolve());
  });
  
  try {
    const response = await axios.post(`${API_URL}/api/replies`, {
      threadId: threadId,
      authorId: doctorUserId,
      content: 'This is a test reply from approved doctor'
    });
    
    console.log('✅ Approved doctor can reply successfully');
    console.log('   Reply ID:', response.data.id);
    console.log('   Doctor Verified:', response.data.doctorVerified);
    
    if (response.data.doctorVerified === true) {
      console.log('✅ Reply correctly marked as doctor verified');
      return true;
    } else {
      console.log('❌ Reply should be marked as doctor verified');
      return false;
    }
  } catch (error) {
    console.log('❌ Reply failed:', error.response?.data || error.message);
    return false;
  }
}

async function runTests() {
  console.log('🏥 DOCTOR AUTHENTICATION FLOW TEST');
  console.log('===================================');
  console.log('API URL:', API_URL);
  console.log('Starting tests...\n');
  
  const results = {
    registration: false,
    login: false,
    pendingBlock: false,
    approvedReply: false
  };
  
  // Test 1: Registration
  results.registration = await testDoctorRegistration();
  await sleep(1000);
  
  // Test 2: Login
  if (results.registration) {
    results.login = await testDoctorLogin();
    await sleep(1000);
  }
  
  // Setup patient and thread
  if (results.login) {
    const setupSuccess = await testPatientSetup();
    await sleep(1000);
    
    // Test 3: Pending doctor blocked
    if (setupSuccess) {
      results.pendingBlock = await testPendingDoctorReply();
      await sleep(1000);
      
      // Test 4: Approved doctor allowed (manual step)
      // results.approvedReply = await testApprovedDoctorReply();
    }
  }
  
  // Summary
  console.log('\n📊 TEST SUMMARY');
  console.log('================================');
  console.log('Registration:', results.registration ? '✅ PASS' : '❌ FAIL');
  console.log('Login:', results.login ? '✅ PASS' : '❌ FAIL');
  console.log('Pending Block:', results.pendingBlock ? '✅ PASS' : '❌ FAIL');
  console.log('Approved Reply:', results.approvedReply ? '✅ PASS' : '⏭️  SKIPPED');
  
  const passCount = Object.values(results).filter(r => r === true).length;
  const totalTests = 3; // Excluding manual test
  
  console.log(`\nPassed: ${passCount}/${totalTests}`);
  
  if (passCount === totalTests) {
    console.log('\n🎉 All automated tests passed!');
  } else {
    console.log('\n⚠️  Some tests failed. Check the output above.');
  }
  
  console.log('\n📝 Test Data:');
  console.log('   Doctor Email:', testDoctor.email);
  console.log('   Doctor ID:', doctorUserId);
  console.log('   Thread ID:', threadId);
}

// Run tests
runTests().catch(console.error);
