import 'dotenv/config';
import { PrismaClient } from '@medthread/database';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createStandardUsers() {
  console.log('🔧 Creating standard users...\n');

  const usersToCreate = [
    {
      username: 'admin',
      email: 'admin@medthread.com',
      password: 'Admin@123456',
      role: 'ADMIN',
    },
    {
      username: 'rifa',
      email: 'rifa@gmail.com',
      password: 'Doctor@123456',
      role: 'DOCTOR',
      doctorVerificationStatus: 'APPROVED',
      specialty: 'General Medicine',
      medicalLicenseNumber: 'DOC123456',
    },
    {
      username: 'navin',
      email: 'navin@gmail.com',
      password: 'Patient@123456',
      role: 'PATIENT',
    },
  ];

  try {
    for (const userData of usersToCreate) {
      // Check if user already exists
      const existing = await prisma.user.findUnique({
        where: { email: userData.email },
      });

      if (existing) {
        console.log(`⚠️  User ${userData.email} already exists - updating password...`);
        
        const hashedPassword = await bcrypt.hash(userData.password, 12);
        await prisma.user.update({
          where: { email: userData.email },
          data: { passwordHash: hashedPassword },
        });
        
        console.log(`✅ Updated ${userData.email}`);
        console.log(`   Password: ${userData.password}\n`);
      } else {
        console.log(`➕ Creating ${userData.email}...`);
        
        const hashedPassword = await bcrypt.hash(userData.password, 12);
        const { password, ...userDataWithoutPassword } = userData;
        
        await prisma.user.create({
          data: {
            ...userDataWithoutPassword,
            passwordHash: hashedPassword,
            emailVerified: true,
          },
        });
        
        console.log(`✅ Created ${userData.email}`);
        console.log(`   Username: ${userData.username}`);
        console.log(`   Password: ${userData.password}`);
        console.log(`   Role: ${userData.role}\n`);
      }
    }

    console.log('=' .repeat(80));
    console.log('\n✅ ALL STANDARD USERS READY!\n');
    console.log('📋 LOGIN CREDENTIALS:\n');
    console.log('ADMIN:');
    console.log('  Email: admin@medthread.com');
    console.log('  Password: Admin@123456\n');
    console.log('DOCTOR:');
    console.log('  Email: rifa@gmail.com');
    console.log('  Password: Doctor@123456\n');
    console.log('PATIENT:');
    console.log('  Email: navin@gmail.com');
    console.log('  Password: Patient@123456\n');
    console.log('=' .repeat(80));

    // Test logins
    console.log('\n🧪 Testing logins...\n');

    for (const userData of usersToCreate) {
      const user = await prisma.user.findUnique({
        where: { email: userData.email },
      });

      if (user && user.passwordHash) {
        const isValid = await bcrypt.compare(userData.password, user.passwordHash);
        if (isValid) {
          console.log(`✅ ${userData.role}: ${userData.email} - Login works!`);
        } else {
          console.log(`❌ ${userData.role}: ${userData.email} - Password mismatch!`);
        }
      } else {
        console.log(`❌ ${userData.role}: ${userData.email} - User not found!`);
      }
    }

    console.log('\n✅ All users ready to use!\n');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createStandardUsers();
