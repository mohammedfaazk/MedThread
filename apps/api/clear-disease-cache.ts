import { PrismaClient } from '@medthread/database';

const prisma = new PrismaClient();

async function clearCache() {
  try {
    console.log('Clearing disease trends cache...');
    
    const result = await prisma.diseaseTrendsCache.deleteMany({});
    
    console.log(`✅ Cleared ${result.count} cache entries`);
    
  } catch (error) {
    console.error('Error clearing cache:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearCache();
