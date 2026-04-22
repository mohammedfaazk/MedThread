import axios from 'axios';

async function testPendingAPI() {
  console.log('🧪 Testing Pending Doctors API...\n');

  try {
    // First, login as admin to get token
    const loginRes = await axios.post('http://localhost:3001/api/v1/auth/login', {
      email: 'admin@medthread.com',
      password: 'admin123'
    });

    const token = loginRes.data.data.token;
    console.log('✅ Admin logged in successfully\n');

    // Get pending verifications
    const pendingRes = await axios.get(
      'http://localhost:3001/api/v1/doctor-verification/pending',
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    console.log('📋 Pending Doctors from API:\n');
    const doctors = pendingRes.data.data.requests || [];
    
    doctors.forEach((doctor: any) => {
      console.log(`Doctor: ${doctor.username}`);
      console.log(`  Email: ${doctor.email}`);
      console.log(`  Specialty: ${doctor.specialty}`);
      console.log(`  Medical University: ${doctor.medicalUniversity || '❌ NOT RETURNED'}`);
      console.log(`  Graduation Year: ${doctor.graduationYear || '❌ NOT RETURNED'}`);
      console.log('');
    });

    if (doctors.length === 0) {
      console.log('❌ No pending doctors returned from API!');
    }

  } catch (error: any) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testPendingAPI();
