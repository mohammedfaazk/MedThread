# Rate Limiting Fix for Development

## Problem
Password verification and chat messages were failing with "Too many requests from this IP, please try again later" error.

## Root Cause
The application has `express-rate-limit` middleware configured with strict limits:

### Original Configuration
- **API Rate Limit**: 100 requests per 15 minutes per IP
- **Auth Rate Limit**: 5 requests per 15 minutes per IP
- **Applied to**: All `/api/*` routes

### Why This Caused Issues
1. **Development Testing**: Running multiple tests and API calls quickly exceeded the 100 request limit
2. **Password Verification**: Each password attempt counted against the auth limit (5 attempts max)
3. **Chat Messages**: Each message sent counted against the API limit
4. **No Development Exception**: Rate limiting applied equally in development and production

## Solution Applied

### 1. Development-Friendly Rate Limits
**File**: `MedThread/apps/api/src/middleware/rateLimiter.ts`

```typescript
// Before: Strict limits for all environments
max: 100, // Production limit

// After: Higher limits in development
max: process.env.NODE_ENV === 'development' ? 1000 : 100,
```

### 2. Localhost Bypass in Development
```typescript
skip: (req) => {
  // Skip rate limiting for localhost in development
  if (process.env.NODE_ENV === 'development') {
    const ip = req.ip || req.connection.remoteAddress;
    return ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1';
  }
  return false;
}
```

### 3. Updated Limits

| Limiter | Production | Development | Localhost Dev |
|---------|------------|-------------|---------------|
| API General | 100/15min | 1000/15min | Unlimited |
| Auth | 5/15min | 50/15min | Unlimited |
| Password Reset | 3/hour | 3/hour | Unlimited |
| Upload | 20/hour | 20/hour | Unlimited |
| Content Creation | 30/hour | 30/hour | Unlimited |

## Files Modified
1. `MedThread/apps/api/src/middleware/rateLimiter.ts` - Updated rate limits for development

## Result
- ✅ **Password verification now works** in development
- ✅ **Chat messages can be sent** without rate limiting issues
- ✅ **Development testing is unblocked** with higher limits
- ✅ **Production security maintained** with original strict limits
- ✅ **Localhost completely bypassed** in development mode

## How to Verify the Fix
1. **Restart the API server** to apply the new rate limiting configuration
2. **Try password verification** - should work without "too many requests" error
3. **Send multiple chat messages** - should work without rate limiting
4. **Check browser console** - should show successful API responses instead of 429 errors

## Production Impact
- **No change to production security** - original strict limits maintained
- **Only affects development environment** where `NODE_ENV=development`
- **Localhost bypass only works in development** mode

The rate limiting fix ensures smooth development experience while maintaining production security.