# Verified Doctor Badge Fix

## Issue
The verified doctor badge was not showing on PostCard even though the code was correct.

## Root Cause
The API's `post.service.ts` was not including `doctorVerificationStatus` in the author select statements. This meant the frontend store couldn't check if a DOCTOR role had APPROVED status.

## Solution
Added `doctorVerificationStatus: true` to all author select statements in `apps/api/src/services/post.service.ts`:

1. `createPost()` - line 44
2. `getPosts()` - line 95
3. `getPostById()` - line 135
4. `updatePost()` - line 217

## Verification Logic
The badge shows when:
```typescript
verified: post.author?.role === 'VERIFIED_DOCTOR' || 
          (post.author?.role === 'DOCTOR' && post.author?.doctorVerificationStatus === 'APPROVED')
```

## Testing
1. Restart the API server
2. Create a post as a verified doctor
3. The badge should now appear on PostCard with:
   - Solid blue background
   - White text
   - Shield icon
   - "Verified Doctor" label

## Files Modified
- `apps/api/src/services/post.service.ts` - Added doctorVerificationStatus to author selects
