import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAppointments() {
  try {
    console.log('\n=== Checking Appointments for Calendar ===\n');

    // Find dr.rifa.hassan
    const doctor = await prisma.user.findUnique({
      where: { username: 'dr.rifa.hassan' }
    });

    if (!doctor) {
      console.log('❌ Doctor not found');
      return;
    }

    console.log('✅ Doctor found:', doctor.username, '(ID:', doctor.id, ')');

    // Get all appointments for this doctor
    const appointments = await prisma.appointment.findMany({
      where: {
        doctorId: doctor.id
      },
      include: {
        patient: {
          select: {
            id: true,
            username: true,
            avatar: true
          }
        },
        doctor: {
          select: {
            id: true,
            username: true,
            specialty: true
          }
        }
      },
      orderBy: {
        startTime: 'asc'
      }
    });

    console.log(`\n📅 Total appointments: ${appointments.length}\n`);

    if (appointments.length === 0) {
      console.log('No appointments found for this doctor');
      return;
    }

    // Group by status
    const byStatus = appointments.reduce((acc, apt) => {
      acc[apt.status] = (acc[apt.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log('Appointments by status:');
    Object.entries(byStatus).forEach(([status, count]) => {
      console.log(`  ${status}: ${count}`);
    });

    console.log('\n--- Appointment Details ---\n');
    appointments.forEach((apt, index) => {
      console.log(`${index + 1}. ${apt.status} - ${apt.patient.username}`);
      console.log(`   Start: ${apt.startTime}`);
      console.log(`   End: ${apt.endTime}`);
      console.log(`   Reason: ${apt.reason || 'N/A'}`);
      console.log(`   ID: ${apt.id}`);
      console.log('');
    });

    // Test the API endpoint format
    console.log('\n--- API Endpoint Test ---');
    console.log(`GET /api/appointments/appointments?userId=${doctor.id}&role=doctor`);
    console.log('\nExpected response format:');
    console.log(JSON.stringify(appointments.slice(0, 1), null, 2));

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAppointments();
