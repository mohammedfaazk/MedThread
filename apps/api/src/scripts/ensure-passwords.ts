import { prisma } from '@medthread/database';
import bcrypt from 'bcrypt';

/**
 * Ensures all users have valid passwords
 * This runs on API startup to prevent login issues
 */
export async function ensureAllUsersHavePasswords() {
  try {
    // Find users without passwords
    const usersWithoutPasswords = await prisma.user.findMany({
      where: {
        passwordHash: ''
      },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
      }
    });

    if (usersWithoutPasswords.length === 0) {
      console.log('✅ All users have valid passwords');
      return;
    }

    console.log(`⚠️  Found ${usersWithoutPasswords.length} users without passwords. Fixing...`);

    for (const user of usersWithoutPasswords) {
      // Set default password based on role
      let defaultPassword = 'Password@123456';
      if (user.role === 'ADMIN') {
        defaultPassword = 'Admin@123456';
      } else if (user.role === 'DOCTOR') {
        defaultPassword = 'Doctor@123456';
      } else {
        defaultPassword = 'Patient@123456';
      }

      const hashedPassword = await bcrypt.hash(defaultPassword, 10);
      await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: hashedPassword }
      });

      console.log(`   ✅ Fixed password for ${user.username} (${user.email})`);
    }

    console.log('✅ All user passwords fixed');
  } catch (error) {
    console.error('❌ Error ensuring passwords:', error);
    // Don't throw - allow API to start even if this fails
  }
}
