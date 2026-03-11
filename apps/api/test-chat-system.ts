import axios from 'axios';

const API_URL = 'http://localhost:3001';

async function testChatSystem() {
  try {
    console.log('💬 Testing Chat System Issues\n');
    console.log('='.repeat(60));

    // Step 1: Login as doctor
    console.log('1. 🩺 Doctor login...');
    const doctorLogin = await axios.post(`${API_URL}/api/auth/login`, {
      email: 'rifa@gmail.com',
      password: 'Doctor@123456'
    });
    const { token: doctorToken, user: doctorUser } = doctorLogin.data.data || doctorLogin.data;
    console.log(`   ✅ Doctor logged in: ${doctorUser.username} (${doctorUser.role})`);
    console.log(`   🔍 Doctor verification status: ${doctorUser.doctorVerificationStatus || 'Not set'}`);

    // Step 2: Login as patient
    console.log('\n2. 👤 Patient login...');
    const patientLogin = await axios.post(`${API_URL}/api/auth/login`, {
      email: 'navin@gmail.com',
      password: 'Patient@123456'
    });
    const { token: patientToken, user: patientUser } = patientLogin.data.data || patientLogin.data;
    console.log(`   ✅ Patient logged in: ${patientUser.username} (${patientUser.role})`);

    // Step 3: Check doctor's conversations
    console.log('\n3. 📋 Checking doctor\'s conversations...');
    try {
      const doctorConversations = await axios.get(`${API_URL}/api/v2/chat/conversations`, {
        headers: { 'Authorization': `Bearer ${doctorToken}` }
      });
      console.log(`   ✅ Doctor has ${doctorConversations.data.length} conversations`);
      doctorConversations.data.forEach((conv: any, index: number) => {
        console.log(`     ${index + 1}. ID: ${conv.id}`);
        console.log(`        Appointment: ${conv.appointment ? 'YES' : 'NO'}`);
        console.log(`        Active: ${conv.isActive ? 'YES' : 'NO'}`);
        if (conv.appointment) {
          console.log(`        Appointment Status: ${conv.appointment.status}`);
          console.log(`        Doctor Verified: ${conv.appointment.doctor?.doctorVerificationStatus || 'Unknown'}`);
        }
      });
    } catch (error: any) {
      console.log(`   ❌ Error fetching doctor conversations: ${error.response?.data?.error || error.message}`);
    }

    // Step 4: Check patient's conversations
    console.log('\n4. 📋 Checking patient\'s conversations...');
    try {
      const patientConversations = await axios.get(`${API_URL}/api/v2/chat/conversations`, {
        headers: { 'Authorization': `Bearer ${patientToken}` }
      });
      console.log(`   ✅ Patient has ${patientConversations.data.length} conversations`);
      patientConversations.data.forEach((conv: any, index: number) => {
        console.log(`     ${index + 1}. ID: ${conv.id}`);
        console.log(`        Appointment: ${conv.appointment ? 'YES' : 'NO'}`);
        console.log(`        Active: ${conv.isActive ? 'YES' : 'NO'}`);
        if (conv.appointment) {
          console.log(`        Appointment Status: ${conv.appointment.status}`);
        }
      });
    } catch (error: any) {
      console.log(`   ❌ Error fetching patient conversations: ${error.response?.data?.error || error.message}`);
    }

    // Step 5: Check appointments
    console.log('\n5. 📅 Checking appointments...');
    try {
      const doctorAppointments = await axios.get(`${API_URL}/api/appointments/appointments?userId=${doctorUser.id}&role=doctor`);
      console.log(`   ✅ Doctor has ${doctorAppointments.data.length} appointments`);
      doctorAppointments.data.forEach((apt: any, index: number) => {
        console.log(`     ${index + 1}. ID: ${apt.id}`);
        console.log(`        Status: ${apt.status}`);
        console.log(`        Patient: ${apt.patient?.username || 'Unknown'}`);
        console.log(`        Time: ${apt.startTime}`);
      });

      const patientAppointments = await axios.get(`${API_URL}/api/appointments/appointments?userId=${patientUser.id}&role=patient`);
      console.log(`   ✅ Patient has ${patientAppointments.data.length} appointments`);
      patientAppointments.data.forEach((apt: any, index: number) => {
        console.log(`     ${index + 1}. ID: ${apt.id}`);
        console.log(`        Status: ${apt.status}`);
        console.log(`        Doctor: ${apt.doctor?.username || 'Unknown'}`);
        console.log(`        Time: ${apt.startTime}`);
      });
    } catch (error: any) {
      console.log(`   ❌ Error fetching appointments: ${error.response?.data?.error || error.message}`);
    }

    // Step 6: Try to create a test conversation/appointment
    console.log('\n6. 🔧 Attempting to create test appointment...');
    try {
      const appointmentData = {
        doctorId: doctorUser.id,
        patientId: patientUser.id,
        startTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour from now
        endTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
        reason: 'Test consultation for chat system',
        status: 'APPROVED'
      };

      const createAppointment = await axios.post(`${API_URL}/api/appointments/appointments`, appointmentData, {
        headers: { 'Authorization': `Bearer ${patientToken}` }
      });
      
      console.log(`   ✅ Test appointment created: ${createAppointment.data.id}`);
      console.log(`   📋 Status: ${createAppointment.data.status}`);
      
    } catch (error: any) {
      console.log(`   ❌ Error creating appointment: ${error.response?.data?.error || error.message}`);
      console.log(`   📋 Status: ${error.response?.status}`);
      console.log(`   📋 Details:`, error.response?.data);
    }

    console.log('\n' + '='.repeat(60));
    console.log('🎯 CHAT SYSTEM ANALYSIS COMPLETED');
    console.log('='.repeat(60));

  } catch (error: any) {
    console.log('\n❌ CRITICAL ERROR:');
    console.log('Status:', error.response?.status);
    console.log('Message:', error.response?.data?.error || error.message);
  }
}

testChatSystem();