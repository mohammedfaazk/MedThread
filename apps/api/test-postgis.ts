import { prisma } from '@medthread/database';

async function testPostGIS() {
  try {
    // Try to enable PostGIS
    console.log('Testing PostGIS extension...\n');
    
    try {
      await prisma.$executeRaw`CREATE EXTENSION IF NOT EXISTS postgis`;
      console.log('✅ PostGIS extension enabled');
    } catch (error: any) {
      console.log('❌ PostGIS extension failed:', error.message);
    }
    
    // Check if extension exists
    const extensions = await prisma.$queryRaw<any[]>`
      SELECT extname FROM pg_extension WHERE extname = 'postgis'
    `;
    
    console.log(`PostGIS installed: ${extensions.length > 0 ? 'YES' : 'NO'}`);
    
    // Try to create a simple table
    console.log('\nTesting simple table creation...\n');
    
    try {
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS test_table_123 (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255)
        )
      `;
      console.log('✅ Simple table created');
      
      // Clean up
      await prisma.$executeRaw`DROP TABLE IF EXISTS test_table_123`;
      console.log('✅ Table dropped');
    } catch (error: any) {
      console.log('❌ Table creation failed:', error.message);
    }
    
  } catch (error: any) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testPostGIS();
