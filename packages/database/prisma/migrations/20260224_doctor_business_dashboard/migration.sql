-- Doctor Business Dashboard Migration
-- Analytics and marketing tools for doctors

-- Create DoctorBusinessAnalytics table for tracking business metrics
CREATE TABLE IF NOT EXISTS "DoctorBusinessAnalytics" (
  id SERIAL PRIMARY KEY,
  doctor_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  
  -- Profile metrics
  profile_views_total INTEGER DEFAULT 0,
  profile_views_seo INTEGER DEFAULT 0,
  profile_views_platform INTEGER DEFAULT 0,
  profile_views_direct INTEGER DEFAULT 0,
  
  -- Conversion metrics
  consultation_requests INTEGER DEFAULT 0,
  consultations_completed INTEGER DEFAULT 0,
  conversion_rate DECIMAL(5, 2) DEFAULT 0.00,
  
  -- Revenue metrics
  revenue_total DECIMAL(10, 2) DEFAULT 0.00,
  revenue_consultations DECIMAL(10, 2) DEFAULT 0.00,
  revenue_promotions DECIMAL(10, 2) DEFAULT 0.00,
  platform_fee DECIMAL(10, 2) DEFAULT 0.00,
  net_revenue DECIMAL(10, 2) DEFAULT 0.00,
  
  -- Patient metrics
  new_patients INTEGER DEFAULT 0,
  returning_patients INTEGER DEFAULT 0,
  patient_retention_rate DECIMAL(5, 2) DEFAULT 0.00,
  
  -- Rating metrics
  average_rating DECIMAL(2, 1) DEFAULT 0.0,
  new_reviews INTEGER DEFAULT 0,
  rating_trend VARCHAR(20), -- 'increasing', 'stable', 'decreasing'
  
  -- Engagement metrics
  replies_posted INTEGER DEFAULT 0,
  helpful_votes_received INTEGER DEFAULT 0,
  profile_shares INTEGER DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(doctor_id, date)
);

-- Create indexes for analytics lookups
CREATE INDEX IF NOT EXISTS idx_business_analytics_doctor ON "DoctorBusinessAnalytics"(doctor_id);
CREATE INDEX IF NOT EXISTS idx_business_analytics_date ON "DoctorBusinessAnalytics"(date DESC);
CREATE INDEX IF NOT EXISTS idx_business_analytics_doctor_date ON "DoctorBusinessAnalytics"(doctor_id, date DESC);

-- Create DoctorPromotion table for paid marketing features
CREATE TABLE IF NOT EXISTS "DoctorPromotion" (
  id SERIAL PRIMARY KEY,
  doctor_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  promotion_type VARCHAR(50) NOT NULL, -- 'top_search', 'featured_badge', 'sponsored_answer'
  
  -- Promotion details
  title VARCHAR(255),
  description TEXT,
  target_specialty VARCHAR(255),
  target_location VARCHAR(255),
  target_keywords TEXT[],
  
  -- Pricing
  price_per_day DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  payment_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'paid', 'failed', 'refunded'
  payment_id TEXT,
  
  -- Schedule
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT false,
  
  -- Performance metrics
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  ctr DECIMAL(5, 2) DEFAULT 0.00,
  conversion_rate DECIMAL(5, 2) DEFAULT 0.00,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for promotion lookups
CREATE INDEX IF NOT EXISTS idx_promotion_doctor ON "DoctorPromotion"(doctor_id);
CREATE INDEX IF NOT EXISTS idx_promotion_type ON "DoctorPromotion"(promotion_type);
CREATE INDEX IF NOT EXISTS idx_promotion_active ON "DoctorPromotion"(is_active, start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_promotion_dates ON "DoctorPromotion"(start_date, end_date);

-- Create FeaturedDoctor table for featured badge holders
CREATE TABLE IF NOT EXISTS "FeaturedDoctor" (
  id SERIAL PRIMARY KEY,
  doctor_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  promotion_id INTEGER REFERENCES "DoctorPromotion"(id) ON DELETE CASCADE,
  
  badge_type VARCHAR(50) DEFAULT 'featured', -- 'featured', 'premium', 'verified_plus'
  badge_color VARCHAR(50) DEFAULT 'gold',
  badge_icon VARCHAR(50),
  
  display_priority INTEGER DEFAULT 0, -- Higher = shown first
  
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(doctor_id, start_date, end_date)
);

-- Create indexes for featured doctor lookups
CREATE INDEX IF NOT EXISTS idx_featured_doctor ON "FeaturedDoctor"(doctor_id);
CREATE INDEX IF NOT EXISTS idx_featured_active ON "FeaturedDoctor"(is_active, display_priority DESC);
CREATE INDEX IF NOT EXISTS idx_featured_dates ON "FeaturedDoctor"(start_date, end_date);

-- Create SponsoredAnswer table for sponsored replies in threads
CREATE TABLE IF NOT EXISTS "SponsoredAnswer" (
  id SERIAL PRIMARY KEY,
  doctor_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  promotion_id INTEGER REFERENCES "DoctorPromotion"(id) ON DELETE CASCADE,
  comment_id TEXT REFERENCES "Comment"(id) ON DELETE CASCADE,
  post_id TEXT REFERENCES "Post"(id) ON DELETE CASCADE,
  
  -- Targeting
  target_keywords TEXT[],
  target_specialty VARCHAR(255),
  
  -- Display
  is_sponsored BOOLEAN DEFAULT true,
  display_label VARCHAR(100) DEFAULT 'Sponsored Answer',
  highlight_color VARCHAR(50) DEFAULT 'blue',
  
  -- Performance
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  engagement_rate DECIMAL(5, 2) DEFAULT 0.00,
  
  -- Budget
  cost_per_impression DECIMAL(10, 4) DEFAULT 0.10,
  cost_per_click DECIMAL(10, 2) DEFAULT 1.00,
  total_spent DECIMAL(10, 2) DEFAULT 0.00,
  budget_limit DECIMAL(10, 2),
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for sponsored answer lookups
CREATE INDEX IF NOT EXISTS idx_sponsored_doctor ON "SponsoredAnswer"(doctor_id);
CREATE INDEX IF NOT EXISTS idx_sponsored_comment ON "SponsoredAnswer"(comment_id);
CREATE INDEX IF NOT EXISTS idx_sponsored_post ON "SponsoredAnswer"(post_id);
CREATE INDEX IF NOT EXISTS idx_sponsored_active ON "SponsoredAnswer"(is_active);
CREATE INDEX IF NOT EXISTS idx_sponsored_keywords ON "SponsoredAnswer" USING GIN (target_keywords);

-- Create TopSearchPromotion table for promoting profiles to top of search
CREATE TABLE IF NOT EXISTS "TopSearchPromotion" (
  id SERIAL PRIMARY KEY,
  doctor_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  promotion_id INTEGER REFERENCES "DoctorPromotion"(id) ON DELETE CASCADE,
  
  -- Search targeting
  search_keywords TEXT[],
  search_location VARCHAR(255),
  search_specialty VARCHAR(255),
  
  -- Display position
  position_rank INTEGER DEFAULT 1, -- 1 = top position
  display_badge BOOLEAN DEFAULT true,
  badge_text VARCHAR(100) DEFAULT 'Promoted',
  
  -- Performance
  search_impressions INTEGER DEFAULT 0,
  profile_clicks INTEGER DEFAULT 0,
  ctr DECIMAL(5, 2) DEFAULT 0.00,
  
  -- Budget
  cost_per_click DECIMAL(10, 2) DEFAULT 2.00,
  daily_budget DECIMAL(10, 2),
  total_spent DECIMAL(10, 2) DEFAULT 0.00,
  
  is_active BOOLEAN DEFAULT true,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for top search promotion lookups
CREATE INDEX IF NOT EXISTS idx_top_search_doctor ON "TopSearchPromotion"(doctor_id);
CREATE INDEX IF NOT EXISTS idx_top_search_active ON "TopSearchPromotion"(is_active, position_rank ASC);
CREATE INDEX IF NOT EXISTS idx_top_search_keywords ON "TopSearchPromotion" USING GIN (search_keywords);
CREATE INDEX IF NOT EXISTS idx_top_search_dates ON "TopSearchPromotion"(start_date, end_date);

-- Create DoctorRevenue table for detailed revenue tracking
CREATE TABLE IF NOT EXISTS "DoctorRevenue" (
  id SERIAL PRIMARY KEY,
  doctor_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  
  -- Transaction details
  transaction_type VARCHAR(50) NOT NULL, -- 'consultation', 'promotion', 'subscription', 'refund'
  transaction_id TEXT,
  
  -- Amounts
  gross_amount DECIMAL(10, 2) NOT NULL,
  platform_fee_percentage DECIMAL(5, 2) DEFAULT 15.00,
  platform_fee_amount DECIMAL(10, 2) NOT NULL,
  net_amount DECIMAL(10, 2) NOT NULL,
  
  -- Related entities
  appointment_id TEXT REFERENCES "Appointment"(id) ON DELETE SET NULL,
  promotion_id INTEGER REFERENCES "DoctorPromotion"(id) ON DELETE SET NULL,
  
  -- Payment info
  payment_method VARCHAR(50),
  payment_status VARCHAR(50) DEFAULT 'completed',
  payout_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  payout_date DATE,
  
  transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for revenue lookups
CREATE INDEX IF NOT EXISTS idx_revenue_doctor ON "DoctorRevenue"(doctor_id);
CREATE INDEX IF NOT EXISTS idx_revenue_type ON "DoctorRevenue"(transaction_type);
CREATE INDEX IF NOT EXISTS idx_revenue_date ON "DoctorRevenue"(transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_revenue_payout ON "DoctorRevenue"(payout_status, payout_date);

-- Create PatientRetention table for tracking patient relationships
CREATE TABLE IF NOT EXISTS "PatientRetention" (
  id SERIAL PRIMARY KEY,
  doctor_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  patient_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  
  -- First interaction
  first_consultation_date DATE,
  first_consultation_id TEXT REFERENCES "Appointment"(id) ON DELETE SET NULL,
  
  -- Latest interaction
  last_consultation_date DATE,
  last_consultation_id TEXT REFERENCES "Appointment"(id) ON DELETE SET NULL,
  
  -- Metrics
  total_consultations INTEGER DEFAULT 0,
  total_revenue DECIMAL(10, 2) DEFAULT 0.00,
  average_rating DECIMAL(2, 1) DEFAULT 0.0,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  retention_status VARCHAR(50) DEFAULT 'active', -- 'active', 'at_risk', 'churned', 'dormant'
  days_since_last_visit INTEGER DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(doctor_id, patient_id)
);

-- Create indexes for patient retention lookups
CREATE INDEX IF NOT EXISTS idx_retention_doctor ON "PatientRetention"(doctor_id);
CREATE INDEX IF NOT EXISTS idx_retention_patient ON "PatientRetention"(patient_id);
CREATE INDEX IF NOT EXISTS idx_retention_status ON "PatientRetention"(retention_status);
CREATE INDEX IF NOT EXISTS idx_retention_active ON "PatientRetention"(is_active, last_consultation_date DESC);

-- Create DoctorGoals table for business goal tracking
CREATE TABLE IF NOT EXISTS "DoctorGoals" (
  id SERIAL PRIMARY KEY,
  doctor_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  
  goal_type VARCHAR(50) NOT NULL, -- 'revenue', 'patients', 'rating', 'reviews'
  goal_period VARCHAR(50) NOT NULL, -- 'daily', 'weekly', 'monthly', 'quarterly', 'yearly'
  
  target_value DECIMAL(10, 2) NOT NULL,
  current_value DECIMAL(10, 2) DEFAULT 0.00,
  progress_percentage DECIMAL(5, 2) DEFAULT 0.00,
  
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  
  is_achieved BOOLEAN DEFAULT false,
  achieved_date DATE,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for goals lookups
CREATE INDEX IF NOT EXISTS idx_goals_doctor ON "DoctorGoals"(doctor_id);
CREATE INDEX IF NOT EXISTS idx_goals_type ON "DoctorGoals"(goal_type);
CREATE INDEX IF NOT EXISTS idx_goals_period ON "DoctorGoals"(goal_period, start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_goals_active ON "DoctorGoals"(is_achieved, end_date DESC);

-- Add business dashboard fields to User table
ALTER TABLE "User"
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS featured_until DATE,
ADD COLUMN IF NOT EXISTS promotion_tier VARCHAR(50) DEFAULT 'free', -- 'free', 'basic', 'premium', 'enterprise'
ADD COLUMN IF NOT EXISTS total_revenue DECIMAL(10, 2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS lifetime_patients INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS dashboard_last_viewed TIMESTAMP;

-- Create index on featured status
CREATE INDEX IF NOT EXISTS idx_user_featured ON "User"(is_featured, featured_until) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_user_promotion_tier ON "User"(promotion_tier);

-- Create function to update business analytics daily
CREATE OR REPLACE FUNCTION update_doctor_business_analytics()
RETURNS void AS $$
BEGIN
  -- This function will be called by a cron job
  -- Insert or update analytics for yesterday
  INSERT INTO "DoctorBusinessAnalytics" (
    doctor_id, date, profile_views_total, consultation_requests,
    consultations_completed, revenue_total, new_patients, average_rating
  )
  SELECT 
    u.id as doctor_id,
    CURRENT_DATE - INTERVAL '1 day' as date,
    COALESCE(u.profile_views, 0) as profile_views_total,
    COUNT(DISTINCT a.id) FILTER (WHERE a.created_at::date = CURRENT_DATE - INTERVAL '1 day') as consultation_requests,
    COUNT(DISTINCT a.id) FILTER (WHERE a.status = 'COMPLETED' AND a.updated_at::date = CURRENT_DATE - INTERVAL '1 day') as consultations_completed,
    COALESCE(SUM(dr.net_amount) FILTER (WHERE dr.transaction_date::date = CURRENT_DATE - INTERVAL '1 day'), 0) as revenue_total,
    COUNT(DISTINCT pr.patient_id) FILTER (WHERE pr.first_consultation_date = CURRENT_DATE - INTERVAL '1 day') as new_patients,
    COALESCE(u.overall_rating, 0) as average_rating
  FROM "User" u
  LEFT JOIN "Appointment" a ON u.id = a."doctorId"
  LEFT JOIN "DoctorRevenue" dr ON u.id = dr.doctor_id
  LEFT JOIN "PatientRetention" pr ON u.id = pr.doctor_id
  WHERE u.role IN ('DOCTOR', 'NURSE', 'PHARMACIST')
  GROUP BY u.id
  ON CONFLICT (doctor_id, date) DO UPDATE
  SET profile_views_total = EXCLUDED.profile_views_total,
      consultation_requests = EXCLUDED.consultation_requests,
      consultations_completed = EXCLUDED.consultations_completed,
      revenue_total = EXCLUDED.revenue_total,
      new_patients = EXCLUDED.new_patients,
      average_rating = EXCLUDED.average_rating,
      updated_at = CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;
