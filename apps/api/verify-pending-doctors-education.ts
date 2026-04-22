import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL || process.env.DATABASE_URL
    }
  }
});

async function verifyPendingDoctorsEducation() {
  console.log('🔍 Verifying Pending Doctors Education Info...\n');

  try {
    // Get both pending doctors
    const doctors = await prisma.user.findMany({
      where: {
        email: {
          in: ['sarah.johnson@medthread.com', 'rajesh.kumar@medthread.com']
        }
      },
      select: {
        id: true,
        email: true,
        username: true,
        specialty: true,
        medicalUniversity: true,
        graduationYear: true,
        doctorVerificationStatus: true,
        verified: true
      }
    });

    console.log('📋 Found doctors in database:\n');
    doctors.forEach(doctor => {
      console.log(`Doctor: ${doctor.username}`);
      console.log(`  Email: ${doctor.email}`);
      console.log(`  Specialty: ${doctor.specialty}`);
      console.log(`  Medical University: ${doctor.medicalUniversity || '❌ NOT SET'}`);
      console.log(`  Graduation Year: ${doctor.graduationYear || '❌ NOT SET'}`);
      console.log(`  Verification Status: ${doctor.doctorVerificationStatus}`);
      console.log(`  Verified: ${doctor.verified}`);
      console.log('');
    });

    if (doctors.length === 0) {
      console.log('❌ No doctors found with those emails!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyPendingDoctorsEducation();
