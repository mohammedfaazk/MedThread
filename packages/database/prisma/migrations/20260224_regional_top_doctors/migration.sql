-- Regional Top Doctors Filter Migration
-- Add rating, review, and ranking fields for doctors

-- Create DoctorRating table for overall ratings
CREATE TABLE IF NOT EXISTS "DoctorRating" (
  id SERIAL PRIMARY KEY,
  doctor_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  overall_rating DECIMAL(3, 2) DEFAULT 0.00 CHECK (overall_rating >= 0 AND overall_rating <= 5),
  total_reviews INTEGER DEFAULT 0,
  response_time_minutes INTEGER DEFAULT 0,
  consultation_success_rate DECIMAL(5, 2) DEFAULT 0.00 CHECK (consultation_success_rate >= 0 AND consultation_success_rate <= 100),
  patient_satisfaction_score DECIMAL(3, 2) DEFAULT 0.00 CHECK (patient_satisfaction_score >= 0 AND patient_satisfaction_score <= 5),
  specialization_match_score DECIMAL(3, 2) DEFAULT 0.00 CHECK (specialization_match_score >= 0 AND specialization_match_score <= 5),
  helpful_replies_count INTEGER DEFAULT 0,
  total_replies_count INTEGER DEFAULT 0,
  last_active_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(doctor_id)
);

-- Create indexes for rating lookups
CREATE INDEX IF NOT EXISTS idx_doctor_rating_doctor ON "DoctorRating"(doctor_id);
CREATE INDEX IF NOT EXISTS idx_doctor_rating_overall ON "DoctorRating"(overall_rating DESC);
CREATE INDEX IF NOT EXISTS idx_doctor_rating_satisfaction ON "DoctorRating"(patient_satisfaction_score DESC);
CREATE INDEX IF NOT EXISTS idx_doctor_rating_success ON "DoctorRating"(consultation_success_rate DESC);
CREATE INDEX IF NOT EXISTS idx_doctor_rating_helpful ON "DoctorRating"(helpful_replies_count DESC);

-- Create DoctorReview table for verified patient reviews
CREATE TABLE IF NOT EXISTS "DoctorReview" (
  id SERIAL PRIMARY KEY,
  doctor_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  patient_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  appointment_id TEXT REFERENCES "Appointment"(id) ON DELETE SET NULL,
  rating DECIMAL(2, 1) NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  response_time_rating INTEGER CHECK (response_time_rating >= 1 AND response_time_rating <= 5),
  professionalism_rating INTEGER CHECK (professionalism_rating >= 1 AND professionalism_rating <= 5),
  communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
  would_recommend BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  is_anonymous BOOLEAN DEFAULT false,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(doctor_id, patient_id, appointment_id)
);

-- Create indexes for review lookups
CREATE INDEX IF NOT EXISTS idx_doctor_review_doctor ON "DoctorReview"(doctor_id);
CREATE INDEX IF NOT EXISTS idx_doctor_review_patient ON "DoctorReview"(patient_id);
CREATE INDEX IF NOT EXISTS idx_doctor_review_verified ON "DoctorReview"(is_verified);
CREATE INDEX IF NOT EXISTS idx_doctor_review_rating ON "DoctorReview"(rating DESC);
CREATE INDEX IF NOT EXISTS idx_doctor_review_created ON "DoctorReview"(created_at DESC);

-- Create DoctorRegionalRank table for region-wise rankings
CREATE TABLE IF NOT EXISTS "DoctorRegionalRank" (
  id SERIAL PRIMARY KEY,
  doctor_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  region_type VARCHAR(50) NOT NULL, -- 'city', 'state', 'country'
  region_name VARCHAR(255) NOT NULL,
  rank_position INTEGER NOT NULL,
  rank_score DECIMAL(10, 2) NOT NULL,
  specialty VARCHAR(255),
  calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(doctor_id, region_type, region_name, specialty)
);

-- Create indexes for regional rank lookups
CREATE INDEX IF NOT EXISTS idx_regional_rank_region ON "DoctorRegionalRank"(region_type, region_name, rank_position);
CREATE INDEX IF NOT EXISTS idx_regional_rank_doctor ON "DoctorRegionalRank"(doctor_id);
CREATE INDEX IF NOT EXISTS idx_regional_rank_specialty ON "DoctorRegionalRank"(specialty, rank_position);
CREATE INDEX IF NOT EXISTS idx_regional_rank_score ON "DoctorRegionalRank"(rank_score DESC);

-- Create DoctorTrending table for trending doctors
CREATE TABLE IF NOT EXISTS "DoctorTrending" (
  id SERIAL PRIMARY KEY,
  doctor_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  trending_score DECIMAL(10, 2) NOT NULL,
  reply_count_7d INTEGER DEFAULT 0,
  helpful_count_7d INTEGER DEFAULT 0,
  view_count_7d INTEGER DEFAULT 0,
  rating_change_7d DECIMAL(3, 2) DEFAULT 0.00,
  week_start_date DATE NOT NULL,
  calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(doctor_id, week_start_date)
);

-- Create indexes for trending lookups
CREATE INDEX IF NOT EXISTS idx_doctor_trending_score ON "DoctorTrending"(trending_score DESC);
CREATE INDEX IF NOT EXISTS idx_doctor_trending_week ON "DoctorTrending"(week_start_date DESC);
CREATE INDEX IF NOT EXISTS idx_doctor_trending_doctor ON "DoctorTrending"(doctor_id);

-- Create DoctorRisingStar table for new doctors with high ratings
CREATE TABLE IF NOT EXISTS "DoctorRisingStar" (
  id SERIAL PRIMARY KEY,
  doctor_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  rising_star_score DECIMAL(10, 2) NOT NULL,
  account_age_days INTEGER NOT NULL,
  rating_velocity DECIMAL(5, 2) NOT NULL, -- Rating increase per week
  reply_velocity DECIMAL(5, 2) NOT NULL, -- Replies per week
  qualified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(doctor_id)
);

-- Create indexes for rising star lookups
CREATE INDEX IF NOT EXISTS idx_rising_star_score ON "DoctorRisingStar"(rising_star_score DESC);
CREATE INDEX IF NOT EXISTS idx_rising_star_doctor ON "DoctorRisingStar"(doctor_id);

-- Create DoctorSpecialtyRank table for "Most Helpful in [Specialty]"
CREATE TABLE IF NOT EXISTS "DoctorSpecialtyRank" (
  id SERIAL PRIMARY KEY,
  doctor_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  specialty VARCHAR(255) NOT NULL,
  helpful_count INTEGER DEFAULT 0,
  total_replies INTEGER DEFAULT 0,
  helpful_percentage DECIMAL(5, 2) DEFAULT 0.00,
  avg_rating DECIMAL(3, 2) DEFAULT 0.00,
  rank_position INTEGER NOT NULL,
  calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(doctor_id, specialty)
);

-- Create indexes for specialty rank lookups
CREATE INDEX IF NOT EXISTS idx_specialty_rank_specialty ON "DoctorSpecialtyRank"(specialty, rank_position);
CREATE INDEX IF NOT EXISTS idx_specialty_rank_doctor ON "DoctorSpecialtyRank"(doctor_id);
CREATE INDEX IF NOT EXISTS idx_specialty_rank_helpful ON "DoctorSpecialtyRank"(helpful_percentage DESC);

-- Create ReviewHelpful table for tracking helpful reviews
CREATE TABLE IF NOT EXISTS "ReviewHelpful" (
  id SERIAL PRIMARY KEY,
  review_id INTEGER NOT NULL REFERENCES "DoctorReview"(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(review_id, user_id)
);

-- Create index for helpful review lookups
CREATE INDEX IF NOT EXISTS idx_review_helpful_review ON "ReviewHelpful"(review_id);
CREATE INDEX IF NOT EXISTS idx_review_helpful_user ON "ReviewHelpful"(user_id);

-- Add fields to User table for doctor statistics
ALTER TABLE "User" 
ADD COLUMN IF NOT EXISTS overall_rating DECIMAL(3, 2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS total_reviews INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS response_time_avg INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS consultation_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_rising_star BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_trending BOOLEAN DEFAULT false;

-- Create indexes for user statistics
CREATE INDEX IF NOT EXISTS idx_user_overall_rating ON "User"(overall_rating DESC) WHERE role IN ('DOCTOR', 'NURSE', 'PHARMACIST');
CREATE INDEX IF NOT EXISTS idx_user_rising_star ON "User"(is_rising_star) WHERE is_rising_star = true;
CREATE INDEX IF NOT EXISTS idx_user_trending ON "User"(is_trending) WHERE is_trending = true;
