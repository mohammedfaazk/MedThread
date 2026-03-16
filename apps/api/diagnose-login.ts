import bcrypt from 'bcrypt';
import { prisma } from '@medthread/database';

const testPasswords: Record<string, string> = {
  'admin@medthread.com': 'Admin@123456',
  'rifa@gmail.com':      'Doctor@123456',
  'navin@gmail.com':     'Patient@123456',
  'ariana@gmail.com':    'Patient@123456',
};

async function main() {
  const users = await prisma.user.findMany({
    select: { email: true, username: true, role: true, passwordHash: true, isSuspended: true },
  });

  console.log(`\nFound ${users.length} users in DB:\n`);

  for (const user of users) {
    const testPw = testPasswords[user.email];
    let matchResult = 'no test password defined';

    if (testPw && user.passwordHash) {
      const match = await bcrypt.compare(testPw, user.passwordHash);
      matchResult = match ? '✅ PASSWORD MATCHES' : '❌ PASSWORD DOES NOT MATCH';
    } else if (!user.passwordHash) {
      matchResult = '❌ NO HASH IN DB';
    }

    console.log(`${user.email} (${user.role}) suspended=${user.isSuspended} → ${matchResult}`);
  }

  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
