-- Cron Jobs Tracking Migration
-- Track execution history and status of scheduled jobs

-- Create CronJobExecution table for tracking job runs
CREATE TABLE IF NOT EXISTS "CronJobExecution" (
  id SERIAL PRIMARY KEY,
  job_name VARCHAR(100) NOT NULL,
  status VARCHAR(50) NOT NULL, -- 'running', 'completed', 'failed'
  
  -- Execution details
  started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  duration_ms INTEGER,
  
  -- Results
  records_processed INTEGER DEFAULT 0,
  records_failed INTEGER DEFAULT 0,
  error_message TEXT,
  error_stack TEXT,
  
  -- Metadata
  triggered_by VARCHAR(50) DEFAULT 'scheduler', -- 'scheduler', 'manual', 'api'
  triggered_by_user_id TEXT REFERENCES "User"(id) ON DELETE SET NULL,
  
  -- Output logs
  output_log TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for cron job execution lookups
CREATE INDEX IF NOT EXISTS idx_cron_job_execution_name ON "CronJobExecution"(job_name);
CREATE INDEX IF NOT EXISTS idx_cron_job_execution_status ON "CronJobExecution"(status);
CREATE INDEX IF NOT EXISTS idx_cron_job_execution_started ON "CronJobExecution"(started_at DESC);

-- Create CronJobSchedule table for managing job schedules
CREATE TABLE IF NOT EXISTS "CronJobSchedule" (
  id SERIAL PRIMARY KEY,
  job_name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  
  -- Schedule
  cron_expression VARCHAR(100) NOT NULL,
  timezone VARCHAR(50) DEFAULT 'UTC',
  
  -- Status
  is_enabled BOOLEAN DEFAULT true,
  is_running BOOLEAN DEFAULT false,
  
  -- Execution tracking
  last_run_at TIMESTAMP,
  last_run_status VARCHAR(50),
  last_run_duration_ms INTEGER,
  next_run_at TIMESTAMP,
  
  -- Statistics
  total_runs INTEGER DEFAULT 0,
  successful_runs INTEGER DEFAULT 0,
  failed_runs INTEGER DEFAULT 0,
  average_duration_ms INTEGER DEFAULT 0,
  
  -- Configuration
  max_retries INTEGER DEFAULT 3,
  retry_delay_minutes INTEGER DEFAULT 5,
  timeout_minutes INTEGER DEFAULT 30,
  
  -- Notifications
  notify_on_failure BOOLEAN DEFAULT true,
  notify_on_success BOOLEAN DEFAULT false,
  notification_emails TEXT[], -- Array of email addresses
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for cron job schedule lookups
CREATE INDEX IF NOT EXISTS idx_cron_job_schedule_name ON "CronJobSchedule"(job_name);
CREATE INDEX IF NOT EXISTS idx_cron_job_schedule_enabled ON "CronJobSchedule"(is_enabled);
CREATE INDEX IF NOT EXISTS idx_cron_job_schedule_next_run ON "CronJobSchedule"(next_run_at);

-- Insert default cron job schedules
INSERT INTO "CronJobSchedule" (job_name, description, cron_expression, is_enabled) VALUES
('checkExpiringLicenses', 'Check for expiring medical licenses and send reminders', '0 9 * * *', true),
('sendAppointmentReminders', 'Send appointment reminders to patients and doctors', '0 * * * *', true),
('autoAwardCmeCredits', 'Auto-award CME credits for quality replies', '0 0 * * *', true),
('sendDailyDigests', 'Send daily digest emails to users', '0 8 * * *', true),
('sendWeeklyDigests', 'Send weekly digest emails to users', '0 8 * * 1', true),
('updateLeaderboards', 'Update all leaderboards with latest rankings', '0 */6 * * *', true),
('checkAllBadges', 'Check and award badges for all active doctors', '0 2 * * *', true),
('cleanupOldNotifications', 'Delete old read notifications (6+ months)', '0 3 * * 0', true),
('cleanupOldSessions', 'Delete old user sessions (30+ days)', '0 4 * * *', true),
('archiveOldPosts', 'Archive old posts with low engagement', '0 2 * * 0', true),
('checkSubscriptionRenewals', 'Check for expiring subscriptions and send reminders', '0 6 * * *', true),
('autoResolveOldReports', 'Auto-resolve reports older than 30 days', '0 5 * * *', true),
('cleanupFailedEmails', 'Clean up failed email queue entries', '0 3 * * *', true),
('updateDoctorAnalytics', 'Update doctor analytics and statistics', '0 1 * * *', true),
('warnInactiveUsers', 'Send reminders to inactive users', '0 10 * * 3', true),
('generateMonthlyReports', 'Generate monthly platform reports', '0 7 1 * *', true)
ON CONFLICT (job_name) DO NOTHING;

-- Create function to log cron job execution
CREATE OR REPLACE FUNCTION log_cron_job_execution(
  p_job_name VARCHAR,
  p_status VARCHAR,
  p_duration_ms INTEGER DEFAULT NULL,
  p_records_processed INTEGER DEFAULT 0,
  p_records_failed INTEGER DEFAULT 0,
  p_error_message TEXT DEFAULT NULL,
  p_triggered_by VARCHAR DEFAULT 'scheduler',
  p_triggered_by_user_id TEXT DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
  v_execution_id INTEGER;
BEGIN
  -- Insert execution record
  INSERT INTO "CronJobExecution" (
    job_name, status, duration_ms, records_processed, records_failed,
    error_message, triggered_by, triggered_by_user_id, completed_at
  ) VALUES (
    p_job_name, p_status, p_duration_ms, p_records_processed, p_records_failed,
    p_error_message, p_triggered_by, p_triggered_by_user_id,
    CASE WHEN p_status IN ('completed', 'failed') THEN CURRENT_TIMESTAMP ELSE NULL END
  )
  RETURNING id INTO v_execution_id;
  
  -- Update schedule statistics
  UPDATE "CronJobSchedule"
  SET last_run_at = CURRENT_TIMESTAMP,
      last_run_status = p_status,
      last_run_duration_ms = p_duration_ms,
      total_runs = total_runs + 1,
      successful_runs = CASE WHEN p_status = 'completed' THEN successful_runs + 1 ELSE successful_runs END,
      failed_runs = CASE WHEN p_status = 'failed' THEN failed_runs + 1 ELSE failed_runs END,
      average_duration_ms = CASE 
        WHEN p_duration_ms IS NOT NULL THEN 
          ((average_duration_ms * total_runs) + p_duration_ms) / (total_runs + 1)
        ELSE average_duration_ms
      END,
      updated_at = CURRENT_TIMESTAMP
  WHERE job_name = p_job_name;
  
  RETURN v_execution_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to get cron job statistics
CREATE OR REPLACE FUNCTION get_cron_job_stats(p_job_name VARCHAR DEFAULT NULL)
RETURNS TABLE (
  job_name VARCHAR,
  total_runs BIGINT,
  successful_runs BIGINT,
  failed_runs BIGINT,
  success_rate DECIMAL,
  avg_duration_ms DECIMAL,
  last_run_at TIMESTAMP,
  last_run_status VARCHAR
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.job_name,
    s.total_runs::BIGINT,
    s.successful_runs::BIGINT,
    s.failed_runs::BIGINT,
    CASE 
      WHEN s.total_runs > 0 THEN (s.successful_runs::DECIMAL / s.total_runs::DECIMAL * 100)
      ELSE 0
    END as success_rate,
    s.average_duration_ms::DECIMAL,
    s.last_run_at,
    s.last_run_status
  FROM "CronJobSchedule" s
  WHERE p_job_name IS NULL OR s.job_name = p_job_name
  ORDER BY s.job_name;
END;
$$ LANGUAGE plpgsql;

-- Create view for recent cron job executions
CREATE OR REPLACE VIEW "RecentCronJobExecutions" AS
SELECT 
  e.id,
  e.job_name,
  e.status,
  e.started_at,
  e.completed_at,
  e.duration_ms,
  e.records_processed,
  e.records_failed,
  e.error_message,
  e.triggered_by,
  u.username as triggered_by_username,
  s.description as job_description
FROM "CronJobExecution" e
LEFT JOIN "User" u ON e.triggered_by_user_id = u.id
LEFT JOIN "CronJobSchedule" s ON e.job_name = s.job_name
ORDER BY e.started_at DESC
LIMIT 100;

-- Create trigger to update CronJobSchedule updated_at
CREATE OR REPLACE FUNCTION update_cron_job_schedule_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_cron_job_schedule_timestamp
BEFORE UPDATE ON "CronJobSchedule"
FOR EACH ROW
EXECUTE FUNCTION update_cron_job_schedule_timestamp();
