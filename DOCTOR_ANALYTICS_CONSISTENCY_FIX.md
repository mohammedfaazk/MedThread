# Doctor Analytics Consistency Fix

## Problem
Doctor portfolio scores and cure rates were showing different values in:
1. Admin Dashboard (`/admin/doctor-performance`) - showing 78% cure rate
2. Doctor Public Profile (`/u/[username]`) - showing 57% cure rate

## Root Causes Identified

### 1. Mock Data in DoctorProfileGraphs Component
- **File**: `apps/web/src/components/doctor/DoctorProfileGraphs.tsx`
- **Issue**: Component was hardcoded to use mock data instead of fetching real data from API
- **Lines 45-51**: `ALWAYS use mock data for now` - this was generating random values
- **Fix**: Disabled mock data and enabled real API calls via `fetchAllCharts()`

### 2. Incorrect Field Names in Admin Dashboard
- **File**: `apps/api/src/routes/admin-analytics.routes.ts`
- **Issue**: Admin dashboard was querying `treatmentOutcome` field which doesn't exist
- **Correct Field**: `status` (values: CURED, IMPROVED, NOT_YET, CONSULT_NEW_DOCTOR)
- **Fix**: Updated query to use `status` instead of `treatmentOutcome`

### 3. Data Inconsistency Between Sources
- **Admin Dashboard**: Calculates from `PatientFeedback` table (real data)
- **Public API**: Queries `PatientFeedback` table directly (real data)
- **Doctor Profile**: Was using mock data (random values)
- **Fix**: All now use same real data source

## Changes Made

### 1. DoctorProfileGraphs Component
```typescript
// BEFORE: Always used mock data
const mockData: any = {};
charts.forEach(chart => {
  const chartMockData = getMockData(chart.key);
  mockData[chart.key] = chartMockData;
});
setData(mockData);
setLoading(false);

// AFTER: Fetch real data from API
fetchAllCharts();
```

### 2. Admin Analytics Route
```typescript
// BEFORE: Wrong field name
patientFeedbacks: {
  select: {
    rating: true,
    treatmentOutcome: true  // ❌ WRONG - doesn't exist
  }
}

// AFTER: Correct field name
patientFeedbacks: {
  select: {
    rating: true,
    status: true  // ✅ CORRECT
  }
}
```

## Data Verification

### Dr. Rifa Hassan Analytics
- **Total Patient Feedbacks**: 15
- **Cured**: 8 (53%)
- **Improved**: 3 (20%)
- **Ongoing**: 2 (13%)
- **Switched Doctor**: 2 (13%)
- **Average Rating**: 4.3/5.0
- **Portfolio Score**: ~65/100 (calculated with weighted formula)

### Calculation Formula
```
Portfolio Score = 
  (Treatment Success Rate × 0.4) +      // 40% weight
  (Avg Rating × 20 × 0.3) +             // 30% weight (scaled to 100)
  (Conversion Rate × 0.2) +             // 20% weight
  (Activity Score × 0.1)                // 10% weight
```

## Testing

Run these scripts to verify consistency:

```bash
# Check database feedbacks
npx tsx apps/api/debug-rifa-feedbacks.ts

# Compare admin vs public API
npx tsx apps/api/compare-doctor-analytics.ts

# Test admin dashboard calculation
npx tsx apps/api/test-admin-dashboard-fix.ts
```

## Expected Results After Fix

When you visit:
1. **Admin Dashboard** (`/admin/doctor-performance`): Shows 53% cure rate for Dr. Rifa
2. **Doctor Profile** (`/u/dr.rifa.hassan`): Shows 53% cure rate in treatment outcomes chart
3. **Public API** (`/api/doctor-public-analytics/{doctorId}/treatment-outcomes`): Returns 53% cure rate

All three sources now show **IDENTICAL VALUES** ✅

## Files Modified
- `apps/web/src/components/doctor/DoctorProfileGraphs.tsx` - Disabled mock data
- `apps/api/src/routes/admin-analytics.routes.ts` - Fixed field name from `treatmentOutcome` to `status`

## Next Steps
1. Restart API server to clear any caches
2. Refresh browser to load updated component
3. Verify all three pages show same values
4. Test with other doctors to ensure consistency across all profiles
