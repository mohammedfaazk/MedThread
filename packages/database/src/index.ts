import { PrismaClient } from '@prisma/client';

// Use connection pooling URL for Supabase
const getDatabaseUrl = (): string | undefined => {
  const directUrl = process.env.DIRECT_URL;
  const url = process.env.DATABASE_URL;
  
  console.log('[Database] DATABASE_URL:', url ? 'SET' : 'NOT SET');
  console.log('[Database] DIRECT_URL:', directUrl ? 'SET' : 'NOT SET');
  
  if (!url && !directUrl) {
    console.log('[Database] No DATABASE_URL or DIRECT_URL found');
    return undefined;
  }
  
  // Prefer DATABASE_URL (pooler) for better connection stability with Supabase
  const connectionUrl = url || directUrl;
  console.log('[Database] Using pooled database connection');
  console.log('[Database] Connection URL:', connectionUrl?.substring(0, 50) + '...');
  return connectionUrl;
};

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: getDatabaseUrl(),
    },
  },
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});

// Test database connection on startup
prisma.$connect()
  .then(() => {
    console.log('[Database] ✓ Connected successfully');
  })
  .catch((error) => {
    console.error('[Database] ✗ Connection failed:', error.message);
    console.error('[Database] Please check your DATABASE_URL or DIRECT_URL in .env file');
    console.error('[Database] The database may be paused or credentials may be incorrect');
  });

// Handle graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export * from '@prisma/client';
