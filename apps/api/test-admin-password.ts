import { prisma } from '@medthread/database';
import bcrypt from 'bcrypt';

async function testAdminPassword() {
  try {
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@medthread.com' }
    });
    
    if (!admin) {
      console.log('❌ Admin user not found!');
      return;
    }
    
    console.log('Admin user found:');
    console.log(`  Email: ${admin.email}`);
    console.log(`  Username: ${admin.username}`);
    console.log(`  Role: ${admin.role}`);
    console.log(`  Password hash: ${admin.password?.substring(0, 20)}...`);
    console.log(`  Hash length: ${admin.password?.length}`);
    
    // Test password
    const testPassword = 'admin123';
    console.log(`\nTesting password: "${testPassword}"`);
    
    if (!admin.password) {
      console.log('❌ No password hash stored!');
      return;
    }
    
    const isValid = await bcrypt.compare(testPassword, admin.password);
    console.log(`Result: ${isValid ? '✅ VALID' : '❌ INVALID'}`);
    
    if (!isValid) {
      console.log('\n🔧 Fixing password...');
      const newHash = await bcrypt.hash(testPassword, 10);
      await prisma.user.update({
        where: { id: admin.id },
        data: { password: newHash }
      });
      console.log('✅ Password updated!');
      
      // Test again
      const admin2 = await prisma.user.findUnique({
        where: { email: 'admin@medthread.com' }
      });
      const isValid2 = await bcrypt.compare(testPassword, admin2!.password!);
      console.log(`Verification: ${isValid2 ? '✅ VALID' : '❌ STILL INVALID'}`);
    }
    
  } catch (error: any) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testAdminPassword();
