import { prisma } from '@medthread/database';

async function resetFeatureMigrations() {
  console.log('Removing feature migration records...\n');
  
  const featureMigrations = [
    '20260224_area_wise_doctor_replies',
    '20260224_doctor_business_dashboard',
    '20260224_doctor_gamification',
    '20260224_patient_journey',
    '20260224_regional_top_doctors',
    '20260224_seo_rating_website',
    '20260224_smart_matching',
    '20260224_revenue_streams',
    '20260224_trust_safety',
    '20260224_fix_trust_score'
  ];
  
  for (const migration of featureMigrations) {
    try {
      await prisma.$executeRaw`
        DELETE FROM _prisma_migrations 
        WHERE migration_name = ${migration}
      `;
      console.log(`✓ Removed: ${migration}`);
    } catch (error) {
      console.log(`✗ Error removing ${migration}:`, error);
    }
  }
  
  console.log('\nMigration records removed. Now run: npx prisma migrate deploy');
  await prisma.$disconnect();
}

resetFeatureMigrations();
