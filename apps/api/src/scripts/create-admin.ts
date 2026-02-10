import { prisma } from '@medthread/database';
import bcrypt from 'bcrypt';
import * as readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query: string): Promise<string> {
  return new Promise(resolve => rl.question(query, resolve));
}

async function createAdmin() {
  console.log('\n╔════════════════════════════════════════╗');
  console.log('║   MedThread Admin User Creation       ║');
  console.log('╚════════════════════════════════════════╝\n');

  try {
    // Check if admin already exists
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });

    if (existingAdmin) {
      console.log('⚠️  Admin user already exists!');
      console.log(`   Username: ${existingAdmin.username}`);
      console.log(`   Email: ${existingAdmin.email}\n`);
      
      const overwrite = await question('Do you want to create another admin? (yes/no): ');
      if (overwrite.toLowerCase() !== 'yes') {
        console.log('\n✅ Keeping existing admin user.\n');
        rl.close();
        process.exit(0);
      }
    }

    // Get admin details
    const email = await question('\nEnter admin email: ');
    const username = await question('Enter admin username: ');
    const password = await question('Enter admin password (min 8 characters): ');

    // Validate inputs
    if (!email || !email.includes('@')) {
      throw new Error('Invalid email address');
    }

    if (!username || username.length < 3) {
      throw new Error('Username must be at least 3 characters');
    }

    if (!password || password.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }

    // Check if email or username already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    });

    if (existingUser) {
      throw new Error('Email or username already exists');
    }

    // Hash password
    console.log('\n⏳ Creating admin user...');
    const passwordHash = await bcrypt.hash(password, 12);

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        email,
        username,
        passwordHash,
        role: 'ADMIN',
        verified: true,
        emailVerified: true,
      }
    });

    console.log('\n✅ Admin user created successfully!\n');
    console.log('╔════════════════════════════════════════╗');
    console.log('║   Admin Credentials                    ║');
    console.log('╠════════════════════════════════════════╣');
    console.log(`║  Email:    ${email.padEnd(28)}║`);
    console.log(`║  Username: ${username.padEnd(28)}║`);
    console.log(`║  Password: ${password.padEnd(28)}║`);
    console.log('╚════════════════════════════════════════╝\n');
    console.log('⚠️  IMPORTANT: Save these credentials securely!\n');
    console.log('You can now login at: http://localhost:3000/admin/login\n');

  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

createAdmin();
