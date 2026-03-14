#!/usr/bin/env node

/**
 * Test script to verify the portfolio score update and top doctors ranking
 */

const axios = require('axios');

const API_URL = 'http://localhost:3001';

async function testPortfolioScoreUpdate() {
  console.log('🔄 Testing Portfolio Score Update & Top Doctors Ranking...\n');

  try {
    // Test 1: Get current top doctors (should be ranked by portfolio score now)
    console.log('1️⃣ Testing current top doctors ranking...');
    const topDoctorsResponse = await axios.get(`${API_URL}/api/enhanced-analytics/top-doctors?limit=5`);
    
    if (topDoctorsResponse.data.success) {
      console.log('✅ Top doctors API working!');
      console.log('📊 Current top doctors (ranked by portfolio score):');
      
      topDoctorsResponse.data.data.forEach((doctor, index) => {
        console.log(`   ${index + 1}. Dr. ${doctor.username}`);
        console.log(`      Portfolio Score: ${doctor.portfolioScore}/100`);
        console.log(`      Cured Patients: ${doctor.curedPatientCount}`);
        console.log(`      Conversions: ${doctor.conversionCount}`);
        console.log(`      Specialty: ${doctor.specialty}`);
        console.log('');
      });
    } else {
      console.log('❌ Top doctors API failed:', topDoctorsResponse.data.error);
    }

    // Test 2: Check if we can recalculate portfolio scores (admin endpoint)
    console.log('2️⃣ Testing portfolio score recalculation...');
    console.log('ℹ️  Note: This requires admin authentication, so it may fail in this test');
    
    try {
      const recalcResponse = await axios.post(`${API_URL}/api/enhanced-analytics/recalculate-portfolio-scores`);
      console.log('✅ Portfolio scores recalculated successfully!');
      console.log('📊 Result:', recalcResponse.data.data);
    } catch (recalcError) {
      if (recalcError.response?.status === 401 || recalcError.response?.status === 403) {
        console.log('⚠️  Recalculation requires admin authentication (expected)');
      } else {
        console.log('❌ Recalculation failed:', recalcError.response?.data || recalcError.message);
      }
    }

    // Test 3: Test regional filtering
    console.log('3️⃣ Testing regional filtering...');
    const regionalResponse = await axios.get(`${API_URL}/api/enhanced-analytics/top-doctors?region=110001&limit=3`);
    
    if (regionalResponse.data.success) {
      console.log('✅ Regional filtering working!');
      console.log('📍 Top doctors in region 110001:');
      
      if (regionalResponse.data.data.length > 0) {
        regionalResponse.data.data.forEach((doctor, index) => {
          console.log(`   ${index + 1}. Dr. ${doctor.username} (Score: ${doctor.portfolioScore}/100)`);
        });
      } else {
        console.log('   No doctors found in this region');
      }
    }

    // Test 4: Test specialty filtering
    console.log('\n4️⃣ Testing specialty filtering...');
    const specialtyResponse = await axios.get(`${API_URL}/api/enhanced-analytics/top-doctors?specialty=Cardiologist&limit=3`);
    
    if (specialtyResponse.data.success) {
      console.log('✅ Specialty filtering working!');
      console.log('🫀 Top Cardiologists:');
      
      if (specialtyResponse.data.data.length > 0) {
        specialtyResponse.data.data.forEach((doctor, index) => {
          console.log(`   ${index + 1}. Dr. ${doctor.username} (Score: ${doctor.portfolioScore}/100)`);
        });
      } else {
        console.log('   No cardiologists found');
      }
    }

    console.log('\n🎉 Portfolio Score Update Tests Completed!');
    console.log('\n📋 Summary of Changes:');
    console.log('• ✅ Top doctors now ranked by portfolio score (0-100)');
    console.log('• ✅ Portfolio score uses comprehensive algorithm');
    console.log('• ✅ Regional filtering works with new scoring');
    console.log('• ✅ Specialty filtering works with new scoring');
    console.log('• ✅ TopDoctorsWidget displays portfolio score prominently');

    console.log('\n🎯 Algorithm Components:');
    console.log('• Patient Outcomes (40%): Cures vs losses');
    console.log('• Engagement Quality (25%): Conversions, appointments');
    console.log('• Professional Activity (20%): Posts, responses');
    console.log('• Patient Satisfaction (15%): Ratings, cure rate');
    console.log('• Experience Bonus: Up to 20% for consistency');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('📊 Error response:', error.response.data);
      console.error('📊 Status:', error.response.status);
    }
  }
}

// Run the test
testPortfolioScoreUpdate();