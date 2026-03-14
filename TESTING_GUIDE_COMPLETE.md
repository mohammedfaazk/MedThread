# 🧪 Complete Testing Guide for Healthcare Analytics Features

## 🚀 Quick Start Testing

### 1. Initial Setup & Validation
```bash
# Step 1: Validate setup
node scripts/validate-feature-setup.js

# Step 2: Create test scenario (users, posts, data)
node scripts/create-test-scenario.js

# Step 3: Quick health check
node scripts/quick-health-check.js

# Step 4: Run comprehensive tests
node scripts/test-new-features-comprehensive.js
```

### 2. Start Development Servers
```bash
# Terminal 1: API Server
cd apps/api && npm run dev

# Terminal 2: Web Server  
cd apps/web && npm run dev

# Terminal 3: Database (if using local)
# Ensure PostgreSQL is running
```

## 📋 Manual Testing Checklist

### ✅ Feature 1: Doctor Profile Graphs

#### Test Account
- **Login as:** `doctor@medthread.com` / `password123`
- **Profile URL:** `http://localhost:3000/u/dr_smith`

#### Test Cases
- [ ] **Patient Acquisition Graph**
  - Navigate to doctor profile
  - Verify line chart displays with months on X-axis
  - Check tooltip shows correct patient counts
  - Verify graph starts from doctor's registration date
  
- [ ] **Average Reply Time**
  - Check "Generally replies within X hours" text displays
  - Verify calculation seems reasonable (should be 1-4 hours for test data)
  - Test with doctor who has no conversations (should show "No reply data")
  
- [ ] **Daily Activity Graph**
  - Verify 24-hour bar chart (00:00 to 23:00)
  - Check peak activity hour is highlighted
  - Verify "Last active X hours ago" text
  - Test responsiveness on mobile device
### ✅ Feature 2: Post Priority Algorithm

#### Test Account
- **Login as:** `doctor@medthread.com` / `password123`
- **Feed URL:** `http://localhost:3000/doctor-feed`

#### Test Cases
- [ ] **Priority Detection**
  - Create new post with "chest pain" → Should get HIGH priority 🔴
  - Create new post with "persistent cough" → Should get MEDIUM priority 🟡
  - Create new post with "common cold" → Should get LOW priority 🟢
  - Verify priority badges display correctly
  
- [ ] **Doctor Feed Prioritization**
  - Access `/doctor-feed` (doctor login required)
  - Verify HIGH priority posts appear first
  - Test filter buttons: All/High/Medium/Low
  - Check priority statistics show correct counts
  - Test pagination with "Load More Posts"
  
- [ ] **Symptom Detection**
  - Check detected symptoms listed under posts
  - Verify symptoms match post content
  - Test posts with no medical keywords show empty symptoms

### ✅ Feature 3: Admin User Activity Graphs

#### Test Account
- **Login as:** `admin@medthread.com` / `password123`
- **Admin URL:** `http://localhost:3000/admin/analytics`

#### Test Cases
- [ ] **Admin Access Control**
  - Login as admin → Should access admin analytics
  - Login as patient → Should be blocked from admin features
  - Test API endpoints require admin role
  
- [ ] **User Activity Analysis**
  - Click "Activity Graph" button on any user
  - Verify modal opens with UserActivityGraphs component
  - Test hourly view (24-hour pattern)
  - Test weekly view toggle
  - Check activity breakdown by type (posts, comments, messages, votes)
  
- [ ] **Activity Metrics**
  - Verify total activity count matches sum of individual activities
  - Check peak activity time identification
  - Test "Last 30 days" data range
  - Verify user comparison functionality

### ✅ Feature 4: Regional Symptom Analytics

#### Test URL
- **Public Access:** `http://localhost:3000/health-trends`

#### Test Cases
- [ ] **Heatmap Display**
  - Access health trends page
  - Verify regional data cards display
  - Check location names (Chennai, Mumbai, Delhi, etc.)
  - Test responsiveness on different screen sizes
  
- [ ] **Filter Functionality**
  - Test Location Level toggle: City/District/State
  - Test Symptom filter dropdown (fever, cough, cold, etc.)
  - Test Time Window: Week/Month/Quarter
  - Test Severity filter: High/Medium/Low
  - Test combined filters work together
  
- [ ] **Data Accuracy**
  - Verify symptom counts match test data
  - Check geographic mapping (Chennai → Tamil Nadu)
  - Test alert levels (Critical/High/Medium/Low)
  - Verify top symptoms listed correctly

## 🔧 Troubleshooting Common Issues

### Issue: "No data available"
```bash
# Solution: Run test data creation
node scripts/create-test-scenario.js

# Verify data was created
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function check() {
  const counts = {
    posts: await prisma.post.count(),
    priorities: await prisma.postPriority.count(),
    symptoms: await prisma.symptomReport.count(),
    activities: await prisma.userActivityLog.count()
  };
  console.log('Data counts:', counts);
  await prisma.\$disconnect();
}
check();
"
```

### Issue: "Authentication failed"
```bash
# Check if test users exist
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function check() {
  const users = await prisma.user.findMany({
    where: { email: { in: ['admin@medthread.com', 'doctor@medthread.com'] } },
    select: { email: true, role: true, username: true }
  });
  console.log('Test users:', users);
  await prisma.\$disconnect();
}
check();
"

# Recreate test users if missing
node scripts/create-test-scenario.js
```

### Issue: "API endpoints not found"
```bash
# Check if routes are registered
grep -r "doctor-profile-analytics" apps/api/src/index.ts
grep -r "post-priority" apps/api/src/index.ts
grep -r "admin-user-activity" apps/api/src/index.ts
grep -r "regional-symptom-analytics" apps/api/src/index.ts

# Restart API server
cd apps/api && npm run dev
```

### Issue: "Database connection failed"
```bash
# Check database URL
echo $DATABASE_URL

# Test database connection
npx prisma db pull

# Apply schema if needed
npx prisma db push
```

## 📊 Performance Testing

### Load Testing
```bash
# Test API performance under load
for i in {1..50}; do
  curl -s "http://localhost:3001/api/doctor-profile-analytics/comprehensive/$(node -e 'const {PrismaClient} = require("@prisma/client"); const p = new PrismaClient(); p.user.findFirst({where:{role:"DOCTOR"}}).then(u=>console.log(u.id)).finally(()=>p.$disconnect())')" &
done
wait
```

### Memory Usage Monitoring
```bash
# Monitor Node.js memory usage
node --inspect apps/api/src/index.ts

# Check for memory leaks in browser DevTools
# Use Chrome DevTools → Performance tab
```

## 🎯 User Acceptance Testing

### Scenario 1: Doctor Reviews Patient Posts
1. Login as doctor (`doctor@medthread.com`)
2. Navigate to `/doctor-feed`
3. Verify high-priority posts (chest pain, severe headache) appear first
4. Click on a high-priority post
5. Verify priority badge and detected symptoms display
6. Filter by "High Priority" only
7. Verify only high-priority posts show

### Scenario 2: Admin Analyzes User Activity
1. Login as admin (`admin@medthread.com`)
2. Navigate to `/admin/analytics`
3. Find a doctor in the top doctors list
4. Click "Activity Graph" button
5. Verify hourly activity pattern displays
6. Toggle to weekly view
7. Check peak activity times make sense

### Scenario 3: Public Health Monitoring
1. Navigate to `/health-trends` (no login required)
2. Verify regional symptom data displays
3. Change location level from City to State
4. Filter by specific symptom (e.g., "fever")
5. Change time window to "Last Week"
6. Verify data updates accordingly

### Scenario 4: Doctor Profile Analysis
1. Navigate to `/u/dr_smith`
2. Verify doctor profile displays with stats
3. Check patient acquisition graph shows growth
4. Verify reply time shows reasonable estimate
5. Check daily activity pattern makes sense
6. Test on mobile device for responsiveness

## 🚨 Critical Test Points

### Security Testing
- [ ] Admin endpoints reject non-admin users (403 Forbidden)
- [ ] Doctor feed requires doctor authentication
- [ ] API endpoints validate JWT tokens properly
- [ ] No sensitive data exposed in public endpoints

### Data Integrity Testing
- [ ] Post priority analysis matches content keywords
- [ ] Geographic data resolves correctly (pincode → city → state)
- [ ] User activity logs aggregate correctly
- [ ] Doctor performance metrics calculate accurately

### Performance Testing
- [ ] API responses under 500ms for single requests
- [ ] Charts render smoothly with large datasets
- [ ] Database queries use proper indexes
- [ ] No memory leaks in long-running sessions

### Accessibility Testing
- [ ] All charts have proper ARIA labels
- [ ] Color-blind friendly priority indicators
- [ ] Keyboard navigation works for all components
- [ ] Screen reader compatibility

## 📱 Cross-Platform Testing

### Desktop Browsers
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### Mobile Devices
- [ ] iOS Safari
- [ ] Android Chrome
- [ ] Responsive design works on all screen sizes
- [ ] Touch interactions work properly

### API Testing
- [ ] Postman/Insomnia collection for all endpoints
- [ ] cURL commands for command-line testing
- [ ] Automated API tests pass

## 🎉 Final Validation

### Pre-Production Checklist
- [ ] All manual test cases pass
- [ ] Automated tests pass (100% success rate)
- [ ] Performance benchmarks met
- [ ] Security vulnerabilities addressed
- [ ] Cross-browser compatibility verified
- [ ] Mobile responsiveness confirmed
- [ ] Database migrations applied
- [ ] Environment variables configured
- [ ] Error handling works gracefully
- [ ] Logging and monitoring configured

### Go-Live Readiness
- [ ] Health checks pass in production environment
- [ ] SSL certificates valid
- [ ] CDN configured for static assets
- [ ] Database backups configured
- [ ] Monitoring and alerting set up
- [ ] Documentation updated
- [ ] Team trained on new features
- [ ] Rollback plan prepared

## 📞 Support & Troubleshooting

### Quick Commands
```bash
# Reset everything and start fresh
npm run clean
node scripts/create-test-scenario.js
npm run dev

# Check system health
node scripts/quick-health-check.js

# Run full test suite
node scripts/test-new-features-comprehensive.js

# Validate setup
node scripts/validate-feature-setup.js
```

### Common Solutions
1. **Clear browser cache** if components not updating
2. **Restart development servers** if API changes not reflecting
3. **Check browser console** for JavaScript errors
4. **Verify database connection** if data not loading
5. **Check network tab** for failed API requests

This comprehensive testing guide ensures all healthcare analytics features work correctly across different scenarios, user types, and environments.