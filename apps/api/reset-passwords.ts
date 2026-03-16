import bcrypt from 'bcrypt';
import { prisma } from '@medthread/database';

const accounts = [
  { email: 'admin@medthread.com', password: 'Admin@123456', role: 'ADMIN' },
  { email: 'rifa@gmail.com',      password: 'Doctor@123456', role: 'DOCTOR' },
  { email: 'navin@gmail.com',     password: 'Patient@123456', role: 'PATIENT' },
  { email: 'ariana@gmail.com',    password: 'Patient@123456', role: 'PATIENT' },
];

async function main() {
  for (const acc of accounts) {
    const hash = await bcrypt.hash(acc.password, 12);
    const result = await prisma.user.updateMany({
      where: { email: acc.email },
      data: { passwordHash: hash, isSuspended: false },
    });
    if (result.count > 0) {
      console.log(`✅ Reset password for ${acc.email}`);
    } else {
      // User doesn't exist — create them
      await prisma.user.create({
        data: {
          email: acc.email,
          username: acc.email.split('@')[0],
          passwordHash: hash,
          role: acc.role as any,
          doctorVerificationStatus: acc.role === 'DOCTOR' ? 'APPROVED' : null,
        },
      });
      console.log(`🆕 Created user ${acc.email}`);
    }
  }
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
