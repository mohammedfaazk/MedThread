import { prisma } from '@medthread/database';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from root .env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function checkRifaUser() {
  console.log('\n🔍 Checking for user: rifa@gmail.com\n');
  console.log('═'.repeat(60));

  try {
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: 'rifa@gmail.com' },
      select: {
        id: true,
        email: true,
        username: true,
        passwordHash: true,
        role: true,
        verified: true,
        isSuspended: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      console.log('\n❌ User "rifa@gmail.com" NOT FOUND in database\n');
      
      // Show all users for reference
      console.log('📋 All users in database:');
      const allUsers = await prisma.user.findMany({
        select: { 
          email: true, 
          username: true, 
          role: true,
          createdAt: true 
        },
        orderBy: { createdAt: 'desc' }
      });
      
      if (allUsers.length === 0) {
        console.log('   (No users found)');
      } else {
        allUsers.forEach((u, i) => {
          console.log(`   ${i + 1}. ${u.email} (${u.username}) - ${u.role} - Created: ${u.createdAt.toISOString()}`);
        });
      }
      
      console.log('\n' + '═'.repeat(60));
      return;
    }

    // User found - display information
    console.log('\n✅ USER FOUND!\n');
    console.log('╔══════════════════════════════════════════════════════════╗');
    console.log('║                    USER INFORMATION                      ║');
    console.log('╠══════════════════════════════════════════════════════════╣');
    console.log(`║  Email:      ${user.email.padEnd(45)}║`);
    console.log(`║  Username:   ${user.username.padEnd(45)}║`);
    console.log(`║  Role:       ${user.role.padEnd(45)}║`);
    console.log(`║  Verified:   ${String(user.verified).padEnd(45)}║`);
    console.log(`║  Suspended:  ${String(user.isSuspended).padEnd(45)}║`);
    console.log(`║  Created:    ${user.createdAt.toISOString().padEnd(45)}║`);
    console.log(`║  Updated:    ${user.updatedAt.toISOString().padEnd(45)}║`);
    console.log('╚══════════════════════════════════════════════════════════╝\n');

    console.log(`🔐 Password Hash: ${user.passwordHash}\n`);
    console.log('═'.repeat(60));

    // Test common passwords
    console.log('\n🧪 Testing common passwords...\n');
    
    const passwordsToTest = [
      'rifa123',
      'Rifa123',
      'rifa@123',
      'Rifa@123',
      'password',
      'Password123',
      'Password@123',
      '123456',
      'rifa',
      'Rifa'
    ];

    let matchFound = false;
    
    for (const pwd of passwordsToTest) {
      const isMatch = await bcrypt.compare(pwd, user.passwordHash);
      const status = isMatch ? '✅ MATCH' : '❌ No match';
      console.log(`   Testing "${pwd}": ${status}`);
      
      if (isMatch) {
        matchFound = true;
        console.log(`\n🎉 SUCCESS! Password is: "${pwd}"\n`);
        break;
      }
    }

    if (!matchFound) {
      console.log('\n⚠️  None of the common passwords matched.');
      console.log('   The password might be different from what was expected.\n');
    }

    console.log('═'.repeat(60));

  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    console.error('\nStack trace:', error.stack);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

checkRifaUser()
  .then(() => {
    console.log('\n✨ Check complete!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
