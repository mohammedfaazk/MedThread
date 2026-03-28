import { prisma } from '@medthread/database';
import bcrypt from 'bcryptjs';

async function checkAdminCredentials() {
  try {
    console.log('🔍 Checking admin user...');
    
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@medthread.com' }
    });

    if (!admin) {
      console.log('❌ Admin user not found');
      return;
    }

    console.log('✅ Admin user found:');
    console.log('   Email:', admin.email);
    console.log('   Username:', admin.username);
    console.log('   Role:', admin.role);
    console.log('   Has password:', !!admin.passwordHash);
    console.log('   Password value:', admin.passwordHash);
    console.log('   Password length:', admin.passwordHash?.length);

    if (!admin.passwordHash || admin.passwordHash === '' || admin.passwordHash === 'null') {
      console.log('\n⚠️  Admin has no password set!');
      console.log('🔄 Setting password to "Admin@123"...');
      
      const hashedPassword = await bcrypt.hash('Admin@123', 10);
      
      await prisma.user.update({
        where: { email: 'admin@medthread.com' },
        data: { passwordHash: hashedPassword }
      });

      console.log('✅ Password set successfully!');
      console.log('\n📋 Admin Credentials:');
      console.log('   Email: admin@medthread.com');
      console.log('   Password: Admin@123');
      return;
    }

    // Test common passwords
    const testPasswords = ['Admin@123', 'admin123', 'Admin123', 'admin@123'];
    
    console.log('\n🔐 Testing common passwords...');
    for (const pwd of testPasswords) {
      const isValid = await bcrypt.compare(pwd, admin.password);
      console.log(`   "${pwd}": ${isValid ? '✅ VALID' : '❌ Invalid'}`);
      if (isValid) {
        console.log(`\n✅ Working password found: "${pwd}"`);
        return;
      }
    }

    // Reset to Admin@123
    console.log('\n🔄 Resetting password to "Admin@123"...');
    const hashedPassword = await bcrypt.hash('Admin@123', 10);
    
    await prisma.user.update({
      where: { email: 'admin@medthread.com' },
      data: { password: hashedPassword }
    });

    console.log('✅ Password reset complete!');
    console.log('\n📋 Admin Credentials:');
    console.log('   Email: admin@medthread.com');
    console.log('   Password: Admin@123');

  } catch (error: any) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdminCredentials();
