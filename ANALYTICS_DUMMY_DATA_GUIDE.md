# Analytics Dummy Data Guide

## Overview
This guide helps you populate ALL analytics graphs with realistic dummy data so they display meaningful information instead of empty charts.

## What Gets Populated

### 👨‍⚕️ Doctor Profile Analytics (for each doctor)
- **Treatment Outcomes**: 65-80 patient feedback records (Cured, Not Yet, Switched Doctor)
- **Posts Over Time**: 96-144 posts across 12 months
- **Comments Over Time**: 240-300 comments across 12 months  
- **Conversion Rates**: 480-600 conversion records across 12 months
- **Portfolio Score**: Performance metrics (75-95 range)

### 🌐 Community Analytics
- **Support Groups**: 40 posts with 2-4 comments each + votes
- **Q&A Forum**: 55 questions with 2-4 answers each
- **Health Challenges**: 30 active challenges with 5-17 participants each
- **Success Stories**: 35 approved stories with 3-8 comments each

### 📊 Admin Analytics
All the data above automatically populates admin analytics including:
- User activity patterns
- Treatment outcomes
- Community engagement
- Doctor activity by community
- Post priorities
- And more...

## How to Run

### Step 1: Ensure you have base data
First make sure you have users and communities:

```bash
# If you haven't run this yet
npx tsx apps/api/src/scripts/comprehensive-seed.ts
```

### Step 2: Run the analytics seed script

```bash
npx tsx apps/api/seed-all-analytics-simple.ts
```

This will take 2-5 minutes depending on your system.

### Step 3: Verify the data

1. **Doctor Profiles**: Visit any doctor profile (e.g., `/u/dr.rifa.hassan`)
   - Scroll to the analytics section
   - All 4 graphs should show data

2. **Admin Analytics**: Login as admin and visit `/admin/analytics`
   - All 12+ graphs should display data
   - Real-time indicators should be active

3. **Community Analytics**: Check the community analytics card
   - Support Groups, Q&A, Challenges, Stories should all show numbers

## Data Characteristics

### Realistic Patterns
- **Peak Activity**: 9-11 AM and 6-8 PM (simulates real user behavior)
- **Conversion Rates**: 50-80% (realistic for medical consultations)
- **Treatment Success**: 80-95% (optimistic but realistic)
- **Engagement**: Varied across communities (some more active than others)

### Time Distribution
- Data spans **12 months** for trend analysis
- Recent months have slightly higher activity
- Seasonal variations included

### Volume
- **Total Records Created**: 15,000-20,000+ across all tables
- **Per Doctor**: ~1,500-2,000 records
- **Community**: ~200-300 posts/questions/stories

## Compatibility with Real Data

### Hybrid Approach
The seed script is designed to work alongside real data:

1. **Adds to existing data**: Doesn't delete anything
2. **Uses real users**: Links to actual user accounts
3. **Follows schema**: Uses proper relationships and constraints

### When Real Data Arrives
When you start getting real data:
- Real data will blend seamlessly with dummy data
- You can optionally clean up dummy data later
- Analytics will show combined totals

### Cleaning Up (Optional)
If you want to remove dummy data later:

```bash
# Delete all seeded analytics data
npx tsx apps/api/src/scripts/cleanup-mock-data.ts
```

## Troubleshooting

### "Not enough users" error
Run the comprehensive seed first:
```bash
npx tsx apps/api/src/scripts/comprehensive-seed.ts
```

### Graphs still empty
1. Check browser console for errors
2. Verify API is running on port 3001
3. Check authentication token is valid
4. Try refreshing the page

### Slow performance
This is normal for the first run. The script creates thousands of records. Subsequent runs will be faster.

### Duplicate errors
The script handles duplicates gracefully. Some "duplicate" warnings are expected and can be ignored.

## What Each Graph Shows

### Doctor Profile Graphs
1. **Treatment Outcomes** (Pie/Doughnut): Distribution of patient outcomes
2. **Posts Over Time** (Line/Bar): Monthly posting activity
3. **Comments Over Time** (Line/Bar): Monthly comment activity  
4. **Conversion Rate** (Line/Bar): Chat-to-appointment conversion trends

### Admin Analytics Graphs
1. **Active Users**: Current online doctors and patients
2. **Offline Users**: Currently offline users
3. **User Activity Time**: Activity by hour of day
4. **Community Activity**: Posts, comments, interactions by community
5. **Treatment Outcomes**: Platform-wide patient outcomes
6. **Doctor Activity**: Contributions by community
7. **Community Engagement**: Engagement scores (dead forum detection)
8. **User Registrations**: New signups over 12 months
9. **Post Priorities**: Distribution of post urgency levels
10. **Appointment Conversion**: Top doctors by conversion rate
11. **Moderation Activity**: Reports filed/resolved over time
12. **Revenue**: Monthly revenue breakdown

### Community Analytics Card
- **Support Groups**: Total posts, comments, interactions
- **Q&A Forum**: Questions, answers, total interactions
- **Health Challenges**: Active challenges, participants
- **Success Stories**: Published stories, comments

## Best Practices

### For Development
- Run this seed script after setting up the database
- Re-run if you reset the database
- Use for UI/UX testing and demos

### For Production
- **DO NOT** run this in production
- Use real data collection instead
- This is for development/testing only

### For Demos
- Perfect for showcasing features
- Shows realistic data patterns
- Demonstrates all analytics capabilities

## Next Steps

After seeding:
1. ✅ Test all analytics pages
2. ✅ Verify graphs render correctly
3. ✅ Check real-time updates work
4. ✅ Test different chart types (bar, line, pie, etc.)
5. ✅ Verify KPI badges show correct values
6. ✅ Test period filters (today, 7 days, 30 days)

## Support

If you encounter issues:
1. Check the console output for specific errors
2. Verify database connection
3. Ensure all migrations are run
4. Check that the API server is running

---

**Created**: For comprehensive analytics testing
**Purpose**: Populate all graphs with meaningful dummy data
**Compatibility**: Works with existing real data
