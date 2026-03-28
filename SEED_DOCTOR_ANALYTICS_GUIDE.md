# Seed Doctor Analytics Data - Quick Guide

## Purpose
Add mock analytics data for Dr. dr.rifa.hassan to populate the Performance Overview carousel with meaningful charts.

## What Data Gets Created

### 1. Treatment Outcomes (80 records)
- **Cured**: 45 patients (56% cure rate)
- **Ongoing Treatment**: 28 patients
- **Switched Doctor**: 7 patients
- Distributed over last 6 months

### 2. Posts Over Time (138 posts)
- Monthly distribution over 12 months
- Range: 8-16 posts per month
- Creates line/bar chart data

### 3. Comments Over Time (331 comments)
- Monthly distribution over 12 months
- Range: 20-35 comments per month
- Shows engagement trends

### 4. Conversion Rate (571 conversions)
- Monthly conversion tracking
- Average: 65-75% conversion rate
- Shows patient engagement effectiveness

### 5. Patients Cured
- Extracted from treatment outcomes
- Monthly cure trends
- Shows treatment success over time

### 6. Clinic Visits
- Extracted from patient feedback
- ~50% of patients had clinic visits
- Monthly visit patterns

### 7. Portfolio Score
- Overall score: 87.5/100
- Response time: 15 minutes
- Patient satisfaction: 4.6/5
- Treatment success rate: 92.3%

## How to Run

### Option 1: Using ts-node
```bash
cd apps/api
npx ts-node seed-rifa-analytics.ts
```

### Option 2: Using tsx
```bash
cd apps/api
npx tsx seed-rifa-analytics.ts
```

### Option 3: Compile and run
```bash
cd apps/api
npx tsc seed-rifa-analytics.ts
node seed-rifa-analytics.js
```

## Expected Output

```
🌱 Seeding analytics data for Dr. dr.rifa.hassan...

✅ Found doctor: dr.rifa.hassan (ID: abc123...)

📊 Creating treatment outcomes...
✅ Treatment outcomes created

📝 Creating posts...
✅ Posts created

💬 Creating comments...
✅ Comments created

📈 Creating conversion data...
✅ Conversion data created

🏆 Creating portfolio score...
✅ Portfolio score created

✨ Analytics data seeding complete!

📊 Summary:
   - Treatment Outcomes: ~80 records
   - Posts: ~138 records over 12 months
   - Comments: ~331 records over 12 months
   - Conversions: ~571 records over 12 months
   - Portfolio Score: 87.5/100

✅ You can now view the Performance Overview on the doctor profile!
```

## Verification

After running the script, visit:
```
http://localhost:3000/u/dr.rifa.hassan
```

Scroll down to the "Performance Overview" section and you should see:
- 7 slides with charts
- Each chart showing meaningful data
- Chart type toggles working
- Navigation arrows and pagination dots

## Chart Examples

### Slide 1: Treatment Outcomes
- Pie/Doughnut chart showing:
  - Cured: 45 (56%)
  - Ongoing: 28 (35%)
  - Switched: 7 (9%)
- KPI: "56% Cure Rate"

### Slide 2: Posts Over Time
- Line/Bar chart showing monthly posts
- KPI: "138 Total Posts"
- Trend: Consistent posting activity

### Slide 3: Comments Over Time
- Line/Bar chart showing monthly comments
- KPI: "331 Total Comments"
- Trend: Active engagement

### Slide 4: Conversion Rate
- Line chart showing monthly conversion %
- KPI: "70% Avg Conversion"
- Trend: Stable conversion rates

### Slide 5: Patients Cured
- Bar chart showing monthly cures
- KPI: "45 Patients Cured"
- Trend: Consistent treatment success

### Slide 6: Clinic Visits
- Bar chart showing monthly visits
- KPI: "40 Total Visits"
- Trend: Regular clinic attendance

### Slide 7: Portfolio Score
- Line chart showing score history
- KPI: "Current Score: 88/100"
- Trend: Improving performance

## Troubleshooting

### Doctor Not Found
If the script can't find dr.rifa.hassan, it will:
1. Search for alternative usernames (dr_rifa_hassan)
2. Search by email containing "rifa"
3. Use any available doctor
4. Report if no doctors exist

### Schema Errors
The script uses try-catch blocks to handle:
- Missing tables
- Different field names
- Constraint violations

It will skip problematic records and continue.

### No Community Found
If no community exists for posts:
- Posts section will be skipped
- Other data will still be created
- Create a community first if needed

## Data Cleanup

To remove the seeded data:
```sql
-- Delete patient feedback
DELETE FROM "PatientFeedback" WHERE "doctorId" = 'doctor-id-here';

-- Delete posts
DELETE FROM "Post" WHERE "authorId" = 'doctor-id-here';

-- Delete comments
DELETE FROM "Comment" WHERE "authorId" = 'doctor-id-here';

-- Delete conversions
DELETE FROM "CommentConversion" WHERE "doctorId" = 'doctor-id-here';

-- Delete performance
DELETE FROM "DoctorPerformance" WHERE "doctorId" = 'doctor-id-here';
```

Or run the script again - it will add more data on top.

## Customization

To adjust the data amounts, edit these values in the script:

```typescript
// Treatment outcomes
{ status: 'CURED', count: 45 },      // Change count
{ status: 'NOT_YET', count: 28 },
{ status: 'SWITCHED_DOCTOR', count: 7 }

// Posts per month
const count = Math.floor(Math.random() * 8) + 8;  // 8-16 posts

// Comments per month
const count = Math.floor(Math.random() * 15) + 20; // 20-35 comments

// Conversion rate
const converted = Math.floor(total * (0.65 + Math.random() * 0.15)); // 65-80%

// Portfolio score
portfolioScore: 87.5,  // Change score
```

## Files Created

1. **apps/api/seed-rifa-analytics.ts** - Main seeding script
2. **apps/api/seed-doctor-analytics-data.ts** - Alternative version

## Next Steps

After seeding:
1. Refresh the doctor profile page
2. Navigate through all 7 slides
3. Test chart type toggles
4. Verify data displays correctly
5. Check mobile responsiveness

## Notes

- Data is randomly distributed over time periods
- Dates are backdated to create historical trends
- All data is for demonstration purposes
- Safe to run multiple times (adds more data)
- No real patient data is used

---

**Quick Command**:
```bash
cd apps/api && npx tsx seed-rifa-analytics.ts
```

Then visit: `http://localhost:3000/u/dr.rifa.hassan`
