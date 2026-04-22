import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL || process.env.DATABASE_URL
    }
  }
});

async function updatePendingDoctorsEducation() {
  console.log('🎓 Updating Pending Doctors Education Info...\n');

  try {
    // Update Dr. Sarah Johnson
    const doctor1 = await prisma.user.update({
      where: { email: 'sarah.johnson@medthread.com' },
      data: {
        medicalUniversity: 'Grant Medical College, Mumbai',
        graduationYear: 2010
      }
    });

    console.log('✅ Dr. Sarah Johnson updated');
    console.log(`   Medical University: ${doctor1.medicalUniversity}`);
    console.log(`   Graduation Year: ${doctor1.graduationYear}\n`);

    // Update Dr. Rajesh Kumar
    const doctor2 = await prisma.user.update({
      where: { email: 'rajesh.kumar@medthread.com' },
      data: {
        medicalUniversity: 'Bangalore Medical College',
        graduationYear: 2007
      }
    });

    console.log('✅ Dr. Rajesh Kumar updated');
    console.log(`   Medical University: ${doctor2.medicalUniversity}`);
    console.log(`   Graduation Year: ${doctor2.graduationYear}\n`);

    console.log('🎉 Success! Both doctors now have education details');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updatePendingDoctorsEducation();
