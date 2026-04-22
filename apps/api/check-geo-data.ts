import { PrismaClient } from '@medthread/database';

const prisma = new PrismaClient();

async function main() {
  const data = await prisma.geographicHealthData.findMany({
    orderBy: { totalReports: 'desc' }
  });
  
  console.log('Geographic Health Data:');
  console.log(JSON.stringify(data, null, 2));
  
  await prisma.$disconnect();
}

main();
