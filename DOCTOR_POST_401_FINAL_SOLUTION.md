# Doctor Post 401 Error - Final Solution

## What Was Fixed

### 1. JWT Secret Mismatch (CRITICAL)
**Problem**: Different parts of the API were using different JWT secrets:
- Login: `process.env.JWT_SECRET || 'secret'`
- Auth middleware: `process.env.JWT_SECRET || 'dev-secret-change-in-production'`
- Other routes: `process.env.JWT_SECRET || 'secret'`

**Solution**: Updated ALL JWT operations to use the same fallback secret:
```
process.env.JWT_SECRET || 'dev-secret-change-in-production'
```

**Files Fixed**:
- ✅ `apps/api/src/routes/auth.ts` (login & register)
- ✅ `apps/api/src/routes/posts.routes.ts` (2 locations)
- ✅ `apps/api/src/routes/posts.ts`
- ✅ `apps/api/src/routes/comments.ts`
- ✅ `apps/api/src/routes/communities.ts`
- ✅ `apps/api/src/routes/analytics-sse.routes.ts`
- ✅ `apps/api/src/handlers/notification.handler.ts`

### 2. Frontend Token Validation
**Problem**: CreatePostModal wasn't checking if token exists before sending

**Solution**: Added token validation:
```typescript
const token = localStorage.getItem('auth_token')
if (!token) {
  alert('Your session has expired. Please log in again.')
  router.push('/login')
  return
}
```

**File Fixed**:
- ✅ `apps/web/src/components/CreatePostModal.tsx`

### 3. Enhanced Logging
**Added**: Comprehensive logging to track token flow:
- Token extraction logging
- Token verification logging
- Error details logging

**Files Updated**:
- ✅ `apps/api/src/middleware/auth.refactored.ts`
- ✅ `apps/web/src/components/CreatePostModal.tsx`

### 4. Health Check Endpoint
**Added**: New health check endpoint to verify API is running:
- `GET /api/health` - Basic health check
- `GET /api/health/token` - Token verification test

**File Created**:
- ✅ `apps/api/src/routes/health.ts`

## How to Test the Fix

### Step 1: Restart Both Servers
```bash
# Terminal 1 - API Server
cd apps/api
npm run dev

# Terminal 2 - Web Server
cd apps/web
npm run dev
```

### Step 2: Verify API is Running
Open browser and go to: `http://localhost:3001/api/health`

Should see:
```json
{
  "success": true,
  "message": "API is running",
  "timestamp": "2026-04-25T...",
  "environment": "development",
  "port": 3001
}
```

### Step 3: Log In
1. Go to `http://localhost:3000/login`
2. Use test credentials:
   - Email: `rifa@gmail.com`
   - Password: `Doctor@123456`
3. Should redirect to home page

### Step 4: Verify Token is Stored
1. Open DevTools (F12)
2. Go to Console
3. Run: `localStorage.getItem('auth_token')`
4. Should return a long string starting with `eyJ`

### Step 5: Create a Post
1. Click "Create a post" button
2. Fill in the form:
   - Title: "Test Post"
   - Content: "This is a test"
   - Community: Select any community
3. Click "Post"
4. Should see success message

### Step 6: Verify in API Logs
Check the API server terminal, should see:
```
[AUTH] Token extraction: { hasCookie: false, hasAuthHeader: true, tokenFound: true, ... }
[AUTH] Verifying token with secret length: 50
[AUTH] Token verified successfully for user: ...
[API] Creating post with data: { title: "Test Post", ... }
```

## Troubleshooting

### Still Getting 401?

**Check 1: Is API running?**
```bash
curl http://localhost:3001/api/health
```
Should return JSON, not "Connection refused"

**Check 2: Is token in localStorage?**
```javascript
localStorage.getItem('auth_token')
```
Should return a string, not `null`

**Check 3: Is token valid?**
```bash
curl http://localhost:3001/api/health/token \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```
Should return token details, not 401

**Check 4: Check API logs**
Look for error messages like:
- "No token provided" → Token not being sent
- "Invalid token" → Token is corrupted
- "Token expired" → Token is too old

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| "No token provided" | Token not in localStorage | Log out and log back in |
| "Invalid token" | Token corrupted or wrong secret | Clear localStorage, restart servers |
| "Token expired" | Token older than 7 days | Log out and log back in |
| "Cannot connect to server" | API not running | Start API with `npm run dev` |
| "Community not found" | Invalid community ID | Select a valid community from dropdown |

## Files Changed Summary

### Backend (API)
- `apps/api/src/routes/auth.ts` - Fixed JWT secret in login/register
- `apps/api/src/routes/posts.routes.ts` - Fixed JWT secret in 2 locations
- `apps/api/src/routes/posts.ts` - Fixed JWT secret
- `apps/api/src/routes/comments.ts` - Fixed JWT secret
- `apps/api/src/routes/communities.ts` - Fixed JWT secret
- `apps/api/src/routes/analytics-sse.routes.ts` - Fixed JWT secret
- `apps/api/src/handlers/notification.handler.ts` - Fixed JWT secret
- `apps/api/src/middleware/auth.refactored.ts` - Added logging
- `apps/api/src/routes/health.ts` - NEW: Health check endpoint
- `apps/api/src/index.ts` - Registered health router

### Frontend (Web)
- `apps/web/src/components/CreatePostModal.tsx` - Added token validation and logging

## Verification Checklist

- [ ] API server is running on port 3001
- [ ] Web server is running on port 3000
- [ ] `http://localhost:3001/api/health` returns JSON
- [ ] You are logged in (token in localStorage)
- [ ] Token starts with `eyJ`
- [ ] API logs show "Token verified successfully"
- [ ] Can create a post without 401 error
- [ ] Post appears in feed

## Next Steps

If everything is working:
1. Test with different user roles (patient, doctor, admin)
2. Test creating different post types (text, image, video, link, poll)
3. Test with expired token (wait 7 days or manually expire)
4. Test with invalid token (modify token in localStorage)

## Support

If you're still getting errors:
1. Check the API logs for the exact error message
2. Check the browser console for JavaScript errors
3. Check the Network tab for request/response details
4. Share the error message and logs for debugging
