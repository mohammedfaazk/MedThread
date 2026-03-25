import { PrismaClient } from '@medthread/database';

const prisma = new PrismaClient();

async function approvePendingDoctors() {
  console.log('🔍 Checking for pending doctor verifications...\n');

  try {
    // Get admin user
    const admin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });

    if (!admin) {
      console.log('❌ No admin user found. Creating one...');
      // This shouldn't happen, but just in case
      return;
    }

    console.log(`✅ Admin found: ${admin.username}\n`);

    // Get all doctors with PENDING or UNDER_REVIEW status
    const pendingDoctors = await prisma.user.findMany({
      where: {
        role: 'DOCTOR',
        doctorVerificationStatus: {
          in: ['PENDING', 'UNDER_REVIEW']
        }
      },
      select: {
        id: true,
        username: true,
        email: true,
        doctorVerificationStatus: true,
        medicalLicenseNumber: true,
        specialty: true,
        yearsOfExperience: true
      }
    });

    if (pendingDoctors.length === 0) {
      console.log('✅ No pending doctors found. All doctors are verified or rejected.');
      return;
    }

    console.log(`Found ${pendingDoctors.length} pending doctor(s):\n`);

    for (const doctor of pendingDoctors) {
      console.log(`Doctor: ${doctor.username} (${doctor.email})`);
      console.log(`  Status: ${doctor.doctorVerificationStatus}`);
      console.log(`  License: ${doctor.medicalLicenseNumber || 'Not provided'}`);
      console.log(`  Specialty: ${doctor.specialty || 'Not provided'}`);
      console.log(`  Experience: ${doctor.yearsOfExperience || 'Not provided'} years`);
      
      // Auto-approve if they have a license number
      if (doctor.medicalLicenseNumber) {
        console.log(`  ✅ Auto-approving (has license number)...`);
        
        await prisma.user.update({
          where: { id: doctor.id },
          data: {
            doctorVerificationStatus: 'APPROVED',
            verifiedAt: new Date(),
            verifiedBy: admin.id,
            verificationNotes: 'Auto-approved by system - has license number'
          }
        });
        
        console.log(`  ✅ Approved successfully!`);
      } else {
        console.log(`  ⚠️  Skipping (no license number provided)`);
      }
      console.log('');
    }

    // Show updated status
    const allDoctors = await prisma.user.findMany({
      where: { role: 'DOCTOR' },
      select: {
        username: true,
        doctorVerificationStatus: true
      }
    });

    console.log('\n📊 Final Status:');
    const statusCounts = allDoctors.reduce((acc, d) => {
      const status = d.doctorVerificationStatus || 'NOT_SET';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`  ${status}: ${count}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

approvePendingDoctors();
