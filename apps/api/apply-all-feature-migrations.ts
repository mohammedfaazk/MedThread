import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

// Use DIRECT_URL for migrations (not pooled connection)
const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

const pool = new Pool({
  connectionString: connectionString?.replace('?pgbouncer=true&connection_limit=5', '')
});

async function applyMigration(name: string, sqlPath: string) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Applying: ${name}`);
  console.log('='.repeat(60));
  
  try {
    const sql = fs.readFileSync(sqlPath, 'utf-8');
    
    // Execute the entire SQL file
    await pool.query(sql);
    
    console.log(`✅ ${name} - SUCCESS`);
    return true;
  } catch (error: any) {
    console.error(`❌ ${name} - FAILED`);
    console.error(`Error: ${error.message}`);
    return false;
  }
}

async function verifyTables(tables: string[]) {
  const results: { [key: string]: boolean } = {};
  
  for (const table of tables) {
    const result = await pool.query(
      `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = $1`,
      [table]
    );
    results[table] = result.rows.length > 0;
  }
  
  return results;
}

async function main() {
  console.log('🔧 APPLYING ALL FEATURE MIGRATIONS\n');
  
  const migrations = [
    {
      name: 'Area-Wise Doctor Replies',
      path: '../../packages/database/prisma/migrations/20260224_area_wise_doctor_replies/migration.sql',
      tables: ['DoctorLocation', 'DoctorAvailability', 'ClinicLocation']
    },
    {
      name: 'Regional Top Doctors',
      path: '../../packages/database/prisma/migrations/20260224_regional_top_doctors/migration.sql',
      tables: ['DoctorRating', 'DoctorReview', 'DoctorRanking']
    },
    {
      name: 'SEO Rating Website',
      path: '../../packages/database/prisma/migrations/20260224_seo_rating_website/migration.sql',
      tables: ['SEOProfile', 'SEOBlogPost', 'SEOKeyword']
    },
    {
      name: 'Doctor Business Dashboard',
      path: '../../packages/database/prisma/migrations/20260224_doctor_business_dashboard/migration.sql',
      tables: ['BusinessMetrics', 'RevenueMetrics', 'PatientMetrics']
    },
    {
      name: 'Patient Journey',
      path: '../../packages/database/prisma/migrations/20260224_patient_journey/migration.sql',
      tables: ['PatientJourney', 'JourneyStep', 'JourneyAnalytics']
    },
    {
      name: 'Doctor Gamification',
      path: '../../packages/database/prisma/migrations/20260224_doctor_gamification/migration.sql',
      tables: ['Badge', 'DoctorBadge', 'Achievement', 'Leaderboard']
    },
    {
      name: 'Smart Matching',
      path: '../../packages/database/prisma/migrations/20260224_smart_matching/migration.sql',
      tables: ['DoctorPreferences', 'PatientPreferences', 'MatchingScore']
    },
    {
      name: 'Revenue Streams',
      path: '../../packages/database/prisma/migrations/20260224_revenue_streams/migration.sql',
      tables: ['SubscriptionPlan', 'PlatformRevenue']
    },
    {
      name: 'Trust & Safety',
      path: '../../packages/database/prisma/migrations/20260224_trust_safety/migration.sql',
      tables: ['TrustScore', 'SafetyFlag', 'ContentModeration']
    }
  ];
  
  const results: { name: string; success: boolean; tables: { [key: string]: boolean } }[] = [];
  
  for (const migration of migrations) {
    const sqlPath = path.join(__dirname, migration.path);
    
    if (!fs.existsSync(sqlPath)) {
      console.log(`⚠️  ${migration.name} - SQL file not found: ${sqlPath}`);
      continue;
    }
    
    const success = await applyMigration(migration.name, sqlPath);
    
    // Verify tables were created
    const tableStatus = await verifyTables(migration.tables);
    
    console.log('\nTable verification:');
    for (const [table, exists] of Object.entries(tableStatus)) {
      console.log(`  ${exists ? '✅' : '❌'} ${table}`);
    }
    
    results.push({
      name: migration.name,
      success,
      tables: tableStatus
    });
  }
  
  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('MIGRATION SUMMARY');
  console.log('='.repeat(60) + '\n');
  
  let allSuccess = true;
  for (const result of results) {
    const allTablesExist = Object.values(result.tables).every(v => v);
    const status = allTablesExist ? '✅' : '❌';
    console.log(`${status} ${result.name}`);
    
    if (!allTablesExist) {
      allSuccess = false;
      const missingTables = Object.entries(result.tables)
        .filter(([_, exists]) => !exists)
        .map(([table, _]) => table);
      console.log(`   Missing: ${missingTables.join(', ')}`);
    }
  }
  
  console.log('\n' + '='.repeat(60));
  
  if (allSuccess) {
    console.log('✅ ALL MIGRATIONS APPLIED SUCCESSFULLY!');
  } else {
    console.log('❌ SOME MIGRATIONS FAILED - Check errors above');
  }
  
  await pool.end();
}

main().catch(console.error);
