-- Smart Matching Algorithm Migration
-- Intelligent patient-doctor matching based on multiple criteria

-- Create SymptomCategory table for symptom classification
CREATE TABLE IF NOT EXISTS "SymptomCategory" (
  id SERIAL PRIMARY KEY,
  category_name VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  related_specialties TEXT[],
  keywords TEXT[],
  severity_indicators TEXT[],
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for symptom category lookups
CREATE INDEX IF NOT EXISTS idx_symptom_category_name ON "SymptomCategory"(category_name);
CREATE INDEX IF NOT EXISTS idx_symptom_category_keywords ON "SymptomCategory" USING GIN (keywords);

-- Create DoctorExpertise table for tracking doctor's expertise areas
CREATE TABLE IF NOT EXISTS "DoctorExpertise" (
  id SERIAL PRIMARY KEY,
  doctor_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  
  -- Expertise details
  expertise_area VARCHAR(255) NOT NULL,
  symptom_categories TEXT[],
  conditions_treated TEXT[],
  procedures_performed TEXT[],
  
  -- Experience metrics
  cases_handled INTEGER DEFAULT 0,
  success_rate DECIMAL(5, 2) DEFAULT 0.00,
  average_rating DECIMAL(2, 1) DEFAULT 0.0,
  
  -- Confidence level
  confidence_level VARCHAR(50) DEFAULT 'intermediate', -- 'beginner', 'intermediate', 'expert', 'specialist'
  
  -- Verification
  is_verified BOOLEAN DEFAULT false,
  verified_by TEXT,
  verified_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(doctor_id, expertise_area)
);

-- Create indexes for doctor expertise lookups
CREATE INDEX IF NOT EXISTS idx_doctor_expertise_doctor ON "DoctorExpertise"(doctor_id);
CREATE INDEX IF NOT EXISTS idx_doctor_expertise_area ON "DoctorExpertise"(expertise_area);
CREATE INDEX IF NOT EXISTS idx_doctor_expertise_categories ON "DoctorExpertise" USING GIN (symptom_categories);
CREATE INDEX IF NOT EXISTS idx_doctor_expertise_success ON "DoctorExpertise"(success_rate DESC);

-- Create DoctorLanguage table for language capabilities
CREATE TABLE IF NOT EXISTS "DoctorLanguage" (
  id SERIAL PRIMARY KEY,
  doctor_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  
  language_code VARCHAR(10) NOT NULL, -- 'en', 'es', 'hi', 'zh', etc.
  language_name VARCHAR(100) NOT NULL,
  proficiency_level VARCHAR(50) DEFAULT 'fluent', -- 'basic', 'conversational', 'fluent', 'native'
  
  is_primary BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(doctor_id, language_code)
);

-- Create indexes for doctor language lookups
CREATE INDEX IF NOT EXISTS idx_doctor_language_doctor ON "DoctorLanguage"(doctor_id);
CREATE INDEX IF NOT EXISTS idx_doctor_language_code ON "DoctorLanguage"(language_code);
CREATE INDEX IF NOT EXISTS idx_doctor_language_primary ON "DoctorLanguage"(is_primary);

-- Create DoctorInsurance table for insurance compatibility
CREATE TABLE IF NOT EXISTS "DoctorInsurance" (
  id SERIAL PRIMARY KEY,
  doctor_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  
  insurance_provider VARCHAR(255) NOT NULL,
  insurance_plan_types TEXT[], -- ['PPO', 'HMO', 'EPO', 'POS']
  
  is_in_network BOOLEAN DEFAULT true,
  copay_amount DECIMAL(10, 2),
  
  verification_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'verified', 'expired'
  verified_at TIMESTAMP,
  expires_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(doctor_id, insurance_provider)
);

-- Create indexes for doctor insurance lookups
CREATE INDEX IF NOT EXISTS idx_doctor_insurance_doctor ON "DoctorInsurance"(doctor_id);
CREATE INDEX IF NOT EXISTS idx_doctor_insurance_provider ON "DoctorInsurance"(insurance_provider);
CREATE INDEX IF NOT EXISTS idx_doctor_insurance_network ON "DoctorInsurance"(is_in_network);

-- Create CaseHistory table for tracking similar case outcomes
CREATE TABLE IF NOT EXISTS "CaseHistory" (
  id SERIAL PRIMARY KEY,
  doctor_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  appointment_id TEXT REFERENCES "Appointment"(id) ON DELETE SET NULL,
  
  -- Case details
  symptom_categories TEXT[],
  primary_diagnosis VARCHAR(255),
  secondary_diagnoses TEXT[],
  
  -- Treatment
  treatment_approach TEXT,
  medications_prescribed TEXT[],
  procedures_performed TEXT[],
  
  -- Outcome
  outcome_status VARCHAR(50), -- 'resolved', 'improved', 'ongoing', 'referred', 'unsuccessful'
  patient_satisfaction_score DECIMAL(2, 1),
  follow_up_required BOOLEAN DEFAULT false,
  
  -- Metadata
  case_complexity VARCHAR(50), -- 'simple', 'moderate', 'complex', 'critical'
  consultation_duration_minutes INTEGER,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for case history lookups
CREATE INDEX IF NOT EXISTS idx_case_history_doctor ON "CaseHistory"(doctor_id);
CREATE INDEX IF NOT EXISTS idx_case_history_symptoms ON "CaseHistory" USING GIN (symptom_categories);
CREATE INDEX IF NOT EXISTS idx_case_history_diagnosis ON "CaseHistory"(primary_diagnosis);
CREATE INDEX IF NOT EXISTS idx_case_history_outcome ON "CaseHistory"(outcome_status);

-- Create MatchingPreference table for patient preferences
CREATE TABLE IF NOT EXISTS "MatchingPreference" (
  id SERIAL PRIMARY KEY,
  patient_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  
  -- Preference weights (0-100)
  specialty_weight INTEGER DEFAULT 30,
  location_weight INTEGER DEFAULT 25,
  availability_weight INTEGER DEFAULT 20,
  rating_weight INTEGER DEFAULT 15,
  language_weight INTEGER DEFAULT 5,
  insurance_weight INTEGER DEFAULT 5,
  
  -- Filters
  max_distance_km DECIMAL(10, 2) DEFAULT 50.0,
  preferred_languages TEXT[],
  required_insurance VARCHAR(255),
  min_rating DECIMAL(2, 1) DEFAULT 4.0,
  
  -- Consultation preferences
  preferred_consultation_type VARCHAR(50), -- 'video', 'in_person', 'any'
  preferred_gender VARCHAR(50), -- 'male', 'female', 'any'
  
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(patient_id)
);

-- Create indexes for matching preference lookups
CREATE INDEX IF NOT EXISTS idx_matching_preference_patient ON "MatchingPreference"(patient_id);

-- Create MatchingResult table for storing match results
CREATE TABLE IF NOT EXISTS "MatchingResult" (
  id SERIAL PRIMARY KEY,
  patient_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  doctor_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  
  -- Match scores (0-100)
  overall_match_score DECIMAL(5, 2) NOT NULL,
  specialty_score DECIMAL(5, 2) DEFAULT 0,
  location_score DECIMAL(5, 2) DEFAULT 0,
  availability_score DECIMAL(5, 2) DEFAULT 0,
  rating_score DECIMAL(5, 2) DEFAULT 0,
  language_score DECIMAL(5, 2) DEFAULT 0,
  insurance_score DECIMAL(5, 2) DEFAULT 0,
  experience_score DECIMAL(5, 2) DEFAULT 0,
  
  -- Match details
  match_reason TEXT,
  distance_km DECIMAL(10, 2),
  estimated_wait_time_minutes INTEGER,
  
  -- Ranking
  rank_position INTEGER,
  
  -- Metadata
  search_criteria JSONB,
  calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Engagement
  viewed BOOLEAN DEFAULT false,
  viewed_at TIMESTAMP,
  contacted BOOLEAN DEFAULT false,
  contacted_at TIMESTAMP,
  booked BOOLEAN DEFAULT false,
  booked_at TIMESTAMP
);

-- Create indexes for matching result lookups
CREATE INDEX IF NOT EXISTS idx_matching_result_patient ON "MatchingResult"(patient_id);
CREATE INDEX IF NOT EXISTS idx_matching_result_doctor ON "MatchingResult"(doctor_id);
CREATE INDEX IF NOT EXISTS idx_matching_result_score ON "MatchingResult"(overall_match_score DESC);
CREATE INDEX IF NOT EXISTS idx_matching_result_rank ON "MatchingResult"(patient_id, rank_position);
CREATE INDEX IF NOT EXISTS idx_matching_result_calculated ON "MatchingResult"(calculated_at DESC);

-- Create MatchingFeedback table for improving algorithm
CREATE TABLE IF NOT EXISTS "MatchingFeedback" (
  id SERIAL PRIMARY KEY,
  matching_result_id INTEGER REFERENCES "MatchingResult"(id) ON DELETE CASCADE,
  patient_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  doctor_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  
  -- Feedback
  was_helpful BOOLEAN,
  feedback_type VARCHAR(50), -- 'good_match', 'poor_match', 'booked', 'not_available'
  feedback_text TEXT,
  
  -- Ratings
  match_accuracy_rating DECIMAL(2, 1),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for matching feedback lookups
CREATE INDEX IF NOT EXISTS idx_matching_feedback_result ON "MatchingFeedback"(matching_result_id);
CREATE INDEX IF NOT EXISTS idx_matching_feedback_patient ON "MatchingFeedback"(patient_id);
CREATE INDEX IF NOT EXISTS idx_matching_feedback_type ON "MatchingFeedback"(feedback_type);

-- Add matching fields to User table
ALTER TABLE "User"
ADD COLUMN IF NOT EXISTS preferred_language VARCHAR(10),
ADD COLUMN IF NOT EXISTS insurance_provider VARCHAR(255),
ADD COLUMN IF NOT EXISTS gender VARCHAR(50),
ADD COLUMN IF NOT EXISTS date_of_birth DATE;

-- Create indexes on matching fields
CREATE INDEX IF NOT EXISTS idx_user_language ON "User"(preferred_language);
CREATE INDEX IF NOT EXISTS idx_user_insurance ON "User"(insurance_provider);
CREATE INDEX IF NOT EXISTS idx_user_gender ON "User"(gender);

-- Insert default symptom categories
INSERT INTO "SymptomCategory" (category_name, description, related_specialties, keywords) VALUES
('Respiratory', 'Breathing and lung-related symptoms', ARRAY['Pulmonology', 'Internal Medicine', 'Family Medicine'], ARRAY['cough', 'shortness of breath', 'wheezing', 'chest pain', 'difficulty breathing']),
('Cardiovascular', 'Heart and circulation symptoms', ARRAY['Cardiology', 'Internal Medicine'], ARRAY['chest pain', 'palpitations', 'irregular heartbeat', 'high blood pressure', 'dizziness']),
('Gastrointestinal', 'Digestive system symptoms', ARRAY['Gastroenterology', 'Internal Medicine'], ARRAY['abdominal pain', 'nausea', 'vomiting', 'diarrhea', 'constipation', 'bloating']),
('Neurological', 'Brain and nervous system symptoms', ARRAY['Neurology', 'Internal Medicine'], ARRAY['headache', 'dizziness', 'numbness', 'tingling', 'seizures', 'memory loss']),
('Musculoskeletal', 'Bones, joints, and muscles', ARRAY['Orthopedics', 'Rheumatology', 'Sports Medicine'], ARRAY['joint pain', 'back pain', 'muscle pain', 'stiffness', 'swelling']),
('Dermatological', 'Skin-related symptoms', ARRAY['Dermatology', 'Family Medicine'], ARRAY['rash', 'itching', 'skin lesion', 'acne', 'eczema', 'psoriasis']),
('Mental Health', 'Psychological and emotional symptoms', ARRAY['Psychiatry', 'Psychology'], ARRAY['anxiety', 'depression', 'stress', 'insomnia', 'mood swings', 'panic attacks']),
('Endocrine', 'Hormone-related symptoms', ARRAY['Endocrinology', 'Internal Medicine'], ARRAY['fatigue', 'weight changes', 'excessive thirst', 'frequent urination', 'thyroid issues']),
('Infectious', 'Infection-related symptoms', ARRAY['Infectious Disease', 'Internal Medicine', 'Family Medicine'], ARRAY['fever', 'chills', 'body aches', 'sore throat', 'cough', 'fatigue']),
('Pediatric', 'Child-specific symptoms', ARRAY['Pediatrics', 'Family Medicine'], ARRAY['developmental delays', 'growth issues', 'childhood illnesses', 'vaccination'])
ON CONFLICT (category_name) DO NOTHING;

-- Create function to calculate match score
CREATE OR REPLACE FUNCTION calculate_match_score(
  p_patient_id TEXT,
  p_doctor_id TEXT,
  p_symptoms TEXT[],
  p_patient_location GEOGRAPHY,
  p_required_language VARCHAR,
  p_insurance_provider VARCHAR
)
RETURNS TABLE (
  overall_score DECIMAL(5,2),
  specialty_score DECIMAL(5,2),
  location_score DECIMAL(5,2),
  availability_score DECIMAL(5,2),
  rating_score DECIMAL(5,2),
  language_score DECIMAL(5,2),
  insurance_score DECIMAL(5,2),
  experience_score DECIMAL(5,2)
) AS $$
DECLARE
  v_specialty_score DECIMAL(5,2) := 0;
  v_location_score DECIMAL(5,2) := 0;
  v_availability_score DECIMAL(5,2) := 0;
  v_rating_score DECIMAL(5,2) := 0;
  v_language_score DECIMAL(5,2) := 0;
  v_insurance_score DECIMAL(5,2) := 0;
  v_experience_score DECIMAL(5,2) := 0;
  v_overall_score DECIMAL(5,2) := 0;
  v_distance_km DECIMAL(10,2);
  v_doctor_rating DECIMAL(2,1);
  v_weights RECORD;
BEGIN
  -- Get patient preferences (weights)
  SELECT * INTO v_weights FROM "MatchingPreference" WHERE patient_id = p_patient_id;
  
  -- Default weights if not set
  IF v_weights IS NULL THEN
    v_weights.specialty_weight := 30;
    v_weights.location_weight := 25;
    v_weights.availability_weight := 20;
    v_weights.rating_weight := 15;
    v_weights.language_weight := 5;
    v_weights.insurance_weight := 5;
  END IF;
  
  -- Calculate specialty score (based on expertise match)
  SELECT COALESCE(AVG(success_rate), 0) INTO v_specialty_score
  FROM "DoctorExpertise"
  WHERE doctor_id = p_doctor_id
    AND symptom_categories && p_symptoms;
  
  -- Calculate location score (based on distance)
  IF p_patient_location IS NOT NULL THEN
    SELECT MIN(ST_Distance(location::geography, p_patient_location) / 1000) INTO v_distance_km
    FROM "DoctorClinic"
    WHERE doctor_id = p_doctor_id;
    
    IF v_distance_km IS NOT NULL THEN
      v_location_score := GREATEST(0, 100 - (v_distance_km * 2));
    END IF;
  END IF;
  
  -- Calculate availability score
  SELECT CASE 
    WHEN COUNT(*) > 0 THEN 100
    ELSE 50
  END INTO v_availability_score
  FROM "DoctorAvailability"
  WHERE doctor_id = p_doctor_id
    AND is_available = true;
  
  -- Calculate rating score
  SELECT COALESCE(overall_rating * 20, 0) INTO v_rating_score
  FROM "DoctorRating"
  WHERE doctor_id = p_doctor_id;
  
  -- Calculate language score
  IF p_required_language IS NOT NULL THEN
    SELECT CASE 
      WHEN COUNT(*) > 0 THEN 100
      ELSE 0
    END INTO v_language_score
    FROM "DoctorLanguage"
    WHERE doctor_id = p_doctor_id
      AND language_code = p_required_language;
  ELSE
    v_language_score := 100;
  END IF;
  
  -- Calculate insurance score
  IF p_insurance_provider IS NOT NULL THEN
    SELECT CASE 
      WHEN COUNT(*) > 0 THEN 100
      ELSE 0
    END INTO v_insurance_score
    FROM "DoctorInsurance"
    WHERE doctor_id = p_doctor_id
      AND insurance_provider = p_insurance_provider
      AND is_in_network = true;
  ELSE
    v_insurance_score := 100;
  END IF;
  
  -- Calculate experience score (based on case history)
  SELECT COALESCE(
    (COUNT(*) FILTER (WHERE outcome_status = 'resolved') * 100.0 / NULLIF(COUNT(*), 0)),
    0
  ) INTO v_experience_score
  FROM "CaseHistory"
  WHERE doctor_id = p_doctor_id
    AND symptom_categories && p_symptoms;
  
  -- Calculate weighted overall score
  v_overall_score := (
    (v_specialty_score * v_weights.specialty_weight / 100.0) +
    (v_location_score * v_weights.location_weight / 100.0) +
    (v_availability_score * v_weights.availability_weight / 100.0) +
    (v_rating_score * v_weights.rating_weight / 100.0) +
    (v_language_score * v_weights.language_weight / 100.0) +
    (v_insurance_score * v_weights.insurance_weight / 100.0)
  );
  
  RETURN QUERY SELECT 
    v_overall_score,
    v_specialty_score,
    v_location_score,
    v_availability_score,
    v_rating_score,
    v_language_score,
    v_insurance_score,
    v_experience_score;
END;
$$ LANGUAGE plpgsql;
