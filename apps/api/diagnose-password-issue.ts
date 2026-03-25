import { PrismaClient } from '@medthread/database';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function diagnosePasswordIssue() {
  console.log('🔍 DIAGNOSING PASSWORD VERIFICATION ISSUE\n');
  console.log('═'.repeat(70));

  try {
    // Get Dr. Rifa Hassan
    const rifa = await prisma.user.findUnique({
      where: { email: 'rifa@gmail.com' },
      select: {
        id: true,
        username: true,
        email: true,
        passwordHash: true,
        doctorVerificationStatus: true
      }
    });

    if (!rifa) {
      console.log('❌ Dr. Rifa Hassan not found');
      return;
    }

    console.log('\n📋 User Information:');
    console.log(`Username: ${rifa.username}`);
    console.log(`Email: ${rifa.email}`);
    console.log(`Verification Status: ${rifa.doctorVerificationStatus}`);
    console.log(`Password Hash: ${rifa.passwordHash.substring(0, 30)}...`);
    console.log(`Hash Length: ${rifa.passwordHash.length}`);
    console.log(`Hash Type: ${rifa.passwordHash.startsWith('$2b$') ? 'bcrypt' : 'unknown'}`);

    // Test with the password you said works
    const testPassword = 'Doctor@123456';
    
    console.log('\n🧪 Testing Password Verification:');
    console.log(`Test Password: ${testPassword}`);
    
    const isValid = await bcrypt.compare(testPassword, rifa.passwordHash);
    console.log(`Result: ${isValid ? '✅ VALID' : '❌ INVALID'}`);

    if (!isValid) {
      console.log('\n⚠️  Password does NOT match the stored hash!');
      console.log('This means the password in the database is different.');
      console.log('\nLet me check what password was used during login...');
      
      // Try common passwords
      const commonPasswords = [
        'Doctor@123456',
        'doctor@123456',
        'Rifa@123456',
        'rifa@123456',
        'Password@123',
        'password123',
        'Doctor123',
        'doctor123'
      ];

      console.log('\n🔍 Testing common passwords:');
      for (const pwd of commonPasswords) {
        const result = await bcrypt.compare(pwd, rifa.passwordHash);
        if (result) {
          console.log(`✅ FOUND: "${pwd}" matches!`);
          break;
        } else {
          console.log(`❌ "${pwd}" - no match`);
        }
      }
    } else {
      console.log('\n✅ Password matches! The issue must be elsewhere.');
    }

    // Check all doctors
    console.log('\n\n📊 Checking ALL Doctors:');
    console.log('═'.repeat(70));
    
    const allDoctors = await prisma.user.findMany({
      where: { role: 'DOCTOR' },
      select: {
        id: true,
        username: true,
        email: true,
        passwordHash: true,
        doctorVerificationStatus: true
      }
    });

    for (const doctor of allDoctors) {
      console.log(`\n${doctor.username} (${doctor.email})`);
      console.log(`  Status: ${doctor.doctorVerificationStatus}`);
      console.log(`  Hash: ${doctor.passwordHash.substring(0, 30)}...`);
      
      const testResult = await bcrypt.compare('Doctor@123456', doctor.passwordHash);
      console.log(`  Password "Doctor@123456": ${testResult ? '✅ VALID' : '❌ INVALID'}`);
    }

  } catch (error) {
    console.error('\n❌ ERROR:', error);
  } finally {
    await prisma.$disconnect();
  }
}

diagnosePasswordIssue()
  .then(() => {
    console.log('\n✅ Diagnosis complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Failed:', error);
    process.exit(1);
  });
