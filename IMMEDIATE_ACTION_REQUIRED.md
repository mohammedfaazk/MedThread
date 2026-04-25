# IMMEDIATE ACTION - REFRESH YOUR BROWSER

## What to Do RIGHT NOW:

1. **Hard refresh your browser** (Ctrl+Shift+R or Cmd+Shift+R)
   - This clears the cache and reloads the app
   - The app will automatically clear your old token
   - You'll be redirected to login

2. **Log in again** with your credentials
   - A new token will be created with the CORRECT JWT_SECRET
   - This token will work with the fixed API

3. **Try creating a post**
   - It should work now! ✅
   - You'll see a success notification
   - Post will appear in the feed

## Why This Works:

- Old token was created with OLD JWT_SECRET
- New API uses NEW JWT_SECRET
- Old token can't be verified with new secret → 401 error
- Solution: Create new token by logging in again

## What Changed:

- `apps/web/src/components/AxiosSetup.tsx` - Now automatically clears old tokens on app load
- When you refresh, old token is cleared
- You're redirected to login
- New token is created with correct secret
- Everything works!

## Expected Flow:

1. Hard refresh browser
2. Redirected to login (old token cleared)
3. Log in with your credentials
4. Redirected to home page
5. Try creating a post
6. ✅ SUCCESS - Post created!

**Do this NOW and it will work!**
