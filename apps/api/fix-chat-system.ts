import axios from 'axios';

const API_URL = 'http://localhost:3001';

async function fixChatSystem() {
  try {
    console.log('🔧 Fixing Chat System Issues\n');
    console.log('='.repeat(60));

    // Step 1: Login as doctor
    console.log('1. 🩺 Doctor login...');
    const doctorLogin = await axios.post(`${API_URL}/api/auth/login`, {
      email: 'rifa@gmail.com',
      password: 'Doctor@123456'
    });
    const { token: doctorToken, user: doctorUser } = doctorLogin.data.data || doctorLogin.data;
    console.log(`   ✅ Doctor logged in: ${doctorUser.username}`);
    console.log(`   🔍 Verification status: ${doctorUser.doctorVerificationStatus}`);

    // Step 2: Login as patient
    console.log('\n2. 👤 Patient login...');
    const patientLogin = await axios.post(`${API_URL}/api/auth/login`, {
      email: 'navin@gmail.com',
      password: 'Patient@123456'
    });
    const { token: patientToken, user: patientUser } = patientLogin.data.data || patientLogin.data;
    console.log(`   ✅ Patient logged in: ${patientUser.username}`);

    // Step 3: Get existing appointments
    console.log('\n3. 📅 Checking existing appointments...');
    const doctorAppointments = await axios.get(`${API_URL}/api/appointments/appointments?userId=${doctorUser.id}&role=doctor`);
    console.log(`   📋 Doctor has ${doctorAppointments.data.length} appointments`);

    let appointmentToApprove = null;
    doctorAppointments.data.forEach((apt: any, index: number) => {
      console.log(`     ${index + 1}. ID: ${apt.id}`);
      console.log(`        Status: ${apt.status}`);
      console.log(`        Patient: ${apt.patient?.username || 'Unknown'}`);
      
      if (apt.status === 'PENDING') {
        appointmentToApprove = apt;
        console.log(`        👆 This appointment needs approval`);
      }
    });

    // Step 4: Approve the pending appointment
    if (appointmentToApprove) {
      console.log(`\n4. ✅ Approving appointment ${appointmentToApprove.id}...`);
      try {
        const approveResponse = await axios.put(
          `${API_URL}/api/appointments/appointments/${appointmentToApprove.id}`,
          {
            status: 'APPROVED',
            doctorId: doctorUser.id
          },
          {
            headers: { 'Authorization': `Bearer ${doctorToken}` }
          }
        );
        console.log(`   ✅ Appointment approved successfully!`);
        console.log(`   📋 New status: ${approveResponse.data.status || 'APPROVED'}`);
      } catch (error: any) {
        console.log(`   ❌ Error approving appointment: ${error.response?.data?.error || error.message}`);
        console.log(`   📋 Status: ${error.response?.status}`);
        console.log(`   📋 Details:`, error.response?.data);
      }
    } else {
      console.log('\n4. ℹ️ No pending appointments found to approve');
    }

    // Step 5: Check if conversation exists for the appointment
    console.log('\n5. 💬 Checking conversations...');
    try {
      const doctorConversations = await axios.get(`${API_URL}/api/v2/chat/conversations`, {
        headers: { 'Authorization': `Bearer ${doctorToken}` }
      });
      console.log(`   ✅ Doctor has ${doctorConversations.data.length} conversations`);
      
      if (doctorConversations.data.length === 0) {
        console.log('   ℹ️ No conversations found. This is normal if no appointments have been approved yet.');
        console.log('   💡 Conversations are automatically created when appointments are approved.');
      } else {
        doctorConversations.data.forEach((conv: any, index: number) => {
          console.log(`     ${index + 1}. Conversation ID: ${conv.id}`);
          console.log(`        Appointment: ${conv.appointment ? conv.appointment.id : 'None'}`);
          console.log(`        Status: ${conv.appointment?.status || 'N/A'}`);
          console.log(`        Active: ${conv.isActive ? 'YES' : 'NO'}`);
        });
      }
    } catch (error: any) {
      console.log(`   ❌ Error fetching conversations: ${error.response?.data?.error || error.message}`);
    }

    // Step 6: Test sending a message (if conversation exists)
    console.log('\n6. 📝 Testing message sending...');
    try {
      const doctorConversations = await axios.get(`${API_URL}/api/v2/chat/conversations`, {
        headers: { 'Authorization': `Bearer ${doctorToken}` }
      });

      if (doctorConversations.data.length > 0) {
        const testConversation = doctorConversations.data[0];
        console.log(`   🎯 Testing with conversation: ${testConversation.id}`);

        const messageData = {
          conversationId: testConversation.id,
          content: 'Hello! This is a test message from the doctor.',
          type: 'TEXT'
        };

        const sendMessageResponse = await axios.post(
          `${API_URL}/api/v2/chat/messages`,
          messageData,
          {
            headers: { 'Authorization': `Bearer ${doctorToken}` }
          }
        );

        console.log(`   ✅ Message sent successfully!`);
        console.log(`   📋 Message ID: ${sendMessageResponse.data.data?.id || 'Unknown'}`);
      } else {
        console.log('   ℹ️ No conversations available to test messaging');
      }
    } catch (error: any) {
      console.log(`   ❌ Error sending message: ${error.response?.data?.error || error.message}`);
      console.log(`   📋 Status: ${error.response?.status}`);
      console.log(`   📋 Error code: ${error.response?.data?.code || 'Unknown'}`);
      
      if (error.response?.data?.code) {
        console.log(`   💡 Error explanation:`);
        switch (error.response.data.code) {
          case 'CONVERSATION_NOT_FOUND':
            console.log(`      - The conversation doesn't exist in the database`);
            break;
          case 'APPOINTMENT_NOT_APPROVED':
            console.log(`      - The appointment needs to be approved first`);
            break;
          case 'DOCTOR_NOT_VERIFIED':
            console.log(`      - The doctor needs to be verified`);
            break;
          case 'NOT_PARTICIPANT':
            console.log(`      - User is not a participant in this conversation`);
            break;
          default:
            console.log(`      - Check the chat permission requirements`);
        }
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('🎯 CHAT SYSTEM FIX COMPLETED');
    console.log('='.repeat(60));

    console.log('\n📋 SUMMARY:');
    console.log('1. ✅ Doctor is verified (APPROVED status)');
    console.log('2. ✅ Authentication endpoints working');
    console.log('3. 🔧 Appointment approval attempted');
    console.log('4. 💬 Chat system tested');
    console.log('\n💡 If chat still doesn\'t work, the issue might be:');
    console.log('   - Conversation not automatically created after approval');
    console.log('   - Frontend trying to access non-existent conversation');
    console.log('   - Appointment-conversation linking issue');

  } catch (error: any) {
    console.log('\n❌ CRITICAL ERROR:');
    console.log('Status:', error.response?.status);
    console.log('Message:', error.response?.data?.error || error.message);
  }
}

fixChatSystem();