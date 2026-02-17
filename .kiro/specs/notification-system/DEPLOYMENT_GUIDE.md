# Notification System - Deployment Guide

## Pre-Deployment Checklist

### Backend Requirements
- [ ] Database migrations applied (Notification, NotificationPreferences, EmailQueue tables)
- [ ] Environment variables configured
- [ ] Socket.io server configured and running
- [ ] Email service configured (SMTP credentials)
- [ ] Rate limiting configured
- [ ] JWT secret configured

### Frontend Requirements
- [ ] NotificationProvider added to app layout
- [ ] Socket.io client configured with correct API URL
- [ ] Service worker registered
- [ ] Environment variables configured (NEXT_PUBLIC_API_URL)

### Optional (for full functionality)
- [ ] VAPID keys generated for push notifications
- [ ] Redis configured for caching (currently using in-memory)
- [ ] Monitoring/logging service configured
- [ ] Email templates designed and implemented

## Environment Variables

### Backend (.env)
```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/medthread"

# JWT
JWT_SECRET="your-secret-key"

# Email Service
SMTP_HOST="smtp.example.com"
SMTP_PORT=587
SMTP_USER="your-email@example.com"
SMTP_PASSWORD="your-password"
SMTP_FROM="MedThread <noreply@medthread.com>"

# Socket.io (optional, defaults to same server)
SOCKET_PORT=3001

# Push Notifications (optional)
VAPID_PUBLIC_KEY="your-vapid-public-key"
VAPID_PRIVATE_KEY="your-vapid-private-key"
VAPID_SUBJECT="mailto:admin@medthread.com"

# Redis (optional, for production caching)
REDIS_URL="redis://localhost:6379"
```

### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL="http://localhost:3001"
# or for production:
# NEXT_PUBLIC_API_URL="https://api.medthread.com"
```

## Database Migration

Run the Prisma migration to create notification tables:

```bash
cd packages/database
npx prisma migrate deploy
```

Or if in development:

```bash
npx prisma migrate dev
```

## Deployment Steps

### Staging Deployment

1. **Deploy Backend**
   ```bash
   cd apps/api
   npm run build
   npm run start
   ```

2. **Deploy Frontend**
   ```bash
   cd apps/web
   npm run build
   npm run start
   ```

3. **Verify Functionality**
   - [ ] User can see notification bell in navbar
   - [ ] Notifications appear in real-time
   - [ ] Notification center page loads
   - [ ] Preferences page loads and saves
   - [ ] Email notifications sent (check spam folder)
   - [ ] Socket connection established
   - [ ] Unread count updates correctly

4. **Test Notification Types**
   - [ ] REPLY notifications
   - [ ] MENTION notifications
   - [ ] AWARD notifications
   - [ ] FOLLOWER notifications
   - [ ] APPOINTMENT_REQUEST notifications
   - [ ] APPOINTMENT_UPDATE notifications
   - [ ] VERIFICATION_STATUS notifications
   - [ ] COMMUNITY_INVITE notifications
   - [ ] DIRECT_MESSAGE notifications
   - [ ] SYSTEM_ANNOUNCEMENT notifications
   - [ ] UPVOTE_MILESTONE notifications

5. **Load Testing**
   ```bash
   # Example using Apache Bench
   ab -n 1000 -c 10 -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:3001/api/v1/notifications
   ```

### Production Deployment

1. **Pre-Deployment**
   - [ ] Backup database
   - [ ] Review all environment variables
   - [ ] Test in staging environment
   - [ ] Prepare rollback plan

2. **Deploy with Feature Flags (Recommended)**
   
   Enable notification types gradually:
   
   ```typescript
   // In notification service
   const ENABLED_NOTIFICATION_TYPES = [
     'SYSTEM_ANNOUNCEMENT', // Start with low-volume
     'VERIFICATION_STATUS',
     'APPOINTMENT_REQUEST',
     // Add more types gradually
   ];
   
   if (!ENABLED_NOTIFICATION_TYPES.includes(type)) {
     console.log(`Notification type ${type} not yet enabled`);
     return [];
   }
   ```

3. **Deployment Order**
   - Deploy backend first
   - Wait 5-10 minutes, monitor for errors
   - Deploy frontend
   - Monitor real-time metrics

4. **Gradual Rollout Schedule**
   - **Day 1**: Enable SYSTEM_ANNOUNCEMENT, VERIFICATION_STATUS
   - **Day 2**: Enable APPOINTMENT_REQUEST, APPOINTMENT_UPDATE
   - **Day 3**: Enable FOLLOWER, AWARD
   - **Day 4**: Enable REPLY, MENTION (high volume)
   - **Day 5**: Enable DIRECT_MESSAGE, COMMUNITY_INVITE
   - **Day 6**: Enable UPVOTE_MILESTONE
   - **Day 7**: Remove feature flags

5. **Post-Deployment Monitoring**
   - [ ] Monitor error rates
   - [ ] Check notification delivery latency
   - [ ] Monitor database query performance
   - [ ] Check socket connection count
   - [ ] Monitor email queue status
   - [ ] Review user feedback

## Rollback Procedure

If issues occur:

1. **Immediate Actions**
   - Disable notification creation via feature flag
   - Stop email queue processing
   - Disconnect socket server if causing issues

2. **Backend Rollback**
   ```bash
   # Revert to previous version
   git checkout <previous-commit>
   npm run build
   npm run start
   ```

3. **Frontend Rollback**
   ```bash
   # Revert to previous version
   git checkout <previous-commit>
   npm run build
   npm run start
   ```

4. **Database Rollback** (if needed)
   ```bash
   # Revert migration
   npx prisma migrate resolve --rolled-back <migration-name>
   ```

## Monitoring & Alerts

### Key Metrics to Monitor

1. **Notification Creation Rate**
   - Target: < 1000/second
   - Alert if: > 1500/second

2. **Delivery Latency**
   - Target: < 2 seconds for socket delivery
   - Alert if: > 5 seconds

3. **Email Queue Backlog**
   - Target: < 100 pending jobs
   - Alert if: > 1000 pending jobs

4. **Socket Connections**
   - Target: Support 10,000 concurrent
   - Alert if: Connection failures > 5%

5. **API Response Times**
   - Target: < 500ms for 95th percentile
   - Alert if: > 1000ms

6. **Error Rates**
   - Target: < 0.1% error rate
   - Alert if: > 1% error rate

### Logging

Key events to log:
- Notification creation (with type and recipient count)
- Email delivery attempts and failures
- Socket connection/disconnection events
- Preference updates
- Circuit breaker state changes
- Rate limit violations

## Troubleshooting

### Common Issues

1. **Notifications not appearing**
   - Check socket connection in browser console
   - Verify JWT token is valid
   - Check user preferences (may be disabled)
   - Verify notification was created in database

2. **Email not sending**
   - Check email queue status
   - Verify SMTP credentials
   - Check circuit breaker status
   - Review email service logs

3. **High latency**
   - Check database query performance
   - Review cache hit rates
   - Monitor socket server load
   - Check network latency

4. **Socket disconnections**
   - Verify Socket.io server is running
   - Check for CORS issues
   - Review authentication token expiration
   - Monitor server resource usage

## Performance Tuning

### Database Optimization
```sql
-- Verify indexes exist
SELECT * FROM pg_indexes WHERE tablename = 'notifications';

-- Analyze query performance
EXPLAIN ANALYZE 
SELECT * FROM notifications 
WHERE "recipientId" = 'user-id' 
  AND "isDeleted" = false 
ORDER BY "createdAt" DESC 
LIMIT 20;
```

### Caching Strategy
- Unread counts: 1-minute TTL
- Recent notifications: 30-second TTL
- User preferences: 5-minute TTL

### Rate Limiting
- GET endpoints: 100 requests/minute per user
- POST endpoints: 30 requests/minute per user
- DELETE endpoints: 20 requests/minute per user

## Support & Maintenance

### Regular Maintenance Tasks

**Daily**
- Review error logs
- Check email queue status
- Monitor notification delivery rates

**Weekly**
- Review performance metrics
- Analyze user feedback
- Check for failed email jobs
- Review circuit breaker trips

**Monthly**
- Archive old notifications (> 90 days)
- Review and optimize database queries
- Update documentation
- Review and adjust rate limits

### Contact Information

For deployment issues:
- Backend: [Backend Team]
- Frontend: [Frontend Team]
- Database: [Database Team]
- DevOps: [DevOps Team]

## Conclusion

Follow this guide carefully to ensure a smooth deployment. Start with staging, test thoroughly, and roll out gradually in production. Monitor closely and be prepared to rollback if issues arise.
