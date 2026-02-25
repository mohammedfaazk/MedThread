import { prisma } from '@medthread/database';

async function checkMigrations() {
  try {
    const migrations = await prisma.$queryRaw<any[]>`
      SELECT migration_name, finished_at 
      FROM _prisma_migrations 
      WHERE migration_name LIKE '%gamification%'
      ORDER BY finished_at DESC
    `;
    
    console.log('Gamification migrations applied:');
    if (migrations.length === 0) {
      console.log('  ❌ None found!');
    } else {
      migrations.forEach(m => {
        console.log(`  ✅ ${m.migration_name} (${m.finished_at})`);
      });
    }
    
    // Check if tables actually exist
    const tables = await prisma.$queryRaw<any[]>`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name = 'Badge'
    `;
    
    console.log(`\nBadge table exists: ${tables.length > 0 ? 'YES' : 'NO'}`);
    
  } catch (error: any) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkMigrations();
