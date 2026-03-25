import { PrismaClient } from '@medthread/database';

const prisma = new PrismaClient();

async function testAppointmentReminders() {
  console.log('🔍 Testing Appointment Reminder System...\n');

  try {
    const now = new Date();
    console.log(`Current time: ${now.toISOString()}\n`);

    // Get all approved appointments
    const allAppointments = await prisma.appointment.findMany({
      where: {
        status: 'APPROVED'
      },
      include: {
        patient: {
          select: {
            id: true,
            username: true,
            email: true
          }
        },
        doctor: {
          select: {
            id: true,
            username: true,
            email: true
          }
        }
      },
      orderBy: {
        startTime: 'asc'
      }
    });

    console.log(`📊 Found ${allAppointments.length} approved appointments:\n`);

    if (allAppointments.length === 0) {
      console.log('❌ No approved appointments found.');
      console.log('\n💡 To test reminders:');
      console.log('1. Create an appointment in the app');
      console.log('2. Make sure it\'s APPROVED status');
      console.log('3. Set the start time to be within 24 hours from now');
      return;
    }

    // Check each appointment
    for (const apt of allAppointments) {
      const startTime = new Date(apt.startTime);
      const timeUntilStart = startTime.getTime() - now.getTime();
      const hoursUntilStart = timeUntilStart / (1000 * 60 * 60);
      const minutesUntilStart = timeUntilStart / (1000 * 60);

      console.log(`\n📅 Appointment ID: ${apt.id}`);
      console.log(`   Patient: ${apt.patient.username} (${apt.patient.email})`);
      console.log(`   Doctor: ${apt.doctor.username} (${apt.doctor.email})`);
      console.log(`   Start Time: ${startTime.toLocaleString()}`);
      console.log(`   Status: ${apt.status}`);

      if (timeUntilStart < 0) {
        console.log(`   ⏰ Status: PAST (${Math.abs(hoursUntilStart).toFixed(1)} hours ago)`);
      } else if (hoursUntilStart <= 1) {
        console.log(`   ⏰ Status: WITHIN 1 HOUR (${minutesUntilStart.toFixed(0)} minutes)`);
        console.log(`   ✅ Would trigger 1-hour reminder`);
      } else if (hoursUntilStart <= 24) {
        console.log(`   ⏰ Status: WITHIN 24 HOURS (${hoursUntilStart.toFixed(1)} hours)`);
        console.log(`   ✅ Would trigger 24-hour reminder`);
      } else {
        console.log(`   ⏰ Status: FUTURE (${hoursUntilStart.toFixed(1)} hours away)`);
        console.log(`   ⏳ No reminder yet`);
      }

      // Check if notifications already exist
      try {
        const existingNotifications = await prisma.notifications.findMany({
          where: {
            OR: [
              { recipientId: apt.patientId },
              { recipientId: apt.doctorId }
            ],
            type: 'APPOINTMENT_REMINDER'
          }
        });

        if (existingNotifications.length > 0) {
          console.log(`   📬 Existing notifications: ${existingNotifications.length}`);
        }
      } catch (notifError) {
        // Notifications table might not exist or have different schema
        console.log(`   📬 Could not check notifications`);
      }
    }

    // Simulate sending reminders for appointments within 24 hours
    console.log('\n\n🔔 SIMULATING REMINDER SYSTEM:\n');

    const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

    // 24-hour reminders
    const appointmentsIn24Hours = allAppointments.filter(apt => {
      const startTime = new Date(apt.startTime);
      return startTime >= now && startTime <= twentyFourHoursFromNow;
    });

    console.log(`📧 Would send 24-hour reminders: ${appointmentsIn24Hours.length} appointments`);
    appointmentsIn24Hours.forEach(apt => {
      console.log(`   - ${apt.patient.username} ↔ Dr. ${apt.doctor.username}`);
      console.log(`     Time: ${new Date(apt.startTime).toLocaleString()}`);
    });

    // 1-hour reminders
    const appointmentsIn1Hour = allAppointments.filter(apt => {
      const startTime = new Date(apt.startTime);
      return startTime >= now && startTime <= oneHourFromNow;
    });

    console.log(`\n📧 Would send 1-hour reminders: ${appointmentsIn1Hour.length} appointments`);
    appointmentsIn1Hour.forEach(apt => {
      console.log(`   - ${apt.patient.username} ↔ Dr. ${apt.doctor.username}`);
      console.log(`     Time: ${new Date(apt.startTime).toLocaleString()}`);
    });

    // Show how to create a test appointment
    console.log('\n\n💡 TO TEST REMINDERS MANUALLY:\n');
    console.log('Option 1: Create appointment via UI');
    console.log('  1. Login as a patient');
    console.log('  2. Go to /appointments');
    console.log('  3. Book appointment with a doctor');
    console.log('  4. Set time to be 23 hours from now');
    console.log('  5. Wait for cron job (runs every hour)');
    
    console.log('\nOption 2: Create test appointment via script');
    console.log('  Run: npx tsx apps/api/create-test-appointment.ts');
    
    console.log('\nOption 3: Manually trigger cron job');
    console.log('  The cron job runs automatically every hour');
    console.log('  Check server logs for: [CRON] Sending appointment reminders...');

    console.log('\n\n📋 CRON JOB INFO:');
    console.log('  Schedule: Every hour (0 * * * *)');
    console.log('  Checks for: Appointments within 24 hours and 1 hour');
    console.log('  Sends: Email + In-app notification');
    console.log('  Recipients: Both patient and doctor');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAppointmentReminders();
