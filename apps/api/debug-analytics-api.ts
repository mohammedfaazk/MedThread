/**
 * Debug Analytics API - Check what the frontend is actually receiving
 */

import axios from 'axios';

async function debug() {
  console.log('🔍 Debugging Analytics API\n');
  
  try {
    // Test what the frontend would call
    console.log('Testing frontend API path: /api/health-analytics/trending');
    const response = await axios.get('http://localhost:3000/api/health-analytics/trending?timeWindow=daily&limit=10');
    
    console.log('\n📊 Response Status:', response.status);
    console.log('📊 Response Data:', JSON.stringify(response.data, null, 2));
    
    if (response.data.success && response.data.data.length > 0) {
      console.log('\n✅ API IS WORKING!');
      console.log('Data received:', response.data.data.length, 'symptoms');
    } else {
      console.log('\n❌ API returned empty data');
    }
    
  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    
    if (error.response) {
      console.log('Response status:', error.response.status);
      console.log('Response data:', error.response.data);
    }
    
    console.log('\n🔧 Trying direct API server...');
    try {
      const directResponse = await axios.get('http://localhost:3001/api/health-analytics/trending?timeWindow=daily&limit=10');
      console.log('✅ Direct API works!');
      console.log('Data:', JSON.stringify(directResponse.data, null, 2));
    } catch (e: any) {
      console.log('❌ Direct API also failed:', e.message);
    }
  }
}

debug();
