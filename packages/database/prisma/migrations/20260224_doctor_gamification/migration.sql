-- Doctor Gamification Migration
-- Badges, achievements, and leaderboards to motivate doctors

-- Create Badge table for defining available badges
CREATE TABLE IF NOT EXISTS "Badge" (
  id SERIAL PRIMARY KEY,
  badge_key VARCHAR(100) UNIQUE NOT NULL, -- 'quick_responder', 'community_hero', etc.
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50) NOT NULL, -- 'engagement', 'quality', 'milestone', 'special'
  
  -- Badge appearance
  icon VARCHAR(255),
  color VARCHAR(50),
  badge_image_url VARCHAR(500),
  
  -- Requirements
  requirement_type VARCHAR(50) NOT NULL, -- 'response_time', 'helpful_count', 'rating', 'specialty_rank'
  requirement_value DECIMAL(10, 2) NOT NULL,
  requirement_operator VARCHAR(20) DEFAULT '>=', -- '>=', '<=', '=', '>'
  
  -- Rarity and points
  rarity VARCHAR(50) DEFAULT 'common', -- 'common', 'rare', 'epic', 'legendary'
  points INTEGER DEFAULT 10,
  
  -- Display
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_secret BOOLEAN DEFAULT false, -- Hidden until earned
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for badge lookups
CREATE INDEX IF NOT EXISTS idx_badge_key ON "Badge"(badge_key);
CREATE INDEX IF NOT EXISTS idx_badge_category ON "Badge"(category);
CREATE INDEX IF NOT EXISTS idx_badge_active ON "Badge"(is_active);

-- Create DoctorBadge table for earned badges
CREATE TABLE IF NOT EXISTS "DoctorBadge" (
  id SERIAL PRIMARY KEY,
  doctor_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  badge_id INTEGER NOT NULL REFERENCES "Badge"(id) ON DELETE CASCADE,
  
  -- Earning details
  earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  earned_value DECIMAL(10, 2), -- The value that earned the badge
  
  -- Display
  is_displayed BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  
  -- Notification
  notification_sent BOOLEAN DEFAULT false,
  notification_sent_at TIMESTAMP,
  
  UNIQUE(doctor_id, badge_id)
);

-- Create indexes for doctor badge lookups
CREATE INDEX IF NOT EXISTS idx_doctor_badge_doctor ON "DoctorBadge"(doctor_id);
CREATE INDEX IF NOT EXISTS idx_doctor_badge_badge ON "DoctorBadge"(badge_id);
CREATE INDEX IF NOT EXISTS idx_doctor_badge_earned ON "DoctorBadge"(earned_at DESC);

-- Create Achievement table for tracking progress
CREATE TABLE IF NOT EXISTS "Achievement" (
  id SERIAL PRIMARY KEY,
  achievement_key VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50) NOT NULL,
  
  -- Tiers (bronze, silver, gold, platinum)
  has_tiers BOOLEAN DEFAULT false,
  tier_requirements JSONB, -- [{tier: 'bronze', value: 10}, {tier: 'silver', value: 50}]
  
  -- Requirements
  requirement_type VARCHAR(50) NOT NULL,
  requirement_metric VARCHAR(100) NOT NULL, -- 'total_replies', 'helpful_votes', etc.
  
  -- Rewards
  points_per_tier JSONB, -- {bronze: 10, silver: 25, gold: 50, platinum: 100}
  badge_id INTEGER REFERENCES "Badge"(id) ON DELETE SET NULL,
  
  -- Display
  icon VARCHAR(255),
  color VARCHAR(50),
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for achievement lookups
CREATE INDEX IF NOT EXISTS idx_achievement_key ON "Achievement"(achievement_key);
CREATE INDEX IF NOT EXISTS idx_achievement_category ON "Achievement"(category);
CREATE INDEX IF NOT EXISTS idx_achievement_active ON "Achievement"(is_active);

-- Create DoctorAchievement table for tracking doctor progress
CREATE TABLE IF NOT EXISTS "DoctorAchievement" (
  id SERIAL PRIMARY KEY,
  doctor_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  achievement_id INTEGER NOT NULL REFERENCES "Achievement"(id) ON DELETE CASCADE,
  
  -- Progress
  current_value DECIMAL(10, 2) DEFAULT 0,
  current_tier VARCHAR(50), -- 'bronze', 'silver', 'gold', 'platinum'
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP,
  
  -- Points earned
  total_points_earned INTEGER DEFAULT 0,
  
  -- Last update
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(doctor_id, achievement_id)
);

-- Create indexes for doctor achievement lookups
CREATE INDEX IF NOT EXISTS idx_doctor_achievement_doctor ON "DoctorAchievement"(doctor_id);
CREATE INDEX IF NOT EXISTS idx_doctor_achievement_achievement ON "DoctorAchievement"(achievement_id);
CREATE INDEX IF NOT EXISTS idx_doctor_achievement_completed ON "DoctorAchievement"(is_completed);

-- Create Leaderboard table for different leaderboard types
CREATE TABLE IF NOT EXISTS "Leaderboard" (
  id SERIAL PRIMARY KEY,
  leaderboard_key VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Leaderboard type
  leaderboard_type VARCHAR(50) NOT NULL, -- 'weekly', 'monthly', 'all_time', 'specialty'
  metric_type VARCHAR(100) NOT NULL, -- 'total_points', 'helpful_answers', 'rating_improvement', 'patient_satisfaction'
  
  -- Time period
  period_start DATE,
  period_end DATE,
  
  -- Specialty filter
  specialty VARCHAR(255),
  
  -- Display
  icon VARCHAR(255),
  color VARCHAR(50),
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for leaderboard lookups
CREATE INDEX IF NOT EXISTS idx_leaderboard_key ON "Leaderboard"(leaderboard_key);
CREATE INDEX IF NOT EXISTS idx_leaderboard_type ON "Leaderboard"(leaderboard_type);
CREATE INDEX IF NOT EXISTS idx_leaderboard_period ON "Leaderboard"(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_leaderboard_active ON "Leaderboard"(is_active);

-- Create LeaderboardEntry table for leaderboard rankings
CREATE TABLE IF NOT EXISTS "LeaderboardEntry" (
  id SERIAL PRIMARY KEY,
  leaderboard_id INTEGER NOT NULL REFERENCES "Leaderboard"(id) ON DELETE CASCADE,
  doctor_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  
  -- Ranking
  rank_position INTEGER NOT NULL,
  metric_value DECIMAL(10, 2) NOT NULL,
  
  -- Previous rank (for showing improvement)
  previous_rank INTEGER,
  rank_change INTEGER, -- Positive = moved up, Negative = moved down
  
  -- Metadata
  calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(leaderboard_id, doctor_id)
);

-- Create indexes for leaderboard entry lookups
CREATE INDEX IF NOT EXISTS idx_leaderboard_entry_leaderboard ON "LeaderboardEntry"(leaderboard_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_entry_doctor ON "LeaderboardEntry"(doctor_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_entry_rank ON "LeaderboardEntry"(leaderboard_id, rank_position);

-- Create DoctorPoints table for tracking gamification points
CREATE TABLE IF NOT EXISTS "DoctorPoints" (
  id SERIAL PRIMARY KEY,
  doctor_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  
  -- Points breakdown
  total_points INTEGER DEFAULT 0,
  badge_points INTEGER DEFAULT 0,
  achievement_points INTEGER DEFAULT 0,
  activity_points INTEGER DEFAULT 0,
  
  -- Level system
  current_level INTEGER DEFAULT 1,
  points_to_next_level INTEGER DEFAULT 100,
  
  -- Streaks
  current_streak_days INTEGER DEFAULT 0,
  longest_streak_days INTEGER DEFAULT 0,
  last_activity_date DATE,
  
  -- Rankings
  global_rank INTEGER,
  specialty_rank INTEGER,
  
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(doctor_id)
);

-- Create indexes for doctor points lookups
CREATE INDEX IF NOT EXISTS idx_doctor_points_doctor ON "DoctorPoints"(doctor_id);
CREATE INDEX IF NOT EXISTS idx_doctor_points_total ON "DoctorPoints"(total_points DESC);
CREATE INDEX IF NOT EXISTS idx_doctor_points_level ON "DoctorPoints"(current_level DESC);

-- Create PointsTransaction table for tracking point history
CREATE TABLE IF NOT EXISTS "PointsTransaction" (
  id SERIAL PRIMARY KEY,
  doctor_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  
  -- Transaction details
  transaction_type VARCHAR(50) NOT NULL, -- 'badge_earned', 'achievement', 'reply', 'helpful_vote', 'rating'
  points_change INTEGER NOT NULL,
  
  -- Reference
  reference_type VARCHAR(50), -- 'badge', 'achievement', 'comment', 'review'
  reference_id VARCHAR(255),
  
  -- Description
  description TEXT,
  
  -- Balance after transaction
  balance_after INTEGER NOT NULL,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for points transaction lookups
CREATE INDEX IF NOT EXISTS idx_points_transaction_doctor ON "PointsTransaction"(doctor_id);
CREATE INDEX IF NOT EXISTS idx_points_transaction_type ON "PointsTransaction"(transaction_type);
CREATE INDEX IF NOT EXISTS idx_points_transaction_date ON "PointsTransaction"(created_at DESC);

-- Add gamification fields to User table
ALTER TABLE "User"
ADD COLUMN IF NOT EXISTS total_gamification_points INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS gamification_level INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS badges_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS achievements_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS current_streak_days INTEGER DEFAULT 0;

-- Create indexes on gamification fields
CREATE INDEX IF NOT EXISTS idx_user_gamification_points ON "User"(total_gamification_points DESC);
CREATE INDEX IF NOT EXISTS idx_user_gamification_level ON "User"(gamification_level DESC);

-- Insert default badges
INSERT INTO "Badge" (badge_key, name, description, category, requirement_type, requirement_value, rarity, points, icon, color) VALUES
('quick_responder', 'Quick Responder', 'Replies within 1 hour consistently', 'engagement', 'avg_response_time', 60, 'rare', 50, '⚡', 'yellow'),
('community_hero', 'Community Hero', '100+ helpful answers', 'engagement', 'helpful_count', 100, 'epic', 100, '🦸', 'blue'),
('patient_favorite', 'Patient Favorite', '4.8+ average rating', 'quality', 'rating', 4.8, 'epic', 100, '⭐', 'gold'),
('specialist_expert', 'Specialist Expert', 'Top in specialty', 'quality', 'specialty_rank', 1, 'legendary', 200, '👑', 'purple'),
('rising_star', 'Rising Star', 'New doctor with high engagement', 'milestone', 'account_age_days', 90, 'rare', 50, '🌟', 'orange'),
('consistent_contributor', 'Consistent Contributor', '30-day activity streak', 'engagement', 'streak_days', 30, 'rare', 75, '🔥', 'red'),
('knowledge_sharer', 'Knowledge Sharer', '500+ total replies', 'milestone', 'total_replies', 500, 'epic', 150, '📚', 'green'),
('trusted_advisor', 'Trusted Advisor', '1000+ consultations completed', 'milestone', 'consultations', 1000, 'legendary', 250, '💎', 'cyan'),
('perfect_score', 'Perfect Score', '5.0 rating with 50+ reviews', 'quality', 'perfect_rating', 5.0, 'legendary', 300, '💯', 'gold'),
('early_adopter', 'Early Adopter', 'Joined in first 100 doctors', 'special', 'user_id_number', 100, 'rare', 100, '🎖️', 'silver')
ON CONFLICT (badge_key) DO NOTHING;

-- Insert default achievements
INSERT INTO "Achievement" (achievement_key, name, description, category, has_tiers, tier_requirements, requirement_type, requirement_metric, points_per_tier, icon, color) VALUES
('reply_master', 'Reply Master', 'Total replies milestone', 'engagement', true, 
  '[{"tier":"bronze","value":10},{"tier":"silver","value":50},{"tier":"gold","value":200},{"tier":"platinum","value":1000}]'::jsonb,
  'count', 'total_replies',
  '{"bronze":10,"silver":25,"gold":75,"platinum":200}'::jsonb,
  '💬', 'blue'),
('helpful_guru', 'Helpful Guru', 'Helpful votes received', 'engagement', true,
  '[{"tier":"bronze","value":25},{"tier":"silver","value":100},{"tier":"gold","value":500},{"tier":"platinum","value":2000}]'::jsonb,
  'count', 'helpful_votes',
  '{"bronze":15,"silver":40,"gold":100,"platinum":250}'::jsonb,
  '👍', 'green'),
('rating_champion', 'Rating Champion', 'Maintain high rating', 'quality', true,
  '[{"tier":"bronze","value":4.0},{"tier":"silver","value":4.5},{"tier":"gold","value":4.8},{"tier":"platinum","value":4.95}]'::jsonb,
  'rating', 'average_rating',
  '{"bronze":20,"silver":50,"gold":100,"platinum":200}'::jsonb,
  '⭐', 'yellow'),
('consultation_pro', 'Consultation Pro', 'Completed consultations', 'milestone', true,
  '[{"tier":"bronze","value":10},{"tier":"silver","value":50},{"tier":"gold","value":200},{"tier":"platinum","value":1000}]'::jsonb,
  'count', 'consultations_completed',
  '{"bronze":25,"silver":60,"gold":150,"platinum":400}'::jsonb,
  '🏥', 'purple')
ON CONFLICT (achievement_key) DO NOTHING;

-- Create function to check and award badges
CREATE OR REPLACE FUNCTION check_and_award_badges(p_doctor_id TEXT)
RETURNS void AS $$
DECLARE
  badge RECORD;
  current_value DECIMAL(10, 2);
  should_award BOOLEAN;
BEGIN
  -- Loop through all active badges
  FOR badge IN 
    SELECT * FROM "Badge" WHERE is_active = true
  LOOP
    -- Check if doctor already has this badge
    IF NOT EXISTS (
      SELECT 1 FROM "DoctorBadge" 
      WHERE doctor_id = p_doctor_id AND badge_id = badge.id
    ) THEN
      -- Get current value based on requirement type
      CASE badge.requirement_type
        WHEN 'avg_response_time' THEN
          SELECT COALESCE(response_time_minutes, 999999) INTO current_value
          FROM "DoctorRating" WHERE doctor_id = p_doctor_id;
        WHEN 'helpful_count' THEN
          SELECT COALESCE(helpful_replies_count, 0) INTO current_value
          FROM "DoctorRating" WHERE doctor_id = p_doctor_id;
        WHEN 'rating' THEN
          SELECT COALESCE(overall_rating, 0) INTO current_value
          FROM "DoctorRating" WHERE doctor_id = p_doctor_id;
        WHEN 'total_replies' THEN
          SELECT COALESCE(total_replies_count, 0) INTO current_value
          FROM "DoctorRating" WHERE doctor_id = p_doctor_id;
        WHEN 'consultations' THEN
          SELECT COUNT(*) INTO current_value
          FROM "Appointment" WHERE "doctorId" = p_doctor_id AND status = 'COMPLETED';
        WHEN 'streak_days' THEN
          SELECT COALESCE(current_streak_days, 0) INTO current_value
          FROM "DoctorPoints" WHERE doctor_id = p_doctor_id;
        ELSE
          current_value := 0;
      END CASE;
      
      -- Check if requirement is met
      should_award := CASE badge.requirement_operator
        WHEN '>=' THEN current_value >= badge.requirement_value
        WHEN '<=' THEN current_value <= badge.requirement_value
        WHEN '>' THEN current_value > badge.requirement_value
        WHEN '<' THEN current_value < badge.requirement_value
        WHEN '=' THEN current_value = badge.requirement_value
        ELSE false
      END;
      
      -- Award badge if requirement met
      IF should_award THEN
        INSERT INTO "DoctorBadge" (doctor_id, badge_id, earned_value)
        VALUES (p_doctor_id, badge.id, current_value);
        
        -- Add points
        INSERT INTO "PointsTransaction" (
          doctor_id, transaction_type, points_change, 
          reference_type, reference_id, description, balance_after
        )
        SELECT 
          p_doctor_id, 'badge_earned', badge.points,
          'badge', badge.id::TEXT, 'Earned badge: ' || badge.name,
          COALESCE((SELECT total_points FROM "DoctorPoints" WHERE doctor_id = p_doctor_id), 0) + badge.points;
        
        -- Update doctor points
        INSERT INTO "DoctorPoints" (doctor_id, total_points, badge_points)
        VALUES (p_doctor_id, badge.points, badge.points)
        ON CONFLICT (doctor_id) DO UPDATE
        SET total_points = "DoctorPoints".total_points + badge.points,
            badge_points = "DoctorPoints".badge_points + badge.points,
            updated_at = CURRENT_TIMESTAMP;
      END IF;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create function to update leaderboards
CREATE OR REPLACE FUNCTION update_leaderboards()
RETURNS void AS $$
BEGIN
  -- Weekly top doctors (by points earned this week)
  DELETE FROM "LeaderboardEntry" WHERE leaderboard_id = (
    SELECT id FROM "Leaderboard" WHERE leaderboard_key = 'weekly_top_doctors'
  );
  
  INSERT INTO "LeaderboardEntry" (leaderboard_id, doctor_id, rank_position, metric_value)
  SELECT 
    (SELECT id FROM "Leaderboard" WHERE leaderboard_key = 'weekly_top_doctors'),
    doctor_id,
    ROW_NUMBER() OVER (ORDER BY SUM(points_change) DESC),
    SUM(points_change)
  FROM "PointsTransaction"
  WHERE created_at >= DATE_TRUNC('week', CURRENT_DATE)
  GROUP BY doctor_id
  ORDER BY SUM(points_change) DESC
  LIMIT 100;
  
  -- Most improved rating (this month)
  DELETE FROM "LeaderboardEntry" WHERE leaderboard_id = (
    SELECT id FROM "Leaderboard" WHERE leaderboard_key = 'most_improved_rating'
  );
  
  -- Highest patient satisfaction
  DELETE FROM "LeaderboardEntry" WHERE leaderboard_id = (
    SELECT id FROM "Leaderboard" WHERE leaderboard_key = 'highest_satisfaction'
  );
  
  INSERT INTO "LeaderboardEntry" (leaderboard_id, doctor_id, rank_position, metric_value)
  SELECT 
    (SELECT id FROM "Leaderboard" WHERE leaderboard_key = 'highest_satisfaction'),
    doctor_id,
    ROW_NUMBER() OVER (ORDER BY patient_satisfaction_score DESC),
    patient_satisfaction_score
  FROM "DoctorRating"
  WHERE total_reviews >= 10
  ORDER BY patient_satisfaction_score DESC
  LIMIT 100;
END;
$$ LANGUAGE plpgsql;

-- Insert default leaderboards
INSERT INTO "Leaderboard" (leaderboard_key, name, description, leaderboard_type, metric_type, icon, color) VALUES
('weekly_top_doctors', 'Weekly Top Doctors', 'Doctors with most points this week', 'weekly', 'total_points', '🏆', 'gold'),
('most_improved_rating', 'Most Improved Rating', 'Biggest rating improvement this month', 'monthly', 'rating_improvement', '📈', 'green'),
('highest_satisfaction', 'Highest Patient Satisfaction', 'Doctors with highest satisfaction scores', 'all_time', 'patient_satisfaction', '😊', 'blue')
ON CONFLICT (leaderboard_key) DO NOTHING;
