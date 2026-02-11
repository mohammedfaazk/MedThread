# Authentication State Troubleshooting

## Current Issue
After logging in, the user data is stored in localStorage correctly, but the Navbar is not displaying the logged-in user information.

## What We Know

### ✅ Working:
1. **Login API** - Returns correct user data with role and verification status
2. **localStorage** - Data is being stored correctly:
   ```json
   {
     "id": "cmlgbh26r0001kpk47d070r3o",
     "username": "navin",
     "email": "navin@gmail.com",
     "role": "DOCTOR",
     "doctorVerificationStatus": "APPROVED"
   }
   ```
3. **Admin Dashboard** - Works correctly at `/admin`
4. **Backend API** - All endpoints working

### ❓ Investigating:
1. **UserContext** - Reading from localStorage but may not be updating React state
2. **Navbar** - Not displaying user info from context

## Debugging Steps

### Step 1: Check Console Logs
Open browser console (F12) and look for these logs:
- `🔍 UserContext: Checking auth...`
- `✅ User from localStorage:` (should show user object)
- `✅ Setting role to:` (should show VERIFIED_DOCTOR or role)

### Step 2: Check Debug Box
Bottom-right corner should show:
```json
{
  "localStorage": {
    "hasToken": true,
    "user": { ... }
  },
  "context": {
    "user": { ... },  // Should match localStorage
    "role": "VERIFIED_DOCTOR",
    "loading": false
  }
}
```

### Step 3: Verify UserContext is Providing Data
If context.user is null but localStorage.user has data, then UserContext is not reading correctly.

## Possible Issues

### Issue 1: React State Not Updating
**Symptom:** localStorage has data but context.user is null
**Solution:** UserContext useEffect may not be triggering

### Issue 2: Navbar Not Re-rendering
**Symptom:** context.user has data but Navbar shows "Log In" button
**Solution:** Navbar may be caching old state

### Issue 3: Role Mapping Issue
**Symptom:** User is logged in but role is wrong
**Solution:** Check role mapping logic in UserContext

## Quick Fixes to Try

### Fix 1: Hard Refresh
1. Clear browser cache (Ctrl+Shift+Delete)
2. Hard refresh (Ctrl+Shift+R)
3. Or use incognito mode

### Fix 2: Restart Dev Server
```bash
# Stop web server (Ctrl+C)
cd apps/web
npm run dev
```

### Fix 3: Clear localStorage and Re-login
```javascript
// In browser console:
localStorage.clear()
// Then login again
```

### Fix 4: Check for Multiple UserContext Providers
Make sure there's only ONE `<UserProvider>` in the app, in the root layout.

## Expected Behavior

### After Login:
1. Login page stores token and user in localStorage
2. Redirects to appropriate page (/, /admin, /dashboard/doctor)
3. UserContext reads from localStorage
4. Navbar displays user info
5. User can navigate the app

### Navbar Should Show:
- User avatar (first letter of username/email)
- Username or email
- Role badge (VERIFIED DOCTOR, PATIENT, ADMIN, etc.)
- Dropdown menu with profile, dashboard, settings, logout

## Files to Check

1. **apps/web/src/context/UserContext.tsx** - Auth state management
2. **apps/web/src/components/Navbar.tsx** - User display
3. **apps/web/src/app/layout.tsx** - UserProvider wrapper
4. **apps/web/src/app/login/page.tsx** - Login and storage logic

## Next Steps

Based on console logs and debug box:

### If context.user is null:
- UserContext is not reading from localStorage
- Check if UserProvider is wrapping the app
- Check if useEffect is running

### If context.user has data but Navbar doesn't show it:
- Navbar is not using the context correctly
- Check if useUser() hook is being called
- Check if Navbar is re-rendering

### If role is wrong:
- Check role mapping logic
- Verify doctorVerificationStatus is being read
- Check if DOCTOR + APPROVED → VERIFIED_DOCTOR mapping works

## Testing Checklist

- [ ] Console shows UserContext logs
- [ ] Debug box shows localStorage data
- [ ] Debug box shows context data matching localStorage
- [ ] Navbar displays user avatar
- [ ] Navbar displays username
- [ ] Navbar displays correct role
- [ ] Dropdown menu works
- [ ] Logout works
- [ ] Re-login works without clearing cache

## Contact Points

If issue persists, check:
1. Browser console for errors
2. Network tab for failed API calls
3. React DevTools for component state
4. localStorage in Application tab
