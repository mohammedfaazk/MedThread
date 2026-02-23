# Email Queue and Job Processing

This document describes the email queue and job processing system for the MedThread notification system.

## Overview

The email queue system provides reliable, asynchronous email delivery with the following features:

- **Instant Email Delivery**: Sends notification emails immediately when notifications are created
- **Digest Email Delivery**: Aggregates notifications and sends daily/weekly digest emails
- **Retry Logic**: Automatically retries failed emails with exponential backoff (max 3 attempts)
- **Circuit Breaker**: Protects the system from cascading failures when the email service is down
- **Status Tracking**: Tracks email delivery status (pending, sent, failed) in the database
- **Queue Monitoring**: Provides API endpoints to monitor queue statistics and health

## Architecture

### Components

1. **EmailQueueService** (`email-queue.service.ts`)
   - Manages the email queue and job processing
   - Implements retry logic with exponential backoff
   - Implements circuit breaker pattern
   - Processes pending jobs at regular intervals (default: 30 seconds)

2. **DigestEmailService** (`digest-email.service.ts`)
   - Sends daily and weekly digest emails
   - Aggregates notifications based on user preferences
   - Filters notifications by digest-enabled types

3. **CronJobsService** (`cron-jobs.service.ts`)
   - Schedules digest email jobs using node-cron
   - Daily digests: 8 AM every day
   - Weekly digests: 8 AM every Monday

### Database Schema

The `EmailQueue` model tracks email delivery jobs:

```prisma
model EmailQueue {
  id             String       @id @default(cuid())
  userId         String
  user           User         @relation(fields: [userId], references: [id])
  notificationId String
  notification   Notification @relation(fields: [notificationId], references: [id])
  type           String       // 'instant' | 'digest'
  status         String       @default("pending") // 'pending' | 'sent' | 'failed'
  attempts       Int          @default(0)
  lastAttemptAt  DateTime?
  sentAt         DateTime?
  error          String?
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt
}
```

## Features

### 1. Instant Email Delivery

When a notification is created, the system automatically enqueues an instant email if:
- The user has instant email enabled for that notification type
- The user hasn't blocked the actor
- The user is not in quiet hours

**Flow:**
1. Notification created → `NotificationService.createNotification()`
2. Email job enqueued → `EmailQueueService.enqueueInstantEmailBatch()`
3. Job processed by worker → `EmailQueueService.processQueue()`
4. Email sent → `EmailService.sendNotificationEmail()`
5. Status updated to 'sent' or 'failed'

### 2. Retry Logic with Exponential Backoff

Failed email jobs are automatically retried up to 3 times with exponential backoff:

- **Attempt 1**: Immediate
- **Attempt 2**: After 1 second
- **Attempt 3**: After 2 seconds
- **Attempt 4**: After 4 seconds (max attempts reached, marked as failed)

**Configuration:**
```typescript
private readonly MAX_ATTEMPTS = 3;
private readonly BASE_DELAY = 1000; // 1 second
```

### 3. Circuit Breaker

The circuit breaker protects the system from cascading failures when the email service is down.

**States:**
- **Closed**: Normal operation, all jobs processed
- **Open**: Email service is failing, jobs are skipped
- **Half-Open**: Testing if email service has recovered

**Configuration:**
```typescript
private readonly CIRCUIT_BREAKER_THRESHOLD = 5; // Open after 5 failures
private readonly CIRCUIT_BREAKER_TIMEOUT = 60000; // 1 minute
```

**Behavior:**
1. After 5 consecutive failures, circuit breaker opens
2. Jobs are skipped for 1 minute
3. After timeout, circuit breaker moves to half-open
4. Next successful job closes the circuit breaker
5. Next failed job reopens the circuit breaker

### 4. Digest Emails

Digest emails aggregate notifications and send them at scheduled intervals.

**Daily Digest:**
- Sent at 8 AM every day
- Includes notifications from the last 24 hours
- Only sent if user has digest-enabled notification types

**Weekly Digest:**
- Sent at 8 AM every Monday
- Includes notifications from the last 7 days
- Only sent if user has digest-enabled notification types

**Cron Schedule:**
```typescript
// Daily digest at 8 AM
cron.schedule('0 8 * * *', async () => {
  await cronJobsService.sendDailyDigests();
});

// Weekly digest on Monday at 8 AM
cron.schedule('0 8 * * 1', async () => {
  await cronJobsService.sendWeeklyDigests();
});
```

### 5. Email Delivery Status Tracking

All email jobs are tracked in the `EmailQueue` table with the following statuses:

- **pending**: Job is waiting to be processed
- **sent**: Email was successfully sent
- **failed**: Email failed after max retry attempts

**Tracking includes:**
- Number of attempts
- Last attempt timestamp
- Sent timestamp
- Error message (if failed)

## API Endpoints

### Get Queue Statistics

```
GET /api/notifications/queue/stats
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "queue": {
      "pending": 10,
      "sent": 1500,
      "failed": 5,
      "total": 1515
    },
    "circuitBreaker": {
      "failures": 0,
      "lastFailureTime": 0,
      "state": "closed"
    }
  }
}
```

### Retry Failed Jobs

```
POST /api/notifications/queue/retry-failed
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "count": 5
  },
  "message": "5 failed jobs reset for retry"
}
```

### Reset Circuit Breaker

```
POST /api/notifications/queue/reset-circuit-breaker
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Circuit breaker reset successfully"
}
```

## Usage

### Starting the Email Queue Worker

The email queue worker is automatically started when the server starts:

```typescript
// In apps/api/src/index.ts
emailQueueService.startProcessing();
```

**Configuration:**
```typescript
// Process queue every 30 seconds (default)
emailQueueService.startProcessing();

// Custom interval (e.g., every 10 seconds)
emailQueueService.startProcessing(10000);
```

### Stopping the Email Queue Worker

```typescript
emailQueueService.stopProcessing();
```

### Manual Email Enqueueing

```typescript
// Enqueue a single instant email
await emailQueueService.enqueueInstantEmail(notificationId, userId);

// Enqueue multiple instant emails
await emailQueueService.enqueueInstantEmailBatch(notifications);
```

### Manual Digest Email Sending

```typescript
// Send digest for a specific user (for testing)
await digestEmailService.sendDigestNow(userId, 'daily');
await digestEmailService.sendDigestNow(userId, 'weekly');

// Get digest preview
const preview = await digestEmailService.getDigestPreview(userId, 'daily');
console.log(`Will send: ${preview.willSend}`);
console.log(`Notification count: ${preview.notificationCount}`);
```

## Monitoring and Observability

### Logs

The system logs important events:

```
[EMAIL_QUEUE] Enqueued instant email for notification abc123
[EMAIL_QUEUE] Processing 10 jobs
[EMAIL_QUEUE] Successfully sent email for job xyz789
[EMAIL_QUEUE] Job abc123 will retry (1/3)
[EMAIL_QUEUE] Job def456 failed after 3 attempts
[EMAIL_QUEUE] Circuit breaker opening after 5 failures
[EMAIL_QUEUE] Circuit breaker moving to half-open state
[EMAIL_QUEUE] Circuit breaker closing after successful job
[DIGEST] Starting daily digest email job
[DIGEST] Sent 150 daily digest emails
```

### Metrics to Monitor

1. **Queue Size**: Number of pending jobs
2. **Failure Rate**: Percentage of failed jobs
3. **Circuit Breaker State**: Current state (closed/open/half-open)
4. **Processing Latency**: Time from job creation to completion
5. **Retry Rate**: Percentage of jobs requiring retries

### Alerts

Consider setting up alerts for:

- Queue size > 1000 (backlog building up)
- Failure rate > 5% (email service issues)
- Circuit breaker open for > 5 minutes (prolonged outage)
- No jobs processed in last 5 minutes (worker stopped)

## Testing

### Unit Tests

Test individual components:

```typescript
// Test retry logic
test('should retry failed jobs with exponential backoff', async () => {
  // Mock email service to fail
  // Verify retry attempts and delays
});

// Test circuit breaker
test('should open circuit breaker after threshold failures', async () => {
  // Simulate failures
  // Verify circuit breaker opens
});
```

### Integration Tests

Test the complete flow:

```typescript
// Test instant email delivery
test('should enqueue and send instant email', async () => {
  // Create notification
  // Verify email job created
  // Process queue
  // Verify email sent
});

// Test digest email
test('should send daily digest with aggregated notifications', async () => {
  // Create multiple notifications
  // Run digest job
  // Verify digest email sent
});
```

## Troubleshooting

### Queue Not Processing

**Symptoms:** Pending jobs not being processed

**Solutions:**
1. Check if worker is running: `emailQueueService.isProcessing`
2. Check circuit breaker state: `emailQueueService.getCircuitBreakerStatus()`
3. Check server logs for errors
4. Restart worker: `emailQueueService.stopProcessing()` then `emailQueueService.startProcessing()`

### High Failure Rate

**Symptoms:** Many jobs failing

**Solutions:**
1. Check email service configuration (SMTP, SendGrid, etc.)
2. Check email service credentials
3. Check email service rate limits
4. Review error messages in failed jobs
5. Reset circuit breaker if it's stuck open

### Circuit Breaker Stuck Open

**Symptoms:** Circuit breaker remains open even after email service recovers

**Solutions:**
1. Manually reset: `POST /api/notifications/queue/reset-circuit-breaker`
2. Or programmatically: `emailQueueService.resetCircuitBreaker()`

### Digest Emails Not Sending

**Symptoms:** Users not receiving digest emails

**Solutions:**
1. Check cron jobs are initialized: `cronJobsService.initializeCronJobs()`
2. Check user preferences: Verify `digestFrequency` is set
3. Check notification types: Verify user has digest-enabled types
4. Check time range: Verify notifications exist in the digest period
5. Check server timezone: Cron jobs run in server timezone

## Performance Considerations

### Queue Processing Rate

The default processing interval is 30 seconds, processing 10 jobs per batch. This gives a throughput of:

- **10 jobs / 30 seconds = 0.33 jobs/second**
- **~1,200 jobs/hour**
- **~28,800 jobs/day**

To increase throughput:

1. **Reduce interval**: `emailQueueService.startProcessing(10000)` (10 seconds)
2. **Increase batch size**: Modify `take: 10` in `processQueue()`
3. **Run multiple workers**: Deploy multiple instances with load balancing

### Database Performance

The `EmailQueue` table has indexes on:
- `[status, createdAt]`: For fetching pending jobs
- `[userId, type]`: For user-specific queries

Monitor query performance and add indexes as needed.

### Email Service Rate Limits

Be aware of email service rate limits:

- **SendGrid**: 100 emails/second (free tier)
- **AWS SES**: 14 emails/second (default)
- **SMTP**: Varies by provider

Adjust processing rate to stay within limits.

## Future Enhancements

1. **Priority Queue**: Process high-priority notifications first
2. **Dead Letter Queue**: Move permanently failed jobs to separate queue
3. **Batch Email Sending**: Send multiple emails in a single API call
4. **Email Templates**: Use template engine for better email formatting
5. **A/B Testing**: Test different email formats and send times
6. **Unsubscribe Management**: Track unsubscribe reasons and trends
7. **Email Analytics**: Track open rates, click rates, etc.
8. **Smart Scheduling**: Send emails at optimal times based on user behavior

## References

- [Requirements Document](/.kiro/specs/notification-system/requirements.md)
- [Design Document](/.kiro/specs/notification-system/design.md)
- [Tasks Document](/.kiro/specs/notification-system/tasks.md)
- [Email Service](./email.service.ts)
- [Notification Service](./notification.service.ts)
