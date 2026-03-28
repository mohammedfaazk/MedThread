/**
 * Reset Admin Password
 * 
 * This script resets the admin user password to a known value
 */

import { prisma } from '@medthread/database';
import bcrypt from 'bcrypt';

async function resetAdminPassword() {
  console.log('🔐 Resetting Admin Password...\n');

  try {
    // Find admin user
    let adminUser = await prisma.user.findFirst({
      where: { email: 'admin@medthread.com' }
    });

    if (!adminUser) {
      console.log('❌ Admin user not found. Creating new admin user...');
      
      const hashedPassword = await bcrypt.hash('Admin@123', 10);
      
      adminUser = await prisma.user.create({
        data: {
          email: 'admin@medthread.com',
          passwordHash: hashedPassword,
          name: 'Admin User',
          role: 'ADMIN',
          verified: true
        }
      });
      
      console.log('✅ Created new admin user');
    } else {
      console.log(`✅ Found admin user: ${adminUser.email}`);
      console.log(`   Current role: ${adminUser.role}`);
      
      // Reset password
      const hashedPassword = await bcrypt.hash('Admin@123', 10);
      
      await prisma.user.update({
        where: { id: adminUser.id },
        data: {
          passwordHash: hashedPassword,
          role: 'ADMIN',
          verified: true
        }
      });
      
      console.log('✅ Password reset successfully');
    }

    // Verify the password works
    console.log('\n🧪 Verifying password...');
    
    // Get the updated user
    const updatedUser = await prisma.user.findUnique({
      where: { id: adminUser.id }
    });
    
    if (updatedUser) {
      const testPassword = 'Admin@123';
      const isValid = await bcrypt.compare(testPassword, updatedUser.passwordHash);
      console.log(isValid ? '✅ Password verification successful!' : '❌ Password verification failed');
    }

    console.log('\n═══════════════════════════════════════════');
    console.log('📝 ADMIN CREDENTIALS');
    console.log('═══════════════════════════════════════════');
    console.log('Email: admin@medthread.com');
    console.log('Password: Admin@123');
    console.log('Role: ADMIN');
    console.log('═══════════════════════════════════════════\n');
    console.log('✅ You can now login with these credentials!');

  } catch (error: any) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

resetAdminPassword();
