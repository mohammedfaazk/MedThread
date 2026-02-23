import 'dotenv/config';
import { PrismaClient } from '@medthread/database';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function checkAndFixAllUsers() {
  console.log('🔍 Checking all users in database...\n');

  try {
    // Get all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        passwordHash: true,
        role: true,
      },
    });

    console.log(`📊 Found ${users.length} users in database\n`);
    console.log('=' .repeat(80));

    const usersToFix: any[] = [];

    for (const user of users) {
      console.log(`\n👤 User: ${user.username}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Password Hash: ${user.passwordHash?.substring(0, 20)}...`);

      // Check if password is valid bcrypt hash
      const isBcryptHash = user.passwordHash?.startsWith('$2a$') || user.passwordHash?.startsWith('$2b$');
      
      if (!user.passwordHash) {
        console.log(`   ❌ NO PASSWORD - needs fixing`);
        usersToFix.push({ ...user, reason: 'no_password' });
      } else if (!isBcryptHash) {
        console.log(`   ❌ INVALID HASH - needs fixing`);
        usersToFix.push({ ...user, reason: 'invalid_hash' });
      } else {
        // Test if hash is valid by trying to compare
        try {
          await bcrypt.compare('test', user.passwordHash);
          console.log(`   ✅ Valid bcrypt hash`);
        } catch (error) {
          console.log(`   ❌ CORRUPTED HASH - needs fixing`);
          usersToFix.push({ ...user, reason: 'corrupted_hash' });
        }
      }
    }

    console.log('\n' + '=' .repeat(80));

    // Define default passwords for each role
    const defaultPasswords: Record<string, string> = {
      ADMIN: 'Admin@123456',
      DOCTOR: 'Doctor@123456',
      PATIENT: 'Patient@123456',
    };

    if (usersToFix.length > 0) {
      console.log(`\n⚠️  Found ${usersToFix.length} users that need fixing\n`);

      for (const user of usersToFix) {
        const defaultPassword = defaultPasswords[user.role] || 'Default@123456';
        const hashedPassword = await bcrypt.hash(defaultPassword, 12);

        await prisma.user.update({
          where: { id: user.id },
          data: { passwordHash: hashedPassword },
        });

        console.log(`✅ Fixed ${user.username} (${user.email})`);
        console.log(`   New password: ${defaultPassword}`);
      }

      console.log('\n✅ All users fixed!\n');
    } else {
      console.log('\n✅ All users have valid passwords!\n');
    }

    // Print summary with credentials
    console.log('=' .repeat(80));
    console.log('\n📋 LOGIN CREDENTIALS SUMMARY:\n');

    const allUsers = await prisma.user.findMany({
      select: {
        username: true,
        email: true,
        role: true,
      },
      orderBy: { role: 'asc' },
    });

    const groupedByRole: Record<string, any[]> = {};
    allUsers.forEach(user => {
      if (!groupedByRole[user.role]) {
        groupedByRole[user.role] = [];
      }
      groupedByRole[user.role].push(user);
    });

    for (const [role, users] of Object.entries(groupedByRole)) {
      console.log(`\n${role}S:`);
      const defaultPassword = defaultPasswords[role] || 'Default@123456';
      
      users.forEach(user => {
        console.log(`  📧 ${user.email}`);
        console.log(`     Username: ${user.username}`);
        console.log(`     Password: ${defaultPassword}`);
        console.log('');
      });
    }

    console.log('=' .repeat(80));

    // Test login for each role
    console.log('\n🧪 Testing login for each role...\n');

    const testUsers = [
      { email: 'admin@medthread.com', password: 'Admin@123456', role: 'ADMIN' },
      { email: 'rifa@gmail.com', password: 'Doctor@123456', role: 'DOCTOR' },
      { email: 'navin@gmail.com', password: 'Patient@123456', role: 'PATIENT' },
    ];

    for (const testUser of testUsers) {
      const user = await prisma.user.findUnique({
        where: { email: testUser.email },
      });

      if (user && user.passwordHash) {
        const isValid = await bcrypt.compare(testUser.password, user.passwordHash);
        if (isValid) {
          console.log(`✅ ${testUser.role}: ${testUser.email} - Login works!`);
        } else {
          console.log(`❌ ${testUser.role}: ${testUser.email} - Password mismatch!`);
        }
      } else {
        console.log(`⚠️  ${testUser.role}: ${testUser.email} - User not found`);
      }
    }

    console.log('\n✅ Check complete!\n');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAndFixAllUsers();
