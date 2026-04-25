# Doctor Post Creation 401 Error - Complete Fix

## Problem
Getting 401 Unauthorized errors when trying to create posts as a doctor:
- `POST /api/v1/posts` → 401
- `GET /api/notifications/unread-count` → 401

## Root Cause
Your auth token is either:
1. Not being stored in localStorage
2. Expired or invalid
3. Not being sent in the Authorization header correctly

## Quick Fix (Try This First)

### Step 1: Clear Everything
```javascript
// In browser console (F12):
localStorage.clear()
sessionStorage.clear()
```

### Step 2: Refresh Page
```javascript
location.reload()
```

### Step 3: Log In Again
- Go to login page
- Enter your doctor credentials
- Log in

### Step 4: Try Creating a Post
- Go to feed/community
- Try creating a post again

## Verify Token is Stored

```javascript
// In browser console:
const token = localStorage.getItem('auth_token')
console.log('Token exists:', !!token)
console.log('Token length:', token?.length)
console.log('Token preview:', token?.substring(0, 50) + '...')
```

If token is missing or very short (< 50 chars), it's invalid.

## Test Token Works

```javascript
// In browser console:
const token = localStorage.getItem('auth_token')
fetch('http://localhost:3001/api/v1/posts', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
}).then(r => {
  console.log('Status:', r.status)
  return r.json()
}).then(d => console.log('Response:', d))
```

If you get 401, token is invalid. If you get 200, token works.

## If Token Still Doesn't Work

### Check API is Running
```bash
# Terminal:
curl http://localhost:3001/api/health
# Should return 200 OK
```

### Check Token Format
The token should be a JWT (looks like: `eyJhbGciOiJIUzI1NiIs...`)

If it's not a JWT, something went wrong during login.

### Re-login with Correct Credentials
Make sure you're using:
- **Username**: Your doctor username (e.g., `dr.rifa.hassan`)
- **Password**: Your doctor password

## Complete Reset Steps

If nothing works, do a complete reset:

1. **Clear all storage**:
   ```javascript
   localStorage.clear()
   sessionStorage.clear()
   ```

2. **Close browser tab** and open new one

3. **Go to login page**: `http://localhost:3000/login`

4. **Log in with doctor account**

5. **Verify token**:
   ```javascript
   console.log(localStorage.getItem('auth_token'))
   ```

6. **Try creating post**

## Doctor Credentials

If you don't remember your password, use one of these test doctors:
- Username: `dr.rifa.hassan`
- Username: `dr.mitchell`
- Username: `Watson`

(Check DOCTOR_CREDENTIALS.md for passwords)

## API Endpoint Requirements

The `/api/v1/posts` endpoint requires:
- ✅ Valid JWT token in `Authorization: Bearer {token}` header
- ✅ Token must not be expired
- ✅ User must be authenticated
- ✅ User must have permission to create posts

## Still Not Working?

Check these files:
1. `apps/web/src/components/CreatePostModal.tsx` - Line 245 (where error occurs)
2. `apps/api/src/routes/posts.routes.ts` - POST endpoint
3. `apps/api/src/middleware/auth.ts` - Token validation

The issue is almost always one of:
1. Token not in localStorage
2. Token expired
3. API server not running
4. Wrong credentials used to log in
