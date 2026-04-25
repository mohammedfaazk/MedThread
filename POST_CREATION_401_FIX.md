# Post Creation 401 Unauthorized Error - Fix Guide

## Problem
Getting `401 Unauthorized` error when trying to create a post:
```
Failed to create post: AxiosError: Request failed with status code 401
```

## Root Causes

### 1. Missing or Expired Auth Token
- Token not stored in localStorage
- Token expired (JWT tokens have expiration times)
- Token invalid or corrupted

### 2. Token Not Being Sent Correctly
- Authorization header not formatted correctly
- Token not retrieved from localStorage

### 3. API Not Recognizing Token
- API middleware not validating token properly
- Token format mismatch

## Solutions

### Solution 1: Check if You're Logged In
1. Open browser DevTools (F12)
2. Go to Application → Local Storage
3. Look for `auth_token` key
4. If it's missing or empty → **You need to log in first**

### Solution 2: Verify Token is Valid
```javascript
// In browser console:
const token = localStorage.getItem('auth_token');
console.log('Token:', token);
console.log('Token length:', token?.length);
```

If token is missing or very short (< 50 chars), it's invalid.

### Solution 3: Log Out and Log Back In
1. Clear localStorage: `localStorage.clear()`
2. Refresh page
3. Log in again with valid credentials
4. Try creating a post

### Solution 4: Check API Token Validation
The API endpoint `/api/v1/posts` requires:
- Valid JWT token in `Authorization: Bearer {token}` header
- Token must not be expired
- Token must belong to an authenticated user

## Quick Fix Steps

1. **Open DevTools** (F12)
2. **Check token exists**:
   ```javascript
   localStorage.getItem('auth_token')
   ```
3. **If missing**: Log in again
4. **If exists**: Try creating post again
5. **If still fails**: Check API logs for specific error

## Code Review

The CreatePostModal is correctly sending the token:
```typescript
const token = localStorage.getItem('auth_token')
const response = await axios.post(
  `${API_URL}/api/v1/posts`,
  postData,
  {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }
)
```

## Common Issues

| Issue | Solution |
|-------|----------|
| Token missing | Log in again |
| Token expired | Log in again |
| Wrong format | Check Authorization header format |
| API not running | Start API server on port 3001 |
| CORS issue | Check API CORS configuration |

## Testing

To test if your token works:
```bash
# In browser console:
fetch('http://localhost:3001/api/v1/posts', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
  }
}).then(r => r.json()).then(console.log)
```

If you get 401, your token is invalid or expired.

## Next Steps

1. Make sure you're logged in
2. Check that API server is running on port 3001
3. Try creating a post again
4. If still failing, check API logs for detailed error message
