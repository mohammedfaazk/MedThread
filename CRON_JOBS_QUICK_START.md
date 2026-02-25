# Cron Jobs - Quick Start Guide

## 🚀 What's New

A comprehensive automated task scheduling system with 16 scheduled jobs running automatically in the background.

## ⚡ Quick Access

### Admin Dashboard
**URL:** `http://localhost:3000/admin/cron-jobs`

**Requirements:** Admin user authentication

### API Endpoints
```bash
# List all jobs
GET /api/cron-jobs

# Trigger a job manually
POST /api/cron-jobs/:jobName/trigger

# View execution history
GET /api/cron-jobs/history
```

## 📋 Available Jobs (16 Total)

### Hourly
- **sendAppointmentReminders** - Appointment notifications

### Every 6 Hours
- **updateLeaderboards** - Refresh rankings

### Daily
- **autoAwardCmeCredits** (12 AM) - Award CME credits
- **updateDoctorAnalytics** (1 AM) - Update statistics
- **checkAllBadges** (2 AM) - Award badges
- **cleanupFailedEmails** (3 AM) - Clean email queue
- **cleanupOldSessions** (4 AM) - Remove old sessions
- **autoResolveOldReports** (5 AM) - Auto-resolve reports
- **checkSubscriptionRenewals** (6 AM) - Renewal reminders
- **sendDailyDigests** (8 AM) - Daily emails
- **checkExpiringLicenses** (9 AM) - License reminders

### Weekly
- **sendWeeklyDigests** (Mon 8 AM) - Weekly emails
- **archiveOldPosts** (Sun 2 AM) - Archive old content
- **cleanupOldNotifications** (Sun 3 AM) - Clean notifications
- **warnInactiveUsers** (Wed 10 AM) - Re-engagement

### Monthly
- **generateMonthlyReports** (1st, 7 AM) - Platform reports

## 🧪 Test It

```bash
cd apps/api
npx ts-node test-cron-jobs.ts
```

## 🎯 Common Tasks

### Manually Run a Job
1. Go to `/admin/cron-jobs`
2. Find the job you want to run
3. Click "Run Now"
4. View execution status

### Check Job Status
```sql
-- View recent executions
SELECT * FROM "RecentCronJobExecutions" LIMIT 10;

-- Get job statistics
SELECT * FROM get_cron_job_stats();

-- Check schedule
SELECT job_name, last_run_at, last_run_status, is_enabled 
FROM "CronJobSchedule";
```

### Enable/Disable a Job
```sql
-- Disable a job
UPDATE "CronJobSchedule" 
SET is_enabled = false 
WHERE job_name = 'jobName';

-- Enable a job
UPDATE "CronJobSchedule" 
SET is_enabled = true 
WHERE job_name = 'jobName';
```

## 📊 Monitoring

### Key Metrics
- Total jobs: 16
- Daily jobs: 9
- Hourly jobs: 1
- Weekly jobs: 4
- Monthly jobs: 1

### Check Health
```bash
# View logs
tail -f apps/api/logs/cron.log

# Check database
SELECT 
  job_name,
  total_runs,
  successful_runs,
  failed_runs,
  ROUND(successful_runs::DECIMAL / NULLIF(total_runs, 0) * 100, 2) as success_rate
FROM "CronJobSchedule"
ORDER BY total_runs DESC;
```

## 🔧 Troubleshooting

### Job Not Running?
1. Check if enabled: `SELECT is_enabled FROM "CronJobSchedule" WHERE job_name = 'jobName'`
2. Check server logs for errors
3. Verify cron service initialized: Look for `[CRON] All cron jobs initialized` in logs

### Job Failing?
1. Check error: `SELECT error_message FROM "CronJobExecution" WHERE job_name = 'jobName' AND status = 'failed' ORDER BY started_at DESC LIMIT 1`
2. Manually trigger to reproduce
3. Check database connectivity

## 📚 Full Documentation

See `CRON_JOBS_COMPLETE.md` for comprehensive documentation including:
- Detailed job descriptions
- Database schema
- API reference
- Adding new jobs
- Security considerations
- Future enhancements

## ✅ Status

- **Implementation:** ✅ Complete
- **Database:** ✅ Migrated
- **Routes:** ✅ Registered
- **Dashboard:** ✅ Available
- **TypeScript:** ✅ 0 errors (production)
- **Testing:** ✅ Test script ready

All jobs are running automatically. No manual intervention required!
