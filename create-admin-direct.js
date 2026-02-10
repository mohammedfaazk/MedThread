/**
 * Direct Admin Creation Script
 * Loads environment variables and creates admin user
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

const DEFAULT_ADMIN = {
  email: 'admin@medthread.com',
  username: 'admin',
  password: 'Admin@123456'
};

async function createAdmin() {
  console.log('\n🔐 Creating Admin User...\n');
  console.log('📊 Database URL:', process.env.DATABASE_URL?.substring(0, 50) + '...\n');

  try {
    // Test connection first
    console.log('🔌 Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connected!\n');

    // Check if admin already exists
    console.log('🔍 Checking for existing admin...');
    const existingAdmin = await prisma.user.findFirst({
      where: { 
        OR: [
          { role: 'ADMIN' },
          { email: DEFAULT_ADMIN.email }
        ]
      }
    });

    if (existingAdmin) {
      console.log('📋 Found existing user:');
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Role: ${existingAdmin.role}\n`);
      
      if (existingAdmin.role === 'ADMIN') {
        console.log('✅ Admin already exists!\n');
        
        // Test password
        console.log('🔐 Testing default password...');
        const isValid = await bcrypt.compare(DEFAULT_ADMIN.password, existingAdmin.passwordHash);
        
        if (isValid) {
          console.log('✅ Default password works!\n');
          console.log('╔════════════════════════════════════════╗');
          console.log('║   USE THESE CREDENTIALS                ║');
          console.log('╠════════════════════════════════════════╣');
          console.log(`║  Email:    ${DEFAULT_ADMIN.email.padEnd(28)}║`);
          console.log(`║  Password: ${DEFAULT_ADMIN.password.padEnd(28)}║`);
          console.log('╚════════════════════════════════════════╝\n');
          return;
        } else {
          console.log('❌ Default password does NOT work\n');
          console.log('🔄 Deleting and recreating admin...\n');
          await prisma.user.delete({ where: { id: existingAdmin.id } });
        }
      } else {
        console.log('⚠️  User exists but is not admin. Deleting...\n');
        await prisma.user.delete({ where: { id: existingAdmin.id } });
      }
    } else {
      console.log('ℹ️  No existing admin found\n');
    }

    // Hash password
    console.log('🔐 Hashing password...');
    const passwordHash = await bcrypt.hash(DEFAULT_ADMIN.password, 12);
    console.log('✅ Password hashed\n');

    // Create admin user
    console.log('👤 Creating admin user...');
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

    console.log('✅ Admin user created successfully!\n');
    console.log('╔════════════════════════════════════════╗');
    console.log('║   ADMIN CREDENTIALS                    ║');
    console.log('╠════════════════════════════════════════╣');
    console.log(`║  Email:    ${DEFAULT_ADMIN.email.padEnd(28)}║`);
    console.log(`║  Username: ${DEFAULT_ADMIN.username.padEnd(28)}║`);
    console.log(`║  Password: ${DEFAULT_ADMIN.password.padEnd(28)}║`);
    console.log('╚════════════════════════════════════════╝\n');
    console.log('🌐 Login at: http://localhost:3000/login\n');

    // Verify credentials work
    console.log('🧪 Verifying credentials...');
    const testUser = await prisma.user.findUnique({
      where: { email: DEFAULT_ADMIN.email }
    });

    const isValid = await bcrypt.compare(DEFAULT_ADMIN.password, testUser.passwordHash);
    if (isValid) {
      console.log('✅ Credentials verified - Ready to login!\n');
    } else {
      console.log('❌ Verification failed!\n');
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.code === 'P2002') {
      console.error('\n💡 Unique constraint violation. User might already exist.');
      console.error('   Try running: node check-admin.js\n');
    } else {
      console.error(error);
    }
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin()
  .then(() => {
    console.log('✅ Admin creation complete!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Failed to create admin');
    process.exit(1);
  });
