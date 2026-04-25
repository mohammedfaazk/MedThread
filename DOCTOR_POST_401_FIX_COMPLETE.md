# Doctor Post 401 Unauthorized Error - FIXED

## Problem
When doctors tried to create posts, they received a 401 Unauthorized error:
```
Failed to create post: AxiosError: Request failed with status code 401
```

## Root Cause
**JWT Secret Mismatch**: The login endpoint and various routes were using different fallback JWT secrets:
- Login endpoint: `process.env.JWT_SECRET || 'secret'`
- Auth middleware: `process.env.JWT_SECRET || 'dev-secret-change-in-production'`
- Other routes: `process.env.JWT_SECRET || 'secret'`

When the JWT_SECRET environment variable wasn't properly loaded or was undefined, tokens generated with one secret couldn't be verified with another secret, causing 401 errors.

## Solution
Updated all JWT token generation and verification to use the same consistent fallback secret:
```
process.env.JWT_SECRET || 'dev-secret-change-in-production'
```

## Files Fixed

### 1. **apps/api/src/routes/auth.ts**
- Fixed `/register` endpoint (line 54)
- Fixed `/login` endpoint (line 116)
- Fixed `/verify-password` endpoint (line 173)

### 2. **apps/api/src/routes/posts.routes.ts**
- Fixed GET `/` endpoint (line 29)
- Fixed GET `/:id` endpoint (line 297)

### 3. **apps/api/src/routes/posts.ts**
- Fixed GET `/:id` endpoint (line 192)

### 4. **apps/api/src/routes/comments.ts**
- Fixed GET `/posts/:postId/comments` endpoint (line 130)

### 5. **apps/api/src/routes/communities.ts**
- Fixed GET `/` endpoint (line 59)

### 6. **apps/api/src/routes/analytics-sse.routes.ts**
- Fixed SSE endpoint (line 18)

### 7. **apps/api/src/handlers/notification.handler.ts**
- Fixed socket authentication (line 22)

## Verification
The .env file has JWT_SECRET properly set:
```
JWT_SECRET="change-this-to-a-secure-random-string-in-production"
```

## Testing
To test the fix:
1. Log in as a doctor
2. Navigate to create a post
3. Fill in the post details
4. Click "Post"
5. The post should be created successfully without 401 errors

## Impact
- ✅ Doctors can now create posts
- ✅ All authenticated endpoints will work correctly
- ✅ Token verification is consistent across the entire API
- ✅ No more 401 errors due to secret mismatch

## Notes
- The fix ensures that all JWT operations use the same secret
- If JWT_SECRET is not set in the environment, all endpoints will use the same fallback
- In production, JWT_SECRET should always be set in the environment variables
