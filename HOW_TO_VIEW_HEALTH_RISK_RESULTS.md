# How to View Health Risk Assessment Results

## The Issue
After submitting the health assessment, you saw "Success" in the console but couldn't see the results on the page.

## What Was Wrong
1. The page was fetching from the wrong API endpoint (`/api/v1/health-risk/assessment/` instead of `/api/health-risk/predictions/`)
2. The RiskDashboard component was also using the wrong endpoint
3. No visual feedback was shown after successful submission

## What I Fixed
✅ Updated the health-risk page to fetch predictions from the correct endpoint
✅ Updated the RiskDashboard component to use the correct API endpoint
✅ Added a success alert that shows how many predictions were generated
✅ Added better error handling and logging

## How to View Your Results Now

### Step 1: Refresh the Page
After submitting the assessment, the page should automatically refresh and show your results. If it doesn't:

1. Go to `http://localhost:3000/health-risk`
2. Press `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac) to hard refresh

### Step 2: What You'll See

After a successful assessment, you should see:

1. **Success Alert**: A popup showing "✅ Assessment Complete! X risk predictions generated."

2. **Risk Dashboard**: The page will automatically reload and display:
   - Risk cards for each disease (Diabetes, Heart Disease, Hypertension, Stroke)
   - Risk level badges (LOW, MODERATE, HIGH, CRITICAL)
   - Risk percentages
   - Charts showing your risk timeline
   - Prevention recommendations

### Step 3: Understanding Your Results

Each risk prediction shows:

```
┌─────────────────────────────────────────┐
│ 🫀 Type 2 Diabetes                      │
│                                         │
│ Risk Level: HIGH (33%)                  │
│ Timeframe: 10 years                     │
│ Algorithm: FINDRISC (85% confidence)    │
│                                         │
│ Top Risk Factors:                       │
│ • BMI > 30 (Obese)                      │
│ • Waist circumference > 102 cm          │
│ • Family history of diabetes            │
│                                         │
│ Prevention Plan:                        │
│ • Lose 5-7% body weight → 58% reduction │
│ • Exercise 150 min/week → 40% reduction │
│ • Reduce sugar intake → 25% reduction   │
└─────────────────────────────────────────┘
```

## If You Still Don't See Results

### Option 1: Check Browser Console
1. Press `F12` to open Developer Tools
2. Go to the "Console" tab
3. Look for messages like:
   - `[Health Assessment] Success:` - Shows the assessment was saved
   - `[RiskDashboard] Predictions data:` - Shows predictions were fetched
   - Any error messages in red

### Option 2: Check Network Tab
1. Press `F12` to open Developer Tools
2. Go to the "Network" tab
3. Refresh the page
4. Look for a request to `/api/health-risk/predictions/YOUR_USER_ID`
5. Click on it and check the "Response" tab to see the predictions data

### Option 3: Manually Fetch Your Predictions

Open the browser console (`F12`) and run:

```javascript
const token = localStorage.getItem('auth_token');
const userId = JSON.parse(localStorage.getItem('user')).id;

fetch(`http://localhost:3001/api/health-risk/predictions/${userId}`, {
  headers: { 'Authorization': `Bearer ${token}` }
})
.then(r => r.json())
.then(data => console.log('Your predictions:', data));
```

This will show your predictions in the console.

## Expected Data Structure

Your predictions should look like this:

```json
{
  "success": true,
  "predictions": [
    {
      "riskType": "TYPE_2_DIABETES",
      "disease": "Type 2 Diabetes",
      "riskScore": 33,
      "riskLevel": "HIGH",
      "riskPercentage": 33,
      "timeframe": "10_YEARS",
      "algorithm": "FINDRISC",
      "confidence": 85,
      "factors": [
        {
          "factor": "BMI > 30 (Obese)",
          "impact": "HIGH",
          "contribution": 15
        }
      ],
      "preventionPlan": [
        {
          "action": "Lose 5-7% of body weight",
          "expectedBenefit": "58% risk reduction",
          "evidence": "Diabetes Prevention Program (DPP) study"
        }
      ],
      "predictedAt": "2026-04-20T16:43:15.123Z",
      "validUntil": "2027-04-20T16:43:15.123Z"
    }
  ]
}
```

## Troubleshooting

### "No predictions found"
- Make sure you completed all 5 steps of the assessment
- Check that you entered valid values (numbers for height, weight, etc.)
- Try submitting the assessment again

### "Failed to fetch predictions"
- Make sure the API server is running on port 3001
- Check that you're logged in (token exists in localStorage)
- Check the browser console for error messages

### Page shows "No Assessment Yet"
- This means no predictions were found in the database
- Try submitting the assessment again
- Check the browser console for errors during submission

## Quick Test

To quickly test if everything is working:

1. Go to `http://localhost:3000/health-risk`
2. Click "Start Assessment"
3. Fill in the form with these test values:
   - Age: 58
   - Gender: Male
   - Height: 175 cm
   - Weight: 95 kg
   - Waist: 105 cm
   - Blood Pressure: 145/92
   - Blood Sugar: 115
   - Cholesterol: 240
   - HDL: 38
   - LDL: 160
   - Triglycerides: 200
   - Smoking: Former
   - Activity: Sedentary
   - Family History: Check "Diabetes" and "Heart Disease"
4. Click through all steps and submit
5. You should see an alert: "✅ Assessment Complete! 4 risk predictions generated."
6. Click OK
7. The page should reload and show your Risk Dashboard with 4 predictions

## Summary

The fixes ensure that:
1. ✅ Assessment data is saved correctly
2. ✅ Predictions are calculated using clinical algorithms
3. ✅ Predictions are stored in the database
4. ✅ The page fetches predictions from the correct endpoint
5. ✅ Results are displayed in the Risk Dashboard
6. ✅ You get visual feedback when the assessment is complete

Your health risk assessment feature is now fully functional!
