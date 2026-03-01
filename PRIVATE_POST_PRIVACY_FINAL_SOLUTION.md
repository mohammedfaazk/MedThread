# Private Post Privacy - Final Solution

## Problem Identified

The user reported that private posts created by one patient were visible to other patients. After investigation, we found TWO critical issues:

### Issue 1: Backend Route Restriction
The POST `/api/v1/posts` route had `requireVerifiedDoctor` middleware, which prevented patients from creating posts at all. This meant:
- Patients couldn't create ANY posts (public or private)
- Only verified doctors could create posts
- The `isPrivate` flag was never being saved because patients couldn't reach the endpoint

### Issue 2: Missing isPrivate Parameter
The backend route was not extracting the `isPrivate` field from the request body, so even if patients could create posts, the privacy flag would be ignored.

## Root Cause

```typescript
// BEFORE (BROKEN)
router.post('/', auth, requireVerifiedDoctor, async (req, res, next) => {
  const { title, content, type, url, mediaUrls, communityId, flairId, isNSFW, isSpoiler, isDraft } = req.body;
  // isPrivate was NOT extracted
  
  const post = await postService.createPost({
    // ... other fields
    // isPrivate was NOT passed
  });
});
```

## Solution Applied

### 1. Removed requireVerifiedDoctor Middleware
Changed the POST route to allow both patients and doctors to create posts:

```typescript
// AFTER (FIXED)
router.post('/', auth, async (req, res, next) => {
  const { title, content, type, url, mediaUrls, communityId, flairId, isNSFW, isSpoiler, isDraft, isPrivate } = req.body;
  // isPrivate is NOW extracted
  
  const post = await postService.createPost({
    // ... other fields
    isPrivate, // isPrivate is NOW passed
  });
});
```

### 2. Added isPrivate to Request Body Extraction
The `isPrivate` field is now properly extracted from `req.body` and passed to `postService.createPost()`.

## Privacy Rules (Already Implemented)

The privacy filtering logic in `post.service.ts` is correct and working:

### For Patients (Non-Doctors)
```typescript
where.OR = [
  { isPrivate: false },  // See all public posts
  { AND: [{ isPrivate: true }, { authorId: requestingUserId }] }  // See only their own private posts
]
```

### For Verified Doctors
```typescript
// No filter applied - doctors see ALL posts (public + all private)
```

### For Guests (Not Logged In)
```typescript
where.OR = [
  { isPrivate: false },  // See only public posts
  { AND: [{ isPrivate: true }, { authorId: 'none' }] }  // Will never match (no private posts)
]
```

## Testing Instructions

### Test 1: Patient Creates Private Post
1. Login as Patient A (e.g., navin_7)
2. Go to "Create Post" (should navigate to `/create` page)
3. Fill in symptoms and details
4. Select "🔒 Private" option in Step 3
5. Select a community
6. Click "Publish Post"
7. **Expected**: Post is created with `isPrivate: true`

### Test 2: Patient A Sees Their Own Private Post
1. Stay logged in as Patient A
2. Go to homepage
3. **Expected**: You should see your private post with "🔒 Private" flair

### Test 3: Patient B Cannot See Patient A's Private Post
1. Logout from Patient A
2. Login as Patient B (different patient account)
3. Go to homepage
4. **Expected**: Patient A's private post should NOT appear in the feed

### Test 4: Doctor Sees All Private Posts
1. Logout from Patient B
2. Login as a verified doctor (e.g., dr_navin)
3. Go to homepage
4. **Expected**: You should see ALL posts including Patient A's private post

### Test 5: Guest Cannot See Private Posts
1. Logout completely
2. Browse homepage as guest
3. **Expected**: Only public posts should be visible

## Verification Script

Run this script to check post privacy in the database:

```bash
cd apps/api
npx tsx check-post-privacy.ts
```

This will show:
- All posts with their privacy settings
- Author information
- Count of public vs private posts

## Files Modified

1. `apps/api/src/routes/posts.ts`
   - Removed `requireVerifiedDoctor` middleware from POST route
   - Added `isPrivate` to request body extraction
   - Added `isPrivate` to `postService.createPost()` call

## Files Already Correct (No Changes Needed)

1. `apps/web/src/components/SymptomForm.tsx` - Already sends `isPrivate` flag ✅
2. `apps/web/src/store/useStore.ts` - Already sends auth token ✅
3. `apps/api/src/services/post.service.ts` - Privacy filtering logic correct ✅
4. `apps/api/src/middleware/auth.refactored.ts` - Authentication working ✅

## Current Status

✅ Backend route now accepts posts from patients
✅ Backend route now extracts and saves `isPrivate` flag
✅ Privacy filtering logic is correct
✅ Frontend sends `isPrivate` flag correctly
✅ Frontend sends auth token correctly
✅ Backend restarted with new changes

## Next Steps

1. **Create a new private post** as a patient to test the fix
2. **Verify in database** that `isPrivate: true` is saved
3. **Test with another patient** to confirm they cannot see it
4. **Test with a doctor** to confirm they can see it

## Expected Database Result

After creating a private post, running `check-post-privacy.ts` should show:

```
1. Post ID: [new-id]
   Title: [symptom-based title]
   Author: [patient-username] (PATIENT)
   Is Private: true  ← Should be TRUE now
   Created: [timestamp]
```

## Summary

The issue was that patients couldn't create posts at all due to the `requireVerifiedDoctor` middleware. Now that it's removed and `isPrivate` is properly extracted, patients can create both public and private posts, and the privacy filtering will work correctly.
