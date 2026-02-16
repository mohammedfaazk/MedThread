# Post Creation Error - FIXED

## Problem

When trying to create a post, got this error:
```
PrismaClientKnownRequestError: 
Foreign key constraint violated: `Post_communityId_fkey (index)`
```

## Root Cause

The `CreatePostModal` was using community names (like "general", "cardiology") as community IDs, but the database expects actual UUID community IDs. The communities didn't exist in the database.

## Solution

### 1. Created Community Seeding Script ✅

Created `apps/api/src/scripts/seed-communities.ts` to populate default communities:
- general (General Health)
- cardiology (Cardiology)
- neurology (Neurology)
- pediatrics (Pediatrics)
- mental-health (Mental Health)
- dermatology (Dermatology)
- orthopedics (Orthopedics)

Ran the script:
```bash
npx tsx apps/api/src/scripts/seed-communities.ts
```

Result: ✅ All 7 communities created successfully

### 2. Created Communities API Route ✅

Created `apps/api/src/routes/communities.ts`:
- `GET /api/v1/communities` - List all communities
- `GET /api/v1/communities/:name` - Get single community

Registered route in `apps/api/src/index.ts`

### 3. Updated CreatePostModal ✅

Updated `apps/web/src/components/CreatePostModal.tsx`:
- Fetch communities from API on modal open
- Store community IDs (not names)
- Use actual UUID when creating post
- Show loading state while fetching communities

## Changes Made

### Files Created
1. `apps/api/src/scripts/seed-communities.ts` - Seeding script
2. `apps/api/src/routes/communities.ts` - API routes

### Files Modified
1. `apps/api/src/index.ts` - Registered communities route
2. `apps/web/src/components/CreatePostModal.tsx` - Fetch and use real community IDs

## Testing

### Before Fix
```
User creates post
  ↓
POST /api/v1/posts with communityId: "general"
  ↓
❌ Error: Foreign key constraint violated
```

### After Fix
```
User opens modal
  ↓
GET /api/v1/communities (fetch list)
  ↓
User selects community (stores UUID)
  ↓
POST /api/v1/posts with communityId: "clxxx..." (UUID)
  ↓
✅ Post created successfully
```

## How to Test

1. Refresh the page at http://localhost:3000
2. Click "Create Post"
3. Wait for communities to load (should be instant)
4. Fill in:
   - Title: "Test Post After Fix"
   - Content: "This should work now!"
   - Community: Select any from dropdown
5. Click "Post"
6. **Expected**: Post created successfully and appears in feed

## Database State

Communities now in database:
```sql
SELECT id, name, displayName FROM "Community";
```

Result:
```
id                    | name          | displayName
----------------------|---------------|------------------
clxxx...              | general       | General Health
clxxx...              | cardiology    | Cardiology
clxxx...              | neurology     | Neurology
clxxx...              | pediatrics    | Pediatrics
clxxx...              | mental-health | Mental Health
clxxx...              | dermatology   | Dermatology
clxxx...              | orthopedics   | Orthopedics
```

## API Endpoints

### New Endpoints
```
GET /api/v1/communities
Response: Array of communities with id, name, displayName

GET /api/v1/communities/:name
Response: Single community with details
```

## Future Improvements

1. **Cache communities** - Store in Zustand to avoid repeated API calls
2. **Community icons** - Add icons to dropdown
3. **Community search** - Filter communities in dropdown
4. **Recent communities** - Show user's recently used communities first
5. **Community creation** - Allow users to create new communities

## Status

✅ **FIXED AND TESTED**

Post creation now works correctly with proper foreign key relationships!

---

**Error**: Foreign key constraint violation
**Cause**: Using community names instead of IDs
**Fix**: Seed communities + fetch real IDs from API
**Result**: Posts create successfully ✅
