import { prisma } from '@medthread/database';
import * as fs from 'fs';
import * as path from 'path';

async function checkMigrationStatus() {
  try {
    console.log('🔍 MIGRATION STATUS CHECK\n');
    console.log('='.repeat(60));
    
    // Get all migration folders
    const migrationsDir = path.join(__dirname, '../../packages/database/prisma/migrations');
    const migrationFolders = fs.readdirSync(migrationsDir)
      .filter(f => fs.statSync(path.join(migrationsDir, f)).isDirectory());
    
    console.log(`\nFound ${migrationFolders.length} migration folders\n`);
    
    // Get applied migrations from database
    const appliedMigrations = await prisma.$queryRaw<any[]>`
      SELECT migration_name, finished_at, rolled_back_at
      FROM _prisma_migrations
      ORDER BY finished_at DESC
    `;
    
    console.log(`Applied migrations in database: ${appliedMigrations.length}\n`);
    
    // Check each migration
    const issues: string[] = [];
    
    for (const folder of migrationFolders) {
      const applied = appliedMigrations.find(m => m.migration_name === folder);
      
      if (!applied) {
        console.log(`❌ ${folder} - NOT APPLIED`);
        issues.push(folder);
      } else if (applied.rolled_back_at) {
        console.log(`⚠️  ${folder} - ROLLED BACK`);
        issues.push(folder);
      } else {
        console.log(`✅ ${folder}`);
      }
    }
    
    console.log('\n' + '='.repeat(60));
    
    if (issues.length > 0) {
      console.log(`\n❌ ${issues.length} migrations not properly applied:`);
      issues.forEach(m => console.log(`  - ${m}`));
    } else {
      console.log('\n✅ All migrations applied successfully');
    }
    
    // Check for feature-specific tables
    console.log('\n' + '='.repeat(60));
    console.log('FEATURE TABLE STATUS');
    console.log('='.repeat(60) + '\n');
    
    const features = [
      { name: 'Area-wise Doctor Replies', tables: ['DoctorLocation', 'DoctorAvailability', 'ClinicLocation'] },
      { name: 'Regional Top Doctors', tables: ['DoctorRating', 'DoctorReview', 'DoctorRanking'] },
      { name: 'SEO Rating Website', tables: ['SEOProfile', 'SEOBlogPost', 'SEOKeyword'] },
      { name: 'Doctor Business Dashboard', tables: ['BusinessMetrics', 'RevenueMetrics', 'PatientMetrics'] },
      { name: 'Patient Journey', tables: ['PatientJourney', 'JourneyStep', 'JourneyAnalytics'] },
      { name: 'Doctor Gamification', tables: ['Badge', 'DoctorBadge', 'Achievement', 'Leaderboard'] },
      { name: 'Smart Matching', tables: ['DoctorPreferences', 'PatientPreferences', 'MatchingScore'] },
      { name: 'Revenue Streams', tables: ['SubscriptionPlan', 'PlatformRevenue'] },
      { name: 'Trust & Safety', tables: ['TrustScore', 'SafetyFlag', 'ContentModeration'] },
      { name: 'Cron Jobs', tables: ['CronJobExecution', 'CronJobSchedule'] }
    ];
    
    for (const feature of features) {
      let allExist = true;
      const missing: string[] = [];
      
      for (const table of feature.tables) {
        const result = await prisma.$queryRaw<any[]>`
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public' AND table_name = ${table}
        `;
        
        if (result.length === 0) {
          allExist = false;
          missing.push(table);
        }
      }
      
      if (allExist) {
        console.log(`✅ ${feature.name}`);
      } else {
        console.log(`❌ ${feature.name} - Missing: ${missing.join(', ')}`);
      }
    }
    
  } catch (error: any) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkMigrationStatus();
