import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function fixAdminPassword() {
  try {
    console.log('🔧 Fixing admin password...');
    
    // Find admin user
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@medthread.com' }
    });
    
    if (!admin) {
      console.log('❌ Admin user not found');
      return;
    }
    
    console.log('✅ Admin user found:', admin.email);
    console.log('   Current password hash:', admin.passwordHash.substring(0, 20) + '...');
    
    // Hash the correct password
    const correctPassword = 'Admin@123';
    const newHash = await bcrypt.hash(correctPassword, 10);
    
    console.log('🔐 New password hash:', newHash.substring(0, 20) + '...');
    
    // Update the password
    await prisma.user.update({
      where: { email: 'admin@medthread.com' },
      data: { passwordHash: newHash }
    });
    
    console.log('✅ Admin password updated successfully!');
    console.log('   Email: admin@medthread.com');
    console.log('   Password: Admin@123');
    
    // Verify the password works
    const updatedAdmin = await prisma.user.findUnique({
      where: { email: 'admin@medthread.com' }
    });
    
    if (updatedAdmin) {
      const isValid = await bcrypt.compare(correctPassword, updatedAdmin.passwordHash);
      console.log('🔍 Password verification:', isValid ? '✅ VALID' : '❌ INVALID');
    }
    
    await prisma.$disconnect();
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixAdminPassword();
