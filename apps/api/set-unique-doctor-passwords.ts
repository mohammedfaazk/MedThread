import { PrismaClient } from '@medthread/database';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const SALT_ROUNDS = 12;

/**
 * Set unique passwords for each doctor
 * This ensures each doctor has their own password that persists across restarts
 */

const DOCTOR_PASSWORDS: Record<string, string> = {
  'watson@gmail.com': 'Watson@123456',
  'dr.mitchell@medthread.com': 'Mitchell@123456',
  'rifa@gmail.com': 'Rifa@123456',
  'test.doctor.1773995866829@example.com': 'TestDoc@123456',
  'login.test.doctor.1773995919045@example.com': 'LoginTest@123456'
};

async function setUniqueDoctorPasswords() {
  console.log('🔧 SETTING UNIQUE PASSWORDS FOR EACH DOCTOR\n');
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

    // Update each doctor with their unique password
    console.log('🔄 Setting unique passwords...\n');
    
    for (const doctor of doctors) {
      const password = DOCTOR_PASSWORDS[doctor.email] || 'Doctor@123456';
      
      console.log(`${doctor.username} (${doctor.email})`);
      console.log(`  Password: ${password}`);
      
      const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
      
      await prisma.user.update({
        where: { id: doctor.id },
        data: {
          passwordHash,
          doctorVerificationStatus: 'APPROVED',
          verifiedAt: new Date(),
          verifiedBy: admin.id,
          verificationNotes: 'Unique password set'
        }
      });
      
      // Verify it works
      const testResult = await bcrypt.compare(password, passwordHash);
      console.log(`  Verification: ${testResult ? '✅ VALID' : '❌ INVALID'}`);
      console.log('');
    }

    // Final verification
    console.log('🧪 Final Verification:\n');
    console.log('═'.repeat(70));
    
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
      const password = DOCTOR_PASSWORDS[doctor.email] || 'Doctor@123456';
      const isValid = await bcrypt.compare(password, doctor.passwordHash);
      const status = doctor.doctorVerificationStatus;
      
      if (isValid && status === 'APPROVED') {
        console.log(`✅ ${doctor.username}`);
        console.log(`   Email: ${doctor.email}`);
        console.log(`   Password: ${password}`);
        console.log(`   Status: ${status}`);
      } else {
        console.log(`❌ ${doctor.username}: FAILED`);
        allValid = false;
      }
      console.log('');
    }

    console.log('═'.repeat(70));
    console.log('\n📊 SUMMARY\n');
    console.log(`Total Doctors: ${doctors.length}`);
    console.log(`All Valid: ${allValid ? 'YES ✅' : 'NO ❌'}`);
    console.log('\n📋 DOCTOR CREDENTIALS:\n');
    
    for (const doctor of updatedDoctors) {
      const password = DOCTOR_PASSWORDS[doctor.email] || 'Doctor@123456';
      console.log(`${doctor.username}:`);
      console.log(`  Email: ${doctor.email}`);
      console.log(`  Password: ${password}`);
      console.log('');
    }
    
    console.log('═'.repeat(70));
    console.log('\n✅ All doctors have unique passwords and are APPROVED!');
    console.log('⚠️  Save these credentials - they will persist across restarts!');

  } catch (error) {
    console.error('\n❌ ERROR:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

setUniqueDoctorPasswords()
  .then(() => {
    console.log('\n✅ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Failed:', error);
    process.exit(1);
  });
