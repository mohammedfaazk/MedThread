-- SEO Rating Website Migration
-- Add SEO-optimized fields and content management tables

-- Create DoctorSEOProfile table for SEO-optimized doctor pages
CREATE TABLE IF NOT EXISTS "DoctorSEOProfile" (
  id SERIAL PRIMARY KEY,
  doctor_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  slug VARCHAR(255) NOT NULL UNIQUE, -- e.g., dr-john-smith-cardiologist-mumbai
  meta_title VARCHAR(255),
  meta_description TEXT,
  meta_keywords TEXT[],
  canonical_url VARCHAR(500),
  og_title VARCHAR(255),
  og_description TEXT,
  og_image VARCHAR(500),
  twitter_card VARCHAR(50) DEFAULT 'summary_large_image',
  schema_markup JSONB,
  page_views INTEGER DEFAULT 0,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(doctor_id)
);

-- Create indexes for SEO profile lookups
CREATE INDEX IF NOT EXISTS idx_seo_profile_slug ON "DoctorSEOProfile"(slug);
CREATE INDEX IF NOT EXISTS idx_seo_profile_doctor ON "DoctorSEOProfile"(doctor_id);
CREATE INDEX IF NOT EXISTS idx_seo_profile_published ON "DoctorSEOProfile"(is_published);

-- Create PatientTestimonial table for verified testimonials
CREATE TABLE IF NOT EXISTS "PatientTestimonial" (
  id SERIAL PRIMARY KEY,
  doctor_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  patient_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  appointment_id TEXT REFERENCES "Appointment"(id) ON DELETE SET NULL,
  testimonial_text TEXT NOT NULL,
  rating DECIMAL(2, 1) NOT NULL CHECK (rating >= 1 AND rating <= 5),
  treatment_type VARCHAR(255),
  before_condition TEXT,
  after_condition TEXT,
  photo_url VARCHAR(500),
  video_url VARCHAR(500),
  is_verified BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  consent_given BOOLEAN DEFAULT false,
  display_name VARCHAR(255), -- Can be different from username for privacy
  is_anonymous BOOLEAN DEFAULT false,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for testimonial lookups
CREATE INDEX IF NOT EXISTS idx_testimonial_doctor ON "PatientTestimonial"(doctor_id);
CREATE INDEX IF NOT EXISTS idx_testimonial_patient ON "PatientTestimonial"(patient_id);
CREATE INDEX IF NOT EXISTS idx_testimonial_verified ON "PatientTestimonial"(is_verified);
CREATE INDEX IF NOT EXISTS idx_testimonial_featured ON "PatientTestimonial"(is_featured);
CREATE INDEX IF NOT EXISTS idx_testimonial_rating ON "PatientTestimonial"(rating DESC);

-- Create DoctorResponse table for doctor responses to reviews
CREATE TABLE IF NOT EXISTS "DoctorResponse" (
  id SERIAL PRIMARY KEY,
  review_id INTEGER REFERENCES "DoctorReview"(id) ON DELETE CASCADE,
  testimonial_id INTEGER REFERENCES "PatientTestimonial"(id) ON DELETE CASCADE,
  doctor_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  response_text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CHECK (
    (review_id IS NOT NULL AND testimonial_id IS NULL) OR
    (review_id IS NULL AND testimonial_id IS NOT NULL)
  )
);

-- Create indexes for doctor response lookups
CREATE INDEX IF NOT EXISTS idx_doctor_response_review ON "DoctorResponse"(review_id);
CREATE INDEX IF NOT EXISTS idx_doctor_response_testimonial ON "DoctorResponse"(testimonial_id);
CREATE INDEX IF NOT EXISTS idx_doctor_response_doctor ON "DoctorResponse"(doctor_id);

-- Create SEOContent table for blog posts and guides
CREATE TABLE IF NOT EXISTS "SEOContent" (
  id SERIAL PRIMARY KEY,
  content_type VARCHAR(50) NOT NULL, -- 'blog', 'guide', 'comparison', 'top_list'
  slug VARCHAR(255) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  subtitle VARCHAR(500),
  content TEXT NOT NULL,
  excerpt TEXT,
  author_id TEXT REFERENCES "User"(id) ON DELETE SET NULL,
  featured_image VARCHAR(500),
  meta_title VARCHAR(255),
  meta_description TEXT,
  meta_keywords TEXT[],
  canonical_url VARCHAR(500),
  schema_markup JSONB,
  related_doctors TEXT[], -- Array of doctor IDs
  related_specialties TEXT[],
  related_locations TEXT[],
  view_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for SEO content lookups
CREATE INDEX IF NOT EXISTS idx_seo_content_slug ON "SEOContent"(slug);
CREATE INDEX IF NOT EXISTS idx_seo_content_type ON "SEOContent"(content_type);
CREATE INDEX IF NOT EXISTS idx_seo_content_published ON "SEOContent"(is_published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_seo_content_doctors ON "SEOContent" USING GIN (related_doctors);
CREATE INDEX IF NOT EXISTS idx_seo_content_specialties ON "SEOContent" USING GIN (related_specialties);

-- Create DoctorComparison table for "Dr. A vs Dr. B" pages
CREATE TABLE IF NOT EXISTS "DoctorComparison" (
  id SERIAL PRIMARY KEY,
  doctor_a_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  doctor_b_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  slug VARCHAR(255) NOT NULL UNIQUE,
  comparison_data JSONB, -- Structured comparison data
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(doctor_a_id, doctor_b_id)
);

-- Create indexes for comparison lookups
CREATE INDEX IF NOT EXISTS idx_comparison_slug ON "DoctorComparison"(slug);
CREATE INDEX IF NOT EXISTS idx_comparison_doctors ON "DoctorComparison"(doctor_a_id, doctor_b_id);

-- Create LocalSEO table for local search optimization
CREATE TABLE IF NOT EXISTS "LocalSEO" (
  id SERIAL PRIMARY KEY,
  doctor_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  google_my_business_id VARCHAR(255),
  google_place_id VARCHAR(255),
  business_name VARCHAR(255),
  business_category VARCHAR(255),
  business_hours JSONB,
  service_areas TEXT[],
  languages_spoken TEXT[],
  payment_methods TEXT[],
  parking_available BOOLEAN DEFAULT false,
  wheelchair_accessible BOOLEAN DEFAULT false,
  accepts_new_patients BOOLEAN DEFAULT true,
  npi_number VARCHAR(50), -- National Provider Identifier
  medical_license_number VARCHAR(100),
  license_state VARCHAR(100),
  license_expiry DATE,
  board_certifications TEXT[],
  hospital_affiliations TEXT[],
  education JSONB,
  awards JSONB,
  publications JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(doctor_id)
);

-- Create indexes for local SEO lookups
CREATE INDEX IF NOT EXISTS idx_local_seo_doctor ON "LocalSEO"(doctor_id);
CREATE INDEX IF NOT EXISTS idx_local_seo_gmb ON "LocalSEO"(google_my_business_id);
CREATE INDEX IF NOT EXISTS idx_local_seo_place ON "LocalSEO"(google_place_id);
CREATE INDEX IF NOT EXISTS idx_local_seo_license ON "LocalSEO"(medical_license_number);

-- Create SEOAnalytics table for tracking SEO performance
CREATE TABLE IF NOT EXISTS "SEOAnalytics" (
  id SERIAL PRIMARY KEY,
  entity_type VARCHAR(50) NOT NULL, -- 'doctor_profile', 'blog_post', 'comparison'
  entity_id VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  organic_views INTEGER DEFAULT 0,
  google_impressions INTEGER DEFAULT 0,
  google_clicks INTEGER DEFAULT 0,
  google_ctr DECIMAL(5, 2) DEFAULT 0.00,
  google_position DECIMAL(5, 2) DEFAULT 0.00,
  search_queries JSONB,
  referral_sources JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(entity_type, entity_id, date)
);

-- Create indexes for SEO analytics lookups
CREATE INDEX IF NOT EXISTS idx_seo_analytics_entity ON "SEOAnalytics"(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_seo_analytics_date ON "SEOAnalytics"(date DESC);

-- Create RichSnippet table for managing rich snippets
CREATE TABLE IF NOT EXISTS "RichSnippet" (
  id SERIAL PRIMARY KEY,
  entity_type VARCHAR(50) NOT NULL,
  entity_id VARCHAR(255) NOT NULL,
  snippet_type VARCHAR(50) NOT NULL, -- 'review', 'faq', 'howto', 'article', 'local_business'
  schema_data JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(entity_type, entity_id, snippet_type)
);

-- Create indexes for rich snippet lookups
CREATE INDEX IF NOT EXISTS idx_rich_snippet_entity ON "RichSnippet"(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_rich_snippet_type ON "RichSnippet"(snippet_type);
CREATE INDEX IF NOT EXISTS idx_rich_snippet_active ON "RichSnippet"(is_active);

-- Add SEO fields to User table
ALTER TABLE "User"
ADD COLUMN IF NOT EXISTS seo_slug VARCHAR(255),
ADD COLUMN IF NOT EXISTS profile_views INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS google_indexed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS last_seo_update TIMESTAMP;

-- Create unique index on seo_slug
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_seo_slug ON "User"(seo_slug) WHERE seo_slug IS NOT NULL;
