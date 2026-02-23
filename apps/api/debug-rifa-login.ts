import { prisma } from '@medthread/database';
import bcrypt from 'bcrypt';

async function debugRifaLogin() {
  try {
    console.log('🔍 Debugging rifa@gmail.com login...\n');

    const user = await prisma.user.findUnique({
      where: { email: 'rifa@gmail.com' }
    });

    if (!user) {
      console.log('❌ User not found!');
      console.log('Creating user with password Rifa@123...\n');
      
      const hashedPassword = await bcrypt.hash('Rifa@123', 10);
      const newUser = await prisma.user.create({
        data: {
          email: 'rifa@gmail.com',
          username: 'rifa',
          passwordHash: hashedPassword,
          role: 'PATIENT'
        }
      });
      
      console.log('✅ User created:', newUser.email);
      return;
    }

    console.log('✅ User found:');
    console.log('ID:', user.id);
    console.log('Email:', user.email);
    console.log('Username:', user.username);
    console.log('Role:', user.role);
    console.log('Has passwordHash:', !!user.passwordHash);
    console.log('passwordHash length:', user.passwordHash?.length || 0);
    console.log('passwordHash preview:', user.passwordHash?.substring(0, 30) + '...');

    // Test the exact password
    const testPassword = 'Rifa@123';
    console.log('\n🔐 Testing password:', testPassword);
    
    if (!user.passwordHash) {
      console.log('❌ No passwordHash in database!');
      console.log('Setting password now...');
      
      const hashedPassword = await bcrypt.hash(testPassword, 10);
      await prisma.user.update({
        where: { email: 'rifa@gmail.com' },
        data: { passwordHash: hashedPassword }
      });
      
      console.log('✅ Password set successfully!');
      return;
    }

    const isValid = await bcrypt.compare(testPassword, user.passwordHash);
    console.log('Result:', isValid ? '✅ VALID' : '❌ INVALID');

    if (!isValid) {
      console.log('\n⚠️  Password does not match!');
      console.log('This means the password in database is NOT "Rifa@123"');
      console.log('\nWould you like to reset it? Run:');
      console.log('npx tsx reset-user-password.ts rifa@gmail.com Rifa@123');
    } else {
      console.log('\n✅ Password is correct in database!');
      console.log('If login still fails, check:');
      console.log('1. Are you typing the password correctly?');
      console.log('2. Check browser console for errors');
      console.log('3. Check API logs for the actual error');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugRifaLogin();
