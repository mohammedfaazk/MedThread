# Deployment Checklist: Area-Wise Doctor Replies

## 🚀 Pre-Deployment

### Database
- [ ] Backup production database
- [ ] Test migration on staging environment
- [ ] Run migration: `packages/database/prisma/migrations/20260224_area_wise_doctor_replies/migration.sql`
- [ ] Verify PostGIS extension is enabled
- [ ] Verify all tables created successfully
- [ ] Verify all indexes created (GIST, GIN, B-tree)
- [ ] Test spatial queries on staging
- [ ] Check database performance metrics

### Backend
- [ ] Code review completed
- [ ] All tests passing
- [ ] Environment variables configured:
  - [ ] `DATABASE_URL` (with PostGIS support)
  - [ ] `API_URL`
  - [ ] `CORS_ORIGIN`
- [ ] API endpoints registered in `apps/api/src/index.ts`
- [ ] Services imported correctly
- [ ] Middleware configured
- [ ] Rate limiting enabled
- [ ] Error handling tested
- [ ] Logging configured

### Frontend
- [ ] Code review completed
- [ ] Components built successfully
- [ ] Environment variables configured:
  - [ ] `NEXT_PUBLIC_API_URL`
- [ ] Geolocation permissions tested
- [ ] Mobile responsiveness verified
- [ ] Cross-browser testing done:
  - [ ] Chrome
  - [ ] Firefox
  - [ ] Safari
  - [ ] Edge
- [ ] Error states handled
- [ ] Loading states implemented

### Security
- [ ] Authentication tested
- [ ] Authorization tested (role-based)
- [ ] Input validation implemented
- [ ] SQL injection prevention verified
- [ ] XSS prevention verified
- [ ] CSRF protection enabled
- [ ] Rate limiting configured
- [ ] HTTPS enforced
- [ ] Privacy controls tested

### Performance
- [ ] Spatial indexes verified
- [ ] Distance caching tested
- [ ] Query performance acceptable (<2s)
- [ ] Pagination working
- [ ] Batch operations optimized
- [ ] Frontend bundle size acceptable
- [ ] API response times acceptable
- [ ] Database connection pooling configured

---

## 📦 Deployment Steps

### Step 1: Database Migration
```bash
# 1. Backup database
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# 2. Run migration
psql $DATABASE_URL -f packages/database/prisma/migrations/20260224_area_wise_doctor_replies/migration.sql

# 3. Verify tables
psql $DATABASE_URL -c "\dt"

# 4. Verify indexes
psql $DATABASE_URL -c "\di"

# 5. Test spatial query
psql $DATABASE_URL -c "SELECT PostGIS_Version();"
```

### Step 2: Backend Deployment
```bash
# 1. Build backend
cd apps/api
npm run build

# 2. Run tests
npm test

# 3. Deploy to server
# (Use your deployment method: Docker, PM2, etc.)

# 4. Verify API health
curl https://your-api.com/health

# 5. Test endpoints
curl https://your-api.com/api/posts/test/replies/doctors
```

### Step 3: Frontend Deployment
```bash
# 1. Build frontend
cd apps/web
npm run build

# 2. Test build locally
npm run start

# 3. Deploy to hosting
# (Use your deployment method: Vercel, Netlify, etc.)

# 4. Verify deployment
curl https://your-app.com

# 5. Test geolocation
# Open in browser and test location permission
```

### Step 4: Verification
```bash
# 1. Test API endpoints
curl -X GET "https://your-api.com/api/posts/POST_ID/replies/doctors?lat=28.6139&lng=77.2090"

# 2. Test clinic creation (with auth token)
curl -X POST "https://your-api.com/api/doctors/clinics" \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"clinicName":"Test Clinic","address":"123 Main St","city":"Mumbai","country":"India","latitude":19.0760,"longitude":72.8777}'

# 3. Test availability update
curl -X PUT "https://your-api.com/api/doctors/availability" \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"telemedicineAvailable":true,"inPersonAvailable":true}'
```

---

## ✅ Post-Deployment

### Immediate Checks (First Hour)
- [ ] API health endpoint responding
- [ ] Database connections stable
- [ ] No error spikes in logs
- [ ] Frontend loading correctly
- [ ] Geolocation working
- [ ] Distance calculations accurate
- [ ] Filters working
- [ ] "Get Directions" working
- [ ] Clinic management accessible
- [ ] No console errors

### First Day Monitoring
- [ ] Monitor API response times
- [ ] Check database query performance
- [ ] Monitor error rates
- [ ] Check geolocation success rate
- [ ] Monitor filter usage
- [ ] Check "Get Directions" clicks
- [ ] Monitor clinic creation rate
- [ ] Check user feedback

### First Week Tasks
- [ ] Analyze usage patterns
- [ ] Review performance metrics
- [ ] Check for any bugs reported
- [ ] Monitor database growth
- [ ] Review cache hit rates
- [ ] Analyze filter combinations
- [ ] Check mobile usage
- [ ] Gather user feedback

---

## 🔍 Monitoring Setup

### Metrics to Track
```
API Metrics:
- Request count per endpoint
- Response times (p50, p95, p99)
- Error rates
- Rate limit hits

Database Metrics:
- Query execution times
- Spatial query performance
- Cache hit rates
- Connection pool usage
- Table sizes

User Metrics:
- Location permission grant rate
- Filter usage patterns
- "Get Directions" clicks
- Clinic creation rate
- Average distance to selected doctors

Performance Metrics:
- Page load times
- API response times
- Distance calculation times
- Geolocation success rate
```

### Alerts to Configure
```
Critical:
- API error rate > 5%
- Database connection failures
- API response time > 5s
- PostGIS extension failure

Warning:
- API response time > 2s
- Cache hit rate < 70%
- Geolocation failure rate > 30%
- Database query time > 1s

Info:
- High traffic periods
- New clinic creations
- Filter usage patterns
```

---

## 🐛 Rollback Plan

### If Issues Occur

1. **Database Issues**
   ```bash
   # Restore from backup
   psql $DATABASE_URL < backup_YYYYMMDD.sql
   
   # Verify restoration
   psql $DATABASE_URL -c "SELECT COUNT(*) FROM \"DoctorClinic\";"
   ```

2. **API Issues**
   ```bash
   # Revert to previous version
   git revert HEAD
   npm run build
   # Redeploy
   ```

3. **Frontend Issues**
   ```bash
   # Revert to previous version
   git revert HEAD
   npm run build
   # Redeploy
   ```

4. **Partial Rollback**
   - Comment out route registration in `apps/api/src/index.ts`
   - Remove component imports in frontend
   - Keep database tables (for future deployment)

---

## 📊 Success Criteria

### Day 1
- [ ] Zero critical errors
- [ ] API response time < 2s
- [ ] At least 10 clinics added
- [ ] At least 50 location permissions granted
- [ ] No database performance issues

### Week 1
- [ ] 100+ clinics added
- [ ] 1000+ location permissions granted
- [ ] 500+ "Get Directions" clicks
- [ ] Average response time < 1.5s
- [ ] User satisfaction > 80%

### Month 1
- [ ] 500+ clinics added
- [ ] 10,000+ location permissions granted
- [ ] 5,000+ "Get Directions" clicks
- [ ] Conversion rate increase > 20%
- [ ] User engagement increase > 30%

---

## 📞 Support Plan

### On-Call Rotation
- [ ] Primary: Backend developer
- [ ] Secondary: Frontend developer
- [ ] Escalation: Tech lead

### Communication Channels
- [ ] Slack channel: #area-wise-replies
- [ ] Email: support@medthread.com
- [ ] Phone: Emergency hotline

### Documentation Links
- [ ] Implementation guide
- [ ] Usage guide
- [ ] API documentation
- [ ] Troubleshooting guide

---

## 🎉 Launch Announcement

### Internal Communication
- [ ] Notify all teams
- [ ] Share documentation
- [ ] Conduct training session
- [ ] Set up support channels

### External Communication
- [ ] Blog post announcement
- [ ] Email to users
- [ ] Social media posts
- [ ] In-app notification

### Marketing Materials
- [ ] Feature highlights
- [ ] Screenshots/GIFs
- [ ] Video demo
- [ ] User testimonials

---

## 📝 Post-Launch Tasks

### Week 1
- [ ] Gather user feedback
- [ ] Fix any critical bugs
- [ ] Optimize performance
- [ ] Update documentation

### Month 1
- [ ] Analyze usage data
- [ ] Plan improvements
- [ ] Conduct user surveys
- [ ] Review success metrics

### Quarter 1
- [ ] Implement Phase 2 features
- [ ] Scale infrastructure
- [ ] Optimize costs
- [ ] Plan next enhancements

---

## ✅ Sign-Off

### Deployment Team
- [ ] Backend Developer: _______________
- [ ] Frontend Developer: _______________
- [ ] Database Administrator: _______________
- [ ] DevOps Engineer: _______________
- [ ] QA Engineer: _______________
- [ ] Product Manager: _______________

### Deployment Date: _______________
### Deployment Time: _______________
### Deployed By: _______________

---

**Checklist Version:** 1.0.0  
**Last Updated:** February 24, 2026  
**Status:** Ready for Deployment ✅
