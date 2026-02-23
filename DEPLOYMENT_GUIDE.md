# Production Deployment Guide - Person 3 Features

**Status:** ✅ Ready for Production  
**Date:** February 18, 2026

---

## 🚀 Quick Start

This guide covers deploying all User Experience & Social features to production.

---

## ✅ Pre-Deployment Checklist

### 1. Install Dependencies

```bash
# Install sharp for PWA icon generation
cd apps/web
npm install sharp

# Verify all dependencies
cd ../..
npm install
```

### 2. Generate PWA Icons

```bash
cd apps/web

# Generate icons from your logo
node scripts/generate-pwa-icons.js public/medthread-logo-1.jpeg

# Verify icons were created
ls public/icons/
# Should see: icon-72x72.png, icon-96x96.png, etc.
```

### 3. Environment Variables

Verify these are set in your production environment:

```env
# API
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
DATABASE_URL=postgresql://...
REDIS_URL=redis://...

# Email
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your_sendgrid_api_key
EMAIL_FROM=noreply@yourdomain.com

# Push Notifications
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key

# JWT
JWT_SECRET=your_jwt_secret

# 2FA
TOTP_ISSUER=MedThread
```

### 4. Build & Test Locally

```bash
# Build API
cd apps/api
npm run build
npm run start

# Build Web (in another terminal)
cd apps/web
npm run build
npm run start

# Test the build
# Visit http://localhost:3000
# Test all new pages:
# - /badges
# - /settings/blocked
# - /u/[username]/followers
# - /u/[username]/following
# - /patients/profile
```

### 5. Run Tests

```bash
# Run API tests
cd apps/api
npm test

# Check for TypeScript errors
npm run type-check

# Run linter
npm run lint
```

### 6. Run Lighthouse Audit

```bash
# Install Lighthouse CLI
npm install -g lighthouse

# Run audit
lighthouse http://localhost:3000 --view

# Target scores:
# - Performance: 90+
# - Accessibility: 95+
# - Best Practices: 95+
# - SEO: 90+
# - PWA: 100
```

---

## 📦 Deployment Steps

### Option 1: Vercel (Recommended for Web)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy web app
cd apps/web
vercel --prod

# Set environment variables in Vercel dashboard
# https://vercel.com/[your-project]/settings/environment-variables
```

### Option 2: Docker

```bash
# Build Docker images
docker-compose build

# Run containers
docker-compose up -d

# Check logs
docker-compose logs -f
```

### Option 3: Traditional Server

```bash
# Build both apps
npm run build

# Start API (with PM2)
cd apps/api
pm2 start dist/index.js --name medthread-api

# Start Web (with PM2)
cd apps/web
pm2 start npm --name medthread-web -- start

# Save PM2 configuration
pm2 save
pm2 startup
```

---

## 🔧 Post-Deployment Configuration

### 1. Add Navigation Links

Update your navigation components to include new pages:

**Sidebar Component:**
```tsx
<Link href="/badges">
  <Trophy className="w-5 h-5" />
  <span>Badges</span>
</Link>
```

**Settings Menu:**
```tsx
<Link href="/settings/blocked">
  <Ban className="w-4 h-4" />
  <span>Blocked Users</span>
</Link>
```

**User Profile:**
```tsx
<Link href={`/u/${username}/followers`}>
  {followerCount} Followers
</Link>
<Link href={`/u/${username}/following`}>
  {followingCount} Following
</Link>
```

### 2. Configure Admin Users

Set admin role for specific users in database:

```sql
UPDATE "User" 
SET role = 'ADMIN' 
WHERE email = 'admin@yourdomain.com';
```

### 3. Test PWA Installation

1. Visit your site on mobile
2. Look for "Add to Home Screen" prompt
3. Install the app
4. Test offline functionality
5. Test push notifications

---

## 🧪 Post-Deployment Testing

### Critical Paths to Test

#### 1. Blocked Users Management
```
1. Login as user
2. Go to /settings/blocked
3. Verify blocked users list loads
4. Unblock a user
5. Verify user is removed from list
```

#### 2. Badge System
```
1. Login as user
2. Go to /badges
3. Verify all badges display
4. Test category filter
5. Test rarity filter
6. Verify earned badges show correctly
```

#### 3. Followers/Following
```
1. Visit /u/[username]/followers
2. Verify followers list loads
3. Test pagination
4. Visit /u/[username]/following
5. Verify following list loads
6. Test pagination
```

#### 4. Patient Profile
```
1. Login as patient (non-doctor)
2. Go to /profile
3. Verify redirect to /patients/profile
4. Verify statistics display
5. Test quick action links
```

#### 5. Admin Queue Management
```
1. Login as admin
2. Go to /api/notifications/queue/stats
3. Verify stats display
4. Test retry failed jobs
5. Test circuit breaker reset
```

---

## 📊 Monitoring Setup

### 1. Error Tracking

**Sentry Setup:**
```bash
npm install @sentry/nextjs @sentry/node

# Configure in apps/web/sentry.config.js
# Configure in apps/api/src/sentry.ts
```

### 2. Performance Monitoring

**Key Metrics to Monitor:**
- API response times
- Page load times
- Database query performance
- Redis connection pool
- Email queue processing
- WebSocket connections

### 3. Logging

**CloudWatch/DataDog:**
```javascript
// Log important events
logger.info('Badge awarded', { userId, badgeType });
logger.error('Failed to unblock user', { error, userId });
```

### 4. Alerts

**Set up alerts for:**
- API error rate > 1%
- Page load time > 3s
- Database connection failures
- Email queue failures
- WebSocket disconnections
- Admin actions (audit log)

---

## 🔒 Security Checklist

### Pre-Production
- [x] Admin middleware implemented
- [x] Rate limiting enabled
- [x] Input validation in place
- [x] SQL injection prevention (Prisma)
- [x] XSS prevention (sanitization)
- [x] CSRF protection
- [ ] SSL/HTTPS configured
- [ ] Security headers configured
- [ ] CORS properly configured
- [ ] API keys rotated

### Security Headers
```javascript
// Add to next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ]
      }
    ]
  }
}
```

---

## 🎯 Performance Optimization

### 1. Database Indexes

Ensure these indexes exist:
```sql
CREATE INDEX idx_user_badges_user_id ON "UserBadge"("userId");
CREATE INDEX idx_blocks_blocker_id ON "Block"("blockerId");
CREATE INDEX idx_follows_follower_id ON "Follow"("followerId");
CREATE INDEX idx_follows_following_id ON "Follow"("followingId");
```

### 2. Redis Caching

Cache frequently accessed data:
```typescript
// Cache badge definitions
redis.set('badges:all', JSON.stringify(badges), 'EX', 3600);

// Cache user stats
redis.set(`user:${userId}:stats`, JSON.stringify(stats), 'EX', 300);
```

### 3. CDN Configuration

Configure CDN for static assets:
- PWA icons
- Images
- Fonts
- JavaScript bundles
- CSS files

---

## 📱 Mobile Testing

### iOS Testing
1. Test on Safari iOS
2. Test PWA installation
3. Test offline mode
4. Test push notifications (browser only)
5. Test touch gestures
6. Test safe area insets

### Android Testing
1. Test on Chrome Android
2. Test PWA installation
3. Test offline mode
4. Test push notifications
5. Test touch gestures
6. Test back button behavior

---

## 🐛 Troubleshooting

### Issue: PWA Icons Not Showing
**Solution:**
```bash
# Regenerate icons
cd apps/web
node scripts/generate-pwa-icons.js public/medthread-logo-1.jpeg

# Clear browser cache
# Hard refresh (Ctrl+Shift+R)
```

### Issue: Admin Middleware Blocking All Users
**Solution:**
```sql
-- Verify admin role is set
SELECT id, email, role FROM "User" WHERE role = 'ADMIN';

-- Set admin role if missing
UPDATE "User" SET role = 'ADMIN' WHERE email = 'admin@example.com';
```

### Issue: Followers/Following Pages 404
**Solution:**
```bash
# Verify users route is registered
grep "usersRouter" apps/api/src/index.ts

# Restart API server
pm2 restart medthread-api
```

### Issue: Badge Stats Not Updating
**Solution:**
```bash
# Trigger badge evaluation
curl -X POST https://api.yourdomain.com/api/badges/evaluate \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Issue: Blocked Users List Empty
**Solution:**
```sql
-- Check if blocks exist
SELECT * FROM "Block" WHERE "blockerId" = 'USER_ID';

-- Verify API endpoint
curl https://api.yourdomain.com/api/block/list \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📈 Success Metrics

### Week 1 Targets
- [ ] 0 critical errors
- [ ] < 1% error rate
- [ ] < 2s average page load
- [ ] > 95% uptime
- [ ] 0 security incidents

### Month 1 Targets
- [ ] 100+ badges earned
- [ ] 50+ users using block feature
- [ ] 500+ followers/following relationships
- [ ] 1000+ page views on new pages
- [ ] > 90 Lighthouse scores

---

## 🔄 Rollback Plan

### If Issues Occur

**Quick Rollback:**
```bash
# Vercel
vercel rollback

# Docker
docker-compose down
docker-compose up -d --build [previous-tag]

# PM2
pm2 stop all
git checkout [previous-commit]
npm run build
pm2 restart all
```

**Database Rollback:**
```bash
# If migrations were run
npx prisma migrate resolve --rolled-back [migration-name]
```

---

## 📞 Support Contacts

### Critical Issues
- **On-Call Engineer:** [phone/slack]
- **DevOps Team:** [slack channel]
- **Database Admin:** [contact]

### Monitoring Dashboards
- **Application:** [dashboard URL]
- **Infrastructure:** [dashboard URL]
- **Logs:** [logs URL]

---

## ✅ Final Checklist

Before marking deployment as complete:

### Technical
- [ ] All services running
- [ ] Database migrations applied
- [ ] Redis connected
- [ ] Email queue processing
- [ ] WebSockets working
- [ ] PWA installable
- [ ] Push notifications working

### Testing
- [ ] All new pages accessible
- [ ] Pagination working
- [ ] Filters working
- [ ] Forms submitting
- [ ] Error handling working
- [ ] Mobile responsive
- [ ] PWA features working

### Monitoring
- [ ] Error tracking configured
- [ ] Performance monitoring active
- [ ] Alerts configured
- [ ] Logs aggregating
- [ ] Dashboards accessible

### Documentation
- [ ] Deployment documented
- [ ] Runbook updated
- [ ] Team notified
- [ ] Changelog updated

---

## 🎉 Deployment Complete!

Once all checklist items are complete, your deployment is successful!

**Next Steps:**
1. Monitor for 24 hours
2. Gather user feedback
3. Plan next iteration
4. Celebrate! 🎊

---

**Prepared By:** Senior Developer (Kiro AI)  
**Date:** February 18, 2026  
**Version:** 1.0.0  
**Status:** ✅ Production Ready
