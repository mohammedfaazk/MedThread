# Doctor Post 401 Error - Debugging Guide

## What We've Fixed
1. ✅ JWT secret mismatch across all endpoints
2. ✅ Added token validation in CreatePostModal
3. ✅ Added comprehensive logging to track the issue

## How to Debug the 401 Error

### Step 1: Check if You're Logged In
1. Open browser DevTools (F12)
2. Go to Console tab
3. Run: `localStorage.getItem('auth_token')`
4. If it returns `null`, you're NOT logged in - log in first
5. If it returns a long string starting with `eyJ...`, you ARE logged in

### Step 2: Check the Token Format
1. In Console, run: `localStorage.getItem('auth_token').substring(0, 50)`
2. Should show something like: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
3. If it doesn't look like that, the token is corrupted

### Step 3: Monitor the Request
1. Open DevTools Network tab
2. Try to create a post
3. Look for the POST request to `http://localhost:3001/api/v1/posts`
4. Click on it and check:
   - **Request Headers**: Should have `Authorization: Bearer eyJ...`
   - **Response Status**: Should be 401 if auth fails
   - **Response Body**: Should show error message

### Step 4: Check API Logs
1. Look at the API server console output
2. You should see logs like:
   ```
   [AUTH] Token extraction: { hasCookie: false, hasAuthHeader: true, tokenFound: true, ... }
   [AUTH] Verifying token with secret length: 50
   [AUTH] Token verified successfully for user: user-id-123
   [API] Creating post with data: { title: "...", ... }
   ```

3. If you see `[AUTH] No token provided`, the token is not being sent
4. If you see `[AUTH] Invalid token`, the token is corrupted or wrong secret

### Step 5: Common Issues and Solutions

#### Issue: "No token provided"
**Cause**: Token not in localStorage or not being sent in header
**Solution**:
1. Log out and log back in
2. Check that `localStorage.getItem('auth_token')` returns a value
3. Restart the browser

#### Issue: "Invalid token"
**Cause**: Token is corrupted or JWT secret mismatch
**Solution**:
1. Clear localStorage: `localStorage.clear()`
2. Log out and log back in
3. Restart both API and web servers

#### Issue: "Token expired"
**Cause**: Token was generated more than 7 days ago
**Solution**:
1. Log out and log back in to get a fresh token

#### Issue: "Cannot connect to server"
**Cause**: API server is not running
**Solution**:
1. Make sure API server is running on port 3001
2. Check: `netstat -ano | findstr :3001` (Windows) or `lsof -i :3001` (Mac/Linux)
3. If not running, start it: `npm run dev` in `apps/api`

### Step 6: Test with curl (Advanced)
```bash
# Get a token first by logging in
# Then test the POST endpoint:
curl -X POST http://localhost:3001/api/v1/posts \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Post",
    "content": "Test content",
    "communityId": "test-community",
    "type": "TEXT"
  }'
```

## What the Logs Tell You

### Successful Request
```
[AUTH] Token extraction: { hasCookie: false, hasAuthHeader: true, tokenFound: true, authHeader: "Bearer eyJ..." }
[AUTH] Verifying token with secret length: 50
[AUTH] Token verified successfully for user: user-id-123
[API] Creating post with data: { title: "Test", ... }
```

### Failed Request - No Token
```
[AUTH] Token extraction: { hasCookie: false, hasAuthHeader: false, tokenFound: false, authHeader: "none" }
[AUTH] No token provided - throwing UnauthorizedError
```

### Failed Request - Invalid Token
```
[AUTH] Token extraction: { hasCookie: false, hasAuthHeader: true, tokenFound: true, authHeader: "Bearer invalid..." }
[AUTH] Verifying token with secret length: 50
[AUTH] Authentication error: { errorType: "JsonWebTokenError", message: "invalid token", ... }
```

## Quick Checklist
- [ ] API server is running on port 3001
- [ ] Web server is running on port 3000
- [ ] You are logged in (check localStorage)
- [ ] Token is in correct format (starts with `eyJ`)
- [ ] Browser console shows no errors
- [ ] API logs show token verification success
- [ ] Community ID is valid (not "test-community")

## Still Not Working?
1. Check the API logs for the exact error message
2. Share the error message from the API logs
3. Share the browser console output
4. Share the Network tab request/response details
