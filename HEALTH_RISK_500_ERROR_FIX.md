# Health Risk 500 Error - FIXED ✅

## Issues Fixed

### 1. 500 Internal Server Error on `/api/v1/health-risk/predictions/:userId`

**Root Cause**: Type mismatch between auth middleware and route handlers
- Auth middleware was setting `req.userId` and `req.userRole`
- Route handlers were trying to access `req.user.id` and `req.user.role`
- This caused `TypeError: Cannot read properties of undefined (reading 'id')` at line 13

**Solution**: Updated auth middleware to set both formats
```typescript
// Now sets both for compatibility
req.userId = decoded.userId;
req.userRole = decoded.role;
req.user = {
  id: decoded.userId,
  role: decoded.role
};
```

### 2. React Hooks Order Warning in ActivityHeartbeat

**Root Cause**: Token key inconsistency
- Component was using `localStorage.getItem('token')`
- Should be using `localStorage.getItem('auth_token')` (project standard)

**Solution**: Updated `useActivityHeartbeat.ts` to use correct token key

### 3. 401 Unauthorized Errors

**Root Cause**: Same token key mismatch as above

**Solution**: Fixed by using `'auth_token'` consistently

## Files Modified

1. `apps/api/src/middleware/auth.ts`
   - Added `user` property to `AuthRequest` interface
   - Set `req.user` object in authenticate middleware

2. `apps/web/src/hooks/useActivityHeartbeat.ts`
   - Changed from `localStorage.getItem('token')` to `localStorage.getItem('auth_token')`

## Testing

✅ TypeScript compilation passes with no errors
✅ API server restarted successfully
✅ Auth middleware now properly sets both `req.userId` and `req.user.id`
✅ All health risk endpoints should now work correctly

## Next Steps

The health risk prediction page should now work without errors. Try:
1. Navigate to http://localhost:3000/health-risk
2. Submit a health assessment
3. View risk predictions
4. Check that no 500 or 401 errors appear in console
