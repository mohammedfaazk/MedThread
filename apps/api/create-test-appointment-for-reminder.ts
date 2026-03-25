import { PrismaClient } from '@medthread/database';

const prisma = new PrismaClient();

async function createTestAppointment() {
  console.log('🔍 Creating test appointment for reminder testing...\n');

  try {
    // Get a patient and doctor
    const patient = await prisma.user.findFirst({
      where: { role: 'PATIENT' }
    });

    const doctor = await prisma.user.findFirst({
      where: { 
        role: 'DOCTOR',
        doctorVerificationStatus: 'APPROVED'
      }
    });

    if (!patient || !doctor) {
      console.log('❌ Need at least one patient and one approved doctor');
      return;
    }

    console.log(`✅ Patient: ${patient.username}`);
    console.log(`✅ Doctor: ${doctor.username}\n`);

    // Create appointment 23 hours from now (will trigger 24-hour reminder)
    const now = new Date();
    const startTime = new Date(now.getTime() + 23 * 60 * 60 * 1000);
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);

    console.log(`Creating appointment for: ${startTime.toLocaleString()}\n`);

    const appointment = await prisma.appointment.create({
      data: {
        patientId: patient.id,
        doctorId: doctor.id,
        startTime,
        endTime,
        status: 'APPROVED',
        type: 'VIDEO_CALL',
        reason: 'Test appointment for reminder system',
        notes: 'This is a test appointment created to verify the reminder system works correctly.'
      }
    });

    console.log('✅ Test appointment created successfully!\n');
    console.log(`📅 Appointment Details:`);
    console.log(`   ID: ${appointment.id}`);
    console.log(`   Patient: ${patient.username}`);
    console.log(`   Doctor: ${doctor.username}`);
    console.log(`   Start: ${startTime.toLocaleString()}`);
    console.log(`   End: ${endTime.toLocaleString()}`);
    console.log(`   Status: ${appointment.status}`);

    // Create conversation for the appointment
    const conversation = await prisma.conversation.create({
      data: {
        appointmentId: appointment.id,
        participants: {
          connect: [
            { id: patient.id },
            { id: doctor.id }
          ]
        }
      }
    });

    console.log(`\n💬 Conversation created: ${conversation.id}`);

    console.log('\n\n⏰ REMINDER SCHEDULE:');
    const twentyFourHourReminder = new Date(startTime.getTime() - 24 * 60 * 60 * 1000);
    const oneHourReminder = new Date(startTime.getTime() - 60 * 60 * 1000);
    
    console.log(`   24-hour reminder: ${twentyFourHourReminder.toLocaleString()}`);
    console.log(`   1-hour reminder: ${oneHourReminder.toLocaleString()}`);

    console.log('\n\n📋 NEXT STEPS:');
    console.log('1. The cron job runs every hour');
    console.log('2. Within the next hour, you should see:');
    console.log('   - Server log: [CRON] Sending appointment reminders...');
    console.log('   - Server log: [CRON] Sent 1 appointment reminders');
    console.log('3. Check notifications:');
    console.log(`   - Patient (${patient.username}): Should receive notification`);
    console.log(`   - Doctor (${doctor.username}): Should receive notification`);
    console.log('4. Check emails (if email service is configured):');
    console.log(`   - ${patient.email}`);
    console.log(`   - ${doctor.email}`);

    console.log('\n\n🔍 TO VERIFY:');
    console.log('Run: npx tsx apps/api/test-appointment-reminders.ts');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestAppointment();
