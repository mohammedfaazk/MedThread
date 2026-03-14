#!/usr/bin/env node

const axios = require('axios');
const jwt = require('jsonwebtoken');

const API_URL = 'http://localhost:3001';
const JWT_SECRET = process.env.JWT_SECRET || 'change-this-to-a-secure-random-string-in-production';

async function testConversionTracking() {
  console.log('🧪 Testing Conversion Rate Tracking...\n');

  try {
    // Create valid JWT tokens for testing
    const doctorId = 'cmmlhkn0900008nyjyf6x720l'; // fatima (DOCTOR)
    const patientId = 'cmmkv69yo0000p5wlnabp4ujm'; // testpatient (PATIENT)
    
    const doctorToken = jwt.sign({ userId: doctorId, role: 'DOCTOR' }, JWT_SECRET);
    const patientToken = jwt.sign({ userId: patientId, role: 'PATIENT' }, JWT_SECRET);
    
    console.log('🔑 Generated valid JWT tokens for testing');

    // Test 1: Get current doctor stats
    console.log('\n📊 Step 1: Getting current doctor stats...');
    
    const statsResponse = await axios.get(`${API_URL}/api/enhanced-analytics/doctor-stats/${doctorId}`);
    const initialStats = statsResponse.data.data;
    
    console.log('Initial conversion count:', initialStats.conversionCount);
    console.log('Initial cured patient count:', initialStats.curedPatientCount);
    console.log('Initial portfolio score:', initialStats.portfolioScore);

    // Test 2: Test direct conversion tracking API
    console.log('\n🎯 Step 2: Testing direct conversion tracking...');
    
    try {
      const conversionResponse = await axios.post(`${API_URL}/api/enhanced-analytics/track-conversion`, {
        commentId: 'test_appointment_booking',
        doctorId: doctorId,
        postId: 'test_appointment_booking',
        action: 'message_click'
      }, {
        headers: {
          'Authorization': `Bearer ${patientToken}`
        }
      });
      
      console.log('✅ Conversion tracked successfully:', conversionResponse.data);
    } catch (conversionError) {
      console.log('❌ Direct conversion tracking failed:', conversionError.response?.data || conversionError.message);
    }

    // Test 3: Test clinic visit tracking
    console.log('\n🏥 Step 3: Testing clinic visit tracking...');
    
    try {
      const clinicResponse = await axios.post(`${API_URL}/api/enhanced-analytics/track-clinic-visit`, {
        doctorId: doctorId
      }, {
        headers: {
          'Authorization': `Bearer ${patientToken}`
        }
      });
      
      console.log('✅ Clinic visit tracked successfully:', clinicResponse.data);
    } catch (clinicError) {
      console.log('❌ Clinic visit tracking failed:', clinicError.response?.data || clinicError.message);
    }

    // Test 4: Check updated stats
    console.log('\n📈 Step 4: Checking updated stats...');
    
    // Wait a moment for the update to process
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const updatedStatsResponse = await axios.get(`${API_URL}/api/enhanced-analytics/doctor-stats/${doctorId}`);
    const updatedStats = updatedStatsResponse.data.data;
    
    console.log('Updated conversion count:', updatedStats.conversionCount);
    console.log('Updated cured patient count:', updatedStats.curedPatientCount);
    console.log('Updated portfolio score:', updatedStats.portfolioScore);

    // Test 5: Check conversion increase
    const conversionIncrease = updatedStats.conversionCount - initialStats.conversionCount;
    console.log('\n🎯 Results:');
    console.log(`Conversion count increased by: ${conversionIncrease}`);
    
    if (conversionIncrease > 0) {
      console.log('✅ SUCCESS: Conversion tracking is working!');
      console.log('   - Conversion tracking correctly increased conversion count');
    } else {
      console.log('❌ ISSUE: Conversion count did not increase');
      console.log('   - Check if the tracking logic is properly implemented');
    }

    // Test 6: Simulate appointment booking and approval
    console.log('\n🏥 Step 5: Simulating appointment booking and approval...');
    
    // Book appointment
    const bookingResponse = await axios.post(`${API_URL}/api/appointments/book`, {
      patientId: patientId,
      doctorId: doctorId,
      startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
      endTime: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(), // Tomorrow + 1 hour
      reason: 'Test conversion tracking - appointment approval'
    });
    
    const appointmentId = bookingResponse.data.id;
    console.log('✅ Appointment booked:', appointmentId);

    // Try to approve appointment (this should trigger conversion tracking)
    try {
      const approvalResponse = await axios.put(`${API_URL}/api/appointments/appointments/${appointmentId}`, {
        status: 'APPROVED',
        doctorId: doctorId
      }, {
        headers: {
          'Authorization': `Bearer ${doctorToken}`
        }
      });
      
      console.log('✅ Appointment approved:', approvalResponse.data.status);
      
      // Check stats again after approval
      await new Promise(resolve => setTimeout(resolve, 1000));
      const finalStatsResponse = await axios.get(`${API_URL}/api/enhanced-analytics/doctor-stats/${doctorId}`);
      const finalStats = finalStatsResponse.data.data;
      
      const totalIncrease = finalStats.conversionCount - initialStats.conversionCount;
      console.log(`Final conversion count increase: ${totalIncrease}`);
      
    } catch (approvalError) {
      console.log('❌ Appointment approval failed:', approvalError.response?.data || approvalError.message);
      console.log('   This might be due to authentication middleware or route issues');
    }

    // Test 7: Get top doctors to see ranking impact
    console.log('\n🏆 Step 6: Checking top doctors ranking...');
    const topDoctorsResponse = await axios.get(`${API_URL}/api/enhanced-analytics/top-doctors?limit=5`);
    const topDoctors = topDoctorsResponse.data.data;
    
    console.log('Top 5 doctors by cured patient count:');
    topDoctors.forEach((doctor, index) => {
      console.log(`${index + 1}. ${doctor.username} - ${doctor.curedPatientCount} cured, ${doctor.conversionCount} conversions`);
    });

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testConversionTracking();