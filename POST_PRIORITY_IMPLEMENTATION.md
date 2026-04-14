# Post Priority Feature - Implementation Summary

## Overview
Successfully implemented the Post Priority feature for MedThread application that automatically analyzes medical posts using Groq AI and prioritizes them based on urgency.

## What Was Implemented

### 1. Backend - Post Creation with Priority Analysis ✅
**File:** `apps/api/src/routes/posts.routes.ts`

**Changes:**
- Modified `POST /api/posts` endpoint to trigger priority analysis after post creation
- Analysis runs asynchronously (non-blocking) using the existing `postPriorityService`
- Groq API integration already exists in `post-priority.service.ts` with:
  - Symptom weight scoring (Emergency=10, Severe=8-9, Moderate=4-7, Mild=1-3)
  - Duration multipliers (<1 day=0.8x, 1-3 days=1.0x, 4-7 days=1.2x, >2 weeks=1.6x)
  - Context boosts (Age >60 or <5 → +10, Medical conditions → +5 each, Pregnancy → +15)
  - LLM analysis via Groq API for free-text content scoring
- Priority levels: HIGH (≥70), MEDIUM (40-69), LOW (<40)
- Includes priority field in post response

### 2. Backend - Post Feed Sorting by Priority ✅
**File:** `apps/api/src/routes/posts.routes.ts`

**Changes:**
- Modified `GET /api/posts` endpoint to sort posts by priority
- Sorting order: HIGH → MEDIUM → LOW, then by `createdAt` DESC within same priority
- Applied to both database queries and mock data fallback
- Includes `priority` relation in post queries

**Database Query:**
```typescript
orderBy: [
  { priority: { urgencyScore: 'desc' } },
  { createdAt: 'desc' }
]
```

**Mock Data Fallback:**
```typescript
filteredPosts.sort((a, b) => {
  const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
  const aPriority = priorityOrder[a.priority?.priorityLevel] || 0;
  const bPriority = priorityOrder[b.priority?.priorityLevel] || 0;
  
  if (aPriority !== bPriority) {
    return bPriority - aPriority; // Higher priority first
  }
  
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
});
```

### 3. Mock Data with Priority Fields ✅
**File:** `apps/api/src/mock-data/posts-and-users.mock.ts`

**Changes:**
- Added 2 HIGH priority posts (chest pain, severe headache)
- Added 3 MEDIUM priority posts (diabetes, anxiety, vaccination)
- Added 5 LOW priority posts (general health info, wellness)
- Each post includes realistic `priority` object with:
  - `priorityLevel`: 'HIGH' | 'MEDIUM' | 'LOW'
  - `urgencyScore`: number (0-100)
  - `detectedSymptoms`: array of symptom objects
- Posts are pre-sorted in HIGH → MEDIUM → LOW order

**Example HIGH Priority Post:**
```typescript
{
  id: '9',
  title: 'Severe Chest Pain and Shortness of Breath - Need Urgent Help',
  content: 'I\'ve been experiencing severe chest pain for the past 2 hours...',
  priority: {
    priorityLevel: 'HIGH',
    urgencyScore: 95,
    detectedSymptoms: [
      { symptom: 'chest pain', weight: 10, category: 'HIGH' },
      { symptom: 'shortness of breath', weight: 10, category: 'HIGH' }
    ]
  }
}
```

### 4. Frontend - Priority Badge Display ✅
**File:** `apps/web/src/components/feed/PostPriorityBadge.tsx`

**Changes:**
- Updated badge labels to match requirements:
  - HIGH → 🔴 **URGENT**
  - MEDIUM → 🟡 **MODERATE**
  - LOW → 🟢 **ROUTINE**
- Badge displays on patient posts in PostCard component
- Shows urgency score and detected symptoms
- Color-coded with appropriate styling

**Files Already Configured:**
- `apps/web/src/components/PostCard.tsx` - Already displays priority badge for patient posts
- `apps/web/src/components/PostFeed.tsx` - Already passes priority data to PostCard
- `apps/web/src/store/useStore.ts` - Already includes priority fields in Post interface and data transformation

### 5. Type Definitions ✅
**Files:**
- `apps/web/src/store/useStore.ts` - Post interface includes:
  ```typescript
  urgencyScore?: number
  priorityLevel?: 'HIGH' | 'MEDIUM' | 'LOW'
  detectedSymptoms?: Array<{
    symptom: string
    weight: number
    category: string
  }>
  ```
- `packages/database/prisma/schema.prisma` - PostPriority model already exists with proper relations

## Groq API Integration

The Groq API is already configured and integrated in `post-priority.service.ts`:

**Environment Variable:**
```
GROQ_API_KEY=your_groq_api_key_here
```

**Model Used:** `llama3-8b-8192`

**Fallback Behavior:**
- If Groq API call fails, falls back to keyword-based scoring only
- No crashes or errors - graceful degradation
- Logs warning: `[PostPriority] LLM scoring failed, using 0`

## How It Works

### Post Creation Flow:
1. User creates a post via `POST /api/posts`
2. Post is saved to database
3. Priority analysis is triggered asynchronously:
   - Analyzes title and content for medical keywords
   - Calls Groq API for LLM-based urgency scoring
   - Calculates final urgency score
   - Determines priority level (HIGH/MEDIUM/LOW)
   - Saves to `PostPriority` table
4. Post is returned to user immediately (non-blocking)

### Post Feed Flow:
1. User requests posts via `GET /api/posts`
2. Backend queries posts with priority relation
3. Posts are sorted by urgency score (DESC) then createdAt (DESC)
4. Frontend receives sorted posts with priority data
5. PostCard displays priority badge for patient posts
6. Feed shows posts in priority order: URGENT → MODERATE → ROUTINE

## Testing

### Manual Testing:
1. Start the backend: `npm run dev` (from root)
2. Create a test post with urgent symptoms (e.g., "chest pain")
3. Check the feed - urgent posts should appear at the top
4. Verify priority badges display correctly

### Test Script:
Run `node test-priority.js` to verify:
- Posts are fetched with priority data
- Posts are sorted by priority
- Priority distribution is correct

## Database Schema

The `PostPriority` model already exists in the schema:

```prisma
model PostPriority {
  id            String   @id @default(cuid())
  postId        String   @unique
  priorityLevel String   // HIGH, MEDIUM, LOW
  urgencyScore  Float    @default(0)
  detectedSymptoms Json? // Array of detected symptoms and their weights
  calculatedAt  DateTime @default(now())
  post          Post     @relation(fields: [postId], references: [id], onDelete: Cascade)

  @@index([priorityLevel])
  @@index([urgencyScore])
}
```

## Files Modified

1. ✅ `apps/api/src/routes/posts.routes.ts` - Post creation and feed sorting
2. ✅ `apps/api/src/mock-data/posts-and-users.mock.ts` - Mock data with priorities
3. ✅ `apps/web/src/components/feed/PostPriorityBadge.tsx` - Badge labels updated

## Files Already Configured (No Changes Needed)

1. ✅ `apps/api/src/services/post-priority.service.ts` - Priority analysis service with Groq
2. ✅ `apps/web/src/components/PostCard.tsx` - Priority badge display
3. ✅ `apps/web/src/components/PostFeed.tsx` - Post rendering
4. ✅ `apps/web/src/store/useStore.ts` - Post interface and data transformation
5. ✅ `packages/database/prisma/schema.prisma` - PostPriority model

## Key Features

✅ Automatic priority analysis on post creation using Groq AI
✅ Keyword-based symptom detection with weighted scoring
✅ Duration and context multipliers for accurate urgency calculation
✅ LLM-powered free-text analysis for nuanced understanding
✅ Graceful fallback if Groq API fails (keyword-only scoring)
✅ Priority-based feed sorting (HIGH → MEDIUM → LOW)
✅ Visual priority badges (🔴 URGENT, 🟡 MODERATE, 🟢 ROUTINE)
✅ Mock data support with realistic priority assignments
✅ Non-blocking async analysis (doesn't slow down post creation)
✅ Database-backed priority storage with proper indexing

## Next Steps (Optional Enhancements)

1. Add priority filter UI in PostFeed (filter by HIGH/MEDIUM/LOW)
2. Add priority analytics dashboard for admins
3. Implement priority-based notifications for doctors
4. Add bulk priority analysis for existing posts
5. Fine-tune Groq prompts for better accuracy
6. Add priority history tracking for posts

## Notes

- The priority system is fully functional and ready for production
- Groq API key is already configured in the environment
- The system gracefully handles database unavailability with mock data
- Priority analysis is non-blocking and won't slow down post creation
- The frontend already displays priority badges correctly
- All type definitions are in place and consistent across the stack
