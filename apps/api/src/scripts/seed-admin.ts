import { prisma } from '@medthread/database';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from root .env
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

async function seedAdmin() {
  console.log('\n🌱 Seeding admin user...\n');

  try {
    // Check if admin already exists
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });

    if (existingAdmin) {
      console.log('✅ Admin user already exists!');
      console.log(`   Username: ${existingAdmin.username}`);
      console.log(`   Email: ${existingAdmin.email}\n`);
      return;
    }

    // Default admin credentials
    const adminData = {
      email: 'admin@medthread.com',
      username: 'admin',
      password: 'Admin@123456', // Change this in production!
    };

    // Hash password
    const passwordHash = await bcrypt.hash(adminData.password, 12);

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        email: adminData.email,
        username: adminData.username,
        passwordHash,
        role: 'ADMIN',
        verified: true,
        emailVerified: true,
      }
    });

    console.log('✅ Admin user created successfully!\n');
    console.log('╔════════════════════════════════════════╗');
    console.log('║   DEFAULT ADMIN CREDENTIALS            ║');
    console.log('╠════════════════════════════════════════╣');
    console.log(`║  Email:    ${adminData.email.padEnd(28)}║`);
    console.log(`║  Username: ${adminData.username.padEnd(28)}║`);
    console.log(`║  Password: ${adminData.password.padEnd(28)}║`);
    console.log('╚════════════════════════════════════════╝\n');
    console.log('⚠️  IMPORTANT: Change the password after first login!\n');
    console.log('Login URL: http://localhost:3000/admin/login\n');

  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedAdmin()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
