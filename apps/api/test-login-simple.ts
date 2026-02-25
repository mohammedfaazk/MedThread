import axios from 'axios';

async function testLogin() {
  try {
    const response = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'admin@medthread.com',
      password: 'admin123'
    });
    
    console.log('✅ Login successful');
    console.log('Full response:', JSON.stringify(response.data, null, 2));
  } catch (error: any) {
    console.log('❌ Login failed');
    console.log('Status:', error.response?.status);
    console.log('Data:', JSON.stringify(error.response?.data, null, 2));
  }
}

testLogin();
