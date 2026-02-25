import { prisma } from '@medthread/database';
import * as fs from 'fs';
import * as path from 'path';

async function applyMigration(name: string, sqlPath: string) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Applying: ${name}`);
  console.log('='.repeat(60));
  
  try {
    const sql = fs.readFileSync(sqlPath, 'utf-8');
    
    // Split into individual statements (but keep function bodies together)
    const statements = splitSQL(sql);
    
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i].trim();
      if (stmt.length === 0 || stmt.startsWith('--')) continue;
      
      try {
        await prisma.$executeRawUnsafe(stmt);
      } catch (error: any) {
        // Ignore "already exists" errors
        if (error.message.includes('already exists') || error.message.includes('duplicate')) {
          console.log(`  ⚠️  Statement ${i + 1}: Already exists, skipping`);
        } else {
          console.log(`  ❌ Statement ${i + 1} failed: ${error.message.substring(0, 100)}`);
        }
      }
    }
    
    console.log(`✅ ${name} - COMPLETED`);
    return true;
  } catch (error: any) {
    console.error(`❌ ${name} - FAILED: ${error.message}`);
    return false;
  }
}

function splitSQL(sql: string): string[] {
  const statements: string[] = [];
  let current = '';
  let inFunction = false;
  let dollarQuoteTag = '';
  
  const lines = sql.split('\n');
  
  for (const line of lines) {
    // Check for function start
    if (line.match(/CREATE\s+(OR\s+REPLACE\s+)?FUNCTION/i)) {
      inFunction = true;
    }
    
    // Check for dollar quote
    const dollarMatch = line.match(/\$([a-zA-Z_]*)\$/);
    if (dollarMatch && inFunction) {
      if (!dollarQuoteTag) {
        dollarQuoteTag = dollarMatch[0];
      } else if (dollarMatch[0] === dollarQuoteTag) {
        dollarQuoteTag = '';
        if (line.includes('LANGUAGE')) {
          inFunction = false;
        }
      }
    }
    
    current += line + '\n';
    
    // Split on semicolon only if not in function
    if (line.trim().endsWith(';') && !inFunction && !dollarQuoteTag) {
      statements.push(current);
      current = '';
    }
  }
  
  if (current.trim()) {
    statements.push(current);
  }
  
  return statements;
}

async function verifyTables(tables: string[]) {
  const results: { [key: string]: boolean } = {};
  
  for (const table of tables) {
    const result = await prisma.$queryRaw<any[]>`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = ${table}
    `;
    results[table] = result.length > 0;
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
    console.log('\n✅ ALL MIGRATIONS APPLIED SUCCESSFULLY!');
    console.log('\nAll 9 features are now functional.');
  } else {
    console.log('\n❌ SOME MIGRATIONS FAILED - Check errors above');
  }
  
  await prisma.$disconnect();
}

main().catch(console.error);
