/**
 * Test Predictions API
 */

import axios from 'axios';

const API_URL = 'http://localhost:3001';

async function testPredictionsAPI() {
  console.log('🧪 Testing Predictions API...\n');

  try {
    // Test with navin's user ID
    const userId = 'cmmt5kn0e0002ztoyh2g3afz6';
    
    console.log(`1️⃣ Fetching predictions for user: ${userId}`);
    
    const response = await axios.get(
      `${API_URL}/api/health-risk/predictions/${userId}`,
      {
        headers: {
          'Authorization': 'Bearer fake-token-for-testing'
        },
        validateStatus: () => true // Don't throw on any status
      }
    );

    console.log(`\nStatus: ${response.status}`);
    console.log(`\nResponse:`);
    console.log(JSON.stringify(response.data, null, 2));

    if (response.data.success && response.data.predictions) {
      console.log(`\n✅ Found ${response.data.predictions.length} predictions`);
      
      response.data.predictions.forEach((pred: any, index: number) => {
        console.log(`\nPrediction ${index + 1}:`);
        console.log(`  - Disease: ${pred.disease}`);
        console.log(`  - Risk Level: ${pred.riskLevel}`);
        console.log(`  - Risk Score: ${pred.riskScore}%`);
        console.log(`  - Risk Percentage: ${pred.riskPercentage}%`);
      });
    }

  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
}

testPredictionsAPI();
