# Health Risk Assessment - Quick Test Guide

## ✅ What Was Fixed

1. **API Endpoint Mismatch** - Frontend now calls correct endpoint `/api/health-risk/assess`
2. **Data Persistence** - Confirmed working (saves to `PatientHealthProfile.secondaryHealthConcerns`)
3. **Graph Display** - RiskDashboard uses Chart.js to show risk timeline

## 🧪 Manual Testing Steps

### Step 1: Start the Application
```bash
# Terminal 1 - Start API server
cd apps/api
npm run dev

# Terminal 2 - Start Web server
cd apps/web
npm run dev
```

### Step 2: Login
1. Go to http://localhost:3000
2. Login with existing user:
   - Email: `navin@example.com`
   - Password: `password123`

### Step 3: Take Health Risk Assessment
1. Navigate to "Health Risk Assessment" page
2. Click "Start Assessment" button
3. Fill out all 5 steps:

**Step 1 - Basic Info:**
- Age: 45
- Gender: Male
- Height: 175 cm
- Weight: 85 kg
- Waist: 95 cm (optional but recommended)

**Step 2 - Vital Signs:**
- Blood Pressure: 135/85
- Blood Sugar: 105 mg/dL
- Cholesterol: 220 mg/dL
- HDL: 45 mg/dL
- LDL: 140 mg/dL

**Step 3 - Lifestyle:**
- Smoking: Former
- Alcohol: Moderate
- Activity: Light

**Step 4 - Family History:**
- Check: Diabetes, Heart Disease

**Step 5 - Current Conditions:**
- Leave empty or check any current conditions
- Check "Taking BP Medication" if applicable

4. Click "Complete Assessment"
5. You should see an alert: "✅ Assessment Complete! X risk predictions generated"

### Step 4: View Results
After submission, you should see:

1. **Overall Risk Score** - Average of all predictions
2. **Risk Level Counts** - High/Medium/Low risk conditions
3. **Risk Timeline Graph** - Line chart showing risk progression over time
4. **Risk Cards** - Individual cards for each disease with:
   - Disease name (e.g., "Type 2 Diabetes")
   - Risk percentage (e.g., "17%")
   - Risk level badge (LOW/MODERATE/HIGH/CRITICAL)
   - Color-coded progress bar
   - Top 2 prevention tips
   - "View Details" button

5. Click any risk card to see:
   - Full prevention strategies
   - All risk factors
   - Options to find specialists or schedule checkup

### Step 5: Test Data Persistence
1. **Refresh the page** - Data should still be there
2. **Stop both servers** (Ctrl+C in both terminals)
3. **Restart servers** - Data should still be there
4. **Login again** - Navigate to Health Risk page - Data should still be there

## 🔍 Verify in Database

### Option 1: Using Prisma Studio
```bash
cd apps/api
npx prisma studio
```
1. Open `PatientHealthProfile` table
2. Find your user's record
3. Check `secondaryHealthConcerns` field
4. You should see JSON with:
   - `age`, `bmi`, `bloodPressure`, etc.
   - `predictions` array with risk data

### Option 2: Using Database Client
Connect to your PostgreSQL database and run:
```sql
SELECT 
  "userId",
  "secondaryHealthConcerns"
FROM "PatientHealthProfile"
WHERE "userId" = 'your-user-id';
```

Look for predictions in the JSON:
```json
{
  "predictions": [
    {
      "disease": "Type 2 Diabetes",
      "riskScore": 17,
      "riskLevel": "MODERATE",
      "timeframe": "10_YEAR_RISK",
      "predictedAt": "2026-04-21T...",
      "validUntil": "2027-04-21T..."
    }
  ]
}
```

## 📊 Expected Results

### Risk Predictions You Should See:
1. **Type 2 Diabetes** - Based on FINDRISC algorithm
2. **Cardiovascular Disease** - Based on Framingham Risk Score
3. **Stroke** - Based on Framingham Stroke Risk Profile
4. **Hypertension** - Based on JNC-8 Guidelines

### Risk Levels:
- **LOW** (Green): < 10% risk
- **MODERATE** (Yellow): 10-20% risk
- **HIGH** (Orange): 20-30% risk
- **CRITICAL** (Red): > 30% risk

### Graph Display:
- Line chart with multiple colored lines
- X-axis: Time (Now, 3 Months, 6 Months, 1 Year, 2 Years, 5 Years)
- Y-axis: Risk percentage (0-100%)
- Each disease has its own colored line
- Filled area under curves

## ✅ Success Criteria

- [ ] Assessment form submits without errors
- [ ] Success alert shows with prediction count
- [ ] Risk dashboard displays with graphs
- [ ] At least 2-4 risk predictions shown
- [ ] Risk cards are color-coded correctly
- [ ] Clicking card opens detailed modal
- [ ] Data persists after page refresh
- [ ] Data persists after server restart

## 🐛 Troubleshooting

### Issue: "Failed to fetch predictions"
**Check:**
1. API server is running on port 3001
2. User is logged in (check localStorage for `auth_token`)
3. Browser console for errors

### Issue: No graphs showing
**Check:**
1. At least one prediction exists
2. Predictions have `riskScore` or `riskPercentage` field
3. Browser console for Chart.js errors
4. Chart.js is installed: `npm list chart.js react-chartjs-2`

### Issue: Data disappears after restart
**Check:**
1. Database connection is working
2. `secondaryHealthConcerns` field exists in schema
3. Predictions have valid `validUntil` dates (not expired)

### Issue: Assessment submission fails
**Check:**
1. All required fields are filled (marked with *)
2. API endpoint is `/api/health-risk/assess` (not `/api/v1/...`)
3. User ID is being passed correctly
4. Auth token is valid

## 📝 Notes

- Predictions are valid for 6-12 months depending on timeframe
- Expired predictions are automatically filtered out
- Each disease only keeps the latest prediction
- Risk scores are calculated using clinically validated algorithms
- Prevention plans include evidence-based recommendations with clinical trial references

## 🎉 Success!

If you can:
1. ✅ Submit assessment
2. ✅ See graphs and risk cards
3. ✅ Data persists after refresh/restart

Then the Health Risk Assessment feature is working perfectly!
