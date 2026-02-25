import { prisma } from '@medthread/database';

async function createTables() {
  console.log('🔧 CREATING FEATURE TABLES MANUALLY\n');
  
  const tables = [
    // Area-wise Doctor Replies
    {
      name: 'DoctorClinic',
      sql: `CREATE TABLE IF NOT EXISTS "DoctorClinic" (
        id SERIAL PRIMARY KEY,
        doctor_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
        clinic_name VARCHAR(255) NOT NULL,
        address TEXT NOT NULL,
        city VARCHAR(100) NOT NULL,
        state VARCHAR(100),
        country VARCHAR(100) NOT NULL,
        postal_code VARCHAR(20),
        latitude DECIMAL(10, 8) NOT NULL,
        longitude DECIMAL(11, 8) NOT NULL,
        phone VARCHAR(50),
        is_primary BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`
    },
    {
      name: 'DoctorAvailability',
      sql: `CREATE TABLE IF NOT EXISTS "DoctorAvailability" (
        id SERIAL PRIMARY KEY,
        doctor_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
        telemedicine_available BOOLEAN DEFAULT false,
        in_person_available BOOLEAN DEFAULT true,
        emergency_available BOOLEAN DEFAULT false,
        insurance_accepted TEXT[],
        accepts_all_insurance BOOLEAN DEFAULT false,
        average_wait_time_minutes INTEGER,
        next_available_slot TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(doctor_id)
      )`
    },
    {
      name: 'ClinicHours',
      sql: `CREATE TABLE IF NOT EXISTS "ClinicHours" (
        id SERIAL PRIMARY KEY,
        clinic_id INTEGER NOT NULL REFERENCES "DoctorClinic"(id) ON DELETE CASCADE,
        day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
        open_time TIME NOT NULL,
        close_time TIME NOT NULL,
        is_closed BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(clinic_id, day_of_week)
      )`
    },
    // Regional Top Doctors
    {
      name: 'DoctorRating',
      sql: `CREATE TABLE IF NOT EXISTS "DoctorRating" (
        id SERIAL PRIMARY KEY,
        doctor_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
        overall_rating DECIMAL(3, 2) DEFAULT 0,
        total_reviews INTEGER DEFAULT 0,
        bedside_manner_rating DECIMAL(3, 2) DEFAULT 0,
        wait_time_rating DECIMAL(3, 2) DEFAULT 0,
        response_time_minutes INTEGER DEFAULT 0,
        helpful_replies_count INTEGER DEFAULT 0,
        total_replies_count INTEGER DEFAULT 0,
        patient_satisfaction_score DECIMAL(5, 2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(doctor_id)
      )`
    },
    {
      name: 'DoctorReview',
      sql: `CREATE TABLE IF NOT EXISTS "DoctorReview" (
        id SERIAL PRIMARY KEY,
        doctor_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
        patient_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
        rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
        bedside_manner_rating INTEGER CHECK (bedside_manner_rating BETWEEN 1 AND 5),
        wait_time_rating INTEGER CHECK (wait_time_rating BETWEEN 1 AND 5),
        review_text TEXT,
        is_verified BOOLEAN DEFAULT false,
        is_anonymous BOOLEAN DEFAULT false,
        helpful_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`
    },
    // SEO Rating Website
    {
      name: 'SEOProfile',
      sql: `CREATE TABLE IF NOT EXISTS "SEOProfile" (
        id SERIAL PRIMARY KEY,
        doctor_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
        seo_title VARCHAR(255),
        seo_description TEXT,
        seo_keywords TEXT[],
        slug VARCHAR(255) UNIQUE,
        profile_views INTEGER DEFAULT 0,
        search_appearances INTEGER DEFAULT 0,
        click_through_rate DECIMAL(5, 2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(doctor_id)
      )`
    },
    {
      name: 'SEOBlogPost',
      sql: `CREATE TABLE IF NOT EXISTS "SEOBlogPost" (
        id SERIAL PRIMARY KEY,
        author_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        content TEXT NOT NULL,
        excerpt TEXT,
        seo_title VARCHAR(255),
        seo_description TEXT,
        seo_keywords TEXT[],
        featured_image VARCHAR(500),
        status VARCHAR(50) DEFAULT 'draft',
        published_at TIMESTAMP,
        views INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`
    },
    // Doctor Business Dashboard
    {
      name: 'BusinessMetrics',
      sql: `CREATE TABLE IF NOT EXISTS "BusinessMetrics" (
        id SERIAL PRIMARY KEY,
        doctor_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
        metric_date DATE NOT NULL,
        total_consultations INTEGER DEFAULT 0,
        completed_consultations INTEGER DEFAULT 0,
        cancelled_consultations INTEGER DEFAULT 0,
        average_consultation_duration INTEGER DEFAULT 0,
        patient_satisfaction DECIMAL(3, 2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(doctor_id, metric_date)
      )`
    },
    {
      name: 'RevenueMetrics',
      sql: `CREATE TABLE IF NOT EXISTS "RevenueMetrics" (
        id SERIAL PRIMARY KEY,
        doctor_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
        metric_date DATE NOT NULL,
        total_revenue DECIMAL(10, 2) DEFAULT 0,
        consultation_revenue DECIMAL(10, 2) DEFAULT 0,
        subscription_revenue DECIMAL(10, 2) DEFAULT 0,
        platform_fee DECIMAL(10, 2) DEFAULT 0,
        net_revenue DECIMAL(10, 2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(doctor_id, metric_date)
      )`
    },
    // Patient Journey
    {
      name: 'PatientJourney',
      sql: `CREATE TABLE IF NOT EXISTS "PatientJourney" (
        id SERIAL PRIMARY KEY,
        patient_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
        journey_type VARCHAR(100) NOT NULL,
        current_step VARCHAR(100),
        status VARCHAR(50) DEFAULT 'in_progress',
        started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`
    },
    // Gamification
    {
      name: 'Badge',
      sql: `CREATE TABLE IF NOT EXISTS "Badge" (
        id SERIAL PRIMARY KEY,
        badge_key VARCHAR(100) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        category VARCHAR(50) NOT NULL,
        icon VARCHAR(255),
        color VARCHAR(50),
        badge_image_url VARCHAR(500),
        requirement_type VARCHAR(50) NOT NULL,
        requirement_value DECIMAL(10, 2) NOT NULL,
        requirement_operator VARCHAR(20) DEFAULT '>=',
        rarity VARCHAR(50) DEFAULT 'common',
        points INTEGER DEFAULT 10,
        display_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        is_secret BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`
    },
    {
      name: 'DoctorBadge',
      sql: `CREATE TABLE IF NOT EXISTS "DoctorBadge" (
        id SERIAL PRIMARY KEY,
        doctor_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
        badge_id INTEGER NOT NULL REFERENCES "Badge"(id) ON DELETE CASCADE,
        earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        earned_value DECIMAL(10, 2),
        is_displayed BOOLEAN DEFAULT true,
        display_order INTEGER DEFAULT 0,
        notification_sent BOOLEAN DEFAULT false,
        notification_sent_at TIMESTAMP,
        UNIQUE(doctor_id, badge_id)
      )`
    },
    {
      name: 'Leaderboard',
      sql: `CREATE TABLE IF NOT EXISTS "Leaderboard" (
        id SERIAL PRIMARY KEY,
        leaderboard_key VARCHAR(100) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        leaderboard_type VARCHAR(50) NOT NULL,
        metric_type VARCHAR(100) NOT NULL,
        period_start DATE,
        period_end DATE,
        specialty VARCHAR(255),
        icon VARCHAR(255),
        color VARCHAR(50),
        display_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`
    },
    // Smart Matching
    {
      name: 'DoctorPreferences',
      sql: `CREATE TABLE IF NOT EXISTS "DoctorPreferences" (
        id SERIAL PRIMARY KEY,
        doctor_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
        preferred_patient_age_min INTEGER,
        preferred_patient_age_max INTEGER,
        preferred_conditions TEXT[],
        preferred_consultation_types TEXT[],
        max_patients_per_day INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(doctor_id)
      )`
    },
    {
      name: 'PatientPreferences',
      sql: `CREATE TABLE IF NOT EXISTS "PatientPreferences" (
        id SERIAL PRIMARY KEY,
        patient_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
        preferred_doctor_gender VARCHAR(20),
        preferred_languages TEXT[],
        preferred_consultation_type VARCHAR(50),
        max_distance_km INTEGER,
        insurance_provider VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(patient_id)
      )`
    },
    // Revenue Streams
    {
      name: 'SubscriptionPlan',
      sql: `CREATE TABLE IF NOT EXISTS "SubscriptionPlan" (
        id SERIAL PRIMARY KEY,
        plan_key VARCHAR(100) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        billing_period VARCHAR(50) NOT NULL,
        features JSONB,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`
    },
    // Trust & Safety
    {
      name: 'TrustScore',
      sql: `CREATE TABLE IF NOT EXISTS "TrustScore" (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
        trust_score DECIMAL(5, 2) DEFAULT 50,
        verification_level VARCHAR(50) DEFAULT 'basic',
        identity_verified BOOLEAN DEFAULT false,
        license_verified BOOLEAN DEFAULT false,
        background_check_status VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id)
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

createTables();
