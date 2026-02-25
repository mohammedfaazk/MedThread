import { prisma } from '@medthread/database';

async function checkTables() {
  try {
    const tables = await prisma.$queryRaw<any[]>`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name IN ('Badge', 'DoctorBadge', 'Leaderboard', 'LeaderboardEntry', 'Achievement', 'DoctorAchievement', 'DoctorPoints', 'PointsTransaction')
      ORDER BY table_name
    `;
    
    console.log('Gamification tables found:', tables.length);
    tables.forEach(t => console.log(`  - ${t.table_name}`));
    
    if (tables.length === 0) {
      console.log('\n❌ No gamification tables found!');
      console.log('Migration may not have been applied.');
    } else if (tables.length < 8) {
      console.log(`\n⚠️ Only ${tables.length}/8 gamification tables found!`);
    } else {
      console.log('\n✅ All gamification tables exist!');
    }
  } catch (error: any) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkTables();
