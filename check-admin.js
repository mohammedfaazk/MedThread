/**
 * Check Admin Status Script
 * 
 * This script checks the current admin user status in the database
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function checkAdmin() {
  console.log('\n🔍 Checking Admin Status...\n');

  try {
    // Find all admin users
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        verified: true,
        emailVerified: true,
        isSuspended: true,
        createdAt: true,
        passwordHash: true
      }
    });

    if (admins.length === 0) {
      console.log('❌ No admin users found in database!\n');
      console.log('💡 Run one of these commands to create an admin:\n');
      console.log('   npm run seed:admin     (in apps/api)');
      console.log('   node reset-admin.js    (in root)\n');
      return;
    }

    console.log(`✅ Found ${admins.length} admin user(s):\n`);

    for (const admin of admins) {
      console.log('╔════════════════════════════════════════╗');
      console.log('║   Admin User Details                   ║');
      console.log('╠════════════════════════════════════════╣');
      console.log(`║  ID:           ${admin.id.substring(0, 24).padEnd(24)}║`);
      console.log(`║  Email:        ${admin.email.padEnd(24)}║`);
      console.log(`║  Username:     ${admin.username.padEnd(24)}║`);
      console.log(`║  Role:         ${admin.role.padEnd(24)}║`);
      console.log(`║  Verified:     ${String(admin.verified).padEnd(24)}║`);
      console.log(`║  Suspended:    ${String(admin.isSuspended).padEnd(24)}║`);
      console.log(`║  Created:      ${admin.createdAt.toISOString().substring(0, 24)}║`);
      console.log('╚════════════════════════════════════════╝\n');

      // Test default password
      console.log('🔐 Testing default password (Admin@123456)...');
      const isDefaultPassword = await bcrypt.compare('Admin@123456', admin.passwordHash);
      
      if (isDefaultPassword) {
        console.log('✅ Default password works!\n');
        console.log('📋 Use these credentials to login:');
        console.log(`   Email: ${admin.email}`);
        console.log(`   Password: Admin@123456\n`);
      } else {
        console.log('❌ Default password does NOT work\n');
        console.log('💡 The password has been changed or is different.');
        console.log('   Run: node reset-admin.js to reset it\n');
      }
    }

    // Check for users with admin email but wrong role
    const adminEmailUser = await prisma.user.findUnique({
      where: { email: 'admin@medthread.com' },
      select: {
        id: true,
        email: true,
        username: true,
        role: true
      }
    });

    if (adminEmailUser && adminEmailUser.role !== 'ADMIN') {
      console.log('⚠️  WARNING: User with admin email exists but role is not ADMIN!');
      console.log(`   Email: ${adminEmailUser.email}`);
      console.log(`   Role: ${adminEmailUser.role}`);
      console.log('   Run: node reset-admin.js to fix this\n');
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdmin()
  .then(() => {
    console.log('✅ Check complete!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Check failed:', error);
    process.exit(1);
  });
