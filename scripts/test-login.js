const axios = require('axios');

const API_URL = 'http://localhost:3001';

const testCredentials = [
  { email: 'dr.sarah.chen@medthread.com', password: 'doctor123', name: 'Dr. Sarah Chen' },
  { email: 'dr.michael.rodriguez@medthread.com', password: 'doctor123', name: 'Dr. Michael Rodriguez' },
  { email: 'dr.emily.watson@medthread.com', password: 'doctor123', name: 'Dr. Emily Watson' },
  { email: 'dr.james.thompson@medthread.com', password: 'doctor123', name: 'Dr. James Thompson' },
  { email: 'dr.lisa.patel@medthread.com', password: 'doctor123', name: 'Dr. Lisa Patel' },
  { email: 'patient1@example.com', password: 'password123', name: 'Alex Johnson (Patient)' },
  { email: 'patient2@example.com', password: 'password123', name: 'Maria Garcia (Patient)' },
  { email: 'patient3@example.com', password: 'password123', name: 'David Kim (Patient)' }
];

async function testLogin(email, password, name) {
  try {
    console.log(`\n🔐 Testing login for ${name}...`);
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    
    const response = await axios.post(`${API_URL}/api/auth/login`, {
      email,
      password
    });
    
    if (response.data.success) {
      console.log(`   ✅ SUCCESS - ${response.data.data.user.username} (${response.data.data.user.role})`);
      return true;
    } else {
      console.log(`   ❌ FAILED - ${response.data.message || 'Unknown error'}`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ ERROR - ${error.response?.data?.error || error.message}`);
    return false;
  }
}

async function testAllLogins() {
  console.log('🧪 Testing all seeded user credentials...\n');
  
  let successCount = 0;
  let totalCount = testCredentials.length;
  
  for (const cred of testCredentials) {
    const success = await testLogin(cred.email, cred.password, cred.name);
    if (success) successCount++;
  }
  
  console.log(`\n📊 Results: ${successCount}/${totalCount} logins successful`);
  
  if (successCount === totalCount) {
    console.log('🎉 All credentials work! The issue is likely in the frontend.');
  } else {
    console.log('⚠️  Some credentials failed. Check the database seeding.');
  }
}

testAllLogins().catch(console.error);