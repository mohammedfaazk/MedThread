/**
 * Resets passwords ONLY for users whose passwords are unknown.
 * Does NOT touch admin@medthread.com, rifa@gmail.com, navin@gmail.com, ariana@gmail.com.
 */
import bcrypt from 'bcrypt';
import { prisma } from '@medthread/database';

// Only reset these — the rest already have known working passwords
const toReset = [
  { email: 'harry@gmail.com', password: 'Patient@123456' },
  { email: 'trump@gmail.com', password: 'Doctor@123456' },
];

async function main() {
  for (const acc of toReset) {
    const hash = await bcrypt.hash(acc.password, 12);
    const result = await prisma.user.updateMany({
      where: { email: acc.email },
      data: { passwordHash: hash },
    });
    if (result.count > 0) {
      console.log(`✅ Reset password for ${acc.email} → ${acc.password}`);
    } else {
      console.log(`⚠️  User not found: ${acc.email}`);
    }
  }
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
