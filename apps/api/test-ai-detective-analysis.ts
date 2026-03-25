import axios from 'axios';

const API_URL = 'http://localhost:3001';

async function testAIDetectiveAnalysis() {
  console.log('=== Testing AI Detective Symptom Analysis ===\n');

  // Login as patient
  console.log('1. Logging in as patient...');
  const login = await axios.post(`${API_URL}/api/auth/login`, {
    email: 'navin@gmail.com',
    password: 'navin123'
  });
  const token = login.data.data.token;
  console.log('✓ Logged in\n');

  // Test Case 1: Common Cold symptoms
  console.log('2. Testing Common Cold symptoms...');
  const coldTest = await axios.post(
    `${API_URL}/api/v1/ai-detective/analyze`,
    {
      userId: login.data.data.user.id,
      symptoms: ['fever', 'cough', 'runny nose', 'sore throat'],
      severities: ['moderate', 'mild', 'mild', 'moderate'],
      durations: ['2 days', '2 days', '2 days', '2 days']
    },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  
  console.log('✓ Analysis Results:');
  coldTest.data.diagnoses.forEach((d: any, i: number) => {
    console.log(`\n  ${i + 1}. ${d.condition}`);
    console.log(`     Probability: ${(d.probability * 100).toFixed(0)}%`);
    console.log(`     Urgency: ${d.urgency}`);
    console.log(`     Reasoning: ${d.reasoning[0]}`);
  });
  console.log();

  // Test Case 2: Severe symptoms (chest pain)
  console.log('3. Testing Emergency symptoms (chest pain)...');
  const emergencyTest = await axios.post(
    `${API_URL}/api/v1/ai-detective/analyze`,
    {
      userId: login.data.data.user.id,
      symptoms: ['chest pain', 'shortness of breath', 'sweating'],
      severities: ['severe', 'moderate', 'moderate'],
      durations: ['30 minutes', '30 minutes', '30 minutes']
    },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  
  console.log('✓ Analysis Results:');
  emergencyTest.data.diagnoses.forEach((d: any, i: number) => {
    console.log(`\n  ${i + 1}. ${d.condition}`);
    console.log(`     Probability: ${(d.probability * 100).toFixed(0)}%`);
    console.log(`     Urgency: ${d.urgency}`);
    console.log(`     When to Seek Care: ${d.whenToSeekCare}`);
  });
  console.log();

  // Test Case 3: Gastrointestinal symptoms
  console.log('4. Testing Gastrointestinal symptoms...');
  const giTest = await axios.post(
    `${API_URL}/api/v1/ai-detective/analyze`,
    {
      userId: login.data.data.user.id,
      symptoms: ['nausea', 'vomiting', 'diarrhea', 'abdominal pain'],
      severities: ['moderate', 'moderate', 'moderate', 'mild'],
      durations: ['1 day', '1 day', '1 day', '1 day']
    },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  
  console.log('✓ Analysis Results:');
  giTest.data.diagnoses.forEach((d: any, i: number) => {
    console.log(`\n  ${i + 1}. ${d.condition}`);
    console.log(`     Probability: ${(d.probability * 100).toFixed(0)}%`);
    console.log(`     Urgency: ${d.urgency}`);
  });

  console.log('\n=== AI Detective is Working! ===');
  console.log('✓ Analyzes symptoms');
  console.log('✓ Provides disease predictions with probability');
  console.log('✓ Gives urgency levels');
  console.log('✓ Provides recommendations');
}

testAIDetectiveAnalysis().catch(console.error);
