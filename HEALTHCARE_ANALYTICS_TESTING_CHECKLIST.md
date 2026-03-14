# Healthcare Analytics Features - Testing Checklist 🧪

## Pre-Testing Setup ✅

### 1. Environment Verification
- [ ] **Application Running**: Both API (3001) and Web (3000) servers active
- [ ] **Database Connected**: Supabase PostgreSQL accessible
- [ ] **Test Data Available**: Run `node scripts/create-test-scenario.js` if needed
- [ ] **Authentication Working**: Can login/logout successfully

### 2. Test Accounts Ready
```
✅ Admin: admin@medthread.com / password123
✅ Doctor: doctor@medthread.com / password123  
✅ Patients: patient1@medthread.com to patient5@medthread.com / password123
```

### 3. Quick Health Check
```bash
# Run this first to verify system health
node scripts/quick-health-check.js
```

---

## 🩺 Feature 1: Doctor Profile Graphs Testing

### Access Method
1. **Login as any user** (patient, doctor, or admin)
2. **Navigate to**: `/u/dr_smith` or any doctor's profile
3. **Scroll down** to see analytics sections

### Test Cases

#### ✅ **Patient Acquisition Graph**
- [ ] **Graph Loads**: Line chart appears without errors
- [ ] **Data Points**: Shows monthly progression from doctor's join date
- [ ] **Hover Tooltips**: Interactive tooltips show exact values
- [ ] **Y-axis**: Cumulative patient count increases over time
- [ ] **X-axis**: Shows months from registration to present
- [ ] **Summary Text**: Displays "X total patients since joining"

**🔧 Troubleshooting**:
```bash
# Check API endpoint directly
curl "http://localhost:3001/api/doctor-profile-analytics/patient-acquisition/[DOCTOR_ID]"

# Expected response: {"success": true, "data": {...}}
```

#### ✅ **Average Reply Time Display**
- [ ] **Metric Shows**: "Generally replies within X hours" text
- [ ] **Statistics**: Shows average and median reply times
- [ ] **Conversation Count**: Displays "Based on X patient conversations"
- [ ] **Visual Design**: Gradient background with proper styling
- [ ] **Data Accuracy**: Numbers seem reasonable (not 0 or extremely high)

**🔧 Troubleshooting**:
```bash
# Check reply time endpoint
curl "http://localhost:3001/api/doctor-profile-analytics/reply-time/[DOCTOR_ID]"
```

#### ✅ **Daily Activity Graph**
- [ ] **Bar Chart Loads**: 24-hour activity pattern visible
- [ ] **X-axis Labels**: Hours 0-23 properly labeled
- [ ] **Activity Data**: Bars show varying heights
- [ ] **Peak Hour Display**: Shows "Peak Activity: Xam/pm"
- [ ] **Last Active**: Shows "Last Active: X hours/days ago"
- [ ] **Hover Details**: Tooltips show activity breakdown

**🔧 Troubleshooting**:
```bash
# Check daily activity endpoint
curl "http://localhost:3001/api/doctor-profile-analytics/daily-activity/[DOCTOR_ID]"
```

### Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| Graphs not loading | API endpoint error | Check server logs, verify doctor ID |
| Empty data | No analytics data | Run `node scripts/create-test-scenario.js` |
| 401 errors | Authentication issue | Login first, check auth token |
| Slow loading | Database query | Check database connection |

---

## 🎯 Feature 2: Post Priority Algorithm Testing

### Access Method
1. **Login as doctor**: doctor@medthread.com / password123
2. **Navigate to**: `/doctor-feed`
3. **Verify doctor role**: Should see "Medical Priority Feed" page

### Test Cases

#### ✅ **Priority Filter Interface**
- [ ] **Filter Buttons**: All/High/Medium/Low buttons visible
- [ ] **Priority Counts**: Each button shows post count
- [ ] **Active State**: Selected filter highlighted
- [ ] **Statistics Toggle**: "Show Stats" button works
- [ ] **Help Text**: Priority criteria explanation visible

#### ✅ **Post Priority Detection**
- [ ] **High Priority Posts**: 🔴 Red badges for severe symptoms
- [ ] **Medium Priority Posts**: 🟡 Yellow badges for moderate symptoms  
- [ ] **Low Priority Posts**: 🟢 Green badges for minor symptoms
- [ ] **Badge Visibility**: Priority badges clearly visible on posts
- [ ] **Sorting Order**: High priority posts appear first

#### ✅ **Filter Functionality**
- [ ] **All Filter**: Shows all posts with mixed priorities
- [ ] **High Filter**: Shows only high priority posts
- [ ] **Medium Filter**: Shows only medium priority posts
- [ ] **Low Filter**: Shows only low priority posts
- [ ] **Post Counts**: Filter counts match displayed posts

#### ✅ **Symptom Detection**
- [ ] **Detected Symptoms**: Shows detected symptoms below posts
- [ ] **Symptom Weights**: Displays symptom importance scores
- [ ] **Keyword Matching**: Symptoms match post content
- [ ] **Urgency Scores**: Higher scores for more severe posts

**🔧 Troubleshooting**:
```bash
# Test priority API directly
curl -H "Authorization: Bearer [TOKEN]" \
  "http://localhost:3001/api/post-priority/doctor-feed?priority=ALL"

# Check priority stats
curl -H "Authorization: Bearer [TOKEN]" \
  "http://localhost:3001/api/post-priority/stats"
```

### Test Posts to Create
Create these posts to test priority detection:

**High Priority** 🔴:
- "Severe chest pain and difficulty breathing"
- "High fever 104°F with severe headache"
- "Sudden numbness in left arm"

**Medium Priority** 🟡:
- "Persistent cough for 2 weeks with fatigue"
- "Body ache and mild fever for 3 days"
- "Joint pain and morning stiffness"

**Low Priority** 🟢:
- "Common cold with runny nose"
- "Vitamin D deficiency questions"
- "General wellness tips needed"

---

## 👥 Feature 3: Admin User Activity Graphs Testing

### Access Method
1. **Login as admin**: admin@medthread.com / password123
2. **Navigate to**: `/admin/analytics` or admin panel
3. **Click on any user** to view their activity details

### Test Cases

#### ✅ **User Activity Modal/Page**
- [ ] **Modal Opens**: User activity analysis appears
- [ ] **User Info**: Shows username, role, member since date
- [ ] **Timeframe Toggle**: Hourly/Weekly buttons work
- [ ] **Close Button**: Modal can be closed (if applicable)

#### ✅ **Activity Charts**
- [ ] **Bar Chart Loads**: Activity pattern visualization
- [ ] **Hourly View**: Shows 24-hour activity pattern
- [ ] **Weekly View**: Shows 7-day activity pattern
- [ ] **Multiple Bars**: Posts, comments, messages shown separately
- [ ] **Hover Tooltips**: Interactive data on hover

#### ✅ **Summary Statistics**
- [ ] **Total Activity**: Shows overall activity count
- [ ] **Peak Time**: Displays most active hour/day
- [ ] **Activity Breakdown**: Posts/comments/messages counts
- [ ] **Averages**: Shows per-day or per-week averages

#### ✅ **Activity Distribution**
- [ ] **Progress Bars**: Visual breakdown by activity type
- [ ] **Percentages**: Accurate percentage calculations
- [ ] **Most Active Times**: Top 5 active periods listed
- [ ] **Color Coding**: Different colors for activity types

**🔧 Troubleshooting**:
```bash
# Test user activity endpoint
curl -H "Authorization: Bearer [ADMIN_TOKEN]" \
  "http://localhost:3001/api/admin-user-activity/user/[USER_ID]?timeframe=hourly"

# Test weekly view
curl -H "Authorization: Bearer [ADMIN_TOKEN]" \
  "http://localhost:3001/api/admin-user-activity/user/[USER_ID]?timeframe=weekly"
```

### Test Different User Types
- [ ] **Patient Activity**: Test with patient account
- [ ] **Doctor Activity**: Test with doctor account  
- [ ] **Admin Activity**: Test with admin account
- [ ] **New User**: Test with recently created user
- [ ] **Active User**: Test with user having lots of activity

---

## 🗺️ Feature 4: Regional Symptom Analytics Testing

### Access Method
1. **Navigate to**: `/health-trends` (public access)
2. **Or admin panel**: Regional analytics section
3. **No login required** for basic functionality

### Test Cases

#### ✅ **Heatmap Visualization**
- [ ] **Map Loads**: Geographic visualization appears
- [ ] **India Map**: Shows Indian states/regions
- [ ] **Data Points**: Colored regions based on symptom data
- [ ] **Interactive**: Can click on regions
- [ ] **Responsive**: Works on different screen sizes

#### ✅ **Location Toggles**
- [ ] **City Toggle**: Shows city-level data
- [ ] **District Toggle**: Shows district-level data
- [ ] **State Toggle**: Shows state-level data
- [ ] **Smooth Transitions**: Toggle changes update map smoothly
- [ ] **Data Accuracy**: Different levels show appropriate detail

#### ✅ **Symptom Filtering**
- [ ] **Symptom Dropdown**: Lists available symptoms
- [ ] **Filter Selection**: Can select specific symptoms
- [ ] **Map Updates**: Map changes based on selected symptom
- [ ] **Count Display**: Shows patient count for selected area
- [ ] **Real-time Updates**: No page reload required

#### ✅ **Data Display**
- [ ] **Tooltip Information**: Hover shows region details
- [ ] **Patient Counts**: Accurate numbers displayed
- [ ] **Time Periods**: Monthly/weekly data available
- [ ] **Legend**: Color coding explanation visible
- [ ] **Loading States**: Smooth loading indicators

**🔧 Troubleshooting**:
```bash
# Test heatmap data endpoint
curl "http://localhost:3001/api/regional-symptom-analytics/heatmap"

# Test with specific filters
curl "http://localhost:3001/api/regional-symptom-analytics/heatmap?symptom=fever&location=city"

# Check trends endpoint
curl "http://localhost:3001/api/regional-symptom-analytics/trends"
```

### Test Scenarios
1. **Create Symptom Posts**: Post content with symptoms from different locations
2. **Test Geographic Data**: Verify pincode to location mapping
3. **Filter Combinations**: Try different symptom + location combinations
4. **Data Aggregation**: Check if counts are accurate

---

## 🔧 General Troubleshooting Guide

### Common Issues

#### 🚨 **Authentication Errors (401)**
```bash
# Check if logged in
localStorage.getItem('auth_token')

# Login via API
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"doctor@medthread.com","password":"password123"}'
```

#### 🚨 **No Data Showing**
```bash
# Create test data
node scripts/create-test-scenario.js

# Verify database connection
node scripts/quick-health-check.js

# Check specific tables
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.postPriority.count().then(console.log);
"
```

#### 🚨 **API Endpoints Not Working**
```bash
# Check server status
curl http://localhost:3001/health

# Check specific endpoints
curl http://localhost:3001/api/post-priority/stats
curl http://localhost:3001/api/regional-symptom-analytics/heatmap
```

#### 🚨 **Frontend Components Not Loading**
1. **Check Browser Console**: Look for JavaScript errors
2. **Network Tab**: Verify API calls are being made
3. **React DevTools**: Check component state and props
4. **Clear Cache**: Hard refresh (Ctrl+Shift+R)

### Performance Issues

#### 🐌 **Slow Loading**
- [ ] **Database Queries**: Check for slow queries in logs
- [ ] **Large Datasets**: Verify pagination is working
- [ ] **Network**: Check API response times
- [ ] **Caching**: Verify data caching is active

#### 🐌 **Memory Issues**
- [ ] **Component Cleanup**: Check for memory leaks
- [ ] **Data Size**: Verify reasonable data limits
- [ ] **Chart Libraries**: Check Recharts performance
- [ ] **Image Loading**: Optimize image sizes

---

## 📊 Automated Testing Scripts

### Quick Tests
```bash
# Overall health check
node scripts/quick-health-check.js

# Feature validation
node scripts/validate-feature-setup.js

# Comprehensive testing
node scripts/test-new-features-comprehensive.js

# Hospital finder (bonus feature)
node scripts/test-hospital-finder.js
```

### Manual API Testing
```bash
# Test all analytics endpoints
curl http://localhost:3001/api/doctor-profile-analytics/patient-acquisition/[DOCTOR_ID]
curl http://localhost:3001/api/post-priority/stats
curl http://localhost:3001/api/admin-user-activity/user/[USER_ID]
curl http://localhost:3001/api/regional-symptom-analytics/heatmap
```

---

## ✅ Success Criteria Checklist

### Feature 1: Doctor Profile Graphs
- [ ] All three graphs load without errors
- [ ] Data is accurate and realistic
- [ ] Interactive elements work (hover, tooltips)
- [ ] Responsive design on mobile/desktop
- [ ] Performance is acceptable (<2s load time)

### Feature 2: Post Priority Algorithm  
- [ ] Priority detection works for all three levels
- [ ] Filtering functions correctly
- [ ] Visual badges are clear and consistent
- [ ] Sorting prioritizes high-urgency posts
- [ ] Statistics are accurate

### Feature 3: Admin User Activity
- [ ] Works for all user types (patient/doctor/admin)
- [ ] Timeframe toggle functions properly
- [ ] Charts display meaningful data
- [ ] Summary statistics are accurate
- [ ] Modal/page interaction is smooth

### Feature 4: Regional Symptom Analytics
- [ ] Geographic visualization loads correctly
- [ ] Location toggles work smoothly
- [ ] Symptom filtering is responsive
- [ ] Data aggregation is accurate
- [ ] Interactive elements function properly

---

## 🆘 Emergency Troubleshooting

### If Everything Breaks
1. **Restart Services**: `npm run dev`
2. **Clear Database**: Re-run test scenario creation
3. **Check Logs**: Look at API server console output
4. **Verify Environment**: Check `.env` file configuration
5. **Reset Browser**: Clear cache and cookies

### Contact Points
- **Database Issues**: Check Supabase dashboard
- **API Problems**: Review server logs in terminal
- **Frontend Issues**: Use browser developer tools
- **Performance**: Monitor network and memory usage

---

## 📋 Testing Report Template

```markdown
## Testing Session Report
**Date**: ___________
**Tester**: ___________
**Environment**: Development/Production

### Feature 1: Doctor Profile Graphs
- Patient Acquisition Graph: ✅/❌
- Average Reply Time: ✅/❌  
- Daily Activity Graph: ✅/❌
- Issues Found: ___________

### Feature 2: Post Priority Algorithm
- Priority Detection: ✅/❌
- Filter Functionality: ✅/❌
- Visual Badges: ✅/❌
- Issues Found: ___________

### Feature 3: Admin User Activity
- Chart Loading: ✅/❌
- Timeframe Toggle: ✅/❌
- Data Accuracy: ✅/❌
- Issues Found: ___________

### Feature 4: Regional Symptom Analytics
- Heatmap Visualization: ✅/❌
- Location Toggles: ✅/❌
- Symptom Filtering: ✅/❌
- Issues Found: ___________

### Overall Assessment
- Performance: ___________
- User Experience: ___________
- Critical Issues: ___________
- Recommendations: ___________
```

**Happy Testing! 🧪✨**