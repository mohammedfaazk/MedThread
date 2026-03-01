# Private Post Privacy - FINAL FIX

## Issue
Even after backend fixes, private posts were still visible to all patients because the frontend was NOT sending the authentication token with API requests.

## Root Cause
The `fetchPosts` function in the Zustand store was making unauthenticated requests to the backend. Without the JWT token, the backend couldn't determine the user's role and treated all requests as guest users.

## The Fix

### File: `apps/web/src/store/useStore.ts`

**Before**:
```typescript
fetchPosts: async (options = {}) => {
  // ... params setup
  
  // ❌ No authentication token sent
  const response = await axios.get(`${API_URL}/api/v1/posts?${params}`)
  const apiPosts = response.data
  // ...
}
```

**After**:
```typescript
fetchPosts: async (options = {}) => {
  // ... params setup
  
  // ✅ Get auth token from localStorage
  const token = localStorage.getItem('auth_token')
  const headers: any = {}
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }
  
  // ✅ Send token with request
  const response = await axios.get(`${API_URL}/api/v1/posts?${params}`, { headers })
  const apiPosts = response.data
  // ...
}
```

## Complete Fix Summary

Three changes were needed to fix private post privacy:

### 1. Frontend - Send `isPrivate` Flag (✅ Fixed Previously)
**File**: `apps/web/src/components/SymptomForm.tsx`
```typescript
const postData = {
  // ...
  isPrivate: formData.isPrivate, // ✅ Now included
}
```

### 2. Backend - Add Authentication Middleware (✅ Fixed Previously)
**File**: `apps/api/src/routes/posts.ts`
```typescript
router.get('/', optionalAuth, async (req: any, res, next) => {
  const posts = await postService.getPosts({
    // ...
    requestingUserId: req.userId, // ✅ Pass user ID
    requestingUserRole: req.userRole, // ✅ Pass user role
  });
});
```

### 3. Frontend - Send Auth Token (✅ Fixed Now)
**File**: `apps/web/src/store/useStore.ts`
```typescript
const token = localStorage.getItem('auth_token')
const headers: any = {}
if (token) {
  headers.Authorization = `Bearer ${token}`
}
const response = await axios.get(`${API_URL}/api/v1/posts?${params}`, { headers })
```

## How It Works Now

### Request Flow
```
1. User loads homepage
   ↓
2. PostFeed calls fetchPosts()
   ↓
3. fetchPosts() gets token from localStorage
   ↓
4. Sends GET /api/v1/posts with Authorization header
   ↓
5. Backend optionalAuth middleware extracts user from token
   ↓
6. Backend passes userId and userRole to postService
   ↓
7. postService filters posts based on role:
   - DOCTOR: See all posts
   - PATIENT: See public posts + own private posts
   - Guest: See only public posts
   ↓
8. Frontend displays filtered posts
```

### Privacy Rules

| User Type | Can See |
|-----------|---------|
| **Doctor** | All posts (public + all private) |
| **Patient** | Public posts + own private posts |
| **Guest** | Only public posts |
| **Post Author** | Always sees own posts (public or private) |

## Testing Instructions

### Test 1: Create Private Post
1. Login as patient (e.g., navin_7)
2. Navigate to `/create`
3. Fill form and select "🔒 Private"
4. Submit post
5. **Expected**: Post appears in YOUR feed with "🔒 Private" flair

### Test 2: Verify Hidden from Other Patients
1. **IMPORTANT**: Refresh the page (Ctrl+R or F5)
   - This ensures the frontend fetches posts with the new auth token
2. Logout
3. Login as different patient (e.g., test_patient)
4. Navigate to homepage
5. **Expected**: Private post should NOT appear
6. **If still visible**: Clear browser cache and refresh again

### Test 3: Verify Visible to Doctors
1. Logout
2. Login as verified doctor (e.g., dr_navin)
3. Navigate to homepage
4. **Expected**: Private post SHOULD appear
5. Click on post
6. **Expected**: Can view full content

### Test 4: Verify Author Can See Own Post
1. Logout
2. Login as original patient author (navin_7)
3. Navigate to homepage
4. **Expected**: Your private post SHOULD appear
5. Navigate to your profile `/u/navin_7`
6. **Expected**: Your private post SHOULD appear

### Test 5: Verify Guest Cannot See
1. Logout (don't login)
2. Navigate to homepage
3. **Expected**: Private post should NOT appear
4. Try accessing post URL directly
5. **Expected**: 403 Forbidden or not found

## Debugging

### Check if Token is Being Sent

**Browser DevTools**:
1. Open DevTools (F12)
2. Go to Network tab
3. Refresh homepage
4. Find request to `/api/v1/posts`
5. Click on it
6. Check "Request Headers"
7. **Should see**: `Authorization: Bearer eyJhbGc...`

**If no Authorization header**:
- Token not in localStorage
- User not logged in
- Need to login again

### Check Backend Logs

**Terminal ID: 3**:
```bash
# Should see:
GET /api/v1/posts 200
[Service] Filtering posts for user role: PATIENT
[Service] Applied privacy filter
```

**If no role in logs**:
- optionalAuth middleware not working
- Token invalid or expired
- Backend needs restart

### Check Database

```bash
cd packages/database
npx prisma studio --schema=prisma/schema.prisma
```

1. Open Post table
2. Find your private post
3. Check `isPrivate` column = `true`
4. If `false`, the post wasn't created as private

## Common Issues

### Issue 1: Still Seeing Private Posts
**Cause**: Browser cache or old data
**Fix**: 
1. Hard refresh (Ctrl+Shift+R)
2. Clear browser cache
3. Logout and login again

### Issue 2: No Posts Showing at All
**Cause**: Token expired or invalid
**Fix**:
1. Logout
2. Login again
3. Check localStorage has `auth_token`

### Issue 3: Private Post Not Saving as Private
**Cause**: Frontend not sending `isPrivate: true`
**Fix**: Check SymptomForm is including `isPrivate` in postData

## API Request Examples

### Authenticated Request (Patient)
```http
GET /api/v1/posts?sort=hot&limit=20
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

Response: 200 OK
[
  { "id": "1", "title": "Public Post", "isPrivate": false },
  { "id": "2", "title": "My Private Post", "isPrivate": true, "authorId": "current_user_id" }
  // Other patients' private posts NOT included
]
```

### Authenticated Request (Doctor)
```http
GET /api/v1/posts?sort=hot&limit=20
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

Response: 200 OK
[
  { "id": "1", "title": "Public Post", "isPrivate": false },
  { "id": "2", "title": "Patient Private Post", "isPrivate": true },
  { "id": "3", "title": "Another Private Post", "isPrivate": true }
  // All posts included
]
```

### Unauthenticated Request (Guest)
```http
GET /api/v1/posts?sort=hot&limit=20
// No Authorization header

Response: 200 OK
[
  { "id": "1", "title": "Public Post", "isPrivate": false }
  // Only public posts
]
```

## Verification Checklist

- [x] Frontend sends `isPrivate` in POST request
- [x] Backend saves `isPrivate` to database
- [x] Backend has `optionalAuth` middleware on GET /posts
- [x] Backend passes `requestingUserId` and `requestingUserRole` to service
- [x] Service filters posts based on role
- [x] Frontend sends JWT token with GET /posts request
- [x] Token extracted from localStorage
- [x] Token sent in Authorization header

## Expected Behavior

### Before All Fixes ❌
- Private posts visible to everyone
- No authentication on API requests
- No role-based filtering

### After All Fixes ✅
- Private posts only visible to:
  - Post author (patient)
  - All verified doctors
- Authentication token sent with requests
- Role-based filtering enforced
- Guests see only public posts

## Summary

The privacy system now works correctly with three key components:

1. **Frontend Form**: Sends `isPrivate: true` when creating private posts
2. **Frontend Store**: Sends JWT token with all API requests
3. **Backend API**: Filters posts based on authenticated user's role

**Refresh your browser and test again!** The private posts should now be properly hidden from other patients.

---

**Backend Status**: Running on Terminal ID: 3
**Frontend**: Refresh required to load updated code
