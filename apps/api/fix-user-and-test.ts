import { prisma } from '@medthread/database';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function fixUserAndTest() {
  const targetEmail = 'meghamaryvinu@licet.ac.in';
  
  try {
    console.log('\n🔧 Fixing user role and testing password...\n');
    
    // Step 1: Update role to PATIENT
    console.log('Step 1: Updating role from DOCTOR to PATIENT...');
    const updatedUser = await prisma.user.update({
      where: { email: targetEmail },
      data: { 
        role: 'PATIENT',
        doctorVerificationStatus: null // Clear doctor verification since they're now a patient
      },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        passwordHash: true
      }
    });
    
    console.log('✅ Role updated successfully!');
    console.log(`   Email: ${updatedUser.email}`);
    console.log(`   Username: ${updatedUser.username}`);
    console.log(`   Role: ${updatedUser.role}\n`);
    
    // Step 2: Test common passwords
    console.log('Step 2: Testing common passwords...\n');
    
    const passwordsToTest = [
      'Admin@123456',
      'Password@123',
      'Megha@123',
      'Patient@123',
      'megha123',
      'Megha@1234',
      'password',
      '12345678'
    ];
    
    for (const password of passwordsToTest) {
      const isMatch = await bcrypt.compare(password, updatedUser.passwordHash);
      
      if (isMatch) {
        console.log('═'.repeat(60));
        console.log('\n✅ PASSWORD FOUND! ✅\n');
        console.log(`   Email: ${updatedUser.email}`);
        console.log(`   Password: ${password}`);
        console.log('\n═'.repeat(60));
        console.log('\n🎉 You can now login with these credentials!\n');
        return;
      } else {
        console.log(`❌ Not: ${password}`);
      }
    }
    
    console.log('\n⚠️  None of the common passwords matched.');
    console.log('Please check if you remember the password or need to reset it.\n');
    
  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

fixUserAndTest()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
