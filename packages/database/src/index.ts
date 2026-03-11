import { PrismaClient } from '@prisma/client';

// Use connection pooling URL for Supabase
const getDatabaseUrl = () => {
  const url = process.env.DATABASE_URL;
  if (!url) return undefined;
  
  // If using Supabase, use the pooling URL
  // Supabase pooling URL format: postgresql://[user]:[password]@[host]:6543/[db]?pgbouncer=true
  if (url.includes('supabase.co') && !url.includes('pgbouncer=true')) {
    // Replace port 5432 with 6543 for connection pooling
    const poolingUrl = url.replace(':5432/', ':6543/');
    // Add pgbouncer parameter
    const finalUrl = poolingUrl.includes('?') 
      ? `${poolingUrl}&pgbouncer=true` 
      : `${poolingUrl}?pgbouncer=true`;
    
    console.log('[Database] Using Supabase connection pooling (port 6543)');
    return finalUrl;
  }
  
  console.log('[Database] Using direct database connection');
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
