# Token Refresh Required - 401 Error Fix

## What Happened
The API server was restarted with the correct JWT_SECRET. However, your current token in localStorage was created with the OLD secret, so it can't be verified anymore.

## Solution
**You need to log out and log back in** to get a new token created with the correct secret.

### Steps:
1. Click "Create Post" button (or try any authenticated action)
2. You'll get a 401 error
3. You'll be automatically redirected to the login page
4. Log in again with your credentials
5. A new token will be created with the correct secret
6. Try creating a post again - it should work!

## Why This Happened
- Old `.env` file had: `JWT_SECRET="change-this-to-a-secure-random-string-in-production"`
- New `.env` file has: `JWT_SECRET="dev-secret-change-in-production"`
- Tokens created with the old secret can't be verified with the new secret
- Solution: Create new tokens with the new secret by logging in again

## Verification
After logging back in, you should see:
- ✅ Token is created with correct secret
- ✅ Token verification succeeds
- ✅ Posts can be created without 401 errors
- ✅ Success notification appears
- ✅ Post appears in the feed

## Files Fixed
- `apps/api/.env` - JWT_SECRET corrected
- `.env` - JWT_SECRET already correct
- `apps/api/src/config/index.ts` - Added logging to verify secret
- `apps/web/src/components/CreatePostModal.tsx` - Auto-redirect to login on 401
- `apps/web/src/utils/logout.ts` - Logout utility created
