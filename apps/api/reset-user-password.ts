import { prisma } from '@medthread/database';
import bcrypt from 'bcrypt';

async function resetUserPassword() {
  try {
    const email = process.argv[2];
    const newPassword = process.argv[3];

    if (!email || !newPassword) {
      console.log('Usage: npx tsx reset-user-password.ts <email> <password>');
      console.log('Example: npx tsx reset-user-password.ts navin@gmail.com Doctor@123456');
      return;
    }

    console.log(`🔧 Resetting password for ${email}...\n`);

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      console.log('❌ User not found!');
      return;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { email },
      data: { passwordHash: hashedPassword }
    });

    console.log('✅ Password reset successfully!');
    console.log('\nLogin credentials:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${newPassword}`);
    console.log(`   Role: ${user.role}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetUserPassword();
