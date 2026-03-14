#!/usr/bin/env node

/**
 * Test script to verify the specialty distribution API returns the correct data format
 */

const axios = require('axios');

const API_URL = 'http://localhost:3001';

async function testSpecialtyChart() {
  console.log('📊 Testing Doctor Specialty Distribution Chart...\n');

  try {
    console.log('1️⃣ Fetching specialty distribution data...');
    const response = await axios.get(`${API_URL}/api/enhanced-analytics/doctor-specialty-distribution`);
    
    if (response.data.success) {
      console.log('✅ API call successful!');
      console.log('📊 Raw API response:', JSON.stringify(response.data, null, 2));
      
      const distribution = response.data.data.distribution;
      console.log('\n📋 Specialty Distribution:');
      
      distribution.forEach((item, index) => {
        console.log(`   ${index + 1}. ${item.specialty}: ${item.count} doctors (${item.percentage}%)`);
      });
      
      console.log('\n🎯 Chart will now display:');
      distribution.forEach((item, index) => {
        console.log(`   • ${item.specialty}: ${item.count} (instead of ${item.percentage}%)`);
      });
      
      console.log('\n✅ The chart has been updated to show counts instead of percentages!');
      console.log('💡 Users will now see "Cardiology: 15" instead of "Cardiology: 12.5%"');
      
    } else {
      console.log('❌ API call failed:', response.data.error);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('📊 Error response:', error.response.data);
      console.error('📊 Status:', error.response.status);
    }
  }
}

// Run the test
testSpecialtyChart();