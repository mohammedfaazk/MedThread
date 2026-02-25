import { prisma } from '@medthread/database';

async function checkTables() {
  try {
    const result = await prisma.$queryRaw<any[]>`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE 'Doctor%'
      ORDER BY table_name
    `;
    
    console.log('Doctor-related tables:');
    result.forEach(row => console.log(`  - ${row.table_name}`));
    console.log(`\nTotal: ${result.length} tables`);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTables();
