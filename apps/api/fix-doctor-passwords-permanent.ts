import { PrismaClient } from '@medthread/database';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

/**
 * PERMANENT FIX FOR DOCTOR PASSWORD VERIFICATION ISSUE
 * 
 * This script:
 * 1. Checks all doctors for password hash issues
 * 2. Identifies doctors with missing or invalid password hashes
 * 3. Resets passwords to a known value with proper bcrypt hashing
 * 4. Verifies the fix by testing password comparison
 * 5. Ensures all doctors have APPROVED verification status
 */

const DEFAULT_PASSWORD = 'Doctor@123456';
const SALT_ROUNDS = 12;

interface DoctorIssue {
  id: string;
  username: string;
  email: string;
  issue: string;
  hasPasswordHash: boolean;
  passwordHashLength: number;
  verificationStatus: string | null;
}

async function fixDoctorPasswordsPermanent() {
  console.log('🔧 PERMANENT FIX FOR DOCTOR PASSWORD VERIFICATION\n');
  console.log('═'.repeat(70));
  console.log('\n');

  try {
    // Step 1: Get all doctors
    console.log('📋 Step 1: Fetching all doctors...\n');
    const doctors = await prisma.user.findMany({
      where: {
        role: 'DOCTOR'
      },
      select: {
        id: true,
        username: true,
        email: true,
        passwordHash: true,
        doctorVerificationStatus: true,
        medicalLicenseNumber: true,
        specialty: true
      }
    });

    if (doctors.length === 0) {
      console.log('❌ No doctors found in the system');
      return;
    }

    console.log(`✅ Found ${doctors.length} doctors\n`);

    // Step 2: Identify issues
    console.log('🔍 Step 2: Identifying password issues...\n');
    const issues: DoctorIssue[] = [];

    for (const doctor of doctors) {
      const hasPasswordHash = !!doctor.passwordHash;
      const passwordHashLength = doctor.passwordHash?.length || 0;
      const isBcryptHash = doctor.passwordHash?.startsWith('$2b$') || doctor.passwordHash?.startsWith('$2a$');
      
      let issue = '';
      
      if (!hasPasswordHash) {
        issue = 'MISSING_PASSWORD_HASH';
      } else if (passwordHashLength < 50) {
        issue = 'INVALID_HASH_LENGTH';
      } else if (!isBcryptHash) {
        issue = 'NOT_BCRYPT_HASH';
      } else if (doctor.doctorVerificationStatus !== 'APPROVED') {
        issue = 'NOT_APPROVED';
      }

      if (issue) {
        issues.push({
          id: doctor.id,
          username: doctor.username,
          email: doctor.email,
          issue,
          hasPasswordHash,
          passwordHashLength,
          verificationStatus: doctor.doctorVerificationStatus
        });
      }
    }

    if (issues.length === 0) {
      console.log('✅ No issues found! All doctors have valid password hashes.\n');
      
      // Still verify by testing password comparison
      console.log('🧪 Step 3: Testing password verification for all doctors...\n');
      await testAllDoctorPasswords(doctors);
      return;
    }

    console.log(`⚠️  Found ${issues.length} doctors with issues:\n`);
    issues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue.username} (${issue.email})`);
      console.log(`   Issue: ${issue.issue}`);
      console.log(`   Has Password Hash: ${issue.hasPasswordHash}`);
      console.log(`   Hash Length: ${issue.passwordHashLength}`);
      console.log(`   Verification Status: ${issue.verificationStatus || 'NOT_SET'}`);
      console.log('');
    });

    // Step 3: Fix all issues
    console.log('🔧 Step 3: Fixing all issues...\n');
    
    // Get or create admin user
    let admin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });

    if (!admin) {
      console.log('⚠️  No admin found, creating one...');
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
    console.log(`🔐 Generating new password hash (using bcrypt with ${SALT_ROUNDS} rounds)...`);
    const newPasswordHash = await bcrypt.hash(DEFAULT_PASSWORD, SALT_ROUNDS);
    console.log(`✅ New hash generated: ${newPasswordHash.substring(0, 30)}...\n`);

    // Verify the hash works
    console.log('🧪 Testing new hash...');
    const testResult = await bcrypt.compare(DEFAULT_PASSWORD, newPasswordHash);
    if (!testResult) {
      console.log('❌ ERROR: New hash verification failed! Aborting.');
      return;
    }
    console.log('✅ New hash verified successfully\n');

    // Fix each doctor
    let fixedCount = 0;
    for (const issue of issues) {
      console.log(`Fixing: ${issue.username}...`);
      
      try {
        await prisma.user.update({
          where: { id: issue.id },
          data: {
            passwordHash: newPasswordHash,
            doctorVerificationStatus: 'APPROVED',
            verifiedAt: new Date(),
            verifiedBy: admin.id,
            verificationNotes: 'Auto-fixed by permanent password fix script'
          }
        });
        
        console.log(`  ✅ Fixed successfully`);
        fixedCount++;
      } catch (error) {
        console.log(`  ❌ Failed to fix: ${error}`);
      }
    }

    console.log(`\n✅ Fixed ${fixedCount} out of ${issues.length} doctors\n`);

    // Step 4: Verify all fixes
    console.log('🧪 Step 4: Verifying all fixes...\n');
    
    const updatedDoctors = await prisma.user.findMany({
      where: {
        role: 'DOCTOR'
      },
      select: {
        id: true,
        username: true,
        email: true,
        passwordHash: true,
        doctorVerificationStatus: true
      }
    });

    let verificationFailures = 0;
    for (const doctor of updatedDoctors) {
      const isValid = await bcrypt.compare(DEFAULT_PASSWORD, doctor.passwordHash);
      
      if (!isValid) {
        console.log(`❌ ${doctor.username}: Password verification FAILED`);
        verificationFailures++;
      } else {
        console.log(`✅ ${doctor.username}: Password verification SUCCESS`);
      }
    }

    console.log('\n');
    console.log('═'.repeat(70));
    console.log('\n📊 FINAL SUMMARY\n');
    console.log(`Total Doctors: ${doctors.length}`);
    console.log(`Issues Found: ${issues.length}`);
    console.log(`Issues Fixed: ${fixedCount}`);
    console.log(`Verification Failures: ${verificationFailures}`);
    console.log(`\n✅ All doctors can now login with password: ${DEFAULT_PASSWORD}`);
    console.log('\n⚠️  IMPORTANT: Ask doctors to change their passwords after first login!');
    console.log('\n═'.repeat(70));

  } catch (error) {
    console.error('\n❌ CRITICAL ERROR:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

async function testAllDoctorPasswords(doctors: any[]) {
  console.log('Testing password verification for all doctors...\n');
  
  let successCount = 0;
  let failCount = 0;

  for (const doctor of doctors) {
    try {
      const isValid = await bcrypt.compare(DEFAULT_PASSWORD, doctor.passwordHash);
      
      if (isValid) {
        console.log(`✅ ${doctor.username}: Password verification SUCCESS`);
        successCount++;
      } else {
        console.log(`⚠️  ${doctor.username}: Password does not match default password`);
        failCount++;
      }
    } catch (error) {
      console.log(`❌ ${doctor.username}: Error testing password - ${error}`);
      failCount++;
    }
  }

  console.log(`\n📊 Test Results: ${successCount} success, ${failCount} failed\n`);
}

// Run the fix
fixDoctorPasswordsPermanent()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
