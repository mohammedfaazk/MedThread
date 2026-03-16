import { prisma } from '@medthread/database';

async function main() {
  const result = await prisma.user.updateMany({
    where: { email: 'rifa@gmail.com' },
    data: { pincode: '600026' },
  });
  console.log(result.count > 0 ? '✅ Updated rifa@gmail.com pincode → 600026' : '⚠️ User not found');
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
