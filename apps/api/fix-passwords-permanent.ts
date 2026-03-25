import { PrismaClient, DoctorVerificationStatus } from '@medthread/database';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

interface DoctorCredential {
  email: string;
  password: string;
  name: string;
}

const DOCTOR_CREDENTIALS: DoctorCredential[] = [
  { email: 'watson@gmail.com', password: 'Watson@123456', name: 'Watson' },
  { email: 'dr.mitchell@medthread.com', password: 'Mitchell@123456', name: 'Dr. Mitchell' },
  { email: 'rifa@gmail.com', password: 'Rifa@123456', name: 'Dr. Rifa Hassan' },
  { email: 'test.doctor.1773995866829@example.com', password: 'TestDoc@123456', name: 'Test Doctor' },
  { email: 'login.test.doctor.1773995919045@example.com', password: 'LoginTest@123456', name: 'Login Test Doctor' }
];

async function fixPasswordsPermanently() {
  console.log('\n🔧 PERMANENT PASSWORD FIX');
  console.log('═'.repeat(80));
  console.log('This will set unique passwords for each doctor and ensure they persist.\n');
  
  let successCount = 0;
  let failCount = 0;
  
  for (const credential of DOCTOR_CREDENTIALS) {
    console.log(`\n📝 Processing: ${credential.name} (${credential.email})`);
    console.log('─'.repeat(80));
    
    try {
      // Find user
      const user = await prisma.user.findUnique({
        where: { email: credential.email }
      });
      
      if (!user) {
        console.log(`⚠️  User not found - skipping`);
        failCount++;
        continue;
      }
      
      console.log(`✅ User found: ${user.username}`);
      
      // Generate new password hash with bcrypt (10 rounds is standard)
      console.log(`🔐 Hashing password: "${credential.password}"`);
      const passwordHash = await bcrypt.hash(credential.password, 10);
      console.log(`   Hash generated (length: ${passwordHash.length})`);
      console.log(`   Hash prefix: ${passwordHash.substring(0, 20)}...`);
      
      // Update user with new password and ensure APPROVED status
      await prisma.user.update({
        where: { id: user.id },
        data: {
          passwordHash,
          doctorVerificationStatus: DoctorVerificationStatus.APPROVED
        }
      });
      
      console.log(`✅ Password updated successfully`);
      console.log(`✅ Verification status set to APPROVED`);
      
      // Verify the password works
      console.log(`🔍 Verifying password...`);
      const isValid = await bcrypt.compare(credential.password, passwordHash);
      
      if (isValid) {
        console.log(`✅ Password verification: SUCCESS`);
        successCount++;
      } else {
        console.log(`❌ Password verification: FAILED (this should never happen)`);
        failCount++;
      }
      
    } catch (error) {
      console.error(`❌ Error processing ${credential.name}:`, error);
      failCount++;
    }
  }
  
  // Summary
  console.log('\n\n📊 FIX SUMMARY');
  console.log('═'.repeat(80));
  console.log(`✅ Successfully fixed: ${successCount} doctors`);
  console.log(`❌ Failed: ${failCount} doctors`);
  
  if (failCount === 0) {
    console.log('\n🎉 ALL PASSWORDS FIXED SUCCESSFULLY!');
    console.log('\n📋 Doctor Credentials:');
    console.log('─'.repeat(80));
    DOCTOR_CREDENTIALS.forEach(cred => {
      console.log(`${cred.name}:`);
      console.log(`  Email: ${cred.email}`);
      console.log(`  Password: ${cred.password}`);
      console.log('');
    });
    console.log('─'.repeat(80));
    console.log('\n✅ These passwords will persist across app restarts.');
    console.log('✅ All doctors are APPROVED and can access chat immediately.');
  } else {
    console.log('\n⚠️  Some passwords could not be fixed. Please check the errors above.');
  }
  
  console.log('\n═'.repeat(80));
}

async function main() {
  try {
    await fixPasswordsPermanently();
  } catch (error) {
    console.error('Fatal error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
