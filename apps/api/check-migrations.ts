import { prisma } from '@medthread/database';

async function checkMigrations() {
  try {
    const result = await prisma.$queryRaw<any[]>`
      SELECT migration_name, finished_at 
      FROM _prisma_migrations 
      ORDER BY finished_at DESC
    `;
    
    console.log('Applied migrations:');
    result.forEach(row => console.log(`  - ${row.migration_name} (${row.finished_at})`));
    console.log(`\nTotal: ${result.length} migrations`);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkMigrations();
