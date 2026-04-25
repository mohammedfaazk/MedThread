# Health Assessment Session Expiration - FIXED ✅

## The Problem

User fills out the 5-step health assessment form (takes 5-10 minutes), but when they click submit:
1. Token has expired (JWT expires after 24 hours, but can expire during form filling)
2. Gets "Invalid token" error
3. Forced to login again
4. **ALL FORM DATA IS LOST** 😡
5. Redirected to dashboard instead of back to the form
6. User has to start over from scratch

## Root Cause

The JWT token expired while the user was filling out the long form. The API logs show:
```
[AUTH] Token verification failed: jwt expired
```

## The Complete Fix

### 1. Save Form Data Before Redirect
When token expires, save all form data to localStorage:
```typescript
localStorage.setItem('health_assessment_draft', JSON.stringify(formData));
```

### 2. Restore Form Data After Login
When component mounts, check for saved draft:
```typescript
useEffect(() => {
  const savedDraft = localStorage.getItem('health_assessment_draft');
  if (savedDraft) {
    const parsedData = JSON.parse(savedDraft);
    setFormData(parsedData);
    setError('✅ Your previous form data has been restored.');
  }
}, []);
```

### 3. Redirect Back to Health Risk Page
Instead of redirecting to `/login`, redirect to `/login?redirect=/health-risk`:
```typescript
window.location.href = '/login?redirect=/health-risk';
```

### 4. Clear Draft on Success
After successful submission, remove the saved draft:
```typescript
localStorage.removeItem('health_assessment_draft');
```

### 5. Better Error Messages
- Success messages (green): Start with ✅
- Error messages (red): Everything else
- Clear indication that data is saved

## User Experience Now

### Scenario 1: Token Expires During Form Fill
1. User fills out form for 10 minutes
2. Clicks "Submit"
3. Sees: "Your session has expired. Please log in again. **Your form data has been saved and will be restored.**"
4. Waits 3 seconds, redirected to login
5. Logs in
6. Redirected back to `/health-risk`
7. Clicks "Start Assessment" again
8. Sees: "✅ Your previous form data has been restored. You can continue where you left off."
9. All fields are pre-filled!
10. Clicks "Submit" again
11. Success! ✅

### Scenario 2: No Token (Logged Out)
1. User somehow gets to form without being logged in
2. Fills out form
3. Clicks "Submit"
4. Sees: "Session expired. Please log in again. Your form data has been saved."
5. Form data saved, redirected to login
6. After login, data is restored

### Scenario 3: Successful Submission
1. User fills out form with valid token
2. Clicks "Submit"
3. Success! Assessment saved
4. Draft data cleared from localStorage
5. Shows results dashboard

## Technical Details

### Files Modified

**`apps/web/src/components/health/ComprehensiveHealthAssessment.tsx`**

1. Added `useEffect` import
2. Added form data restoration on mount
3. Save form data before redirect on token expiration
4. Clear form data on successful submission
5. Better error messages with 3-second delay
6. Redirect to `/login?redirect=/health-risk` instead of just `/login`
7. Color-coded messages (green for success, red for errors)

### localStorage Keys

- `health_assessment_draft`: Stores the entire formData object as JSON
- `auth_token`: The JWT authentication token

### Error Message Colors

```typescript
{error.startsWith('✅') 
  ? 'bg-green-50 border border-green-200 text-green-700'  // Success
  : 'bg-red-50 border border-red-200 text-red-700'        // Error
}
```

## Testing

### Test 1: Token Expiration
1. Log in
2. Start health assessment
3. Fill out first 2 steps
4. Open DevTools → Application → Local Storage
5. Delete `auth_token`
6. Continue to step 5 and submit
7. Should see: "Session expired... Your form data has been saved"
8. Log in again
9. Go to health risk page
10. Click "Start Assessment"
11. Should see: "✅ Your previous form data has been restored"
12. All fields should be pre-filled!

### Test 2: Normal Flow
1. Log in
2. Start health assessment
3. Fill out all 5 steps
4. Submit
5. Should see success message
6. Check localStorage - `health_assessment_draft` should be deleted

### Test 3: Multiple Attempts
1. Start assessment, fill partially
2. Token expires, data saved
3. Log in, data restored
4. Fill more, token expires again
5. Log in, data restored again
6. Complete and submit
7. Success!

## API Logs Analysis

From the logs, we can see:
```
[AUTH] Token verification failed: jwt expired  ← Token expired
🔐 Login attempt: { email: 'navin@gmail.com' } ← User logged in again
✅ User found: { email: 'navin@gmail.com' }    ← Login successful
[AUTH] Token verified successfully             ← New token works
```

The user had to login again because their token expired, but now their form data is preserved!

## Future Improvements

1. **Token Refresh**: Implement automatic token refresh before expiration
2. **Auto-save**: Save draft every 30 seconds while filling
3. **Session Warning**: Show warning 5 minutes before token expires
4. **Longer Tokens**: Increase token expiration to 7 days for better UX
5. **Remember Me**: Option for 30-day tokens

## Summary

✅ Form data is now saved before redirect
✅ Form data is restored after login
✅ User redirected back to health risk page
✅ Clear success/error messages
✅ No more lost data!
✅ Much better user experience
