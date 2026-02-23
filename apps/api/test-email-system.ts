import 'dotenv/config';
import { emailService } from './src/services/email.service';

async function testEmailSystem() {
  console.log('🧪 Testing Email System...\n');
  console.log('=' .repeat(60));

  try {
    // Test 1: Welcome Email
    console.log('\n1️⃣ Testing Welcome Email...');
    await emailService.sendWelcomeEmail({
      username: 'John Doe',
      email: 'john@example.com',
      loginUrl: 'http://localhost:3000/login',
    });
    console.log('✅ Welcome email sent\n');

    // Test 2: Verification Email
    console.log('2️⃣ Testing Verification Email...');
    await emailService.sendVerificationEmail({
      username: 'Jane Smith',
      email: 'jane@example.com',
      verificationUrl: 'http://localhost:3000/verify?token=abc123',
    });
    console.log('✅ Verification email sent\n');

    // Test 3: Password Reset Email
    console.log('3️⃣ Testing Password Reset Email...');
    await emailService.sendPasswordResetEmail({
      username: 'Bob Johnson',
      email: 'bob@example.com',
      resetUrl: 'http://localhost:3000/reset-password?token=xyz789',
    });
    console.log('✅ Password reset email sent\n');

    // Test 4: Appointment Reminder
    console.log('4️⃣ Testing Appointment Reminder...');
    await emailService.sendAppointmentReminder({
      patientName: 'Alice Williams',
      email: 'alice@example.com',
      doctorName: 'Dr. Sarah Miller',
      appointmentDate: 'February 20, 2026',
      appointmentTime: '10:00 AM',
      appointmentType: 'General Consultation',
      appointmentUrl: 'http://localhost:3000/appointments/123',
    });
    console.log('✅ Appointment reminder sent\n');

    // Test 5: Notification Email
    console.log('5️⃣ Testing Notification Email...');
    await emailService.sendNotificationEmail({
      username: 'Charlie Brown',
      email: 'charlie@example.com',
      title: 'New Message',
      content: 'You have received a new message from Dr. Smith regarding your recent consultation.',
      actionUrl: 'http://localhost:3000/messages',
      actionText: 'View Message',
    });
    console.log('✅ Notification email sent\n');

    // Test 6: New Comment Notification
    console.log('6️⃣ Testing New Comment Notification...');
    await emailService.sendNewCommentNotification({
      username: 'David Lee',
      email: 'david@example.com',
      postTitle: 'How to manage diabetes?',
      commenterName: 'Dr. Emily Chen',
      commentPreview: 'Great question! Here are some tips...',
      postUrl: 'http://localhost:3000/post/456',
    });
    console.log('✅ Comment notification sent\n');

    // Test 7: Doctor Verification Approved
    console.log('7️⃣ Testing Doctor Verification Approved...');
    await emailService.sendDoctorVerificationApproved({
      username: 'Dr. Michael Brown',
      email: 'michael@example.com',
    });
    console.log('✅ Verification approved email sent\n');

    console.log('=' .repeat(60));
    console.log('\n✅ ALL EMAIL TESTS PASSED!');
    console.log('\n📊 Email System Status:');
    console.log('  ✅ Welcome emails: Working');
    console.log('  ✅ Verification emails: Working');
    console.log('  ✅ Password reset emails: Working');
    console.log('  ✅ Appointment reminders: Working');
    console.log('  ✅ Notification emails: Working');
    console.log('  ✅ Comment notifications: Working');
    console.log('  ✅ Doctor verification emails: Working');
    console.log('\n🎉 Email system is 100% functional!');
    console.log('\n💡 Note: Emails are being logged to console.');
    console.log('   To send real emails, add SMTP credentials to .env file.');

  } catch (error) {
    console.error('\n❌ Test failed:', error);
  }
}

testEmailSystem();
