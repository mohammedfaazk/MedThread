import { prisma } from '@medthread/database';
import bcrypt from 'bcrypt';

async function checkAdminUser() {
  try {
    console.log('🔍 Checking admin user...\n');

    const admin = await prisma.user.findUnique({
      where: { email: 'admin@medthread.com' }
    });

    if (!admin) {
      console.log('❌ Admin user not found!');
      console.log('Run: npm run seed:admin');
      return;
    }

    console.log('✅ Admin user found:');
    console.log('ID:', admin.id);
    console.log('Email:', admin.email);
    console.log('Username:', admin.username);
    console.log('Role:', admin.role);
    console.log('Password Hash:', admin.passwordHash ? admin.passwordHash.substring(0, 20) + '...' : 'NULL/UNDEFINED');

    if (!admin.passwordHash) {
      console.log('\n⚠️  Password is NULL! Setting password...');
      const testPassword = 'Admin@123456';
      const hashedPassword = await bcrypt.hash(testPassword, 10);
      await prisma.user.update({
        where: { email: 'admin@medthread.com' },
        data: { passwordHash: hashedPassword }
      });
      console.log('✅ Password set successfully!');
      console.log('You can now login with:');
      console.log('Email: admin@medthread.com');
      console.log('Password: Admin@123456');
      return;
    }

    // Test password
    const testPassword = 'Admin@123456';
    const isValid = await bcrypt.compare(testPassword, admin.passwordHash);
    
    console.log('\n🔐 Password Test:');
    console.log('Testing password:', testPassword);
    console.log('Result:', isValid ? '✅ VALID' : '❌ INVALID');

    if (!isValid) {
      console.log('\n⚠️  Password does not match! Resetting...');
      const hashedPassword = await bcrypt.hash(testPassword, 10);
      await prisma.user.update({
        where: { email: 'admin@medthread.com' },
        data: { passwordHash: hashedPassword }
      });
      console.log('✅ Password reset successfully!');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdminUser();
