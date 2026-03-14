# Analytics Quick Start Guide

## 🚀 Quick Access

### View Analytics Dashboard
```
http://localhost:3000/admin/analytics
```

### View Doctor Profile Stats
```
http://localhost:3000/u/{doctor-username}
```

### View Community Top Doctors
```
http://localhost:3000/m/cardiology
http://localhost:3000/m/dermatology
```

## 📊 What You'll See

### Admin Dashboard (`/admin/analytics`)
1. **Doctor Specialty Distribution** - Pie chart showing doctor distribution
2. **Community Activity Tiers** - Engagement levels per community
3. **Top 10 Doctors** - Leaderboard with portfolio scores
4. **Doctor Deep-Dive** - Click "View Details" for comprehensive stats

### Doctor Profiles (`/u/{username}`)
- Portfolio Score
- Patient Satisfaction Rate
- Cure Count
- Conversion Metrics
- Clinic Visit Conversions

### Community Pages (`/m/{community}`)
- Top 5 Doctors in that specialty
- Quick stats and links to profiles

## 🔧 Quick Test

### 1. Check if servers are running
```bash
# Both should be running
lsof -i :3000  # Web server
lsof -i :3001  # API server
```

### 2. Test API endpoint
```bash
curl http://localhost:3001/api/enhanced-analytics/doctor-specialty-distribution
```

### 3. Visit the dashboard
Open browser: `http://localhost:3000/admin/analytics`

## 📝 Key Features

### 1. Portfolio Scoring
Doctors are ranked by a comprehensive score:
- Posts × 2 points
- Comments × 1 point
- Conversions × 10 points
- Patients Cured × 15 points
- Clinic Visits × 20 points
- Post-Clinic Cures × 25 points
- Switched Doctors × -10 points

### 2. Activity Tiers
Communities are categorized:
- 🟢 **HIGHLY_ACTIVE**: 10+ posts/month, 5+ comments/post
- 🟡 **MODERATELY_ACTIVE**: 5-9 posts/month, 2-4 comments/post
- ⚪ **INACTIVE**: <5 posts/month or <2 comments/post

### 3. Patient Feedback
Three outcome options:
- ✅ **Cured** - Problem resolved
- 🔄 **Not Yet** - Still in treatment
- 🔀 **Consult New Doctor** - Seeking second opinion

## 🎯 Next Steps

### For Testing
1. Visit `/admin/analytics` to see the dashboard
2. Check if charts render correctly
3. Click "View Details" on a doctor
4. Navigate to a doctor profile page
5. Check community pages for top doctors

### For Integration
1. Add PatientFeedbackModal to appointment flow
2. Track conversions in booking process
3. Track clinic visits in appointment system

## 📚 Full Documentation
- `ANALYTICS_IMPLEMENTATION.md` - Complete technical details
- `ANALYTICS_VISUAL_GUIDE.md` - Visual guide to features
- `ANALYTICS_LOCATIONS_GUIDE.md` - Where to find analytics

## ✅ Status
- ✅ All features implemented
- ✅ Servers running
- ✅ No compilation errors
- ✅ Charts rendering correctly
- ✅ API endpoints working
- ✅ Database schema updated
- ✅ Cron jobs configured

## 🐛 Troubleshooting

**Charts not showing?**
- Check browser console for errors
- Verify Recharts is installed: `npm list recharts`

**No data in dashboard?**
- Run seed script to generate sample data
- Check API responses in Network tab

**401 Unauthorized?**
- Verify you're logged in as admin
- Check JWT token in localStorage

---

**Ready to use!** Visit `http://localhost:3000/admin/analytics` to get started.
