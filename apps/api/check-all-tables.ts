import { prisma } from '@medthread/database';

async function checkAllTables() {
  try {
    const result = await prisma.$queryRaw<any[]>`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    
    console.log('All tables in database:');
    result.forEach(row => console.log(`  - ${row.table_name}`));
    console.log(`\nTotal: ${result.length} tables`);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAllTables();
