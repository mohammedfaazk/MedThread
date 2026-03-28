# Mock Data Debug Guide

## Changes Made

I've updated the `DoctorProfileGraphs` component with:

1. **Enhanced Console Logging**: Added emoji-prefixed logs to easily spot in console
2. **Visual Indicator**: Added a green "📊 Mock Data Active" badge at the top
3. **Cleared Next.js Cache**: Removed the `.next` build folder

## How to See the Changes

### Step 1: Hard Refresh Your Browser
Since the `.next` cache has been cleared, you need to do a HARD refresh:

**Windows (Chrome/Edge/Firefox):**
- Press `Ctrl + Shift + R` OR
- Press `Ctrl + F5` OR
- Open DevTools (F12), right-click the refresh button, select "Empty Cache and Hard Reload"

### Step 2: Check Browser Console
Open the browser console (F12) and look for these logs:

```
🔥 [DoctorProfileGraphs] Component loaded! Version: 2.0 - MOCK DATA ENABLED
🎯 [DoctorProfileGraphs] Loading mock data for doctor: [doctor-id]
📊 [DoctorProfileGraphs] Mock data for treatmentOutcomes: {...}
📊 [DoctorProfileGraphs] Mock data for postsOverTime: {...}
... (more logs for each metric)
✅ [DoctorProfileGraphs] All mock data loaded: {...}
```

### Step 3: Look for Visual Indicator
At the top of the "Performance Overview" section, you should see:
- A green badge that says "📊 Mock Data Active"

### Step 4: Check the Data
Each metric should now show:
- **Treatment Outcomes**: 156 patients (73% cure rate) with 3 categories
- **Posts Over Time**: 142 total posts across 12 months
- **Comments Over Time**: 348 total comments across 12 months
- **Conversion Rate**: 74% average across 12 months
- **Patients Cured**: 156 patients across 12 months
- **Clinic Visits**: 89 visits across 12 months
- **Portfolio Score**: 88/100 with growth trend

## If You Still Don't See Changes

### Option 1: Restart the Dev Server
```bash
# Stop the current dev server (Ctrl+C in the terminal)
# Then restart it
cd apps/web
npm run dev
```

### Option 2: Clear Browser Cache Completely
1. Open DevTools (F12)
2. Go to Application tab (Chrome) or Storage tab (Firefox)
3. Click "Clear site data" or "Clear storage"
4. Refresh the page

### Option 3: Try Incognito/Private Window
Open the page in an incognito/private browsing window to bypass all caching.

## What the Mock Data Contains

### Treatment Outcomes (Pie/Doughnut Chart)
- Cured: 156 patients (73%)
- Ongoing Treatment: 48 patients (22%)
- Switched Doctor: 10 patients (5%)

### Posts Over Time (12 months)
Monthly posts: 8, 12, 15, 11, 14, 13, 10, 16, 12, 11, 10, 10
Total: 142 posts

### Comments Over Time (12 months)
Monthly comments: 22, 28, 35, 30, 32, 29, 25, 33, 31, 27, 28, 28
Total: 348 comments

### Conversion Rate (12 months)
Monthly rates: 68%, 72%, 75%, 71%, 76%, 78%, 73%, 77%, 75%, 74%, 76%, 79%
Average: 74%

### Patients Cured (12 months)
Monthly cured: 10, 14, 16, 12, 15, 13, 11, 14, 13, 12, 13, 13
Total: 156 patients

### Clinic Visits (12 months)
Monthly visits: 6, 8, 9, 7, 8, 7, 6, 9, 8, 7, 7, 7
Total: 89 visits

### Portfolio Score (12 months)
Monthly scores: 75, 77, 79, 80, 82, 83, 84, 85, 86, 87, 87, 88
Current: 88/100

## URL to Test
http://localhost:3000/u/dr.rifa.hassan

## Expected Result
You should see rich, meaningful graphs with multiple data points for each metric, not just 1-2 data points.
