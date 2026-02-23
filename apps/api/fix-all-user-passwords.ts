import { prisma } from '@medthread/database';
import bcrypt from 'bcrypt';

async function fixAllUserPasswords() {
  try {
    console.log('🔧 Fixing all user passwords...\n');

    // Get all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        passwordHash: true,
      }
    });

    console.log(`Found ${users.length} users\n`);

    let fixedCount = 0;
    let alreadyValidCount = 0;

    for (const user of users) {
      if (!user.passwordHash) {
        console.log(`❌ ${user.username} (${user.email}) - NO PASSWORD`);
        
        // Set default password based on role
        let defaultPassword = 'Password@123456';
        if (user.role === 'ADMIN') {
          defaultPassword = 'Admin@123456';
        } else if (user.role === 'DOCTOR') {
          defaultPassword = 'Doctor@123456';
        } else {
          defaultPassword = 'Patient@123456';
        }

        const hashedPassword = await bcrypt.hash(defaultPassword, 10);
        await prisma.user.update({
          where: { id: user.id },
          data: { passwordHash: hashedPassword }
        });

        console.log(`   ✅ Fixed! Default password: ${defaultPassword}\n`);
        fixedCount++;
      } else {
        console.log(`✅ ${user.username} (${user.email}) - Password OK`);
        alreadyValidCount++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 Summary:');
    console.log(`   Total users: ${users.length}`);
    console.log(`   Already valid: ${alreadyValidCount}`);
    console.log(`   Fixed: ${fixedCount}`);
    console.log('='.repeat(60));

    if (fixedCount > 0) {
      console.log('\n📝 Default Passwords:');
      console.log('   Admin: Admin@123456');
      console.log('   Doctor: Doctor@123456');
      console.log('   Patient: Patient@123456');
      console.log('\n⚠️  Users should change their passwords after first login!');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixAllUserPasswords();
