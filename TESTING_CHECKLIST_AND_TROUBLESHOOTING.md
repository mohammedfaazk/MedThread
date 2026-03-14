# 🧪 Testing Checklist & Troubleshooting Guide

## 📋 Pre-Testing Setup

### 1. Environment Setup
```bash
# Ensure all dependencies are installed
npm install

# Run database migrations
npx prisma db push

# Seed test data for new features
node scripts/setup-new-features.js

# Start the development servers
npm run dev:api    # Backend (port 3001)
npm run dev:web    # Frontend (port 3000)
```

### 2. Test User Accounts Required
- **Admin User**: For admin analytics testing
- **Doctor User**: For doctor profile and feed testing  
- **Patient User**: For creating posts and symptom reports
- **Multiple Users**: For activity comparison testing

### 3. Test Data Verification
```bash
# Verify test data was created
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function check() {
  const posts = await prisma.postPriority.count();
  const symptoms = await prisma.symptomReport.count();
  const activities = await prisma.userActivityLog.count();
  console.log('Test data:', { posts, symptoms, activities });
  await prisma.\$disconnect();
}
check();
"
```

## 🎯 Feature 1: Doctor Profile Graphs Testing

### ✅ Test Cases

#### 1.1 Patient Acquisition Graph
- [ ] **Navigate to doctor profile**: `/u/[doctor-username]`
- [ ] **Verify graph displays**: Patient acquisition line chart visible
- [ ] **Check data accuracy**: Graph starts from doctor's registration date
- [ ] **Test empty state**: New doctor with no patients shows zero growth
- [ ] **Verify responsiveness**: Graph adapts to different screen sizes

**Expected Results:**
- Line chart with months on X-axis, cumulative patients on Y-axis
- Tooltip shows month name and patient count
- Graph only shows data from registration date forward

#### 1.2 Average Reply Time
- [ ] **Check display text**: "Generally replies within X hours/minutes"
- [ ] **Verify calculation**: Based on actual conversation data
- [ ] **Test edge cases**: Doctor with no conversations shows "No reply data available"
- [ ] **Check accuracy**: Manual verification of sample reply times

**Expected Results:**
- Clear, human-readable text (e.g., "Generally replies within 2 hours")
- Shows both average and median reply times
- Handles zero-conversation case gracefully

#### 1.3 Daily Activity Graph
- [ ] **Verify bar chart**: 24-hour activity pattern (0-23)
- [ ] **Check activity types**: Posts, comments, messages counted
- [ ] **Test peak hour display**: Shows hour with highest activity
- [ ] **Verify last active**: "Last active X hours/days ago" text
- [ ] **Check empty state**: Inactive doctor shows zero activity

**Expected Results:**
- Bar chart with hours (00:00-23:00) on X-axis
- Activity count on Y-axis
- Peak hour highlighted or mentioned
- Last active timestamp accurate

### 🐛 Troubleshooting

#### Issue: Graphs not loading
```bash
# Check API endpoints
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3001/api/doctor-profile-analytics/comprehensive/DOCTOR_ID

# Check browser console for errors
# Verify doctor ID exists in database
```

#### Issue: Empty or incorrect data
```bash
# Verify doctor has activity data
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function check() {
  const doctor = await prisma.user.findFirst({ where: { role: 'DOCTOR' } });
  const messages = await prisma.message.count({ where: { senderId: doctor.id } });
  const posts = await prisma.post.count({ where: { authorId: doctor.id } });
  console.log('Doctor activity:', { messages, posts });
  await prisma.\$disconnect();
}
check();
"
```

## 🎯 Feature 2: Post Priority Algorithm Testing

### ✅ Test Cases

#### 2.1 Priority Detection
- [ ] **Create high-priority post**: Include "chest pain" or "difficulty breathing"
- [ ] **Create medium-priority post**: Include "persistent cough" or "fatigue"
- [ ] **Create low-priority post**: Include "cold" or "sneezing"
- [ ] **Verify priority badges**: Correct emoji and color coding
- [ ] **Check urgency scores**: High (8-10), Medium (4-7), Low (1-3)

**Test Posts:**
```
High: "Severe chest pain and difficulty breathing for 2 hours"
Medium: "Persistent cough and fatigue for a week"  
Low: "Common cold with runny nose and sneezing"
```

#### 2.2 Doctor Feed Prioritization
- [ ] **Access doctor feed**: `/doctor-feed` (doctor login required)
- [ ] **Verify sorting**: High-priority posts appear first
- [ ] **Test filters**: All/High/Medium/Low filter buttons work
- [ ] **Check statistics**: Priority distribution shows correct counts
- [ ] **Verify pagination**: Load more posts works correctly

**Expected Results:**
- Posts sorted by urgency score (highest first)
- Filter buttons change feed content
- Priority badges visible on each post
- Statistics match actual post counts

#### 2.3 Symptom Detection
- [ ] **Check detected symptoms**: Symptoms listed under posts
- [ ] **Verify accuracy**: Symptoms match post content
- [ ] **Test edge cases**: Posts with no symptoms show empty state
- [ ] **Check weights**: Higher-weight symptoms prioritized

### 🐛 Troubleshooting

#### Issue: Priority not detected
```bash
# Test priority analysis manually
curl -X POST http://localhost:3001/api/post-priority/analyze/POST_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"title":"chest pain","content":"severe chest pain and breathing issues"}'

# Check if PostPriority record was created
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function check() {
  const priorities = await prisma.postPriority.findMany({ take: 5 });
  console.log('Priorities:', priorities);
  await prisma.\$disconnect();
}
check();
"
```

#### Issue: Doctor feed access denied
```bash
# Verify user role
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3001/api/auth/me

# Check if user role is DOCTOR or VERIFIED_DOCTOR
```

## 🎯 Feature 3: Admin User Activity Graphs Testing

### ✅ Test Cases

#### 3.1 Admin Access Control
- [ ] **Login as admin**: Verify admin role authentication
- [ ] **Access admin analytics**: `/admin/analytics`
- [ ] **Non-admin blocked**: Regular users cannot access admin features
- [ ] **API protection**: Admin endpoints require admin role

#### 3.2 User Activity Analysis
- [ ] **Click "Activity Graph"**: On any user in admin dashboard
- [ ] **Verify modal opens**: UserActivityGraphs component loads
- [ ] **Check hourly view**: 24-hour activity pattern displays
- [ ] **Test weekly view**: Toggle to weekly view works
- [ ] **Verify data accuracy**: Activity counts match user's actual activity

#### 3.3 Activity Metrics
- [ ] **Total activity count**: Matches sum of posts, comments, messages, votes
- [ ] **Peak activity time**: Correctly identifies most active hour/day
- [ ] **Activity breakdown**: Shows distribution by activity type
- [ ] **Time period**: "Last 30 days" data range accurate

### 🐛 Troubleshooting

#### Issue: Admin access denied
```bash
# Check user role in database
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function check() {
  const user = await prisma.user.findUnique({ 
    where: { id: 'USER_ID' },
    select: { role: true, username: true }
  });
  console.log('User role:', user);
  await prisma.\$disconnect();
}
check();
"

# Update user role to ADMIN if needed
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function update() {
  await prisma.user.update({
    where: { id: 'USER_ID' },
    data: { role: 'ADMIN' }
  });
  console.log('Updated user to ADMIN');
  await prisma.\$disconnect();
}
update();
"
```

#### Issue: No activity data
```bash
# Create test activity data
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function create() {
  const activities = [];
  for (let i = 0; i < 50; i++) {
    activities.push({
      userId: 'USER_ID',
      activityType: 'POST',
      hourOfDay: Math.floor(Math.random() * 24),
      dayOfWeek: Math.floor(Math.random() * 7),
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
    });
  }
  await prisma.userActivityLog.createMany({ data: activities });
  console.log('Created test activity data');
  await prisma.\$disconnect();
}
create();
"
```

## 🎯 Feature 4: Regional Symptom Analytics Testing

### ✅ Test Cases

#### 4.1 Heatmap Display
- [ ] **Access health trends**: `/health-trends`
- [ ] **Verify heatmap loads**: Regional data displays correctly
- [ ] **Check location cards**: Cities/districts/states show symptom data
- [ ] **Test responsiveness**: Works on mobile and desktop
- [ ] **Verify empty state**: Handles no data gracefully

#### 4.2 Filter Functionality
- [ ] **Location level toggle**: City/District/State switching works
- [ ] **Symptom filter**: Dropdown filters by specific symptoms
- [ ] **Time window**: Week/Month/Quarter filtering works
- [ ] **Severity filter**: High/Medium/Low filtering works
- [ ] **Combined filters**: Multiple filters work together

#### 4.3 Data Accuracy
- [ ] **Symptom counts**: Match actual symptom reports
- [ ] **Geographic mapping**: Pincodes resolve to correct locations
- [ ] **Alert levels**: Critical/High/Medium/Low calculated correctly
- [ ] **Top symptoms**: Most common symptoms listed first

### 🐛 Troubleshooting

#### Issue: No regional data
```bash
# Check symptom reports exist
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function check() {
  const reports = await prisma.symptomReport.count();
  const cities = await prisma.symptomReport.groupBy({
    by: ['city'],
    _count: { city: true }
  });
  console.log('Symptom reports:', reports, 'Cities:', cities);
  await prisma.\$disconnect();
}
check();
"

# Create test symptom data if missing
node scripts/setup-new-features.js
```

#### Issue: Geographic mapping fails
```bash
# Test pincode resolution
curl http://localhost:3001/api/regional-symptom-analytics/heatmap?locationLevel=city

# Check if location data is properly structured
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function check() {
  const sample = await prisma.symptomReport.findFirst({
    select: { pincode: true, city: true, district: true, state: true }
  });
  console.log('Sample location data:', sample);
  await prisma.\$disconnect();
}
check();
"
```

## 🔧 General Troubleshooting

### Database Issues

#### Connection Problems
```bash
# Check database connection
npx prisma db pull

# Reset database if needed
npx prisma db push --force-reset
node scripts/setup-new-features.js
```

#### Missing Tables/Columns
```bash
# Apply schema changes
npx prisma db push

# Check schema status
npx prisma db pull
```

### API Issues

#### CORS Errors
```javascript
// Check CORS configuration in apps/api/src/index.ts
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3003',
    process.env.CORS_ORIGIN || 'http://localhost:3000'
  ],
  credentials: true,
}));
```

#### Authentication Failures
```bash
# Test authentication
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'

# Verify JWT token
node -e "
const jwt = require('jsonwebtoken');
const token = 'YOUR_JWT_TOKEN';
try {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  console.log('Token valid:', decoded);
} catch (err) {
  console.log('Token invalid:', err.message);
}
"
```

### Frontend Issues

#### Component Not Rendering
```bash
# Check browser console for errors
# Verify component imports
# Check if API data is loading

# Test component in isolation
npm run storybook  # if Storybook is configured
```

#### Chart Libraries Issues
```bash
# Reinstall chart dependencies
npm install recharts

# Check if data format matches chart requirements
console.log('Chart data:', chartData);
```

## 📊 Performance Testing

### Load Testing
```bash
# Test API endpoints under load
for i in {1..100}; do
  curl -s http://localhost:3001/api/doctor-profile-analytics/comprehensive/DOCTOR_ID &
done
wait

# Monitor database performance
# Check for slow queries in logs
```

### Memory Usage
```bash
# Monitor Node.js memory usage
node --inspect apps/api/src/index.ts

# Check for memory leaks in browser
# Use Chrome DevTools Performance tab
```

## 🚀 Deployment Testing

### Production Checklist
- [ ] **Environment variables**: All required env vars set
- [ ] **Database migrations**: Applied successfully
- [ ] **API endpoints**: All endpoints accessible
- [ ] **Authentication**: JWT tokens working
- [ ] **HTTPS**: SSL certificates valid
- [ ] **Performance**: Response times acceptable
- [ ] **Error handling**: Graceful error responses
- [ ] **Logging**: Proper error logging configured

### Smoke Tests
```bash
# Test critical paths
curl https://your-domain.com/api/health
curl https://your-domain.com/api/doctor-profile-analytics/comprehensive/DOCTOR_ID
curl https://your-domain.com/api/post-priority/stats
curl https://your-domain.com/api/regional-symptom-analytics/heatmap
```

## 📝 Test Automation Scripts

### Automated Test Runner
```bash
# Create test script
cat > scripts/test-new-features.js << 'EOF'
const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:3001';
const AUTH_TOKEN = process.env.TEST_AUTH_TOKEN;

async function runTests() {
  console.log('🧪 Running automated tests...');
  
  const tests = [
    {
      name: 'Doctor Profile Analytics',
      url: `${API_URL}/api/doctor-profile-analytics/comprehensive/DOCTOR_ID`,
      expected: (data) => data.patientAcquisition && data.averageReplyTime
    },
    {
      name: 'Post Priority Stats',
      url: `${API_URL}/api/post-priority/stats`,
      expected: (data) => data.total >= 0 && data.distribution
    },
    {
      name: 'Regional Symptom Heatmap',
      url: `${API_URL}/api/regional-symptom-analytics/heatmap`,
      expected: (data) => data.heatmapData && Array.isArray(data.heatmapData)
    }
  ];

  for (const test of tests) {
    try {
      const response = await axios.get(test.url, {
        headers: { Authorization: `Bearer ${AUTH_TOKEN}` }
      });
      
      if (response.data.success && test.expected(response.data.data)) {
        console.log(`✅ ${test.name}: PASSED`);
      } else {
        console.log(`❌ ${test.name}: FAILED - Invalid response`);
      }
    } catch (error) {
      console.log(`❌ ${test.name}: FAILED - ${error.message}`);
    }
  }
}

runTests();
EOF

# Run automated tests
node scripts/test-new-features.js
```

## 📋 Final Verification Checklist

### Before Going Live
- [ ] All test cases pass
- [ ] No console errors in browser
- [ ] API responses within acceptable time limits
- [ ] Database queries optimized
- [ ] Error handling works correctly
- [ ] Authentication and authorization secure
- [ ] Data privacy and security measures in place
- [ ] Mobile responsiveness verified
- [ ] Cross-browser compatibility tested
- [ ] Performance benchmarks met

### Post-Deployment Monitoring
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Configure performance monitoring
- [ ] Set up database query monitoring
- [ ] Create health check endpoints
- [ ] Set up alerting for critical failures
- [ ] Monitor user adoption metrics
- [ ] Track feature usage analytics

This comprehensive testing checklist ensures all new healthcare analytics features work correctly and provides troubleshooting guidance for common issues.