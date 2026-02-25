/**
 * List All Actual Database Tables
 * Shows what's really in the database
 */

import { PrismaClient } from '@medthread/database';

const prisma = new PrismaClient();

async function listActualTables() {
  console.log('🔍 Listing all actual database tables...\n');

  try {
    // Get all tables with row counts
    const result = await prisma.$queryRaw<Array<{ 
      table_name: string; 
      row_count: number;
    }>>`
      SELECT 
        schemaname || '.' || tablename as table_name,
        (xpath('/row/cnt/text()', xml_count))[1]::text::int as row_count
      FROM (
        SELECT 
          schemaname, 
          tablename, 
          query_to_xml(format('SELECT COUNT(*) as cnt FROM %I.%I', schemaname, tablename), false, true, '') as xml_count
        FROM pg_tables
        WHERE schemaname = 'public'
        AND tablename NOT LIKE 'pg_%'
        AND tablename NOT LIKE 'sql_%'
        AND tablename != '_prisma_migrations'
        AND tablename != 'spatial_ref_sys'
      ) t
      ORDER BY tablename;
    `;

    console.log(`📊 Found ${result.length} tables\n`);
    console.log('Table Name'.padEnd(40) + 'Row Count');
    console.log('='.repeat(60));

    let totalRows = 0;
    result.forEach(table => {
      const name = table.table_name.replace('public.', '');
      const count = table.row_count || 0;
      totalRows += count;
      console.log(name.padEnd(40) + count.toString().padStart(10));
    });

    console.log('='.repeat(60));
    console.log('TOTAL'.padEnd(40) + totalRows.toString().padStart(10));

    console.log('\n✅ Complete!');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

listActualTables();
