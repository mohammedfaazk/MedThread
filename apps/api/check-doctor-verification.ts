import { PrismaClient } from '@medthread/database';

const prisma = new PrismaClient();

async function checkDoctorVerification() {
  console.log('🔍 Checking doctor verification status...\n');

  try {
    // Get all users with DOCTOR role
    const doctors = await prisma.user.findMany({
      where: {
        role: 'DOCTOR'
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        doctorVerificationStatus: true,
        medicalLicenseNumber: true,
        specialty: true,
        verifiedAt: true,
        verifiedBy: true,
        rejectionReason: true
      }
    });

    console.log(`Found ${doctors.length} doctors in the system:\n`);

    if (doctors.length === 0) {
      console.log('❌ No doctors found in the system');
      return;
    }

    doctors.forEach((doctor, index) => {
      console.log(`${index + 1}. ${doctor.username} (${doctor.email})`);
      console.log(`   ID: ${doctor.id}`);
      console.log(`   Role: ${doctor.role}`);
      console.log(`   Verification Status: ${doctor.doctorVerificationStatus || 'NOT_SET'}`);
      console.log(`   License Number: ${doctor.medicalLicenseNumber || 'Not provided'}`);
      console.log(`   Specialty: ${doctor.specialty || 'Not provided'}`);
      console.log(`   Verified At: ${doctor.verifiedAt || 'Not verified'}`);
      console.log(`   Verified By: ${doctor.verifiedBy || 'N/A'}`);
      if (doctor.rejectionReason) {
        console.log(`   Rejection Reason: ${doctor.rejectionReason}`);
      }
      console.log('');
    });

    // Check appointments with doctors
    const appointments = await prisma.appointment.findMany({
      where: {
        doctorId: {
          in: doctors.map(d => d.id)
        }
      },
      include: {
        doctor: {
          select: {
            username: true,
            doctorVerificationStatus: true
          }
        },
        patient: {
          select: {
            username: true
          }
        }
      }
    });

    console.log(`\n📅 Found ${appointments.length} appointments with doctors:\n`);
    
    appointments.forEach((apt, index) => {
      console.log(`${index + 1}. Appointment ${apt.id}`);
      console.log(`   Doctor: ${apt.doctor.username} (Status: ${apt.doctor.doctorVerificationStatus || 'NOT_SET'})`);
      console.log(`   Patient: ${apt.patient.username}`);
      console.log(`   Status: ${apt.status}`);
      console.log(`   Start: ${apt.startTime}`);
      console.log('');
    });

    // Check conversations
    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: {
            id: {
              in: doctors.map(d => d.id)
            }
          }
        }
      },
      include: {
        participants: {
          select: {
            id: true,
            username: true,
            role: true,
            doctorVerificationStatus: true
          }
        },
        appointment: {
          select: {
            status: true,
            startTime: true,
            endTime: true
          }
        }
      }
    });

    console.log(`\n💬 Found ${conversations.length} conversations with doctors:\n`);
    
    conversations.forEach((conv, index) => {
      console.log(`${index + 1}. Conversation ${conv.id}`);
      conv.participants.forEach(p => {
        console.log(`   - ${p.username} (${p.role}, Verification: ${p.doctorVerificationStatus || 'NOT_SET'})`);
      });
      if (conv.appointment) {
        console.log(`   Appointment Status: ${conv.appointment.status}`);
      }
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDoctorVerification();
