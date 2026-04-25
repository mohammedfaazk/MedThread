# Health Risk Assessment Persistence - FIXED ✅

## Problem
Health risk assessment data was not persisting after app restart. Users had to retake the assessment every time.

## Root Cause
The frontend was ONLY checking for risk predictions, not the actual assessment data. The assessment data WAS being saved to the database correctly, but the UI wasn't retrieving it.

## What Was Happening

### Backend (Working Correctly) ✅
1. User submits assessment via `/api/health-risk/assess`
2. `saveHealthAssessment()` saves data to `PatientHealthProfile` table using `prisma.upsert()`
3. Data is persisted in database permanently
4. Risk predictions are also generated and saved

### Frontend (Bug) ❌
1. Page only fetched predictions: `/api/health-risk/predictions/${userId}`
2. Did NOT fetch assessment data: `/api/health-risk/assessment/${userId}`
3. Only showed dashboard if predictions existed
4. If predictions were empty/failed, showed "No Assessment Yet" even though assessment data existed

## The Fix

### Updated `apps/web/src/app/health-risk/page.tsx`

#### Before:
```typescript
// Only fetched predictions
const response = await fetch(`${apiUrl}/api/health-risk/predictions/${user?.id}`);
const data = await response.json();
setRiskData(data);

// Only showed dashboard if predictions exist
{riskData && riskData.predictions && riskData.predictions.length > 0 ? (
  <RiskDashboard />
) : (
  <div>No Assessment Yet</div>
)}
```

#### After:
```typescript
// Fetch BOTH predictions AND assessment data
const [predictionsResponse, assessmentResponse] = await Promise.all([
  fetch(`${apiUrl}/api/health-risk/predictions/${user?.id}`),
  fetch(`${apiUrl}/api/health-risk/assessment/${user?.id}`)
]);

// Parse both responses
let predictions = null;
let assessment = null;

if (predictionsResponse.ok) {
  const predData = await predictionsResponse.json();
  predictions = predData.predictions;
}

if (assessmentResponse.ok) {
  const assessData = await assessmentResponse.json();
  assessment = assessData.assessment;
}

// Set data if EITHER exists
if (predictions || assessment) {
  setRiskData({ predictions, assessment });
}

// Show dashboard if EITHER predictions OR assessment exists
{riskData && (riskData.predictions?.length > 0 || riskData.assessment) ? (
  <RiskDashboard />
) : (
  <div>No Assessment Yet</div>
)}
```

## How It Works Now

1. **User submits assessment**
   - Data saved to `PatientHealthProfile` table
   - Risk predictions generated and saved to `HealthRiskPrediction` table

2. **User refreshes page or restarts app**
   - Frontend fetches BOTH predictions AND assessment
   - Shows dashboard if EITHER exists
   - Assessment data persists permanently

3. **Data Persistence**
   - Assessment data: Stored in `PatientHealthProfile.secondaryHealthConcerns` (JSON field)
   - Includes: age, gender, BMI, blood pressure, cholesterol, lifestyle factors, etc.
   - Risk predictions: Stored in `HealthRiskPrediction` table
   - Both persist across app restarts

## Database Schema

### PatientHealthProfile
```prisma
model PatientHealthProfile {
  id                      String   @id @default(cuid())
  userId                  String   @unique
  ageGroup                String?
  biologicalSex           String?
  smokingStatus           String?
  alcoholConsumption      String?
  activityLevel           String?
  preExistingConditions   String[]
  currentMedications      String[]
  secondaryHealthConcerns Json?    // ← Assessment data stored here
  completedAt             DateTime?
  lastUpdatedAt           DateTime?
}
```

### HealthRiskPrediction
```prisma
model HealthRiskPrediction {
  id          String   @id @default(cuid())
  userId      String
  riskType    String   // "Type 2 Diabetes", "Cardiovascular Disease", etc.
  riskScore   Float    // 0-100
  timeframe   String   // "10_YEAR_RISK", "5_YEAR_RISK", etc.
  factors     Json     // Contributing factors
  predictedAt DateTime @default(now())
}
```

## Testing

1. **Submit Assessment**
   - Go to `/health-risk`
   - Click "Start Assessment"
   - Fill out all 5 steps
   - Submit

2. **Verify Persistence**
   - Refresh the page → Should show dashboard
   - Stop and restart the app → Should still show dashboard
   - Check database → Data should be in `PatientHealthProfile` table

3. **Check Database Directly**
   ```sql
   SELECT * FROM "PatientHealthProfile" WHERE "userId" = 'your-user-id';
   SELECT * FROM "HealthRiskPrediction" WHERE "userId" = 'your-user-id';
   ```

## Files Modified

1. `apps/web/src/app/health-risk/page.tsx`
   - Updated `fetchRiskData()` to fetch both predictions AND assessment
   - Updated conditional rendering to check for either predictions OR assessment

## Result

✅ Health risk assessment data now persists permanently
✅ Dashboard shows even if only assessment exists (no predictions)
✅ Data survives app restarts
✅ Users don't need to retake assessment
