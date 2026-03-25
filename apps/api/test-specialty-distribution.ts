import axios from 'axios';

const API_URL = 'http://localhost:3001';

async function testSpecialtyDistribution() {
  try {
    console.log('Testing specialty distribution endpoint...\n');
    
    const response = await axios.get(`${API_URL}/api/enhanced-analytics/doctor-specialty-distribution`);
    
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    if (response.data.success) {
      console.log('\n✓ Data retrieved successfully');
      console.log('Distribution:', response.data.data.distribution);
    }
  } catch (error: any) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testSpecialtyDistribution();
