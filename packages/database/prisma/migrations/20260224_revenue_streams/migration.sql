-- Revenue Streams Migration
-- Monetization features for doctors and platform

-- Create SubscriptionTier table for doctor subscription plans
CREATE TABLE IF NOT EXISTS "SubscriptionTier" (
  id SERIAL PRIMARY KEY,
  tier_name VARCHAR(100) UNIQUE NOT NULL, -- 'free', 'basic', 'professional', 'enterprise'
  display_name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Pricing
  monthly_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  annual_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  currency VARCHAR(10) DEFAULT 'USD',
  
  -- Features
  features JSONB DEFAULT '[]'::jsonb,
  max_profile_views INTEGER,
  max_consultations_per_month INTEGER,
  priority_matching BOOLEAN DEFAULT false,
  advanced_analytics BOOLEAN DEFAULT false,
  featured_listing BOOLEAN DEFAULT false,
  top_search_placement BOOLEAN DEFAULT false,
  custom_branding BOOLEAN DEFAULT false,
  api_access BOOLEAN DEFAULT false,
  
  -- Limits
  max_clinics INTEGER DEFAULT 1,
  max_photos INTEGER DEFAULT 5,
  max_videos INTEGER DEFAULT 0,
  
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for subscription tiers
CREATE INDEX IF NOT EXISTS idx_subscription_tier_name ON "SubscriptionTier"(tier_name);
CREATE INDEX IF NOT EXISTS idx_subscription_tier_active ON "SubscriptionTier"(is_active);

-- Create DoctorSubscription table for tracking doctor subscriptions
CREATE TABLE IF NOT EXISTS "DoctorSubscription" (
  id SERIAL PRIMARY KEY,
  doctor_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  tier_id INTEGER NOT NULL REFERENCES "SubscriptionTier"(id),
  
  -- Subscription details
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'cancelled', 'expired', 'suspended'
  billing_cycle VARCHAR(50) DEFAULT 'monthly', -- 'monthly', 'annual'
  
  -- Dates
  start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  end_date TIMESTAMP,
  next_billing_date TIMESTAMP,
  cancelled_at TIMESTAMP,
  
  -- Payment
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'USD',
  payment_method VARCHAR(100),
  
  -- Auto-renewal
  auto_renew BOOLEAN DEFAULT true,
  
  -- Trial
  is_trial BOOLEAN DEFAULT false,
  trial_end_date TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(doctor_id, tier_id, start_date)
);

-- Create indexes for doctor subscriptions
CREATE INDEX IF NOT EXISTS idx_doctor_subscription_doctor ON "DoctorSubscription"(doctor_id);
CREATE INDEX IF NOT EXISTS idx_doctor_subscription_status ON "DoctorSubscription"(status);
CREATE INDEX IF NOT EXISTS idx_doctor_subscription_billing ON "DoctorSubscription"(next_billing_date);

-- Create PremiumListing table for premium profile features
CREATE TABLE IF NOT EXISTS "PremiumListing" (
  id SERIAL PRIMARY KEY,
  doctor_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  
  -- Premium features
  is_premium BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  is_verified_premium BOOLEAN DEFAULT false,
  
  -- Placement
  search_priority INTEGER DEFAULT 0, -- Higher = better placement
  category_featured BOOLEAN DEFAULT false,
  homepage_featured BOOLEAN DEFAULT false,
  
  -- Badges
  premium_badge_enabled BOOLEAN DEFAULT true,
  verified_badge_enabled BOOLEAN DEFAULT true,
  
  -- Customization
  custom_profile_url VARCHAR(255),
  custom_banner_url TEXT,
  custom_theme_color VARCHAR(20),
  
  -- Visibility boost
  visibility_multiplier DECIMAL(3, 2) DEFAULT 1.00, -- 1.5x, 2.0x, etc.
  
  -- Dates
  premium_start_date TIMESTAMP,
  premium_end_date TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(doctor_id)
);

-- Create indexes for premium listings
CREATE INDEX IF NOT EXISTS idx_premium_listing_doctor ON "PremiumListing"(doctor_id);
CREATE INDEX IF NOT EXISTS idx_premium_listing_featured ON "PremiumListing"(is_featured);
CREATE INDEX IF NOT EXISTS idx_premium_listing_priority ON "PremiumListing"(search_priority DESC);

-- Create ConsultationCommission table for tracking platform commissions
CREATE TABLE IF NOT EXISTS "ConsultationCommission" (
  id SERIAL PRIMARY KEY,
  appointment_id TEXT NOT NULL REFERENCES "Appointment"(id) ON DELETE CASCADE,
  doctor_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  patient_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  
  -- Amounts
  consultation_fee DECIMAL(10, 2) NOT NULL,
  commission_rate DECIMAL(5, 2) NOT NULL, -- Percentage (e.g., 15.00 for 15%)
  commission_amount DECIMAL(10, 2) NOT NULL,
  doctor_payout DECIMAL(10, 2) NOT NULL,
  
  -- Currency
  currency VARCHAR(10) DEFAULT 'USD',
  
  -- Status
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'processed', 'paid', 'refunded'
  
  -- Payment details
  payment_method VARCHAR(100),
  transaction_id VARCHAR(255),
  
  -- Dates
  consultation_date TIMESTAMP NOT NULL,
  commission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  payout_date TIMESTAMP,
  
  -- Notes
  notes TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(appointment_id)
);

-- Create indexes for consultation commissions
CREATE INDEX IF NOT EXISTS idx_consultation_commission_appointment ON "ConsultationCommission"(appointment_id);
CREATE INDEX IF NOT EXISTS idx_consultation_commission_doctor ON "ConsultationCommission"(doctor_id);
CREATE INDEX IF NOT EXISTS idx_consultation_commission_status ON "ConsultationCommission"(status);
CREATE INDEX IF NOT EXISTS idx_consultation_commission_date ON "ConsultationCommission"(consultation_date DESC);

-- Create Advertisement table for platform advertising
CREATE TABLE IF NOT EXISTS "Advertisement" (
  id SERIAL PRIMARY KEY,
  
  -- Advertiser details
  advertiser_name VARCHAR(255) NOT NULL,
  advertiser_email VARCHAR(255),
  advertiser_company VARCHAR(255),
  
  -- Ad details
  ad_type VARCHAR(50) NOT NULL, -- 'banner', 'sidebar', 'sponsored_post', 'video', 'native'
  ad_title VARCHAR(255) NOT NULL,
  ad_description TEXT,
  ad_content TEXT,
  
  -- Media
  image_url TEXT,
  video_url TEXT,
  click_url TEXT NOT NULL,
  
  -- Targeting
  target_specialties TEXT[],
  target_locations TEXT[],
  target_user_types TEXT[], -- ['doctor', 'patient', 'all']
  
  -- Placement
  placement_pages TEXT[], -- ['home', 'search', 'profile', 'post']
  placement_position VARCHAR(100), -- 'top', 'sidebar', 'inline', 'bottom'
  
  -- Pricing
  pricing_model VARCHAR(50) DEFAULT 'cpm', -- 'cpm', 'cpc', 'cpa', 'flat'
  cost_per_impression DECIMAL(10, 4),
  cost_per_click DECIMAL(10, 2),
  total_budget DECIMAL(10, 2),
  daily_budget DECIMAL(10, 2),
  
  -- Performance
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  total_spent DECIMAL(10, 2) DEFAULT 0.00,
  
  -- Status
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'active', 'paused', 'completed', 'rejected'
  
  -- Schedule
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP,
  
  -- Priority
  priority INTEGER DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for advertisements
CREATE INDEX IF NOT EXISTS idx_advertisement_status ON "Advertisement"(status);
CREATE INDEX IF NOT EXISTS idx_advertisement_type ON "Advertisement"(ad_type);
CREATE INDEX IF NOT EXISTS idx_advertisement_dates ON "Advertisement"(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_advertisement_priority ON "Advertisement"(priority DESC);

-- Create AdImpression table for tracking ad views
CREATE TABLE IF NOT EXISTS "AdImpression" (
  id SERIAL PRIMARY KEY,
  ad_id INTEGER NOT NULL REFERENCES "Advertisement"(id) ON DELETE CASCADE,
  
  -- User details
  user_id TEXT REFERENCES "User"(id) ON DELETE SET NULL,
  user_type VARCHAR(50), -- 'doctor', 'patient', 'guest'
  
  -- Context
  page_url TEXT,
  placement_position VARCHAR(100),
  
  -- Device/Browser
  user_agent TEXT,
  ip_address VARCHAR(50),
  device_type VARCHAR(50), -- 'desktop', 'mobile', 'tablet'
  
  -- Engagement
  viewed BOOLEAN DEFAULT true,
  clicked BOOLEAN DEFAULT false,
  click_timestamp TIMESTAMP,
  
  -- Revenue
  cost DECIMAL(10, 4),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for ad impressions
CREATE INDEX IF NOT EXISTS idx_ad_impression_ad ON "AdImpression"(ad_id);
CREATE INDEX IF NOT EXISTS idx_ad_impression_user ON "AdImpression"(user_id);
CREATE INDEX IF NOT EXISTS idx_ad_impression_clicked ON "AdImpression"(clicked);
CREATE INDEX IF NOT EXISTS idx_ad_impression_date ON "AdImpression"(created_at DESC);

-- Create DataInsight table for anonymized research data
CREATE TABLE IF NOT EXISTS "DataInsight" (
  id SERIAL PRIMARY KEY,
  
  -- Insight details
  insight_type VARCHAR(100) NOT NULL, -- 'symptom_trend', 'specialty_demand', 'treatment_outcome', 'geographic_pattern'
  insight_title VARCHAR(255) NOT NULL,
  insight_description TEXT,
  
  -- Data
  data_summary JSONB NOT NULL,
  aggregated_data JSONB,
  
  -- Metadata
  data_source VARCHAR(100), -- 'consultations', 'posts', 'searches', 'appointments'
  time_period_start TIMESTAMP,
  time_period_end TIMESTAMP,
  sample_size INTEGER,
  
  -- Geographic
  region_type VARCHAR(50), -- 'city', 'state', 'country', 'global'
  region_name VARCHAR(255),
  
  -- Specialty
  specialty VARCHAR(255),
  
  -- Privacy
  is_anonymized BOOLEAN DEFAULT true,
  privacy_level VARCHAR(50) DEFAULT 'high', -- 'high', 'medium', 'low'
  
  -- Access
  access_level VARCHAR(50) DEFAULT 'internal', -- 'internal', 'partner', 'public'
  price DECIMAL(10, 2),
  
  -- Status
  status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'published', 'archived'
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for data insights
CREATE INDEX IF NOT EXISTS idx_data_insight_type ON "DataInsight"(insight_type);
CREATE INDEX IF NOT EXISTS idx_data_insight_status ON "DataInsight"(status);
CREATE INDEX IF NOT EXISTS idx_data_insight_access ON "DataInsight"(access_level);
CREATE INDEX IF NOT EXISTS idx_data_insight_specialty ON "DataInsight"(specialty);

-- Create RevenueTransaction table for all platform revenue
CREATE TABLE IF NOT EXISTS "RevenueTransaction" (
  id SERIAL PRIMARY KEY,
  
  -- Transaction details
  transaction_type VARCHAR(100) NOT NULL, -- 'subscription', 'commission', 'advertisement', 'data_insight', 'premium_feature'
  transaction_id VARCHAR(255) UNIQUE NOT NULL,
  
  -- Related entities
  doctor_id TEXT REFERENCES "User"(id) ON DELETE SET NULL,
  patient_id TEXT REFERENCES "User"(id) ON DELETE SET NULL,
  subscription_id INTEGER REFERENCES "DoctorSubscription"(id) ON DELETE SET NULL,
  commission_id INTEGER REFERENCES "ConsultationCommission"(id) ON DELETE SET NULL,
  ad_id INTEGER REFERENCES "Advertisement"(id) ON DELETE SET NULL,
  
  -- Amounts
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'USD',
  
  -- Payment
  payment_method VARCHAR(100),
  payment_gateway VARCHAR(100),
  gateway_transaction_id VARCHAR(255),
  
  -- Status
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'refunded'
  
  -- Dates
  transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  
  -- Metadata
  metadata JSONB,
  notes TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for revenue transactions
CREATE INDEX IF NOT EXISTS idx_revenue_transaction_type ON "RevenueTransaction"(transaction_type);
CREATE INDEX IF NOT EXISTS idx_revenue_transaction_status ON "RevenueTransaction"(status);
CREATE INDEX IF NOT EXISTS idx_revenue_transaction_doctor ON "RevenueTransaction"(doctor_id);
CREATE INDEX IF NOT EXISTS idx_revenue_transaction_date ON "RevenueTransaction"(transaction_date DESC);

-- Create PlatformRevenue table for aggregated revenue analytics
CREATE TABLE IF NOT EXISTS "PlatformRevenue" (
  id SERIAL PRIMARY KEY,
  
  -- Time period
  period_type VARCHAR(50) NOT NULL, -- 'daily', 'weekly', 'monthly', 'quarterly', 'yearly'
  period_start TIMESTAMP NOT NULL,
  period_end TIMESTAMP NOT NULL,
  
  -- Revenue by source
  subscription_revenue DECIMAL(10, 2) DEFAULT 0.00,
  commission_revenue DECIMAL(10, 2) DEFAULT 0.00,
  advertising_revenue DECIMAL(10, 2) DEFAULT 0.00,
  data_insights_revenue DECIMAL(10, 2) DEFAULT 0.00,
  other_revenue DECIMAL(10, 2) DEFAULT 0.00,
  
  -- Total
  total_revenue DECIMAL(10, 2) DEFAULT 0.00,
  
  -- Counts
  new_subscriptions INTEGER DEFAULT 0,
  active_subscriptions INTEGER DEFAULT 0,
  consultations_count INTEGER DEFAULT 0,
  ads_served INTEGER DEFAULT 0,
  
  -- Growth
  revenue_growth_percentage DECIMAL(5, 2),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(period_type, period_start)
);

-- Create indexes for platform revenue
CREATE INDEX IF NOT EXISTS idx_platform_revenue_period ON "PlatformRevenue"(period_type, period_start DESC);

-- Add subscription fields to User table
ALTER TABLE "User"
ADD COLUMN IF NOT EXISTS current_subscription_tier VARCHAR(100) DEFAULT 'free',
ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(50) DEFAULT 'active',
ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS is_premium_member BOOLEAN DEFAULT false;

-- Create indexes on user subscription fields
CREATE INDEX IF NOT EXISTS idx_user_subscription_tier ON "User"(current_subscription_tier);
CREATE INDEX IF NOT EXISTS idx_user_premium ON "User"(is_premium_member);

-- Insert default subscription tiers
INSERT INTO "SubscriptionTier" (
  tier_name, display_name, description, monthly_price, annual_price,
  features, max_profile_views, max_consultations_per_month,
  priority_matching, advanced_analytics, featured_listing,
  top_search_placement, custom_branding, api_access,
  max_clinics, max_photos, max_videos, sort_order
) VALUES
(
  'free', 'Free', 'Basic features for getting started',
  0.00, 0.00,
  '["Basic profile", "Up to 10 consultations/month", "Standard support"]'::jsonb,
  1000, 10, false, false, false, false, false, false, 1, 5, 0, 1
),
(
  'basic', 'Basic', 'Essential features for growing practices',
  49.99, 499.99,
  '["Enhanced profile", "Up to 50 consultations/month", "Priority support", "Basic analytics"]'::jsonb,
  5000, 50, false, true, false, false, false, false, 2, 10, 2, 2
),
(
  'professional', 'Professional', 'Advanced features for established doctors',
  99.99, 999.99,
  '["Premium profile", "Unlimited consultations", "Priority matching", "Advanced analytics", "Featured listing", "Custom branding"]'::jsonb,
  20000, -1, true, true, true, false, true, false, 5, 20, 5, 3
),
(
  'enterprise', 'Enterprise', 'Complete solution for medical institutions',
  299.99, 2999.99,
  '["Enterprise profile", "Unlimited consultations", "Top priority matching", "Full analytics suite", "Top search placement", "Custom branding", "API access", "Dedicated support"]'::jsonb,
  -1, -1, true, true, true, true, true, true, 10, 50, 10, 4
)
ON CONFLICT (tier_name) DO NOTHING;

-- Create function to calculate commission
CREATE OR REPLACE FUNCTION calculate_commission(
  p_consultation_fee DECIMAL,
  p_doctor_id TEXT
)
RETURNS TABLE (
  commission_rate DECIMAL(5,2),
  commission_amount DECIMAL(10,2),
  doctor_payout DECIMAL(10,2)
) AS $$
DECLARE
  v_tier VARCHAR(100);
  v_rate DECIMAL(5,2);
BEGIN
  -- Get doctor's subscription tier
  SELECT current_subscription_tier INTO v_tier
  FROM "User"
  WHERE id = p_doctor_id;
  
  -- Set commission rate based on tier
  v_rate := CASE v_tier
    WHEN 'free' THEN 20.00
    WHEN 'basic' THEN 15.00
    WHEN 'professional' THEN 10.00
    WHEN 'enterprise' THEN 5.00
    ELSE 20.00
  END;
  
  RETURN QUERY SELECT 
    v_rate,
    ROUND(p_consultation_fee * v_rate / 100, 2),
    ROUND(p_consultation_fee * (100 - v_rate) / 100, 2);
END;
$$ LANGUAGE plpgsql;

-- Create function to aggregate daily revenue
CREATE OR REPLACE FUNCTION aggregate_daily_revenue(p_date DATE)
RETURNS VOID AS $$
DECLARE
  v_period_start TIMESTAMP;
  v_period_end TIMESTAMP;
BEGIN
  v_period_start := p_date::timestamp;
  v_period_end := (p_date + INTERVAL '1 day')::timestamp;
  
  INSERT INTO "PlatformRevenue" (
    period_type, period_start, period_end,
    subscription_revenue, commission_revenue, advertising_revenue,
    data_insights_revenue, total_revenue,
    new_subscriptions, active_subscriptions, consultations_count, ads_served
  )
  SELECT
    'daily',
    v_period_start,
    v_period_end,
    COALESCE(SUM(CASE WHEN transaction_type = 'subscription' THEN amount ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN transaction_type = 'commission' THEN amount ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN transaction_type = 'advertisement' THEN amount ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN transaction_type = 'data_insight' THEN amount ELSE 0 END), 0),
    COALESCE(SUM(amount), 0),
    COUNT(DISTINCT CASE WHEN transaction_type = 'subscription' THEN subscription_id END),
    (SELECT COUNT(*) FROM "DoctorSubscription" WHERE status = 'active'),
    COUNT(DISTINCT CASE WHEN transaction_type = 'commission' THEN commission_id END),
    (SELECT SUM(impressions) FROM "Advertisement" WHERE DATE(created_at) = p_date)
  FROM "RevenueTransaction"
  WHERE transaction_date >= v_period_start
    AND transaction_date < v_period_end
    AND status = 'completed'
  ON CONFLICT (period_type, period_start) DO UPDATE
  SET subscription_revenue = EXCLUDED.subscription_revenue,
      commission_revenue = EXCLUDED.commission_revenue,
      advertising_revenue = EXCLUDED.advertising_revenue,
      data_insights_revenue = EXCLUDED.data_insights_revenue,
      total_revenue = EXCLUDED.total_revenue,
      new_subscriptions = EXCLUDED.new_subscriptions,
      active_subscriptions = EXCLUDED.active_subscriptions,
      consultations_count = EXCLUDED.consultations_count,
      ads_served = EXCLUDED.ads_served,
      updated_at = CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;
