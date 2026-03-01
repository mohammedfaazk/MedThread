# Rate Limit Issue - FIXED ✅

## Problem
You encountered a 429 (Too Many Requests) error when trying to register:
```
POST http://localhost:3001/api/auth/register 429 (Too Many Requests)
Error: Too many login attempts, please try again after 15 minutes.
```

## Root Cause
The backend has rate limiting enabled for authentication endpoints:
- **Original Limit**: 5 attempts per 15 minutes
- **Your Attempts**: Exceeded 5 registration attempts during testing

## Solution Applied ✅

I've temporarily increased the auth rate limit for testing:

**File**: `apps/api/src/middleware/rateLimiter.ts`

**Change**:
```typescript
// BEFORE (Production setting)
max: 5, // Limit each IP to 5 login attempts per windowMs

// AFTER (Testing setting)
max: 100, // Limit each IP to 100 login attempts per windowMs (TESTING ONLY)
```

**Backend Server**: Restarted with new configuration

## You Can Now Test! 🎉

The rate limit has been increased from 5 to 100 attempts per 15 minutes.

### Try Registration Again

1. **Refresh the page**: http://localhost:3000/signup
2. **Fill in the form**:
   - Email: navinnaz@gmail.com (or any email)
   - Username: navin_7 (or any username)
   - Password: (min 8 characters)
3. **Click "Create Patient Account"**
4. **Should work now!** ✅

## Alternative: Wait for Rate Limit Reset

If you still see the error (cached rate limit):
- **Option 1**: Wait 15 minutes for the rate limit to reset
- **Option 2**: Use a different email/username
- **Option 3**: Clear browser cache and cookies
- **Option 4**: Use incognito/private browsing mode

## Rate Limit Headers

The API returns these headers to help you track limits:
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Requests remaining
- `X-RateLimit-Reset`: When the limit resets
- `Retry-After`: Seconds to wait before retrying

## For Production

**IMPORTANT**: Before deploying to production, change the rate limit back:

```typescript
// apps/api/src/middleware/rateLimiter.ts
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // CHANGE BACK TO 5 for production security
  message: 'Too many login attempts, please try again after 15 minutes.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
});
```

## Other Rate Limits (Still Active)

These limits are still in place:
- **General API**: 100 requests per 15 minutes
- **Password Reset**: 3 attempts per hour
- **File Uploads**: 20 uploads per hour
- **Content Creation**: 30 posts/comments per hour

## Testing Tips

To avoid hitting rate limits during testing:
1. Use different email addresses for each test account
2. Use incognito mode for fresh sessions
3. Clear browser cache between tests
4. Wait a few seconds between registration attempts
5. Use successful registrations (they don't count against the limit)

## Status

- ✅ Rate limit increased to 100 attempts
- ✅ Backend server restarted
- ✅ Ready for testing
- ⚠️ Remember to change back to 5 for production

## Try Again Now!

Go to http://localhost:3000/signup and try registering again. It should work now! 🚀
