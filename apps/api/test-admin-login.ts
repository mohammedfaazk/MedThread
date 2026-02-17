import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const API_URL = 'http://localhost:3001/api';

async function testAdminLogin() {
  console.log('🔐 Testing Admin Login...\n');

  try {
    // Test admin login
    console.log('Attempting login with: admin@medthread.com / Admin@123456');
    
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@medthread.com',
      password: 'Admin@123456',
    });

    console.log('\n✅ Login successful!');
    console.log('Full response:', JSON.stringify(response.data, null, 2));
    
    const token = response.data.token || response.data.data?.token;
    const user = response.data.user || response.data.data?.user;
    
    console.log('\nToken:', token?.substring(0, 20) + '...');
    console.log('User:', user);
    console.log('Role:', user?.role);

    if (user?.role === 'ADMIN') {
      console.log('\n✅ Admin role confirmed!');
    } else {
      console.log('\n❌ User is not an admin');
    }

  } catch (error: any) {
    console.error('\n❌ Login failed!');
    console.error('Error:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n💡 Possible issues:');
      console.log('  1. Password might be incorrect');
      console.log('  2. Admin user might not exist');
      console.log('  3. Password hash might be corrupted');
    }
  }
}

testAdminLogin();
