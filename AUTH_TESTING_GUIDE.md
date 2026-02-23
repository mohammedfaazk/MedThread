# Authentication Testing Guide

## Quick Test (5 minutes)

### Test 1: Patient Signup
1. Open browser in incognito mode
2. Go to `http://localhost:3000/signup`
3. Fill in the form:
   - Email: `testpatient@example.com`
   - Username: `testpatient123`
   - Password: `Test1234!`
   - Confirm Password: `Test1234!`
4. Click "Create Patient Account"
5. **Expected Result:**
   - ✅ Alert: "Account created successfully! Welcome to MedThread."
   - ✅ Redirects to `/`
   - ✅ Navbar shows user menu with avatar (NOT "Login" button)
   - ✅ Click avatar → Dropdown shows:
     - Email: testpatient@example.com
     - Role: PATIENT
     - "Patient Dashboard" link
     - "Settings" link
     - "Saved Posts" link
     - "Log Out" button

### Test 2: Verify Persistence
1. While still logged in from Test 1
2. Refresh the page (F5)
3. **Expected Result:**
   - ✅ User stays logged in
   - ✅ Navbar still shows user menu (NOT "Login" button)
   - ✅ User data still correct

### Test 3: Logout
1. Click avatar in navbar
2. Click "Log Out"
3. **Expected Result:**
   - ✅ Redirects to `/login`
   - ✅ Navbar now shows "Login" button
   - ✅ User menu is gone

### Test 4: Doctor Signup
1. Go to `http://localhost:3000/signup`
2. Click "Doctor" button
3. Fill in all required fields:
   - Email: `testdoctor@example.com`
   - Username: `testdoctor123`
   - Password: `Test1234!`
   - Medical License Number: `MED123456`
   - Specialty: Select any
   - Years of Experience: `5`
   - Upload all 3 documents (any image files)
4. Click "Create Doctor Account"
5. **Expected Result:**
   - ✅ Alert: "Doctor account created successfully! Your verification request has been submitted..."
   - ✅ Redirects to `/login`
6. Login with the doctor credentials
7. **Expected Result:**
   - ✅ Navbar shows user menu
   - ✅ Click avatar → Shows "DOCTOR" role
   - ✅ Shows "Doctor Dashboard" link

## Detailed Test Scenarios

### Scenario 1: Patient Complete Flow
```
1. Signup as patient
   → Should see user menu immediately
   
2. Navigate to /settings
   → Should work (authenticated)
   
3. Navigate to /profile
   → Should work (authenticated)
   
4. Refresh page
   → Should stay logged in
   
5. Open new tab, go to localhost:3000
   → Should be logged in (multi-tab support)
   
6. Logout in first tab
   → Second tab should also logout (storage event)
```

### Scenario 2: Doctor Complete Flow
```
1. Signup as doctor
   → Should redirect to /login (needs verification)
   
2. Login with doctor credentials
   → Should see user menu with DOCTOR role
   
3. Navigate to /dashboard/doctor
   → Should work (authenticated)
   
4. Check navbar dropdown
   → Should show "Doctor Dashboard" link
   
5. Refresh page
   → Should stay logged in
   
6. Logout
   → Should show "Login" button
```

### Scenario 3: Edge Cases
```
1. Signup with existing email
   → Should show error, NOT login
   
2. Signup with weak password
   → Should show error, NOT login
   
3. Signup with mismatched passwords
   → Should show error, NOT login
   
4. Network error during signup
   → Should show error, NOT login
   
5. Incomplete form submission
   → Should show validation errors
```

## Visual Verification Checklist

### When Logged Out
- [ ] Navbar shows "Login" button (orange/red color)
- [ ] No user avatar visible
- [ ] No dropdown menu
- [ ] Clicking "Login" goes to `/login`

### When Logged In (Patient)
- [ ] Navbar shows user avatar (blue gradient circle with first letter)
- [ ] Avatar shows email initial
- [ ] Below avatar shows username
- [ ] Below username shows "PATIENT" in small caps
- [ ] Dropdown shows:
  - [ ] "My Profile" with email
  - [ ] "Patient Dashboard" link
  - [ ] "Settings" link
  - [ ] "Saved Posts" link
  - [ ] "Log Out" button (red text)

### When Logged In (Doctor)
- [ ] Navbar shows user avatar
- [ ] Below username shows "DOCTOR" or "VERIFIED DOCTOR"
- [ ] Dropdown shows:
  - [ ] "My Profile" with email
  - [ ] "Doctor Dashboard" link (NOT "Patient Dashboard")
  - [ ] "Settings" link
  - [ ] "Saved Posts" link
  - [ ] "Log Out" button

### When Logged In (Verified Doctor)
- [ ] Blue checkmark icon next to username
- [ ] Shows "VERIFIED DOCTOR" role
- [ ] All other features same as doctor

## Browser Console Checks

### After Successful Signup
Open browser console (F12) and check:

```javascript
// Should see these in localStorage:
localStorage.getItem('auth_token')  // Should return JWT token
localStorage.getItem('user')        // Should return user JSON

// Parse user data:
JSON.parse(localStorage.getItem('user'))
// Should show:
// {
//   id: "...",
//   username: "testpatient123",
//   email: "testpatient@example.com",
//   role: "PATIENT"
// }
```

### After Logout
```javascript
localStorage.getItem('auth_token')  // Should return null
localStorage.getItem('user')        // Should return null
```

## API Response Verification

### Signup Response (Should Include)
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "clx...",
      "username": "testpatient123",
      "email": "testpatient@example.com",
      "role": "PATIENT"
    }
  }
}
```

### Login Response (Should Include)
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "clx...",
      "username": "testpatient123",
      "email": "testpatient@example.com",
      "role": "PATIENT",
      "verified": false,
      "totalKarma": 0
    }
  }
}
```

## Common Issues and Solutions

### Issue: Still seeing "Login" button after signup
**Cause:** Browser cached old JavaScript
**Solution:** 
1. Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
2. Clear browser cache
3. Restart dev server

### Issue: User menu shows but wrong role
**Cause:** Old user data in localStorage
**Solution:**
1. Open console
2. Run: `localStorage.clear()`
3. Refresh page
4. Signup again

### Issue: Logout doesn't work
**Cause:** Not using logout() function
**Solution:** Check that logout button calls `logout()` from context

### Issue: User logged out after refresh
**Cause:** Token not saved to localStorage
**Solution:** Verify signup is calling `login(token, user)` function

## Automated Testing (Optional)

### Using Browser DevTools
```javascript
// Test signup flow
async function testSignup() {
  const response = await fetch('http://localhost:3001/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'test@example.com',
      username: 'testuser',
      password: 'Test1234!',
      role: 'PATIENT'
    })
  });
  
  const data = await response.json();
  console.log('Signup response:', data);
  
  // Check if token and user are present
  if (data.success && data.data.token && data.data.user) {
    console.log('✅ Signup successful');
    console.log('Token:', data.data.token.substring(0, 20) + '...');
    console.log('User:', data.data.user);
  } else {
    console.log('❌ Signup failed');
  }
}

testSignup();
```

## Performance Checks

### Page Load Time
- [ ] Signup page loads in < 2 seconds
- [ ] After signup, redirect happens in < 1 second
- [ ] Navbar updates immediately (no delay)

### Network Requests
- [ ] Signup makes 1 POST request to `/api/auth/register`
- [ ] No unnecessary API calls
- [ ] Token is included in subsequent authenticated requests

## Security Checks

### Token Storage
- [ ] Token stored in localStorage (not sessionStorage)
- [ ] Token is JWT format (3 parts separated by dots)
- [ ] Token includes user ID and role in payload

### Password Security
- [ ] Password not visible in network requests (check DevTools Network tab)
- [ ] Password not stored in localStorage
- [ ] Password strength indicator works

### Authorization
- [ ] Protected routes require authentication
- [ ] Unauthenticated users redirected to login
- [ ] Role-based access control works (patient vs doctor)

## Accessibility Checks

### Keyboard Navigation
- [ ] Can tab through signup form
- [ ] Can submit form with Enter key
- [ ] Can navigate navbar with keyboard
- [ ] Dropdown menu accessible with keyboard

### Screen Reader
- [ ] Form labels are read correctly
- [ ] Error messages are announced
- [ ] Success messages are announced
- [ ] User menu is accessible

## Mobile Testing

### Responsive Design
- [ ] Signup form works on mobile (320px width)
- [ ] Navbar collapses properly on mobile
- [ ] User menu accessible on mobile
- [ ] Touch targets are large enough (44px minimum)

### Mobile Browsers
- [ ] Test on Chrome Mobile
- [ ] Test on Safari Mobile
- [ ] Test on Firefox Mobile

## Cross-Browser Testing

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

## Final Checklist

- [ ] Patient signup works
- [ ] Doctor signup works
- [ ] Login works
- [ ] Logout works
- [ ] Refresh preserves login
- [ ] Multi-tab support works
- [ ] Navbar shows correct state
- [ ] User menu shows correct data
- [ ] Role-based features work
- [ ] No console errors
- [ ] No network errors
- [ ] Performance is good
- [ ] Security is maintained
- [ ] Accessibility is maintained

---

**Testing Date:** _____________
**Tester:** _____________
**Status:** [ ] Pass [ ] Fail
**Notes:** _____________________________________________
