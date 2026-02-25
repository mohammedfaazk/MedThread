import { prisma } from '@medthread/database';
import bcrypt from 'bcrypt';

async function fixAllPasswords() {
  try {
    console.log('🔧 Fixing all user passwords...\n');
    
    const users = [
      { email: 'admin@medthread.com', password: 'admin123' },
      { email: 'dr.smith@medthread.com', password: 'doctor123' },
      { email: 'dr.johnson@medthread.com', password: 'doctor123' },
      { email: 'dr.chen@medthread.com', password: 'doctor123' },
      { email: 'dr.rodriguez@medthread.com', password: 'doctor123' },
      { email: 'dr.wilson@medthread.com', password: 'doctor123' },
      { email: 'john.doe@example.com', password: 'patient123' },
      { email: 'jane.smith@example.com', password: 'patient123' },
      { email: 'bob.johnson@example.com', password: 'patient123' },
      { email: 'alice.williams@example.com', password: 'patient123' },
      { email: 'charlie.brown@example.com', password: 'patient123' },
    ];
    
    for (const userData of users) {
      const user = await prisma.user.findUnique({
        where: { email: userData.email }
      });
      
      if (user) {
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        await prisma.user.update({
          where: { id: user.id },
          data: { passwordHash: hashedPassword }
        });
        console.log(`✅ ${userData.email} - password set`);
      } else {
        console.log(`⚠️  ${userData.email} - user not found`);
      }
    }
    
    console.log('\n✅ All passwords fixed!');
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

fixAllPasswords();
