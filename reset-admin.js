/**
 * Reset Admin Credentials Script
 * 
 * This script will:
 * 1. Check if admin exists
 * 2. Delete existing admin if found
 * 3. Create new admin with default credentials
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

const DEFAULT_ADMIN = {
  email: 'admin@medthread.com',
  username: 'admin',
  password: 'Admin@123456'
};

async function resetAdmin() {
  console.log('\n🔄 Resetting Admin Credentials...\n');

  try {
    // Find existing admin
    const existingAdmin = await prisma.user.findFirst({
      where: { 
        OR: [
          { role: 'ADMIN' },
          { email: DEFAULT_ADMIN.email },
          { username: DEFAULT_ADMIN.username }
        ]
      }
    });

    if (existingAdmin) {
      console.log('📋 Found existing admin:');
      console.log(`   ID: ${existingAdmin.id}`);
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Username: ${existingAdmin.username}`);
      console.log(`   Role: ${existingAdmin.role}\n`);
      
      // Delete existing admin
      await prisma.user.delete({
        where: { id: existingAdmin.id }
      });
      console.log('✅ Deleted existing admin\n');
    } else {
      console.log('ℹ️  No existing admin found\n');
    }

    // Hash password
    console.log('🔐 Hashing password...');
    const passwordHash = await bcrypt.hash(DEFAULT_ADMIN.password, 12);

    // Create new admin
    console.log('👤 Creating new admin user...');
    const admin = await prisma.user.create({
      data: {
        email: DEFAULT_ADMIN.email,
        username: DEFAULT_ADMIN.username,
        passwordHash,
        role: 'ADMIN',
        verified: true,
        emailVerified: true,
      }
    });

    console.log('\n✅ Admin user created successfully!\n');
    console.log('╔════════════════════════════════════════╗');
    console.log('║   ADMIN CREDENTIALS                    ║');
    console.log('╠════════════════════════════════════════╣');
    console.log(`║  Email:    ${DEFAULT_ADMIN.email.padEnd(28)}║`);
    console.log(`║  Username: ${DEFAULT_ADMIN.username.padEnd(28)}║`);
    console.log(`║  Password: ${DEFAULT_ADMIN.password.padEnd(28)}║`);
    console.log('╚════════════════════════════════════════╝\n');
    console.log('🌐 Login URL: http://localhost:3000/login\n');
    console.log('⚠️  IMPORTANT: Change the password after first login!\n');

    // Test login
    console.log('🧪 Testing credentials...');
    const testUser = await prisma.user.findUnique({
      where: { email: DEFAULT_ADMIN.email },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        passwordHash: true
      }
    });

    if (testUser) {
      const isValid = await bcrypt.compare(DEFAULT_ADMIN.password, testUser.passwordHash);
      if (isValid) {
        console.log('✅ Credentials verified - Login should work!\n');
      } else {
        console.log('❌ Password verification failed!\n');
      }
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

resetAdmin()
  .then(() => {
    console.log('✅ Admin reset complete!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Failed to reset admin:', error);
    process.exit(1);
  });
