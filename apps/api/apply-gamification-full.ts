import { prisma } from '@medthread/database';
import * as fs from 'fs';
import * as path from 'path';

async function applyMigration() {
  try {
    const migrationPath = path.join(__dirname, '../../packages/database/prisma/migrations/20260224_doctor_gamification/migration.sql');
    const sql = fs.readFileSync(migrationPath, 'utf-8');
    
    console.log('Applying gamification migration as single transaction...\n');
    
    await prisma.$executeRawUnsafe(sql);
    
    console.log('✅ Migration applied successfully!');
    
    // Verify tables
    const tables = await prisma.$queryRaw<any[]>`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name IN ('Badge', 'DoctorBadge', 'Leaderboard', 'LeaderboardEntry', 'Achievement', 'DoctorAchievement', 'DoctorPoints', 'PointsTransaction')
      ORDER BY table_name
    `;
    
    console.log(`\nTables created: ${tables.length}/8`);
    tables.forEach(t => console.log(`  ✅ ${t.table_name}`));
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

applyMigration();
