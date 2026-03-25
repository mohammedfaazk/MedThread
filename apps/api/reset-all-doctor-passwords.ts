import { PrismaClient } from '@medthread/database';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const DEFAULT_PASSWORD = 'Doctor@123456';
const SALT_ROUNDS = 12;

async function resetAllDoctorPasswords() {
  console.log('🔧 RESETTING ALL DOCTOR PASSWORDS\n');
  console.log('═'.repeat(70));

  try {
    // Get all doctors
    const doctors = await prisma.user.findMany({
      where: { role: 'DOCTOR' },
      select: {
        id: true,
        username: true,
        email: true,
        doctorVerificationStatus: true
      }
    });

    console.log(`\n✅ Found ${doctors.length} doctors\n`);

    // Get or create admin
    let admin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });

    if (!admin) {
      console.log('Creating admin user...');
      const adminPasswordHash = await bcrypt.hash('Admin@123456', SALT_ROUNDS);
      admin = await prisma.user.create({
        data: {
          email: 'admin@medthread.com',
          username: 'admin',
          passwordHash: adminPasswordHash,
          role: 'ADMIN',
          verified: true,
          emailVerified: true
        }
      });
      console.log('✅ Admin created\n');
    }

    // Generate new password hash
    console.log(`🔐 Generating password hash for: ${DEFAULT_PASSWORD}`);
    const newPasswordHash = await bcrypt.hash(DEFAULT_PASSWORD, SALT_ROUNDS);
    console.log(`✅ Hash: ${newPasswordHash.substring(0, 30)}...\n`);

    // Test the hash
    const testResult = await bcrypt.compare(DEFAULT_PASSWORD, newPasswordHash);
    if (!testResult) {
      console.log('❌ Hash test failed! Aborting.');
      return;
    }
    console.log('✅ Hash test passed\n');

    // Update ALL doctors
    console.log('🔄 Updating all doctors...\n');
    
    for (const doctor of doctors) {
      console.log(`Updating: ${doctor.username} (${doctor.email})`);
      
      await prisma.user.update({
        where: { id: doctor.id },
        data: {
          passwordHash: newPasswordHash,
          doctorVerificationStatus: 'APPROVED',
          verifiedAt: new Date(),
          verifiedBy: admin.id,
          verificationNotes: 'Password reset and auto-approved'
        }
      });
      
      console.log(`  ✅ Updated`);
    }

    // Verify all
    console.log('\n🧪 Verifying all passwords...\n');
    
    const updatedDoctors = await prisma.user.findMany({
      where: { role: 'DOCTOR' },
      select: {
        id: true,
        username: true,
        email: true,
        passwordHash: true,
        doctorVerificationStatus: true
      }
    });

    let allValid = true;
    for (const doctor of updatedDoctors) {
      const isValid = await bcrypt.compare(DEFAULT_PASSWORD, doctor.passwordHash);
      const status = doctor.doctorVerificationStatus;
      
      if (isValid && status === 'APPROVED') {
        console.log(`✅ ${doctor.username}: Password ✓ | Status: ${status}`);
      } else {
        console.log(`❌ ${doctor.username}: Password ${isValid ? '✓' : '✗'} | Status: ${status}`);
        allValid = false;
      }
    }

    console.log('\n' + '═'.repeat(70));
    console.log('\n📊 SUMMARY\n');
    console.log(`Total Doctors: ${doctors.length}`);
    console.log(`All Valid: ${allValid ? 'YES ✅' : 'NO ❌'}`);
    console.log(`\nDefault Password: ${DEFAULT_PASSWORD}`);
    console.log(`All doctors are APPROVED and can login now!`);
    console.log('\n' + '═'.repeat(70));

  } catch (error) {
    console.error('\n❌ ERROR:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

resetAllDoctorPasswords()
  .then(() => {
    console.log('\n✅ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Failed:', error);
    process.exit(1);
  });
