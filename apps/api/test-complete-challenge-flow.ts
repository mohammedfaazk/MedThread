import axios from 'axios';

const API_URL = 'http://localhost:3001';

async function testCompleteChallengeFlow() {
  console.log('=== Testing Complete Challenge Flow ===\n');

  // Login as doctor (rifa@gmail.com)
  console.log('1. Logging in as doctor (rifa@gmail.com)...');
  const doctorLogin = await axios.post(`${API_URL}/api/auth/login`, {
    email: 'rifa@gmail.com',
    password: 'Rifa@123456'
  });
  const doctorToken = doctorLogin.data.data.token;
  console.log('✓ Doctor logged in\n');

  // Create a HIGH-RISK challenge
  console.log('2. Creating HIGH-RISK challenge...');
  const createChallenge = await axios.post(
    `${API_URL}/api/v1/health-challenges`,
    {
      title: 'Intermittent Fasting Challenge',
      description: 'Fast for 16 hours daily',
      category: 'nutrition',
      difficulty: 'hard',
      riskLevel: 'HIGH',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      goals: { type: 'fasting_hours', value: 16 },
      rewards: { points: 500 }
    },
    { headers: { Authorization: `Bearer ${doctorToken}` } }
  );
  const challengeId = createChallenge.data.data.id;
  console.log(`✓ HIGH-RISK challenge created: ${challengeId}`);
  console.log(`  - requiresDoctorApproval: ${createChallenge.data.data.requiresDoctorApproval}\n`);

  // Login as patient (navin@gmail.com)
  console.log('3. Logging in as patient (navin@gmail.com)...');
  const patientLogin = await axios.post(`${API_URL}/api/auth/login`, {
    email: 'navin@gmail.com',
    password: 'navin123'
  });
  const patientToken = patientLogin.data.data.token;
  console.log('✓ Patient logged in\n');

  // Patient tries to join HIGH-RISK challenge
  console.log('4. Patient requesting to join HIGH-RISK challenge...');
  const joinResponse = await axios.post(
    `${API_URL}/api/v1/health-challenges/${challengeId}/join`,
    {},
    { headers: { Authorization: `Bearer ${patientToken}` } }
  );
  console.log('✓ Join response:', joinResponse.data);
  console.log(`  - requiresApproval: ${joinResponse.data.data.requiresApproval}`);
  console.log(`  - message: ${joinResponse.data.data.message}\n`);

  // Doctor checks pending approvals
  console.log('5. Doctor checking pending approvals...');
  const approvals = await axios.get(
    `${API_URL}/api/v1/health-challenges/approvals/pending`,
    { headers: { Authorization: `Bearer ${doctorToken}` } }
  );
  console.log(`✓ Found ${approvals.data.data.length} pending approval(s)`);
  if (approvals.data.data.length > 0) {
    console.log('  - Request ID:', approvals.data.data[0].id);
    console.log('  - Challenge ID:', approvals.data.data[0].challengeId);
    console.log('  - Patient ID:', approvals.data.data[0].patientId);
    console.log('  - Status:', approvals.data.data[0].status);
  }
  console.log();

  // Doctor approves the request
  if (approvals.data.data.length > 0) {
    const requestId = approvals.data.data[0].id;
    console.log('6. Doctor approving the request...');
    const approveResponse = await axios.post(
      `${API_URL}/api/v1/health-challenges/approvals/${requestId}/approve`,
      { notes: 'Patient is healthy enough for this challenge' },
      { headers: { Authorization: `Bearer ${doctorToken}` } }
    );
    console.log('✓ Request approved:', approveResponse.data);
  }

  console.log('\n=== Test Complete ===');
}

testCompleteChallengeFlow().catch(console.error);
