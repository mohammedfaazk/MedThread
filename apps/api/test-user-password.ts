import { prisma } from '@medthread/database';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as readline from 'readline';

// Load environment variables from root .env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

async function testUserPassword() {
  console.log('\n🔐 Password Verification Test\n');
  console.log('═'.repeat(50));

  const targetEmail = 'meghamaryvinu@licet.ac.in';

  try {
    // Fetch user from database
    console.log(`\n📧 Looking up user: ${targetEmail}...`);
    const user = await prisma.user.findUnique({
      where: { email: targetEmail },
      select: {
        id: true,
        email: true,
        username: true,
        passwordHash: true,
        role: true,
        verified: true,
        isSuspended: true,
        createdAt: true
      }
    });

    if (!user) {
      console.log(`\n❌ User not found: ${targetEmail}`);
      console.log('\nAvailable users in database:');
      
      const allUsers = await prisma.user.findMany({
        select: { email: true, username: true, role: true },
        take: 10
      });
      
      allUsers.forEach((u, i) => {
        console.log(`   ${i + 1}. ${u.email} (${u.username}) - ${u.role}`);
      });
      
      return;
    }

    // Display user information
    console.log('\n✅ User found!');
    console.log('\n╔════════════════════════════════════════════════╗');
    console.log('║              USER INFORMATION                  ║');
    console.log('╠════════════════════════════════════════════════╣');
    console.log(`║  Email:      ${user.email.padEnd(33)}║`);
    console.log(`║  Username:   ${user.username.padEnd(33)}║`);
    console.log(`║  Role:       ${user.role.padEnd(33)}║`);
    console.log(`║  Verified:   ${String(user.verified).padEnd(33)}║`);
    console.log(`║  Suspended:  ${String(user.isSuspended).padEnd(33)}║`);
    console.log(`║  Created:    ${user.createdAt.toISOString().split('T')[0].padEnd(33)}║`);
    console.log('╚════════════════════════════════════════════════╝\n');

    console.log(`Password Hash: ${user.passwordHash.substring(0, 30)}...\n`);

    // Ask for password to test
    console.log('Common passwords to test:');
    console.log('  1. Admin@123456 (default admin password)');
    console.log('  2. Password@123');
    console.log('  3. Custom password\n');

    const choice = await question('Enter choice (1-3) or press Enter for option 1: ');
    
    let passwordToTest: string;
    
    if (choice === '2') {
      passwordToTest = 'Password@123';
    } else if (choice === '3') {
      passwordToTest = await question('Enter password to test: ');
    } else {
      passwordToTest = 'Admin@123456';
    }

    console.log(`\n🔍 Testing password: "${passwordToTest}"`);
    console.log('⏳ Comparing with bcrypt hash...\n');

    // Test password
    const isMatch = await bcrypt.compare(passwordToTest, user.passwordHash);

    console.log('═'.repeat(50));
    if (isMatch) {
      console.log('\n✅ PASSWORD MATCH! ✅');
      console.log(`\nThe password "${passwordToTest}" is CORRECT for ${user.email}`);
    } else {
      console.log('\n❌ PASSWORD MISMATCH! ❌');
      console.log(`\nThe password "${passwordToTest}" is INCORRECT for ${user.email}`);
      console.log('\nTry running the script again with a different password.');
    }
    console.log('\n' + '═'.repeat(50));

    // Additional test with other common passwords if first attempt failed
    if (!isMatch) {
      console.log('\n🔄 Would you like to test another password? (y/n): ');
      const retry = await question('');
      
      if (retry.toLowerCase() === 'y') {
        const anotherPassword = await question('Enter password to test: ');
        const anotherMatch = await bcrypt.compare(anotherPassword, user.passwordHash);
        
        console.log('\n' + '═'.repeat(50));
        if (anotherMatch) {
          console.log('\n✅ PASSWORD MATCH! ✅');
          console.log(`\nThe password "${anotherPassword}" is CORRECT for ${user.email}`);
        } else {
          console.log('\n❌ PASSWORD MISMATCH! ❌');
          console.log(`\nThe password "${anotherPassword}" is INCORRECT for ${user.email}`);
        }
        console.log('\n' + '═'.repeat(50));
      }
    }

  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    console.error('\nStack trace:', error.stack);
    throw error;
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

testUserPassword()
  .then(() => {
    console.log('\n✨ Test complete!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
