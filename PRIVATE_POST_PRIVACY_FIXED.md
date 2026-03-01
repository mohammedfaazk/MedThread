# Private Post Privacy - FIXED

## Issue
Private posts created by patients were visible to ALL users (including other patients), not just doctors as intended.

## Root Cause
Two issues were preventing proper privacy enforcement:

### 1. Frontend Not Sending `isPrivate` Flag
The `SymptomForm` component was setting `isPrivate` in the form state but NOT including it in the API request body.

**File**: `apps/web/src/components/SymptomForm.tsx`

**Before**:
```typescript
const postData = {
  title,
  content,
  communityId: formData.communityId,
  type: 'TEXT',
  isNSFW: false,
  isSpoiler: false,
  // isPrivate was missing!
  flair: { text: formData.isPrivate ? '🔒 Private' : '💬 Consultation' }
}
```

**After**:
```typescript
const postData = {
  title,
  content,
  communityId: formData.communityId,
  type: 'TEXT',
  isNSFW: false,
  isSpoiler: false,
  isPrivate: formData.isPrivate, // ✅ Now included
  flair: { text: formData.isPrivate ? '🔒 Private' : '💬 Consultation' }
}
```

### 2. Backend Not Filtering Posts by Privacy
The GET /posts endpoint was NOT using authentication middleware, so it couldn't determine the user's role to filter private posts.

**File**: `apps/api/src/routes/posts.ts`

**Before**:
```typescript
// No authentication
router.get('/', async (req, res, next) => {
  const posts = await postService.getPosts({
    // ... other params
    // requestingUserId and requestingUserRole were missing!
  });
});
```

**After**:
```typescript
// Added optionalAuth middleware
router.get('/', optionalAuth, async (req: any, res, next) => {
  const posts = await postService.getPosts({
    // ... other params
    requestingUserId: req.userId, // ✅ Pass authenticated user ID
    requestingUserRole: req.userRole, // ✅ Pass authenticated user role
  });
});
```

## Privacy Filtering Logic

The `postService.getPosts()` method implements the following privacy rules:

### For Non-Doctors (Patients)
```typescript
// Non-doctors see only:
// 1. Public posts (isPrivate: false)
// 2. Their own private posts
where.OR = [
  { isPrivate: false },
  { AND: [{ isPrivate: true }, { authorId: requestingUserId }] }
];
```

### For Doctors
```typescript
// Doctors see ALL posts (public + all private posts)
// No filter applied
```

### For Unauthenticated Users (Guests)
```typescript
// Guests see only public posts
where.OR = [
  { isPrivate: false },
  { AND: [{ isPrivate: true }, { authorId: 'none' }] } // Will never match
];
```

## Files Modified

1. **Frontend**: `apps/web/src/components/SymptomForm.tsx`
   - Added `isPrivate: formData.isPrivate` to API request

2. **Backend**: `apps/api/src/routes/posts.ts`
   - Added `optionalAuth` middleware to GET /posts
   - Pass `requestingUserId` and `requestingUserRole` to service

3. **Backend**: `apps/api/src/routes/posts.routes.ts`
   - Added `optionalAuth` middleware to GET /posts (v2 route)

## Testing Instructions

### Test 1: Create Private Post as Patient
1. Login as patient (e.g., navin_7)
2. Navigate to `/create`
3. Fill symptom form
4. Select "🔒 Private" privacy mode
5. Submit post
6. Verify post appears in feed with "🔒 Private" flair

### Test 2: Verify Privacy as Another Patient
1. Logout
2. Login as different patient
3. Navigate to homepage
4. **Expected**: Private post should NOT appear in feed
5. Try accessing post directly via URL
6. **Expected**: Should get 403 Forbidden or not found

### Test 3: Verify Privacy as Doctor
1. Logout
2. Login as verified doctor (e.g., dr_navin)
3. Navigate to homepage
4. **Expected**: Private post SHOULD appear in feed
5. Click on post
6. **Expected**: Can view full content and comment

### Test 4: Verify Privacy as Guest
1. Logout (don't login)
2. Navigate to homepage
3. **Expected**: Private post should NOT appear in feed
4. Try accessing post directly via URL
5. **Expected**: Should get 403 Forbidden or not found

### Test 5: Author Can See Own Private Post
1. Login as original patient author
2. Navigate to homepage
3. **Expected**: Your private post SHOULD appear
4. Navigate to your profile
5. **Expected**: Your private post SHOULD appear in your posts

## API Behavior

### POST /api/v1/posts
```json
Request:
{
  "title": "Headache, Fever and more",
  "content": "...",
  "communityId": "...",
  "isPrivate": true  // ✅ Now sent from frontend
}

Response: 201 Created
{
  "id": "...",
  "title": "...",
  "isPrivate": true,
  "flair": { "text": "🔒 Private" }
}
```

### GET /api/v1/posts
```
Request Headers:
Authorization: Bearer {token}  // Optional

Query Params:
- privacyMode: PUBLIC | PRIVATE | ALL (optional)

Response:
[
  // Only posts user is allowed to see based on role
]
```

**Privacy Filtering**:
- If `Authorization` header present → Extract user role
- If user is DOCTOR → Show all posts
- If user is PATIENT → Show public posts + own private posts
- If no auth → Show only public posts

## Backend Logs to Check

### Successful Private Post Creation
```
POST /api/v1/posts 201
[API] Post created with isPrivate: true
```

### Privacy Filtering Applied
```
GET /api/v1/posts 200
[Service] Filtering posts for user role: PATIENT
[Service] Applied privacy filter: OR [isPrivate: false, authorId: userId]
```

## Database Schema

The `Post` table has an `isPrivate` boolean field:

```prisma
model Post {
  id          String   @id @default(cuid())
  title       String
  content     String?
  isPrivate   Boolean  @default(false)  // Privacy flag
  authorId    String
  communityId String
  // ... other fields
}
```

## Expected Behavior

### Before Fix ❌
- Private posts visible to everyone
- Privacy flag not saved to database
- No role-based filtering

### After Fix ✅
- Private posts only visible to:
  - The author (patient who created it)
  - All verified doctors
- Privacy flag saved correctly
- Role-based filtering enforced
- Guests see only public posts

## Security Notes

1. **Privacy is enforced at API level** - Even if someone tries to access a private post URL directly, the backend will check permissions

2. **Comments on private posts** - The comments API also checks privacy:
   ```typescript
   if (post.isPrivate && userRole !== 'DOCTOR' && userId !== post.authorId) {
     return res.status(403).json({ error: 'Access denied' });
   }
   ```

3. **Doctor isolation** - Each doctor's comments on private posts are isolated from other doctors' comments (only author sees all)

## Summary

Private post privacy is now properly enforced:
- ✅ Frontend sends `isPrivate` flag
- ✅ Backend saves `isPrivate` to database
- ✅ Backend filters posts based on user role
- ✅ Patients can only see public posts + own private posts
- ✅ Doctors can see all posts
- ✅ Guests can only see public posts
- ✅ Privacy enforced on both list and detail views

**Backend is running on Terminal ID: 3**

Test the fix by creating a private post as a patient and verifying it's not visible to other patients!
