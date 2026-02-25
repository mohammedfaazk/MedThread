import { prisma } from '@medthread/database';
import * as fs from 'fs';
import * as path from 'path';

async function applyMigration() {
  try {
    const migrationPath = path.join(__dirname, '../../packages/database/prisma/migrations/20260224_doctor_gamification/migration.sql');
    const sql = fs.readFileSync(migrationPath, 'utf-8');
    
    console.log('Applying gamification migration...\n');
    
    // Split by semicolon and execute each statement
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    for (const statement of statements) {
      try {
        await prisma.$executeRawUnsafe(statement);
        console.log('✅ Executed statement');
      } catch (error: any) {
        if (error.message.includes('already exists')) {
          console.log('⚠️  Already exists, skipping');
        } else {
          console.error('❌ Error:', error.message.substring(0, 100));
        }
      }
    }
    
    console.log('\n✅ Migration applied successfully!');
    
    // Verify tables
    const tables = await prisma.$queryRaw<any[]>`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name IN ('Badge', 'DoctorBadge', 'Leaderboard')
      ORDER BY table_name
    `;
    
    console.log(`\nTables created: ${tables.length}/3`);
    tables.forEach(t => console.log(`  - ${t.table_name}`));
    
  } catch (error: any) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

applyMigration();
