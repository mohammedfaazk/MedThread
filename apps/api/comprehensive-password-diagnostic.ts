import { PrismaClient } from '@medthread/database';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

interface DoctorCredential {
  email: string;
  expectedPassword: string;
  name: string;
}

const DOCTOR_CREDENTIALS: DoctorCredential[] = [
  { email: 'watson@gmail.com', expectedPassword: 'Watson@123456', name: 'Watson' },
  { email: 'dr.mitchell@medthread.com', expectedPassword: 'Mitchell@123456', name: 'Dr. Mitchell' },
  { email: 'rifa@gmail.com', expectedPassword: 'Rifa@123456', name: 'Dr. Rifa Hassan' },
  { email: 'test.doctor.1773995866829@example.com', expectedPassword: 'TestDoc@123456', name: 'Test Doctor' },
  { email: 'login.test.doctor.1773995919045@example.com', expectedPassword: 'LoginTest@123456', name: 'Login Test Doctor' }
];

async function comprehensiveDiagnostic() {
  console.log('\n🔍 COMPREHENSIVE PASSWORD DIAGNOSTIC');
  console.log('═'.repeat(80));
  
  let allPassed = true;
  const issues: string[] = [];
  
  for (const credential of DOCTOR_CREDENTIALS) {
    console.log(`\n📋 Checking: ${credential.name} (${credential.email})`);
    console.log('─'.repeat(80));
    
    try {
      // 1. Find user
      const user = await prisma.user.findUnique({
        where: { email: credential.email },
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          passwordHash: true,
          doctorVerificationStatus: true
        }
      });
      
      if (!user) {
        console.log(`❌ User not found in database`);
        issues.push(`${credential.name}: User not found`);
        allPassed = false;
        continue;
      }
      
      console.log(`✅ User found: ${user.username}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Verification Status: ${user.doctorVerificationStatus}`);
      console.log(`   Password Hash Length: ${user.passwordHash.length}`);
      console.log(`   Hash Prefix: ${user.passwordHash.substring(0, 20)}...`);
      
      // 2. Check verification status
      if (user.doctorVerificationStatus !== 'APPROVED') {
        console.log(`⚠️  WARNING: Doctor not APPROVED (status: ${user.doctorVerificationStatus})`);
        issues.push(`${credential.name}: Not APPROVED`);
        allPassed = false;
      }
      
      // 3. Test password with bcrypt
      console.log(`\n🔐 Testing password: "${credential.expectedPassword}"`);
      const isValid = await bcrypt.compare(credential.expectedPassword, user.passwordHash);
      
      if (isValid) {
        console.log(`✅ Password verification: SUCCESS`);
      } else {
        console.log(`❌ Password verification: FAILED`);
        console.log(`   Expected password: ${credential.expectedPassword}`);
        console.log(`   Stored hash: ${user.passwordHash}`);
        issues.push(`${credential.name}: Password mismatch`);
        allPassed = false;
        
        // Try to test what password would work
        console.log(`\n🔍 Testing alternative passwords...`);
        const alternatives = [
          'Doctor@123456',
          'doctor123',
          'password123',
          credential.expectedPassword.toLowerCase(),
          credential.expectedPassword.toUpperCase()
        ];
        
        for (const alt of alternatives) {
          const altValid = await bcrypt.compare(alt, user.passwordHash);
          if (altValid) {
            console.log(`   ✅ FOUND WORKING PASSWORD: "${alt}"`);
            break;
          }
        }
      }
      
      // 4. Test login endpoint simulation
      console.log(`\n🌐 Simulating login flow...`);
      const loginValid = await bcrypt.compare(credential.expectedPassword, user.passwordHash);
      if (loginValid) {
        console.log(`✅ Login would succeed`);
      } else {
        console.log(`❌ Login would fail`);
      }
      
    } catch (error) {
      console.error(`❌ Error checking ${credential.name}:`, error);
      issues.push(`${credential.name}: Error - ${error instanceof Error ? error.message : 'Unknown'}`);
      allPassed = false;
    }
  }
  
  // Summary
  console.log('\n\n📊 DIAGNOSTIC SUMMARY');
  console.log('═'.repeat(80));
  
  if (allPassed) {
    console.log('✅ ALL CHECKS PASSED - Passwords are correctly configured');
  } else {
    console.log('❌ ISSUES FOUND:');
    issues.forEach(issue => console.log(`   • ${issue}`));
    
    console.log('\n\n🔧 RECOMMENDED FIX:');
    console.log('Run the following command to reset all passwords:');
    console.log('   npx tsx apps/api/fix-passwords-permanent.ts');
  }
  
  console.log('\n═'.repeat(80));
}

async function main() {
  try {
    await comprehensiveDiagnostic();
  } catch (error) {
    console.error('Fatal error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
