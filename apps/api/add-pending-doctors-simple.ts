import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL || process.env.DATABASE_URL
    }
  }
});

async function addPendingDoctors() {
  console.log('👨‍⚕️ Adding Pending Doctors...\n');

  try {
    const hashedPassword = await bcrypt.hash('doctor123', 10);

    // Doctor 1
    const doctor1 = await prisma.user.create({
      data: {
        email: 'sarah.johnson@medthread.com',
        username: 'dr_sarah_johnson',
        passwordHash: hashedPassword,
        role: 'DOCTOR',
        verified: false,
        doctorVerificationStatus: 'PENDING',
        specialty: 'Cardiology',
        yearsOfExperience: 12,
        medicalLicenseNumber: 'MCI-2012-45678',
        hospitalAffiliation: 'Lilavati Hospital, Mumbai',
        bio: 'Board-certified Cardiologist with 12 years of experience',
        city: 'Mumbai',
        state: 'Maharashtra',
        medicalUniversity: 'Grant Medical College, Mumbai',
        graduationYear: 2010
      }
    });

    console.log('✅ Dr. Sarah Johnson created');
    console.log(`   Email: ${doctor1.email}`);
    console.log(`   Password: doctor123\n`);

    // Doctor 2
    const doctor2 = await prisma.user.create({
      data: {
        email: 'rajesh.kumar@medthread.com',
        username: 'dr_rajesh_kumar',
        passwordHash: hashedPassword,
        role: 'DOCTOR',
        verified: false,
        doctorVerificationStatus: 'PENDING',
        specialty: 'Orthopedics',
        yearsOfExperience: 15,
        medicalLicenseNumber: 'MCI-2009-34567',
        hospitalAffiliation: 'Manipal Hospital, Bangalore',
        bio: 'Experienced Orthopedic Surgeon specializing in joint replacement',
        city: 'Bangalore',
        state: 'Karnataka',
        medicalUniversity: 'Bangalore Medical College',
        graduationYear: 2007
      }
    });

    console.log('✅ Dr. Rajesh Kumar created');
    console.log(`   Email: ${doctor2.email}`);
    console.log(`   Password: doctor123\n`);

    console.log('🎉 Success! 2 pending doctors added for verification');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addPendingDoctors();
