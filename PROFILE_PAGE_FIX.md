# Profile Page Fix - Supabase to API Migration

## Issue
The user profile page at `/u/[username]` was still trying to fetch user data from Supabase, which resulted in 404 errors:
- `GET .../doctors?select=*&or=(id.eq.meghamary,user_id.eq.meghamary) 404`
- `GET .../patient_health_record?select=*&user_id=eq.meghamary 404`

This happened because the profile page wasn't updated to use the new backend API endpoints.

## Root Cause
The `apps/web/src/app/u/[username]/page.tsx` file was using:
1. Direct Supabase queries to `doctors` table
2. Direct Supabase queries to `patient_health_record` table
3. Fallback to `doctor_data.json` file

This approach had several problems:
- Supabase tables may not exist or have different schemas
- No centralized user data management
- Inconsistent with the new API-based architecture

## Solution
Updated the profile page to use the new backend API endpoint:

### Primary Method
```typescript
// Fetch from the profile API endpoint
const response = await axios.get(`${API_URL}/api/profile/${params.username}`);
```

This endpoint (`GET /api/profile/:username`) was created in Task 7 and:
- Fetches user data from the Prisma database
- Returns consistent user profile structure
- Handles both patients and doctors
- Includes all necessary user information (avatar, bio, karma, etc.)

### Fallback Methods (in order)
1. **Verified Doctors API** - Fetches from doctor verification endpoint
2. **doctor_data.json** - Static fallback for development

## Changes Made

### File: `apps/web/src/app/u/[username]/page.tsx`

1. **Removed Supabase dependency**
   ```typescript
   // REMOVED: import { supabase } from '@/lib/supabase'
   ```

2. **Updated fetchProfile function**
   - Primary: Use `/api/profile/:username` endpoint
   - Fallback 1: Try verified doctors list
   - Fallback 2: Try doctor_data.json
   - Proper error handling for 404s

3. **Better error handling**
   - Distinguishes between "user not found" (404) and other errors
   - Logs helpful debug information
   - Sets profileUser to null when user doesn't exist

## Benefits

1. **Consistency** - All user data comes from the same source (Prisma DB)
2. **Reliability** - No dependency on Supabase tables that may not exist
3. **Maintainability** - Single source of truth for user profiles
4. **Performance** - Direct API calls instead of multiple fallback attempts
5. **Error Handling** - Clear distinction between different error types

## Testing

### Test User Profile Access
1. Login as a patient (e.g., username: "meghamary")
2. Click on "My Profile" in navbar
3. Should navigate to `/u/meghamary`
4. Profile should load without Supabase errors
5. Avatar, bio, and user info should display correctly

### Test Different User Types
- Patient profile: `/u/patient_username`
- Doctor profile: `/u/doctor_username`
- Verified doctor profile: `/u/verified_doctor_username`

### Expected Behavior
- ✅ No Supabase 404 errors in console
- ✅ Profile loads from API endpoint
- ✅ User data displays correctly
- ✅ Avatar and banner images load properly
- ✅ "User not found" message for non-existent users

## API Endpoint Details

### GET /api/profile/:username

**Request:**
```
GET http://localhost:3001/api/profile/meghamary
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "id": "user_id",
    "username": "meghamary",
    "email": "user@example.com",
    "role": "PATIENT",
    "verified": false,
    "bio": "User bio",
    "avatar": "avatar_url",
    "banner": "banner_url",
    "postKarma": 0,
    "commentKarma": 0,
    "totalKarma": 0,
    "isPremium": false,
    "createdAt": "2026-02-17T...",
    "_count": {
      "posts": 0,
      "comments": 0,
      "followers": 0,
      "following": 0
    }
  }
}
```

**Response (Not Found):**
```json
{
  "success": false,
  "error": "User not found"
}
```

## Related Files

- `apps/web/src/app/u/[username]/page.tsx` - User profile page (UPDATED)
- `apps/api/src/routes/profile.routes.ts` - Profile routes (from Task 7)
- `apps/api/src/controllers/profile.controller.ts` - Profile controller (from Task 7)
- `apps/api/src/services/user.service.ts` - User service (from Task 7)

## Migration Notes

This fix is part of the larger migration from Supabase to Prisma/PostgreSQL:
- User data now stored in Prisma database
- Profile endpoints use Prisma queries
- Consistent data structure across the app
- Better type safety with TypeScript

## Future Improvements

1. Add caching for profile data
2. Implement profile data refresh on updates
3. Add loading skeletons for better UX
4. Consider adding profile data to context for faster access
