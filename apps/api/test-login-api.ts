import axios from 'axios';

async function testLogin() {
  console.log('\n🔐 Testing Login API\n');
  console.log('═'.repeat(60));

  const API_URL = 'http://localhost:3001';
  
  const testCases = [
    {
      name: 'Correct password (Rifa@123)',
      email: 'rifa@gmail.com',
      password: 'Rifa@123'
    },
    {
      name: 'Wrong password (rifa123)',
      email: 'rifa@gmail.com',
      password: 'rifa123'
    },
    {
      name: 'Wrong password (Rifa123)',
      email: 'rifa@gmail.com',
      password: 'Rifa123'
    }
  ];

  for (const testCase of testCases) {
    console.log(`\n📝 Test: ${testCase.name}`);
    console.log(`   Email: ${testCase.email}`);
    console.log(`   Password: ${testCase.password}`);
    
    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        email: testCase.email,
        password: testCase.password
      });

      console.log(`   ✅ Status: ${response.status}`);
      console.log(`   Response:`, JSON.stringify(response.data, null, 2));
      
      if (response.data.success) {
        console.log(`   🎉 LOGIN SUCCESSFUL!`);
        console.log(`   Token: ${response.data.data.token.substring(0, 30)}...`);
        console.log(`   User: ${response.data.data.user.username} (${response.data.data.user.role})`);
      }
      
    } catch (error: any) {
      if (error.response) {
        console.log(`   ❌ Status: ${error.response.status}`);
        console.log(`   Error:`, JSON.stringify(error.response.data, null, 2));
      } else if (error.request) {
        console.log(`   ❌ No response from server`);
        console.log(`   Error: ${error.message}`);
      } else {
        console.log(`   ❌ Error: ${error.message}`);
      }
    }
    
    console.log('   ' + '-'.repeat(56));
  }

  console.log('\n═'.repeat(60));
  console.log('\n✨ Test complete!\n');
}

testLogin().catch(console.error);
