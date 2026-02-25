import { prisma } from '@medthread/database';

async function createRemainingTables() {
  console.log('🔧 CREATING REMAINING TABLES\n');
  
  const tables = [
    {
      name: 'DoctorRanking',
      sql: `CREATE TABLE IF NOT EXISTS "DoctorRanking" (
        id SERIAL PRIMARY KEY,
        doctor_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
        region VARCHAR(100) NOT NULL,
        specialty VARCHAR(100),
        rank_position INTEGER NOT NULL,
        rank_score DECIMAL(10, 2) DEFAULT 0,
        ranking_period VARCHAR(50) DEFAULT 'monthly',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`
    },
    {
      name: 'SEOKeyword',
      sql: `CREATE TABLE IF NOT EXISTS "SEOKeyword" (
        id SERIAL PRIMARY KEY,
        keyword VARCHAR(255) NOT NULL,
        search_volume INTEGER DEFAULT 0,
        competition_level VARCHAR(50),
        related_specialty VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(keyword)
      )`
    },
    {
      name: 'PatientMetrics',
      sql: `CREATE TABLE IF NOT EXISTS "PatientMetrics" (
        id SERIAL PRIMARY KEY,
        doctor_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
        metric_date DATE NOT NULL,
        new_patients INTEGER DEFAULT 0,
        returning_patients INTEGER DEFAULT 0,
        patient_retention_rate DECIMAL(5, 2) DEFAULT 0,
        average_patient_age INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(doctor_id, metric_date)
      )`
    },
    {
      name: 'JourneyStep',
      sql: `CREATE TABLE IF NOT EXISTS "JourneyStep" (
        id SERIAL PRIMARY KEY,
        journey_id INTEGER NOT NULL REFERENCES "PatientJourney"(id) ON DELETE CASCADE,
        step_name VARCHAR(100) NOT NULL,
        step_order INTEGER NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        started_at TIMESTAMP,
        completed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`
    },
    {
      name: 'JourneyAnalytics',
      sql: `CREATE TABLE IF NOT EXISTS "JourneyAnalytics" (
        id SERIAL PRIMARY KEY,
        journey_type VARCHAR(100) NOT NULL,
        step_name VARCHAR(100) NOT NULL,
        completion_rate DECIMAL(5, 2) DEFAULT 0,
        average_time_minutes INTEGER DEFAULT 0,
        drop_off_rate DECIMAL(5, 2) DEFAULT 0,
        metric_date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(journey_type, step_name, metric_date)
      )`
    },
    {
      name: 'Achievement',
      sql: `CREATE TABLE IF NOT EXISTS "Achievement" (
        id SERIAL PRIMARY KEY,
        achievement_key VARCHAR(100) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        category VARCHAR(50) NOT NULL,
        has_tiers BOOLEAN DEFAULT false,
        tier_requirements JSONB,
        requirement_type VARCHAR(50) NOT NULL,
        requirement_metric VARCHAR(100) NOT NULL,
        points_per_tier JSONB,
        badge_id INTEGER REFERENCES "Badge"(id) ON DELETE SET NULL,
        icon VARCHAR(255),
        color VARCHAR(50),
        display_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`
    },
    {
      name: 'DoctorAchievement',
      sql: `CREATE TABLE IF NOT EXISTS "DoctorAchievement" (
        id SERIAL PRIMARY KEY,
        doctor_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
        achievement_id INTEGER NOT NULL REFERENCES "Achievement"(id) ON DELETE CASCADE,
        current_value DECIMAL(10, 2) DEFAULT 0,
        current_tier VARCHAR(50),
        is_completed BOOLEAN DEFAULT false,
        completed_at TIMESTAMP,
        total_points_earned INTEGER DEFAULT 0,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(doctor_id, achievement_id)
      )`
    },
    {
      name: 'LeaderboardEntry',
      sql: `CREATE TABLE IF NOT EXISTS "LeaderboardEntry" (
        id SERIAL PRIMARY KEY,
        leaderboard_id INTEGER NOT NULL REFERENCES "Leaderboard"(id) ON DELETE CASCADE,
        doctor_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
        rank_position INTEGER NOT NULL,
        metric_value DECIMAL(10, 2) NOT NULL,
        previous_rank INTEGER,
        rank_change INTEGER,
        calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(leaderboard_id, doctor_id)
      )`
    },
    {
      name: 'DoctorPoints',
      sql: `CREATE TABLE IF NOT EXISTS "DoctorPoints" (
        id SERIAL PRIMARY KEY,
        doctor_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
        total_points INTEGER DEFAULT 0,
        badge_points INTEGER DEFAULT 0,
        achievement_points INTEGER DEFAULT 0,
        activity_points INTEGER DEFAULT 0,
        current_level INTEGER DEFAULT 1,
        points_to_next_level INTEGER DEFAULT 100,
        current_streak_days INTEGER DEFAULT 0,
        longest_streak_days INTEGER DEFAULT 0,
        last_activity_date DATE,
        global_rank INTEGER,
        specialty_rank INTEGER,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(doctor_id)
      )`
    },
    {
      name: 'PointsTransaction',
      sql: `CREATE TABLE IF NOT EXISTS "PointsTransaction" (
        id SERIAL PRIMARY KEY,
        doctor_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
        transaction_type VARCHAR(50) NOT NULL,
        points_change INTEGER NOT NULL,
        reference_type VARCHAR(50),
        reference_id VARCHAR(255),
        description TEXT,
        balance_after INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`
    },
    {
      name: 'MatchingScore',
      sql: `CREATE TABLE IF NOT EXISTS "MatchingScore" (
        id SERIAL PRIMARY KEY,
        patient_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
        doctor_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
        overall_score DECIMAL(5, 2) DEFAULT 0,
        specialty_match_score DECIMAL(5, 2) DEFAULT 0,
        location_score DECIMAL(5, 2) DEFAULT 0,
        availability_score DECIMAL(5, 2) DEFAULT 0,
        rating_score DECIMAL(5, 2) DEFAULT 0,
        preference_score DECIMAL(5, 2) DEFAULT 0,
        calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(patient_id, doctor_id)
      )`
    },
    {
      name: 'PlatformRevenue',
      sql: `CREATE TABLE IF NOT EXISTS "PlatformRevenue" (
        id SERIAL PRIMARY KEY,
        revenue_date DATE NOT NULL,
        revenue_type VARCHAR(100) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        source VARCHAR(100),
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(revenue_date, revenue_type, source)
      )`
    },
    {
      name: 'SafetyFlag',
      sql: `CREATE TABLE IF NOT EXISTS "SafetyFlag" (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
        flag_type VARCHAR(100) NOT NULL,
        severity VARCHAR(50) DEFAULT 'low',
        description TEXT,
        flagged_by TEXT REFERENCES "User"(id) ON DELETE SET NULL,
        status VARCHAR(50) DEFAULT 'pending',
        resolved_at TIMESTAMP,
        resolved_by TEXT REFERENCES "User"(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`
    },
    {
      name: 'ContentModeration',
      sql: `CREATE TABLE IF NOT EXISTS "ContentModeration" (
        id SERIAL PRIMARY KEY,
        content_type VARCHAR(50) NOT NULL,
        content_id VARCHAR(255) NOT NULL,
        moderation_status VARCHAR(50) DEFAULT 'pending',
        flagged_reason TEXT,
        moderator_id TEXT REFERENCES "User"(id) ON DELETE SET NULL,
        moderated_at TIMESTAMP,
        action_taken VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`
    }
  ];
  
  let successCount = 0;
  let failCount = 0;
  
  for (const table of tables) {
    try {
      await prisma.$executeRawUnsafe(table.sql);
      console.log(`✅ ${table.name}`);
      successCount++;
    } catch (error: any) {
      if (error.message.includes('already exists')) {
        console.log(`⚠️  ${table.name} - already exists`);
        successCount++;
      } else {
        console.log(`❌ ${table.name} - ${error.message.substring(0, 80)}`);
        failCount++;
      }
    }
  }
  
  console.log(`\n${'='.repeat(60)}`);
  console.log(`✅ Success: ${successCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log('='.repeat(60));
  
  await prisma.$disconnect();
}

createRemainingTables();
