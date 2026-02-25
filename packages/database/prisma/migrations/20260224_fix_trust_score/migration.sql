-- Fix Trust Score Calculation
-- Fixes the created_at reference issue

-- Drop and recreate the trust score function with proper field references
DROP FUNCTION IF EXISTS calculate_trust_score(TEXT, VARCHAR);

CREATE OR REPLACE FUNCTION calculate_trust_score(p_user_id TEXT, p_user_type VARCHAR)
RETURNS DECIMAL(5,2) AS $$
DECLARE
  v_verification_score DECIMAL(5,2) := 0;
  v_activity_score DECIMAL(5,2) := 0;
  v_reputation_score DECIMAL(5,2) := 0;
  v_compliance_score DECIMAL(5,2) := 100;
  v_trust_score DECIMAL(5,2);
  v_account_age_days INTEGER := 0;
BEGIN
  -- Get account age (use createdAt field which exists in User table)
  SELECT EXTRACT(DAY FROM (CURRENT_TIMESTAMP - "createdAt"))
  INTO v_account_age_days
  FROM "User"
  WHERE id = p_user_id;
  
  -- Verification score (0-30 points)
  IF p_user_type = 'doctor' THEN
    SELECT 
      (CASE WHEN license_verified THEN 15 ELSE 0 END) +
      (CASE WHEN hospital_verified THEN 10 ELSE 0 END) +
      (CASE WHEN peer_endorsement_count >= 3 THEN 5 ELSE COALESCE(peer_endorsement_count, 0) * 1.67 END)
    INTO v_verification_score
    FROM "User"
    WHERE id = p_user_id;
  ELSE
    SELECT 
      (CASE WHEN identity_verified THEN 20 ELSE 0 END) +
      (CASE WHEN "emailVerified" IS NOT NULL THEN 5 ELSE 0 END) +
      (CASE WHEN phone_verified THEN 5 ELSE 0 END)
    INTO v_verification_score
    FROM "User"
    WHERE id = p_user_id;
  END IF;
  
  -- Activity score (0-30 points)
  v_activity_score := LEAST(30, (v_account_age_days / 365.0 * 10));
  
  -- Add post activity
  SELECT LEAST(20, COUNT(*) * 0.5)
  INTO v_activity_score
  FROM "Post"
  WHERE "authorId" = p_user_id;
  
  v_activity_score := v_activity_score + LEAST(30, (v_account_age_days / 365.0 * 10));
  v_activity_score := LEAST(30, v_activity_score);
  
  -- Reputation score (0-30 points)
  IF p_user_type = 'doctor' THEN
    SELECT COALESCE(LEAST(30, overall_rating * 6), 0)
    INTO v_reputation_score
    FROM "User"
    WHERE id = p_user_id;
  ELSE
    SELECT COALESCE(LEAST(30, COUNT(*) * 3), 0)
    INTO v_reputation_score
    FROM "DoctorReview"
    WHERE patient_id = p_user_id AND is_verified = true;
  END IF;
  
  -- Compliance score (0-10 points, deductions for violations)
  SELECT COALESCE(100 - (content_violations * 10), 100)
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
