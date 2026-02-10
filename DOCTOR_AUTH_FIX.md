# Doctor Authentication & Verification Fix

## Problem Summary
Doctors were not being properly logged in with their verification status, causing state management issues where:
- Doctor verification status wasn't returned in login response
- Frontend couldn't determine if doctor was verified or pending
- Doctors with pending verification could attempt to post/reply

## Changes Made

### 1. Backend - Auth Service (`apps/api/src/services/auth.service.ts`)

**Fixed Registration:**
- Changed role enum from `VERIFIED_DOCTOR` to `DOCTOR`
- Automatically set `doctorVerificationStatus = 'PENDING'` when role is `DOCTOR`
- Return `doctorVerificationStatus` in registration response

**Fixed Login:**
- Added `doctorVerificationStatus` to user query
- Return `doctorVerificationStatus` in login response
- This allows frontend to know doctor's verification state

**Updated Interfaces:**
```typescript
interface RegisterInput {
  role: 'PATIENT' | 'DOCTOR' | 'NURSE' | 'MEDICAL_STUDENT' | 'PHARMACIST';
}

interface AuthResponse {
  user: {
    doctorVerificationStatus?: string;
  };
}
```

### 2. Backend - Auth Validator (`apps/api/src/validators/auth.validator.ts`)

**Fixed Role Enum:**
- Changed from `VERIFIED_DOCTOR` to `DOCTOR`
- Now accepts: `['PATIENT', 'DOCTOR', 'NURSE', 'MEDICAL_STUDENT', 'PHARMACIST']`

### 3. Backend - New Middleware (`apps/api/src/middleware/requireVerifiedDoctor.ts`)

**Created middleware to protect doctor-only routes:**
```typescript
export const requireVerifiedDoctor = async (req, res, next) => {
  // Check if user is DOCTOR role
  // Check if doctorVerificationStatus === 'APPROVED'
  // Block if not approved
}
```

### 4. Backend - Reply Routes (`apps/api/src/routes/replies.ts`)

**Added Doctor Verification Check:**
- Query includes `doctorVerificationStatus`
- Block doctors with status !== 'APPROVED' from posting
- Return clear error message: "Doctor verification required"
- Set `doctorVerified` flag only for APPROVED doctors

### 5. Frontend - Login Page (`apps/web/src/app/login/page.tsx`)

**Enhanced Login Flow:**
```typescript
if (user.role === 'DOCTOR') {
  if (user.doctorVerificationStatus === 'APPROVED') {
    router.push('/dashboard/doctor')
  } else if (user.doctorVerificationStatus === 'PENDING') {
    alert('Your doctor account is pending verification...')
    router.push('/')
  } else if (user.doctorVerificationStatus === 'REJECTED') {
    alert('Your doctor verification was rejected...')
    router.push('/')
  }
}
```

### 6. Frontend - Auth Hook (`apps/web/src/hooks/useAuth.ts`)

**Created reusable auth hook:**
```typescript
export function useAuth() {
  return {
    user,
    isAuthenticated,
    isDoctor,
    isDoctorVerified,
    isDoctorPending,
    logout,
    updateUser
  };
}
```

## Complete Doctor Flow

### Registration Flow:
1. Doctor signs up with role = 'DOCTOR'
2. Backend creates user with:
   - `role: 'DOCTOR'`
   - `doctorVerificationStatus: 'PENDING'`
3. Doctor submits KYC documents via `/api/v1/doctor-verification/submit`
4. Doctor receives token and can log in

### Login Flow:
1. Doctor logs in with email/password
2. Backend returns:
   ```json
   {
     "user": {
       "id": "...",
       "role": "DOCTOR",
       "doctorVerificationStatus": "PENDING"
     }
   }
   ```
3. Frontend stores user data in localStorage
4. Frontend checks verification status and shows appropriate message

### Posting/Replying Flow:
1. Doctor tries to post reply
2. Backend checks:
   - Is role === 'DOCTOR'?
   - Is doctorVerificationStatus === 'APPROVED'?
3. If not approved → Return 403 error
4. If approved → Allow post with `doctorVerified: true`

### Admin Verification Flow:
1. Admin views pending verifications
2. Admin approves doctor
3. Backend updates: `doctorVerificationStatus: 'APPROVED'`
4. On next login/token refresh, doctor gets full access

## Testing Checklist

- [ ] Doctor can register with role='DOCTOR'
- [ ] Doctor receives `doctorVerificationStatus: 'PENDING'` on registration
- [ ] Doctor can log in successfully
- [ ] Login response includes `doctorVerificationStatus`
- [ ] Frontend shows "Pending Verification" message
- [ ] Doctor CANNOT post replies when pending
- [ ] Doctor CANNOT post threads when pending (if applicable)
- [ ] Admin can approve doctor
- [ ] After approval, doctor can post/reply
- [ ] Replies from approved doctors show `doctorVerified: true`

## Files Modified

1. `apps/api/src/services/auth.service.ts` - Auth logic
2. `apps/api/src/validators/auth.validator.ts` - Role validation
3. `apps/api/src/routes/replies.ts` - Reply verification check
4. `apps/web/src/app/login/page.tsx` - Login flow
5. `apps/web/src/hooks/useAuth.ts` - NEW auth hook

## Files Created

1. `apps/api/src/middleware/requireVerifiedDoctor.ts` - NEW middleware
2. `apps/web/src/hooks/useAuth.ts` - NEW auth hook

## Next Steps

1. Apply `requireVerifiedDoctor` middleware to other doctor-only routes
2. Update frontend components to use `useAuth()` hook
3. Add verification status badge in UI
4. Test complete flow end-to-end
5. Update doctor dashboard to show verification status banner
