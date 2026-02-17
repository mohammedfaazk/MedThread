import 'dotenv/config';
import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

async function testAllLogins() {
  console.log('🧪 Testing All User Logins via API...\n');
  console.log('=' .repeat(80));

  const testUsers = [
    {
      email: 'admin@medthread.com',
      password: 'Admin@123456',
      role: 'ADMIN',
    },
    {
      email: 'rifa@gmail.com',
      password: 'Rifa@123',
      role: 'DOCTOR',
    },
    {
      email: 'navin@gmail.com',
      password: '12345678',
      role: 'PATIENT',
    },
  ];

  let allPassed = true;

  for (const user of testUsers) {
    console.log(`\n🔐 Testing ${user.role} login...`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Password: ${user.password}`);

    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email: user.email,
        password: user.password,
      });

      console.log(`   Response:`, JSON.stringify(response.data, null, 2));

      if (response.data.data?.token || response.data.token) {
        const token = response.data.data?.token || response.data.token;
        const userData = response.data.data?.user || response.data.user;
        
        console.log(`   ✅ Login successful!`);
        console.log(`   Token: ${token.substring(0, 20)}...`);
        console.log(`   User: ${userData.username}`);
        console.log(`   Role: ${userData.role}`);
      } else {
        console.log(`   ❌ Login failed - no token received`);
        allPassed = false;
      }
    } catch (error: any) {
      console.log(`   ❌ Login failed!`);
      if (error.response) {
        console.log(`   Error: ${error.response.data.message || error.response.statusText}`);
        console.log(`   Status: ${error.response.status}`);
      } else {
        console.log(`   Error: ${error.message}`);
      }
      allPassed = false;
    }
  }

  console.log('\n' + '=' .repeat(80));

  if (allPassed) {
    console.log('\n✅ ALL LOGINS WORKING PERFECTLY!\n');
    console.log('📋 You can now login with:');
    console.log('\nADMIN:');
    console.log('  Email: admin@medthread.com');
    console.log('  Password: Admin@123456');
    console.log('\nDOCTOR:');
    console.log('  Email: rifa@gmail.com');
    console.log('  Password: Rifa@123');
    console.log('\nPATIENT:');
    console.log('  Email: navin@gmail.com');
    console.log('  Password: 12345678');
  } else {
    console.log('\n❌ SOME LOGINS FAILED - CHECK ERRORS ABOVE\n');
  }

  console.log('\n' + '=' .repeat(80));
}

testAllLogins();
