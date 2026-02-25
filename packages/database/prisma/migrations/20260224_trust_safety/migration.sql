-- Trust & Safety Migration
-- Verification layers and quality control systems

-- Create MedicalLicenseVerification table
CREATE TABLE IF NOT EXISTS "MedicalLicenseVerification" (
  id SERIAL PRIMARY KEY,
  doctor_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  
  -- License details
  license_number VARCHAR(255) NOT NULL,
  license_type VARCHAR(100) NOT NULL, -- 'MD', 'DO', 'MBBS', 'RN', 'PharmD', etc.
  issuing_authority VARCHAR(255) NOT NULL, -- State medical board, country authority
  issuing_country VARCHAR(100) NOT NULL,
  issuing_state VARCHAR(100),
  
  -- Dates
  issue_date DATE NOT NULL,
  expiry_date DATE NOT NULL,
  
  -- Verification
  verification_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'verified', 'rejected', 'expired', 'suspended'
  verification_method VARCHAR(100), -- 'manual', 'api', 'document_upload'
  verified_by TEXT REFERENCES "User"(id) ON DELETE SET NULL,
  verified_at TIMESTAMP,
  
  -- Documents
  license_document_url TEXT,
  additional_documents TEXT[],
  
  -- Verification notes
  verification_notes TEXT,
  rejection_reason TEXT,
  
  -- Auto-renewal check
  last_checked_at TIMESTAMP,
  next_check_date DATE,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(license_number, issuing_authority)
);

-- Create indexes for medical license verification
CREATE INDEX IF NOT EXISTS idx_medical_license_doctor ON "MedicalLicenseVerification"(doctor_id);
CREATE INDEX IF NOT EXISTS idx_medical_license_status ON "MedicalLicenseVerification"(verification_status);
CREATE INDEX IF NOT EXISTS idx_medical_license_expiry ON "MedicalLicenseVerification"(expiry_date);

-- Create HospitalAffiliationVerification table
CREATE TABLE IF NOT EXISTS "HospitalAffiliationVerification" (
  id SERIAL PRIMARY KEY,
  doctor_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  
  -- Hospital details
  hospital_name VARCHAR(255) NOT NULL,
  hospital_address TEXT,
  hospital_city VARCHAR(100),
  hospital_state VARCHAR(100),
  hospital_country VARCHAR(100),
  hospital_type VARCHAR(100), -- 'public', 'private', 'teaching', 'specialty'
  
  -- Affiliation details
  affiliation_type VARCHAR(100), -- 'staff', 'consultant', 'visiting', 'honorary'
  department VARCHAR(255),
  position VARCHAR(255),
  
  -- Dates
  start_date DATE NOT NULL,
  end_date DATE,
  is_current BOOLEAN DEFAULT true,
  
  -- Verification
  verification_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'verified', 'rejected', 'expired'
  verification_method VARCHAR(100), -- 'hospital_confirmation', 'document_upload', 'phone_verification'
  verified_by TEXT REFERENCES "User"(id) ON DELETE SET NULL,
  verified_at TIMESTAMP,
  
  -- Contact
  hospital_contact_email VARCHAR(255),
  hospital_contact_phone VARCHAR(50),
  verification_contact_name VARCHAR(255),
  
  -- Documents
  affiliation_document_url TEXT,
  
  -- Notes
  verification_notes TEXT,
  rejection_reason TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for hospital affiliation verification
CREATE INDEX IF NOT EXISTS idx_hospital_affiliation_doctor ON "HospitalAffiliationVerification"(doctor_id);
CREATE INDEX IF NOT EXISTS idx_hospital_affiliation_status ON "HospitalAffiliationVerification"(verification_status);
CREATE INDEX IF NOT EXISTS idx_hospital_affiliation_current ON "HospitalAffiliationVerification"(is_current);

-- Create PeerEndorsement table
CREATE TABLE IF NOT EXISTS "PeerEndorsement" (
  id SERIAL PRIMARY KEY,
  endorser_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  endorsed_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  
  -- Endorsement details
  endorsement_type VARCHAR(100) NOT NULL, -- 'clinical_skills', 'professionalism', 'communication', 'expertise', 'general'
  specialty_area VARCHAR(255),
  
  -- Content
  endorsement_text TEXT,
  
  -- Relationship
  relationship_type VARCHAR(100), -- 'colleague', 'supervisor', 'mentee', 'collaborator'
  years_known INTEGER,
  worked_together BOOLEAN DEFAULT false,
  
  -- Verification
  is_verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMP,
  
  -- Visibility
  is_public BOOLEAN DEFAULT true,
  
  -- Status
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'revoked', 'disputed'
  revoked_at TIMESTAMP,
  revoke_reason TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(endorser_id, endorsed_id, endorsement_type)
);

-- Create indexes for peer endorsements
CREATE INDEX IF NOT EXISTS idx_peer_endorsement_endorser ON "PeerEndorsement"(endorser_id);
CREATE INDEX IF NOT EXISTS idx_peer_endorsement_endorsed ON "PeerEndorsement"(endorsed_id);
CREATE INDEX IF NOT EXISTS idx_peer_endorsement_status ON "PeerEndorsement"(status);

-- Create PatientIdentityVerification table
CREATE TABLE IF NOT EXISTS "PatientIdentityVerification" (
  id SERIAL PRIMARY KEY,
  patient_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  
  -- Verification method
  verification_method VARCHAR(100) NOT NULL, -- 'email', 'phone', 'government_id', 'medical_record', 'appointment_history'
  
  -- Identity details
  full_name VARCHAR(255),
  date_of_birth DATE,
  phone_number VARCHAR(50),
  email VARCHAR(255),
  
  -- Government ID (optional, for high-trust reviews)
  id_type VARCHAR(100), -- 'passport', 'drivers_license', 'national_id'
  id_number_hash VARCHAR(255), -- Hashed for privacy
  id_document_url TEXT, -- Encrypted storage
  
  -- Medical record verification
  medical_record_number VARCHAR(255),
  healthcare_provider VARCHAR(255),
  
  -- Appointment verification
  verified_appointment_id TEXT REFERENCES "Appointment"(id) ON DELETE SET NULL,
  
  -- Verification status
  verification_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'verified', 'rejected', 'expired'
  verification_level VARCHAR(50) DEFAULT 'basic', -- 'basic', 'standard', 'enhanced'
  verified_by TEXT REFERENCES "User"(id) ON DELETE SET NULL,
  verified_at TIMESTAMP,
  
  -- Expiry
  expires_at TIMESTAMP,
  
  -- Notes
  verification_notes TEXT,
  rejection_reason TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(patient_id, verification_method)
);

-- Create indexes for patient identity verification
CREATE INDEX IF NOT EXISTS idx_patient_identity_patient ON "PatientIdentityVerification"(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_identity_status ON "PatientIdentityVerification"(verification_status);
CREATE INDEX IF NOT EXISTS idx_patient_identity_level ON "PatientIdentityVerification"(verification_level);

-- Create ContentModeration table
CREATE TABLE IF NOT EXISTS "ContentModeration" (
  id SERIAL PRIMARY KEY,
  
  -- Content details
  content_type VARCHAR(50) NOT NULL, -- 'post', 'comment', 'reply', 'review', 'message'
  content_id TEXT NOT NULL,
  author_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  content_text TEXT,
  
  -- AI Analysis
  ai_flagged BOOLEAN DEFAULT false,
  ai_confidence_score DECIMAL(5, 2), -- 0-100
  ai_flag_reasons TEXT[], -- ['inappropriate_language', 'medical_misinformation', 'spam', 'harassment']
  ai_analyzed_at TIMESTAMP,
  
  -- Moderation status
  moderation_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'requires_review'
  moderation_action VARCHAR(50), -- 'none', 'warning', 'content_removed', 'user_suspended', 'user_banned'
  
  -- Human review
  reviewed_by TEXT REFERENCES "User"(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP,
  review_notes TEXT,
  
  -- Severity
  severity_level VARCHAR(50), -- 'low', 'medium', 'high', 'critical'
  
  -- Appeal
  appeal_status VARCHAR(50), -- 'none', 'pending', 'approved', 'rejected'
  appeal_text TEXT,
  appeal_reviewed_by TEXT REFERENCES "User"(id) ON DELETE SET NULL,
  appeal_reviewed_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for content moderation
CREATE INDEX IF NOT EXISTS idx_content_moderation_content ON "ContentModeration"(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_content_moderation_author ON "ContentModeration"(author_id);
CREATE INDEX IF NOT EXISTS idx_content_moderation_status ON "ContentModeration"(moderation_status);
CREATE INDEX IF NOT EXISTS idx_content_moderation_ai_flagged ON "ContentModeration"(ai_flagged);

-- Create MedicalAdvicePeerReview table
CREATE TABLE IF NOT EXISTS "MedicalAdvicePeerReview" (
  id SERIAL PRIMARY KEY,
  
  -- Content being reviewed
  content_type VARCHAR(50) NOT NULL, -- 'post', 'comment', 'reply'
  content_id TEXT NOT NULL,
  author_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  content_text TEXT NOT NULL,
  
  -- Review request
  requested_by TEXT REFERENCES "User"(id) ON DELETE SET NULL,
  request_reason VARCHAR(100), -- 'quality_check', 'patient_concern', 'conflicting_advice', 'routine_review'
  
  -- Reviewer
  reviewer_id TEXT REFERENCES "User"(id) ON DELETE SET NULL,
  reviewer_specialty VARCHAR(255),
  
  -- Review details
  review_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'escalated'
  review_outcome VARCHAR(50), -- 'approved', 'needs_revision', 'incorrect', 'dangerous'
  
  -- Feedback
  review_feedback TEXT,
  suggested_corrections TEXT,
  medical_accuracy_score DECIMAL(3, 1), -- 0-10
  
  -- Severity
  severity_level VARCHAR(50), -- 'low', 'medium', 'high', 'critical'
  requires_immediate_action BOOLEAN DEFAULT false,
  
  -- Actions taken
  action_taken VARCHAR(100), -- 'none', 'content_flagged', 'content_removed', 'author_notified', 'admin_escalated'
  
  -- Dates
  assigned_at TIMESTAMP,
  completed_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for medical advice peer review
CREATE INDEX IF NOT EXISTS idx_medical_advice_review_content ON "MedicalAdvicePeerReview"(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_medical_advice_review_author ON "MedicalAdvicePeerReview"(author_id);
CREATE INDEX IF NOT EXISTS idx_medical_advice_review_reviewer ON "MedicalAdvicePeerReview"(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_medical_advice_review_status ON "MedicalAdvicePeerReview"(review_status);

-- Create ConflictingDiagnosis table
CREATE TABLE IF NOT EXISTS "ConflictingDiagnosis" (
  id SERIAL PRIMARY KEY,
  
  -- Patient post/case
  post_id TEXT NOT NULL REFERENCES "Post"(id) ON DELETE CASCADE,
  patient_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  
  -- Conflicting responses
  response_1_id TEXT NOT NULL REFERENCES "Comment"(id) ON DELETE CASCADE,
  response_1_doctor_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  response_1_diagnosis TEXT,
  
  response_2_id TEXT NOT NULL REFERENCES "Comment"(id) ON DELETE CASCADE,
  response_2_doctor_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  response_2_diagnosis TEXT,
  
  -- Conflict analysis
  conflict_type VARCHAR(100), -- 'diagnosis', 'treatment', 'medication', 'urgency_level'
  conflict_severity VARCHAR(50), -- 'minor', 'moderate', 'major', 'critical'
  
  -- AI Detection
  detected_by_ai BOOLEAN DEFAULT false,
  ai_confidence_score DECIMAL(5, 2),
  conflict_description TEXT,
  
  -- Resolution
  resolution_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'under_review', 'resolved', 'escalated'
  resolution_method VARCHAR(100), -- 'peer_review', 'expert_consultation', 'patient_clarification', 'admin_decision'
  
  -- Expert review
  expert_reviewer_id TEXT REFERENCES "User"(id) ON DELETE SET NULL,
  expert_opinion TEXT,
  recommended_action TEXT,
  
  -- Patient notification
  patient_notified BOOLEAN DEFAULT false,
  patient_notified_at TIMESTAMP,
  
  -- Actions taken
  action_taken VARCHAR(100),
  
  resolved_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for conflicting diagnosis
CREATE INDEX IF NOT EXISTS idx_conflicting_diagnosis_post ON "ConflictingDiagnosis"(post_id);
CREATE INDEX IF NOT EXISTS idx_conflicting_diagnosis_patient ON "ConflictingDiagnosis"(patient_id);
CREATE INDEX IF NOT EXISTS idx_conflicting_diagnosis_status ON "ConflictingDiagnosis"(resolution_status);
CREATE INDEX IF NOT EXISTS idx_conflicting_diagnosis_severity ON "ConflictingDiagnosis"(conflict_severity);

-- Create DoctorQualityReview table
CREATE TABLE IF NOT EXISTS "DoctorQualityReview" (
  id SERIAL PRIMARY KEY,
  doctor_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  
  -- Review trigger
  trigger_type VARCHAR(100) NOT NULL, -- 'low_rating', 'patient_complaints', 'peer_reports', 'routine_audit', 'license_issue'
  trigger_details TEXT,
  
  -- Review period
  review_period_start DATE NOT NULL,
  review_period_end DATE NOT NULL,
  
  -- Metrics analyzed
  average_rating DECIMAL(2, 1),
  total_reviews INTEGER,
  complaint_count INTEGER,
  response_time_avg INTEGER, -- minutes
  consultation_success_rate DECIMAL(5, 2),
  
  -- Quality indicators
  medical_accuracy_score DECIMAL(3, 1), -- 0-10
  professionalism_score DECIMAL(3, 1), -- 0-10
  patient_safety_score DECIMAL(3, 1), -- 0-10
  
  -- Review status
  review_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'escalated'
  review_outcome VARCHAR(50), -- 'no_action', 'warning', 'training_required', 'suspension', 'termination'
  
  -- Reviewer
  reviewed_by TEXT REFERENCES "User"(id) ON DELETE SET NULL,
  review_notes TEXT,
  recommendations TEXT,
  
  -- Actions
  action_plan TEXT,
  action_deadline DATE,
  action_completed BOOLEAN DEFAULT false,
  
  -- Follow-up
  requires_follow_up BOOLEAN DEFAULT false,
  follow_up_date DATE,
  follow_up_completed BOOLEAN DEFAULT false,
  
  -- Dates
  review_started_at TIMESTAMP,
  review_completed_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for doctor quality review
CREATE INDEX IF NOT EXISTS idx_doctor_quality_review_doctor ON "DoctorQualityReview"(doctor_id);
CREATE INDEX IF NOT EXISTS idx_doctor_quality_review_status ON "DoctorQualityReview"(review_status);
CREATE INDEX IF NOT EXISTS idx_doctor_quality_review_outcome ON "DoctorQualityReview"(review_outcome);
CREATE INDEX IF NOT EXISTS idx_doctor_quality_review_follow_up ON "DoctorQualityReview"(requires_follow_up, follow_up_completed);

-- Create TrustScore table for overall trust metrics
CREATE TABLE IF NOT EXISTS "TrustScore" (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  user_type VARCHAR(50) NOT NULL, -- 'doctor', 'patient'
  
  -- Overall trust score (0-100)
  trust_score DECIMAL(5, 2) DEFAULT 50.00,
  
  -- Component scores
  verification_score DECIMAL(5, 2) DEFAULT 0.00,
  activity_score DECIMAL(5, 2) DEFAULT 0.00,
  reputation_score DECIMAL(5, 2) DEFAULT 0.00,
  compliance_score DECIMAL(5, 2) DEFAULT 0.00,
  
  -- Verification status
  license_verified BOOLEAN DEFAULT false,
  hospital_verified BOOLEAN DEFAULT false,
  identity_verified BOOLEAN DEFAULT false,
  peer_endorsed BOOLEAN DEFAULT false,
  
  -- Activity metrics
  account_age_days INTEGER DEFAULT 0,
  total_interactions INTEGER DEFAULT 0,
  positive_interactions INTEGER DEFAULT 0,
  
  -- Flags
  has_violations BOOLEAN DEFAULT false,
  violation_count INTEGER DEFAULT 0,
  last_violation_date TIMESTAMP,
  
  -- Trust level
  trust_level VARCHAR(50) DEFAULT 'new', -- 'new', 'basic', 'trusted', 'verified', 'expert'
  
  -- Last calculated
  calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(user_id)
);

-- Create indexes for trust score
CREATE INDEX IF NOT EXISTS idx_trust_score_user ON "TrustScore"(user_id);
CREATE INDEX IF NOT EXISTS idx_trust_score_level ON "TrustScore"(trust_level);
CREATE INDEX IF NOT EXISTS idx_trust_score_score ON "TrustScore"(trust_score DESC);

-- Add trust & safety fields to User table
ALTER TABLE "User"
ADD COLUMN IF NOT EXISTS license_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS license_verification_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS hospital_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS identity_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS trust_score DECIMAL(5, 2) DEFAULT 50.00,
ADD COLUMN IF NOT EXISTS trust_level VARCHAR(50) DEFAULT 'new',
ADD COLUMN IF NOT EXISTS peer_endorsement_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS content_violations INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS account_suspended BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS suspension_reason TEXT,
ADD COLUMN IF NOT EXISTS suspended_until TIMESTAMP;

-- Create indexes on user trust fields
CREATE INDEX IF NOT EXISTS idx_user_license_verified ON "User"(license_verified);
CREATE INDEX IF NOT EXISTS idx_user_trust_score ON "User"(trust_score DESC);
CREATE INDEX IF NOT EXISTS idx_user_suspended ON "User"(account_suspended);

-- Create function to calculate trust score
CREATE OR REPLACE FUNCTION calculate_trust_score(p_user_id TEXT, p_user_type VARCHAR)
RETURNS DECIMAL(5,2) AS $$
DECLARE
  v_verification_score DECIMAL(5,2) := 0;
  v_activity_score DECIMAL(5,2) := 0;
  v_reputation_score DECIMAL(5,2) := 0;
  v_compliance_score DECIMAL(5,2) := 100;
  v_trust_score DECIMAL(5,2);
BEGIN
  -- Verification score (0-30 points)
  IF p_user_type = 'doctor' THEN
    SELECT 
      (CASE WHEN license_verified THEN 15 ELSE 0 END) +
      (CASE WHEN hospital_verified THEN 10 ELSE 0 END) +
      (CASE WHEN peer_endorsement_count >= 3 THEN 5 ELSE peer_endorsement_count * 1.67 END)
    INTO v_verification_score
    FROM "User"
    WHERE id = p_user_id;
  ELSE
    SELECT 
      (CASE WHEN identity_verified THEN 20 ELSE 0 END) +
      (CASE WHEN email_verified THEN 5 ELSE 0 END) +
      (CASE WHEN phone_verified THEN 5 ELSE 0 END)
    INTO v_verification_score
    FROM "User"
    WHERE id = p_user_id;
  END IF;
  
  -- Activity score (0-30 points)
  SELECT 
    LEAST(30, (EXTRACT(DAY FROM (CURRENT_DATE - created_at::date)) / 365.0 * 10)) +
    LEAST(20, (SELECT COUNT(*) FROM "Post" WHERE "authorId" = p_user_id) * 0.5)
  INTO v_activity_score
  FROM "User"
  WHERE id = p_user_id;
  
  -- Reputation score (0-30 points)
  IF p_user_type = 'doctor' THEN
    SELECT LEAST(30, overall_rating * 6)
    INTO v_reputation_score
    FROM "User"
    WHERE id = p_user_id;
  ELSE
    SELECT LEAST(30, (SELECT COUNT(*) FROM "DoctorReview" WHERE patient_id = p_user_id AND is_verified = true) * 3)
    INTO v_reputation_score;
  END IF;
  
  -- Compliance score (0-10 points, deductions for violations)
  SELECT 100 - (content_violations * 10)
  INTO v_compliance_score
  FROM "User"
  WHERE id = p_user_id;
  
  v_compliance_score := GREATEST(0, LEAST(10, v_compliance_score / 10));
  
  -- Calculate total (max 100)
  v_trust_score := v_verification_score + v_activity_score + v_reputation_score + v_compliance_score;
  
  -- Update TrustScore table
  INSERT INTO "TrustScore" (
    user_id, user_type, trust_score,
    verification_score, activity_score, reputation_score, compliance_score,
    calculated_at
  ) VALUES (
    p_user_id, p_user_type, v_trust_score,
    v_verification_score, v_activity_score, v_reputation_score, v_compliance_score,
    CURRENT_TIMESTAMP
  )
  ON CONFLICT (user_id) DO UPDATE
  SET trust_score = v_trust_score,
      verification_score = v_verification_score,
      activity_score = v_activity_score,
      reputation_score = v_reputation_score,
      compliance_score = v_compliance_score,
      calculated_at = CURRENT_TIMESTAMP,
      updated_at = CURRENT_TIMESTAMP;
  
  -- Update User table
  UPDATE "User"
  SET trust_score = v_trust_score,
      trust_level = CASE
        WHEN v_trust_score >= 80 THEN 'expert'
        WHEN v_trust_score >= 60 THEN 'verified'
        WHEN v_trust_score >= 40 THEN 'trusted'
        WHEN v_trust_score >= 20 THEN 'basic'
        ELSE 'new'
      END
  WHERE id = p_user_id;
  
  RETURN v_trust_score;
END;
$$ LANGUAGE plpgsql;

-- Create function to detect conflicting diagnoses
CREATE OR REPLACE FUNCTION detect_conflicting_diagnoses()
RETURNS VOID AS $$
BEGIN
  -- This would be called by a cron job to analyze recent posts
  -- Implementation would use NLP/AI to detect conflicts
  -- Placeholder for now
  NULL;
END;
$$ LANGUAGE plpgsql;
