const axios = require('axios');

const API_URL = 'http://localhost:3001';

// Test credentials from seeded data
const testCredentials = [
  { email: 'dr.sarah.chen@medthread.com', password: 'doctor123', role: 'DOCTOR' },
  { email: 'dr.james.thompson@medthread.com', password: 'doctor123', role: 'DOCTOR' },
  { email: 'dr.lisa.patel@medthread.com', password: 'doctor123', role: 'DOCTOR' },
  { email: 'patient1@example.com', password: 'password123', role: 'PATIENT' },
  { email: 'patient2@example.com', password: 'password123', role: 'PATIENT' },
  { email: 'patient3@example.com', password: 'password123', role: 'PATIENT' }
];

// Test conversation IDs from the database check
const testConversations = [
  'cmmq3sojm00dcxu8eeol6gkge', // fitness_first + dr_lisa_patel
  'cmmq3soc100cyxu8etnjhxtds', // healthseeker_2024 + dr_lisa_patel
  'cmmq3so4j00ckxu8e83qz8llz', // wellness_warrior + dr_lisa_patel
  'cmmq3snhy00bexu8e4lenbv75', // wellness_warrior + dr_james_thompson
  'cmmq4y072000ddlvhzw8islcn'  // healthseeker_2024 + dr_james_thompson
];

async function testChatAccess() {
  console.log('=== TESTING CHAT ACCESS ===\n');
  
  // Test login for each user
  for (const cred of testCredentials) {
    try {
      console.log(`Testing login for ${cred.email} (${cred.role})...`);
      
      const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
        email: cred.email,
        password: cred.password
      });
      
      if (loginResponse.data.success) {
        const token = loginResponse.data.data.token;
        const userId = loginResponse.data.data.user.id;
        console.log(`✅ Login successful for ${cred.email}`);
        console.log(`   User ID: ${userId}`);
        console.log(`   Token: ${token.substring(0, 20)}...`);
        
        // Test chat access for first conversation
        const conversationId = testConversations[0];
        try {
          const chatResponse = await axios.get(
            `${API_URL}/api/v2/chat/conversations/${conversationId}/access`,
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          );
          
          console.log(`   Chat Access Test: ${chatResponse.data.data.allowed ? '✅ ALLOWED' : '❌ DENIED'}`);
          if (!chatResponse.data.data.allowed) {
            console.log(`   Reason: ${chatResponse.data.data.reason}`);
            console.log(`   Code: ${chatResponse.data.data.code}`);
          }
        } catch (chatError) {
          console.log(`   Chat Access Test: ❌ ERROR - ${chatError.response?.data?.error || chatError.message}`);
        }
        
      } else {
        console.log(`❌ Login failed for ${cred.email}: ${loginResponse.data.error}`);
      }
    } catch (error) {
      console.log(`❌ Login error for ${cred.email}: ${error.response?.data?.error || error.message}`);
    }
    console.log('');
  }
  
  // Test specific conversation access with correct participants
  console.log('\n=== TESTING SPECIFIC CONVERSATION ACCESS ===\n');
  
  // Login as dr_lisa_patel
  try {
    const doctorLogin = await axios.post(`${API_URL}/api/auth/login`, {
      email: 'dr.lisa.patel@medthread.com',
      password: 'doctor123'
    });
    
    if (doctorLogin.data.success) {
      const doctorToken = doctorLogin.data.data.token;
      console.log('✅ Doctor logged in successfully');
      
      // Test access to conversation with fitness_first
      const conversationId = 'cmmq3sojm00dcxu8eeol6gkge';
      
      try {
        const accessResponse = await axios.get(
          `${API_URL}/api/v2/chat/conversations/${conversationId}/access`,
          {
            headers: { Authorization: `Bearer ${doctorToken}` }
          }
        );
        
        console.log(`Doctor access to conversation ${conversationId}:`);
        console.log(`  Allowed: ${accessResponse.data.data.allowed}`);
        if (!accessResponse.data.data.allowed) {
          console.log(`  Reason: ${accessResponse.data.data.reason}`);
          console.log(`  Code: ${accessResponse.data.data.code}`);
        }
        
        // Try to get conversation details
        if (accessResponse.data.data.allowed) {
          const convResponse = await axios.get(
            `${API_URL}/api/v2/chat/conversations/${conversationId}`,
            {
              headers: { Authorization: `Bearer ${doctorToken}` }
            }
          );
          console.log(`  ✅ Successfully accessed conversation details`);
          console.log(`  Appointment ID: ${convResponse.data.data.appointmentId}`);
        }
        
      } catch (error) {
        console.log(`  ❌ Error accessing conversation: ${error.response?.data?.error || error.message}`);
      }
    }
  } catch (error) {
    console.log(`❌ Doctor login failed: ${error.response?.data?.error || error.message}`);
  }
  
  // Login as patient and test
  try {
    const patientLogin = await axios.post(`${API_URL}/api/auth/login`, {
      email: 'patient3@example.com',
      password: 'password123'
    });
    
    if (patientLogin.data.success) {
      const patientToken = patientLogin.data.data.token;
      console.log('\n✅ Patient logged in successfully');
      
      // Test access to same conversation
      const conversationId = 'cmmq3sojm00dcxu8eeol6gkge';
      
      try {
        const accessResponse = await axios.get(
          `${API_URL}/api/v2/chat/conversations/${conversationId}/access`,
          {
            headers: { Authorization: `Bearer ${patientToken}` }
          }
        );
        
        console.log(`Patient access to conversation ${conversationId}:`);
        console.log(`  Allowed: ${accessResponse.data.data.allowed}`);
        if (!accessResponse.data.data.allowed) {
          console.log(`  Reason: ${accessResponse.data.data.reason}`);
          console.log(`  Code: ${accessResponse.data.data.code}`);
        }
        
      } catch (error) {
        console.log(`  ❌ Error accessing conversation: ${error.response?.data?.error || error.message}`);
      }
    }
  } catch (error) {
    console.log(`❌ Patient login failed: ${error.response?.data?.error || error.message}`);
  }
}

testChatAccess().catch(console.error);