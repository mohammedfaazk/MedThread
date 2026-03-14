#!/usr/bin/env node

const axios = require('axios');

const API_URL = 'http://localhost:3001';

async function testAdminAnalytics() {
  try {
    console.log('🧪 Testing Admin Analytics API...\n');

    // Test the top-doctors endpoint
    console.log('📊 Testing /api/enhanced-analytics/top-doctors endpoint...');
    const response = await axios.get(`${API_URL}/api/enhanced-analytics/top-doctors?limit=5`);
    
    if (response.data.success && response.data.data) {
      console.log('✅ API Response Structure: CORRECT');
      console.log(`📈 Found ${response.data.data.length} doctors`);
      
      // Display doctor information
      response.data.data.forEach((doctor, index) => {
        console.log(`\n${index + 1}. ${doctor.username}`);
        console.log(`   Specialty: ${doctor.specialty}`);
        console.log(`   Patients Cured: ${doctor.curedPatientCount}`);
        console.log(`   Conversions: ${doctor.conversionCount}`);
        console.log(`   Portfolio Score: ${doctor.portfolioScore}`);
        console.log(`   Helpfulness: ${doctor.helpfulnessScore}`);
      });
      
      console.log('\n✅ Admin Analytics API is working correctly!');
      console.log('🎯 The frontend should now display these doctors in /admin/analytics');
      
    } else {
      console.log('❌ API Response Structure: INCORRECT');
      console.log('Response:', JSON.stringify(response.data, null, 2));
    }

  } catch (error) {
    console.error('❌ Error testing admin analytics:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testAdminAnalytics();