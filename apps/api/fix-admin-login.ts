import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

// Use DIRECT_URL to bypass connection pool
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL || process.env.DATABASE_URL
    }
  }
});

async function fixAdminLogin() {
  try {
    console.log('🔧 Fixing admin login...');
    
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const admin = await prisma.user.upsert({
      where: { email: 'admin@medthread.com' },
      update: {
        passwordHash: hashedPassword,
        role: 'ADMIN',
        verified: true
      },
      create: {
        email: 'admin@medthread.com',
        passwordHash: hashedPassword,
        username: 'admin',
        role: 'ADMIN',
        verified: true
      }
    });
    
    console.log('✅ Admin user fixed!');
    console.log('📧 Email: admin@medthread.com');
    console.log('🔑 Password: admin123');
    console.log('👤 Role:', admin.role);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixAdminLogin();
