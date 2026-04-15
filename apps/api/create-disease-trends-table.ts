import { PrismaClient } from '@medthread/database';

const prisma = new PrismaClient();

async function createTable() {
  try {
    console.log('Creating DiseaseTrendsCache table...');
    
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "DiseaseTrendsCache" (
        "id" TEXT NOT NULL,
        "disease" TEXT NOT NULL,
        "location" TEXT NOT NULL,
        "year" INTEGER NOT NULL,
        "searchQuery" TEXT NOT NULL,
        "data" JSONB NOT NULL,
        "sources" JSONB,
        "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "expiresAt" TIMESTAMP(3) NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT "DiseaseTrendsCache_pkey" PRIMARY KEY ("id")
      );
    `);
    
    console.log('✓ Table created');
    
    console.log('Creating indexes...');
    
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "DiseaseTrendsCache_disease_location_year_idx" 
      ON "DiseaseTrendsCache"("disease", "location", "year");
    `);
    
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "DiseaseTrendsCache_expiresAt_idx" 
      ON "DiseaseTrendsCache"("expiresAt");
    `);
    
    console.log('✓ Indexes created');
    console.log('✅ DiseaseTrendsCache table setup complete!');
    
  } catch (error) {
    console.error('Error creating table:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTable();
