# Avatar Sync Fix - Navbar vs Profile Page

## Problem
The avatar in the navbar didn't match the avatar on the profile page. The navbar showed initials while the profile page showed the actual avatar image.

## Root Cause
When users logged in, the auth service only returned basic user information:
- id
- username  
- email
- role
- doctorVerificationStatus

It did NOT include:
- avatar ❌
- banner ❌
- bio ❌
- specialty ❌

This meant:
1. Login response → localStorage → User context → Navbar (NO AVATAR DATA)
2. Profile page → API fetch → Fresh data (HAS AVATAR DATA)

Result: Navbar showed initials, profile showed actual avatar.

## Solution
Updated the auth service to include avatar and other profile data in login/register responses.

### Changes Made

**File: `apps/api/src/services/auth.service.ts`**

1. **Updated AuthResponse interface:**
```typescript
interface AuthResponse {
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
    role: string;
    doctorVerificationStatus?: string;
    avatar?: string;        // ← ADDED
    banner?: string;        // ← ADDED
    bio?: string;           // ← ADDED
    specialty?: string;     // ← ADDED
  };
}
```

2. **Updated register() method:**
```typescript
const user = await prisma.user.create({
  // ... data
  select: {
    id: true,
    username: true,
    email: true,
    role: true,
    doctorVerificationStatus: true,
    avatar: true,          // ← ADDED
    banner: true,          // ← ADDED
    bio: true,             // ← ADDED
    specialty: true,       // ← ADDED
  }
});

return {
  token,
  user: {
    // ... other fields
    avatar: user.avatar || undefined,
    banner: user.banner || undefined,
    bio: user.bio || undefined,
    specialty: user.specialty || undefined,
  },
};
```

3. **Updated login() method:**
```typescript
const user = await prisma.user.findUnique({
  where: { email: input.email },
  select: {
    // ... other fields
    avatar: true,          // ← ADDED
    banner: true,          // ← ADDED
    bio: true,             // ← ADDED
    specialty: true,       // ← ADDED
  }
});

return {
  token,
  user: {
    // ... other fields
    avatar: user.avatar || undefined,
    banner: user.banner || undefined,
    bio: user.bio || undefined,
    specialty: user.specialty || undefined,
  },
};
```

## How It Works Now

### Login Flow
```
User logs in
  ↓
Auth service queries database
  ↓
Returns user data WITH avatar, banner, bio, specialty
  ↓
Frontend stores in localStorage
  ↓
User context loads from localStorage
  ↓
Navbar reads from context
  ↓
Navbar shows actual avatar! ✅
```

### Profile Update Flow
```
User updates avatar
  ↓
Upload to server
  ↓
Update database
  ↓
Update localStorage
  ↓
Reload page
  ↓
Context refreshes
  ↓
Navbar shows new avatar! ✅
```

## Testing

### Test Login
1. Logout if logged in
2. Login with an account that has an avatar
3. Check navbar - should show avatar
4. Navigate to profile page
5. Avatar should match navbar

### Test New User
1. Create a new account
2. Navbar shows initials (no avatar yet)
3. Upload avatar in settings
4. Save changes
5. Page reloads
6. Navbar now shows avatar

### Test Profile Update
1. Go to `/settings/profile`
2. Upload new avatar
3. Save changes
4. Page reloads
5. Navbar shows new avatar
6. Visit profile page
7. Profile shows same avatar

## Benefits

1. **Consistency**: Navbar and profile page always show same avatar
2. **Performance**: Avatar loaded once at login, cached in localStorage
3. **User Experience**: Users see their avatar immediately after login
4. **Data Completeness**: All profile data available in context

## Related Files

- `apps/api/src/services/auth.service.ts` - Auth service (UPDATED)
- `apps/web/src/context/JWTAuthContext.tsx` - User context (already has avatar field)
- `apps/web/src/components/NavbarEnhanced.tsx` - Navbar (already reads avatar)
- `apps/web/src/app/settings/profile/page.tsx` - Profile settings (already updates localStorage)

## Notes

- Existing users need to logout and login again to get avatar in localStorage
- Or they can update their profile, which also updates localStorage
- New logins will automatically have avatar data
- This fix ensures data consistency across the entire app
