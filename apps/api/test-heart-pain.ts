import axios from 'axios';

const API_URL = 'http://localhost:3001';

async function testHeartPain() {
  console.log('=== Testing Heart Pain + Headache ===\n');

  // Login
  const login = await axios.post(`${API_URL}/api/auth/login`, {
    email: 'navin@gmail.com',
    password: 'navin123'
  });
  const token = login.data.data.token;
  console.log('✓ Logged in\n');

  // Test with heart pain and headache
  console.log('Testing with: headache, heart pain');
  const response = await axios.post(
    `${API_URL}/api/v1/ai-detective/analyze`,
    {
      userId: login.data.data.user.id,
      symptoms: ['headache', 'heart pain'],
      severities: ['severe', 'severe'],
      durations: ['3 days', '3 days']
    },
    { headers: { Authorization: `Bearer ${token}` } }
  );

  console.log('\nResponse:');
  console.log('Number of diagnoses:', response.data.diagnoses?.length || 0);
  
  if (response.data.diagnoses && response.data.diagnoses.length > 0) {
    response.data.diagnoses.forEach((d: any, i: number) => {
      console.log(`\n${i + 1}. ${d.condition}`);
      console.log(`   Probability: ${(d.probability * 100).toFixed(0)}%`);
      console.log(`   Urgency: ${d.urgency}`);
      console.log(`   Reasoning: ${d.reasoning[0]}`);
      console.log(`   When to Seek Care: ${d.whenToSeekCare}`);
    });
  } else {
    console.log('\n❌ NO DIAGNOSES RETURNED');
    console.log('Full response:', JSON.stringify(response.data, null, 2));
  }
}

testHeartPain().catch(console.error);
