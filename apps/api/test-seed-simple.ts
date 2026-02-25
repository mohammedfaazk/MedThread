import { prisma } from '@medthread/database';
import { hash } from 'bcryptjs';

async function testSeed() {
  console.log('Testing database connection...');
  
  try {
    // Test connection
    const userCount = await prisma.user.count();
    console.log(`Current users: ${userCount}`);
    
    // Try to create one doctor
    const hashedPassword = await hash('Doctor@123', 10);
    const doctor = await prisma.user.upsert({
      where: { email: 'test.doctor@medthread.com' },
      update: {},
      create: {
        username: 'Test Doctor',
        email: 'test.doctor@medthread.com',
        passwordHash: hashedPassword,
        role: 'DOCTOR',
        specialty: 'Cardiology',
        verified: true,
        doctorVerificationStatus: 'APPROVED',
      }
    });
    
    console.log('✓ Doctor created:', doctor.email);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testSeed();
