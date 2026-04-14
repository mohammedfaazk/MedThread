# Priority Fix Summary

## Problem Identified ✅
You correctly identified that "Heart Attack" was showing as LOW priority when it should be HIGH priority. This is a critical medical safety issue.

## Root Cause
The priority detection system was working, but:
1. Existing posts in the database didn't have priorities assigned
2. Some posts were created before the priority system was implemented
3. Priority analysis may have failed or not run for some posts

## Solutions Implemented

### 1. Enhanced Priority Keywords ✅
**File**: `apps/api/src/services/post-priority.service.ts`

Added comprehensive emergency keywords:
- **HIGH Priority**: heart attack, cardiac arrest, stroke, seizure, severe chest pain, crushing chest pain, difficulty breathing, unconscious, severe bleeding, suicidal thoughts, overdose, poisoning, anaphylaxis, choking, etc.
- **MEDIUM Priority**: persistent fever, chronic pain, anxiety, depression, infection, worsening symptoms, bleeding, vomiting, etc.
- **LOW Priority**: cold, vitamin questions, exercise advice, diet tips, sleep hygiene, wellness, etc.

### 2. Fix Priority Script ✅
**File**: `apps/api/src/scripts/fix-post-priorities.ts`

Created a script to bulk fix all existing posts:
```bash
cd apps/api
npx tsx src/scripts/fix-post-priorities.ts
```

Features:
- Scans all posts in database
- Identifies posts with wrong priorities
- Re-analyzes using enhanced keywords
- Updates database with correct priorities
- Shows detailed progress and results

### 3. Fix Priority API Endpoints ✅
**File**: `apps/api/src/routes/fix-priorities.routes.ts`

Created API endpoints:
- `POST /api/fix-priorities/post/:id` - Fix single post
- `POST /api/fix-priorities/bulk` - Bulk fix all posts (admin)
- `GET /api/fix-priorities/stats` - Get priority statistics

### 4. UI Fix Priority Button ✅
**File**: `apps/web/src/components/PostCard.tsx`

Added "Fix Priority" button to post menu:
- Available to post authors
- Click three-dot menu → "Fix Priority"
- Re-analyzes post and updates priority
- Shows confirmation with new priority

---

## How to Fix Your Posts

### Option 1: Use the UI (Easiest)
1. Navigate to the "Heart Attack" post
2. Click the three-dot menu (⋮)
3. Click "Fix Priority"
4. Confirm the re-analysis
5. ✅ Post will now show HIGH priority with 🔴 red badge

### Option 2: Run the Script (Fixes All Posts)
```bash
cd apps/api
npx tsx src/scripts/fix-post-priorities.ts
```

This will:
- Find all posts with wrong priorities
- Re-analyze them with enhanced keywords
- Update the database
- Show you what was fixed

### Option 3: Use the API
```bash
# Fix a specific post
curl -X POST http://localhost:3001/api/fix-priorities/post/POST_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Expected Results After Fix

### "Heart Attack" Post:
- ✅ Priority: HIGH (🔴 red badge)
- ✅ Score: 90-100
- ✅ Left border: Red (4px)
- ✅ Position: Top of feed
- ✅ Keywords detected: "heart attack"

### Other Emergency Posts:
- "Chest Pain" → HIGH (🔴)
- "Difficulty Breathing" → HIGH (🔴)
- "Stroke" → HIGH (🔴)
- "Seizure" → HIGH (🔴)
- "Severe Bleeding" → HIGH (🔴)

### Medium Priority Posts:
- "Persistent Fever" → MEDIUM (🟡)
- "Chronic Pain" → MEDIUM (🟡)
- "Anxiety" → MEDIUM (🟡)

### Low Priority Posts:
- "Vitamin D Question" → LOW (🟢)
- "Exercise Advice" → LOW (🟢)
- "Sleep Tips" → LOW (🟢)

---

## Verification Steps

1. **Check the UI**:
   - Navigate to home feed
   - "Heart Attack" should be at the top with 🔴 red badge
   - Posts should be sorted: HIGH → MEDIUM → LOW

2. **Check via API**:
```bash
curl http://localhost:3001/api/v1/posts | jq '.data[] | {title, priority: .priority.priorityLevel}'
```

3. **Check Priority Stats**:
```bash
curl http://localhost:3001/api/fix-priorities/stats
```

---

## Files Modified

### Backend:
1. `apps/api/src/services/post-priority.service.ts` - Enhanced keywords
2. `apps/api/src/routes/fix-priorities.routes.ts` - NEW: Fix priority endpoints
3. `apps/api/src/scripts/fix-post-priorities.ts` - NEW: Bulk fix script
4. `apps/api/src/index.ts` - Added fix-priorities route

### Frontend:
1. `apps/web/src/components/PostCard.tsx` - Added "Fix Priority" button

---

## Prevention for Future Posts

The system now automatically assigns correct priorities to new posts:

1. **On Creation**: Priority analyzed immediately
2. **Groq API**: Uses AI for intelligent analysis
3. **Keyword Fallback**: Uses enhanced keywords if AI fails
4. **Socket Emission**: Broadcasts with correct priority
5. **Real-time Update**: All users see correct priority instantly

---

## Testing

### Test Case 1: Create "Heart Attack" Post
```bash
curl -X POST http://localhost:3001/api/v1/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Heart Attack Emergency",
    "content": "Severe chest pain and difficulty breathing",
    "communityId": "general"
  }'
```

Expected:
- ✅ Priority: HIGH
- ✅ Score: 90-100
- ✅ Badge: 🔴 RED
- ✅ Position: Top of feed

### Test Case 2: Create "Vitamin" Post
```bash
curl -X POST http://localhost:3001/api/v1/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Best Vitamin D Supplements?",
    "content": "Looking for recommendations",
    "communityId": "general"
  }'
```

Expected:
- ✅ Priority: LOW
- ✅ Score: 0-39
- ✅ Badge: 🟢 GREEN
- ✅ Position: Bottom of feed

---

## Summary

✅ **Enhanced priority keywords** - Added 20+ emergency terms
✅ **Created fix script** - Bulk update all posts
✅ **Added API endpoints** - Manual priority fixes
✅ **Added UI button** - Easy fix for post authors
✅ **Improved detection** - Heart attack, stroke, emergencies
✅ **Documented everything** - Complete guides and tests

## Next Steps

1. **Run the fix script** to update all existing posts:
   ```bash
   cd apps/api
   npx tsx src/scripts/fix-post-priorities.ts
   ```

2. **Verify the fix** by checking the UI:
   - "Heart Attack" should show HIGH priority (🔴)
   - Posts should be sorted correctly

3. **Test new posts** to ensure they get correct priorities

---

**The "Heart Attack" post will now correctly show as HIGH priority! 🚨**

All critical medical emergencies will be properly prioritized to ensure patient safety.
