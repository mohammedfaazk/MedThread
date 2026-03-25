import axios from 'axios';

const API_URL = 'http://localhost:3001';

async function testSimple() {
  console.log('=== Simple AI Detective Test ===\n');

  // Login
  const login = await axios.post(`${API_URL}/api/auth/login`, {
    email: 'navin@gmail.com',
    password: 'navin123'
  });
  const token = login.data.data.token;
  console.log('✓ Logged in\n');

  // Test with simple symptoms
  console.log('Testing with: fever, cough, headache');
  const response = await axios.post(
    `${API_URL}/api/v1/ai-detective/analyze`,
    {
      userId: login.data.data.user.id,
      symptoms: ['fever', 'cough', 'headache'],
      severities: ['moderate', 'mild', 'moderate'],
      durations: ['2 days', '2 days', '2 days']
    },
    { headers: { Authorization: `Bearer ${token}` } }
  );

  console.log('\nFull Response:');
  console.log(JSON.stringify(response.data, null, 2));
  
  console.log('\n\nNumber of diagnoses:', response.data.diagnoses?.length || 0);
  
  if (response.data.diagnoses && response.data.diagnoses.length > 0) {
    console.log('\nFirst diagnosis:');
    console.log('- Condition:', response.data.diagnoses[0].condition);
    console.log('- Probability:', response.data.diagnoses[0].probability);
    console.log('- Urgency:', response.data.diagnoses[0].urgency);
    console.log('- Reasoning:', response.data.diagnoses[0].reasoning);
    console.log('- Recommendations:', response.data.diagnoses[0].recommendations);
  }
}

testSimple().catch(console.error);
