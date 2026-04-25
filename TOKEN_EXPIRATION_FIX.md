# Token Expiration Error - Fixed ✅

## Error
```
[Health Assessment] Error: Invalid token
```

## Cause
The authentication token (JWT) has expired or is invalid. This happens when:
1. User's session has expired (tokens typically expire after 24 hours)
2. User logged in on another device and the old token was invalidated
3. Server JWT_SECRET changed
4. Token was corrupted in localStorage

## The Fix

### Updated `apps/web/src/components/health/ComprehensiveHealthAssessment.tsx`

Added proper token expiration handling:

```typescript
if (!response.ok) {
  const errorData = await response.json().catch(() => ({ error: 'Failed to submit assessment' }));
  
  // Handle token expiration
  if (response.status === 401) {
    setError('Your session has expired. Please log in again.');
    // Clear invalid token
    localStorage.removeItem('auth_token');
    // Redirect to login after 2 seconds
    setTimeout(() => {
      window.location.href = '/login';
    }, 2000);
    return;
  }
  
  throw new Error(errorData.error || `Server error: ${response.status}`);
}
```

## What Happens Now

1. **Token Expired**
   - User sees: "Your session has expired. Please log in again."
   - Invalid token is automatically removed from localStorage
   - User is redirected to login page after 2 seconds

2. **No Token**
   - User sees: "Session expired. Please log in again."
   - Redirected to login page after 2 seconds

3. **Success (with predictions)**
   - Shows: "✅ Assessment Complete! X risk predictions generated."

4. **Success (without predictions)**
   - Shows: "✅ Assessment Saved! Your health assessment has been saved successfully."

## User Action Required

If you see the "Invalid token" error:
1. **Log out** from the app
2. **Log back in** with your credentials
3. Try submitting the health assessment again

The new token will be valid for 24 hours.

## For Developers

### Token Expiration Time
Tokens are configured in `apps/api/src/routes/auth.ts`:

```typescript
const token = jwt.sign(
  { userId: user.id, role: user.role },
  process.env.JWT_SECRET || 'secret',
  { expiresIn: '24h' } // ← Token expires after 24 hours
);
```

### To Change Expiration Time
Edit the `expiresIn` value:
- `'1h'` = 1 hour
- `'24h'` = 24 hours (current)
- `'7d'` = 7 days
- `'30d'` = 30 days

### Token Refresh (Future Enhancement)
Consider implementing refresh tokens for better UX:
1. Short-lived access tokens (15 minutes)
2. Long-lived refresh tokens (7 days)
3. Automatic token refresh before expiration
4. No need for user to log in again

## Testing

1. **Test Expired Token**
   - Log in
   - Wait 24 hours (or manually expire token in JWT debugger)
   - Try to submit health assessment
   - Should see expiration message and redirect to login

2. **Test Invalid Token**
   - Log in
   - Manually corrupt token in localStorage
   - Try to submit health assessment
   - Should see expiration message and redirect to login

3. **Test No Token**
   - Clear localStorage
   - Try to submit health assessment
   - Should see session expired message and redirect to login

## Files Modified

1. `apps/web/src/components/health/ComprehensiveHealthAssessment.tsx`
   - Added 401 status code handling
   - Clear invalid token from localStorage
   - Auto-redirect to login page
   - Better error messages
