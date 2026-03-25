import { PrismaClient } from '@prisma/client';

// Use connection pooling URL for Supabase
const getDatabaseUrl = (): string | undefined => {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.log('[Database] No DATABASE_URL found');
    return undefined;
  }
  
  // Temporarily disable connection pooling due to connectivity issues
  console.log('[Database] Using direct database connection (pooling disabled)');
  return url;
};

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: getDatabaseUrl(),
    },
  },
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});

// Handle graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export * from '@prisma/client';
