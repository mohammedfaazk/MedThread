/**
 * Verify All Database Tables
 * Checks that all expected tables exist in the database
 */

import { PrismaClient } from '@medthread/database';

const prisma = new PrismaClient();

async function verifyAllTables() {
  console.log('🔍 Verifying all database tables...\n');

  try {
    // Query to get all tables in the public schema
    const tables = await prisma.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename;
    `;

    console.log(`📊 Found ${tables.length} tables in database\n`);

    // Expected tables organized by feature
    const expectedTables = {
      'Core Models': [
        'User',
        'Community',
        'Post',
        'Comment',
        'Vote',
        'Flair',
        'Award',
        'AwardGiven',
        'SavedPost',
        'SavedComment',
        'HiddenPost',
        'CommunityMember',
        'CommunityModerator',
        'Follow',
        'Block',
        'Message',
        'Conversation',
        'Report',
        'Availability',
        'Appointment',
        'MedicalThread',
        'ThreadReply',
        'CaseTimelineEvent'
      ],
      'Audit & Logging': [
        'AuditLog'
      ],
      'Analytics': [
        'AnalyticsEvent',
        'ConsultationFee',
        'ConversionEvent',
        'PageView',
        'PostAnalytics',
        'UserAnalytics',
        'UserSession'
      ],
      'Payment System': [
        'Payment',
        'PaymentHistory',
        'Refund',
        'Subscription'
      ],
      'Notification System': [
        'email_queue',
        'notification_preferences',
        'notifications'
      ],
      'Area-Wise Doctor Replies': [
        'DoctorLocation',
        'DoctorAvailability',
        'AreaCoverage'
      ],
      'Regional Top Doctors': [
        'DoctorRating',
        'DoctorReview',
        'RegionalRanking'
      ],
      'SEO Rating Website': [
        'SEOProfile',
        'BlogPost',
        'BlogCategory',
        'BlogTag',
        'BlogPostTag'
      ],
      'Doctor Business Dashboard': [
        'ConsultationMetrics',
        'RevenueMetrics',
        'PatientRetention'
      ],
      'Patient Journey': [
        'PatientJourney',
        'JourneyStep',
        'JourneyMetrics'
      ],
      'Doctor Gamification': [
        'Badge',
        'DoctorBadge',
        'Achievement',
        'DoctorAchievement',
        'Leaderboard',
        'LeaderboardEntry',
        'DoctorPoints',
        'PointsTransaction'
      ],
      'Smart Matching': [
        'DoctorPreferences',
        'PatientPreferences',
        'MatchingScore',
        'MatchingHistory'
      ],
      'Revenue Streams': [
        'PlatformRevenue',
        'DoctorEarnings',
        'RevenueShare'
      ],
      'Trust & Safety': [
        'TrustScore',
        'SafetyIncident',
        'ContentModeration'
      ],
      'Cron Jobs': [
        'CronJobExecution',
        'CronJobSchedule'
      ]
    };

    // Flatten expected tables
    const allExpectedTables = Object.values(expectedTables).flat();
    const tableNames = tables.map(t => t.tablename);

    console.log('✅ Verification Results:\n');

    let totalExpected = 0;
    let totalFound = 0;
    let totalMissing = 0;

    // Check each category
    for (const [category, expectedInCategory] of Object.entries(expectedTables)) {
      console.log(`\n📁 ${category}:`);
      
      const found: string[] = [];
      const missing: string[] = [];

      for (const table of expectedInCategory) {
        totalExpected++;
        if (tableNames.includes(table)) {
          found.push(table);
          totalFound++;
        } else {
          missing.push(table);
          totalMissing++;
        }
      }

      if (found.length > 0) {
        console.log(`   ✅ Found (${found.length}/${expectedInCategory.length}):`);
        found.forEach(t => console.log(`      • ${t}`));
      }

      if (missing.length > 0) {
        console.log(`   ❌ Missing (${missing.length}/${expectedInCategory.length}):`);
        missing.forEach(t => console.log(`      • ${t}`));
      }
    }

    // Check for unexpected tables
    const unexpectedTables = tableNames.filter(t => !allExpectedTables.includes(t));
    
    if (unexpectedTables.length > 0) {
      console.log('\n\n📦 Additional Tables (not in expected list):');
      unexpectedTables.forEach(t => console.log(`   • ${t}`));
    }

    // Summary
    console.log('\n\n' + '='.repeat(60));
    console.log('📊 SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total Expected Tables: ${totalExpected}`);
    console.log(`Total Found: ${totalFound} ✅`);
    console.log(`Total Missing: ${totalMissing} ${totalMissing > 0 ? '❌' : '✅'}`);
    console.log(`Additional Tables: ${unexpectedTables.length}`);
    console.log(`Total in Database: ${tables.length}`);
    console.log('='.repeat(60));

    if (totalMissing === 0) {
      console.log('\n✅ SUCCESS: All expected tables exist!');
    } else {
      console.log('\n⚠️  WARNING: Some expected tables are missing!');
    }

    // Check views
    console.log('\n\n🔍 Checking Views...');
    const views = await prisma.$queryRaw<Array<{ viewname: string }>>`
      SELECT viewname 
      FROM pg_views 
      WHERE schemaname = 'public'
      ORDER BY viewname;
    `;

    console.log(`\n📊 Found ${views.length} views:`);
    views.forEach(v => console.log(`   • ${v.viewname}`));

    // Check functions
    console.log('\n\n🔍 Checking Functions...');
    const functions = await prisma.$queryRaw<Array<{ proname: string }>>`
      SELECT proname 
      FROM pg_proc 
      WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
      AND prokind = 'f'
      ORDER BY proname;
    `;

    console.log(`\n📊 Found ${functions.length} functions:`);
    const importantFunctions = [
      'check_and_award_badges',
      'update_leaderboards',
      'log_cron_job_execution',
      'get_cron_job_stats'
    ];

    importantFunctions.forEach(fn => {
      const exists = functions.some(f => f.proname === fn);
      console.log(`   ${exists ? '✅' : '❌'} ${fn}`);
    });

    // Check indexes
    console.log('\n\n🔍 Checking Indexes...');
    const indexes = await prisma.$queryRaw<Array<{ indexname: string, tablename: string }>>`
      SELECT indexname, tablename
      FROM pg_indexes 
      WHERE schemaname = 'public'
      AND indexname NOT LIKE '%_pkey'
      ORDER BY tablename, indexname;
    `;

    console.log(`\n📊 Found ${indexes.length} custom indexes (excluding primary keys)`);

    // Group by table
    const indexesByTable: { [key: string]: string[] } = {};
    indexes.forEach(idx => {
      if (!indexesByTable[idx.tablename]) {
        indexesByTable[idx.tablename] = [];
      }
      indexesByTable[idx.tablename].push(idx.indexname);
    });

    console.log('\nTables with most indexes:');
    Object.entries(indexesByTable)
      .sort((a, b) => b[1].length - a[1].length)
      .slice(0, 10)
      .forEach(([table, idxs]) => {
        console.log(`   • ${table}: ${idxs.length} indexes`);
      });

    console.log('\n✅ Database verification complete!');

  } catch (error) {
    console.error('❌ Error verifying tables:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

verifyAllTables();
