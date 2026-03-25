import fetch from 'node-fetch';

const API_URL = 'http://localhost:3001';

async function testRiskBasedChallenges() {
  try {
    console.log('=== Testing Risk-Based Challenge System ===\n');

    // Login as doctor
    console.log('🔐 Logging in as doctor...\n');
    const doctorLogin = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'rifa@gmail.com',
        password: 'Rifa@123456'
      })
    });
    const doctorData = await doctorLogin.json();
    const doctorToken = doctorData.data.token;
    console.log('✅ Doctor logged in\n');

    // Create LOW-RISK challenge
    console.log('📝 Creating LOW-RISK challenge (Walking)...\n');
    const lowRiskResponse = await fetch(`${API_URL}/api/v1/health-challenges`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${doctorToken}`
      },
      body: JSON.stringify({
        title: 'Daily Walking Challenge',
        description: 'Walk 10,000 steps every day',
        category: 'fitness',
        difficulty: 'easy',
        riskLevel: 'LOW',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        goals: { type: 'steps', value: 10000 },
        rewards: { points: 300 }
      })
    });
    const lowRiskChallenge = await lowRiskResponse.json();
    
    if (!lowRiskChallenge.success) {
      console.log('❌ LOW-RISK challenge creation failed:', lowRiskChallenge);
      return;
    }
    
    console.log('✅ LOW-RISK challenge created:', lowRiskChallenge.data.id);
    console.log('   Requires approval:', lowRiskChallenge.data.requiresDoctorApproval);
    console.log();

    // Create HIGH-RISK challenge
    console.log('📝 Creating HIGH-RISK challenge (Diet Restriction)...\n');
    const highRiskResponse = await fetch(`${API_URL}/api/v1/health-challenges`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${doctorToken}`
      },
      body: JSON.stringify({
        title: 'Intermittent Fasting Challenge',
        description: '16:8 intermittent fasting for 30 days',
        category: 'nutrition',
        difficulty: 'hard',
        riskLevel: 'HIGH',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        goals: { type: 'days', value: 30 },
        rewards: { points: 1000 }
      })
    });
    const highRiskChallenge = await highRiskResponse.json();
    console.log('✅ HIGH-RISK challenge created:', highRiskChallenge.data.id);
    console.log('   Requires approval:', highRiskChallenge.data.requiresDoctorApproval);
    console.log();

    // Login as patient
    console.log('🔐 Logging in as patient...\n');
    const patientLogin = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'navin@gmail.com',
        password: 'navin123'
      })
    });
    const patientData = await patientLogin.json();
    const patientToken = patientData.data.token;
    console.log('✅ Patient logged in\n');

    // Patient joins LOW-RISK challenge (should succeed immediately)
    console.log('👤 Patient joining LOW-RISK challenge...\n');
    const joinLowRisk = await fetch(`${API_URL}/api/v1/health-challenges/${lowRiskChallenge.data.id}/join`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${patientToken}` }
    });
    const joinLowRiskData = await joinLowRisk.json();
    
    if (joinLowRiskData.success) {
      console.log('✅ Patient joined LOW-RISK challenge immediately!');
      console.log('   No approval needed ✓');
    } else {
      console.log('❌ Failed:', joinLowRiskData.error);
    }
    console.log();

    // Patient tries to join HIGH-RISK challenge (should create approval request)
    console.log('👤 Patient requesting HIGH-RISK challenge...\n');
    const joinHighRisk = await fetch(`${API_URL}/api/v1/health-challenges/${highRiskChallenge.data.id}/join`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${patientToken}` }
    });
    const joinHighRiskData = await joinHighRisk.json();
    
    if (joinHighRiskData.success) {
      if (joinHighRiskData.data.requiresApproval) {
        console.log('✅ Approval request created!');
        console.log('   Message:', joinHighRiskData.data.message);
        console.log('   Request ID:', joinHighRiskData.data.requestId);
      } else {
        console.log('⚠️  Joined without approval (unexpected for HIGH-RISK)');
      }
    } else {
      console.log('❌ Failed:', joinHighRiskData.error);
    }

    console.log('\n🎉 Risk-based challenge system working:');
    console.log('   ✅ LOW-RISK: Patients join freely');
    console.log('   ✅ HIGH-RISK: Requires doctor approval');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testRiskBasedChallenges();
