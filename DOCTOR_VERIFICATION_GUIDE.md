# Doctor Verification System - Quick Reference Guide

## Overview

The MedThread platform implements a secure doctor verification system where:
- Doctors register like any other user
- Their account is created with `PENDING` verification status
- They can log in but cannot post/reply until verified
- Admin reviews and approves their credentials
- Once approved, they gain full doctor privileges

## User Roles

```
PATIENT              - Regular users seeking medical advice
DOCTOR               - Medical professionals (requires verification)
NURSE                - Nursing professionals
MEDICAL_STUDENT      - Medical students
PHARMACIST           - Pharmacy professionals
ADMIN                - Platform administrators
```

## Doctor Verification Statuses

```
PENDING              - Initial status after registration
UNDER_REVIEW         - Admin is reviewing documents
APPROVED             - Verified and can post as doctor
REJECTED             - Verification denied
SUSPENDED            - Temporarily suspended
```

## API Endpoints

### Authentication

**Register Doctor**
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "doctor@example.com",
  "username": "dr_smith",
  "password": "SecurePass@123",
  "role": "DOCTOR"
}

Response:
{
  "success": true,
  "data": {
    "token": "jwt_token_here",
    "user": {
      "id": "user_id",
      "username": "dr_smith",
      "email": "doctor@example.com",
      "role": "DOCTOR",
      "doctorVerificationStatus": "PENDING"
    }
  }
}
```

**Login**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "doctor@example.com",
  "password": "SecurePass@123"
}

Response:
{
  "success": true,
  "data": {
    "token": "jwt_token_here",
    "user": {
      "id": "user_id",
      "username": "dr_smith",
      "email": "doctor@example.com",
      "role": "DOCTOR",
      "doctorVerificationStatus": "PENDING"
    }
  }
}
```

### Doctor Verification

**Submit Verification Documents**
```http
POST /api/v1/doctor-verification/submit
Authorization: Bearer {token}
Content-Type: application/json

{
  "medicalLicenseNumber": "MED123456",
  "licenseIssuingAuthority": "Medical Council of India",
  "licenseExpiryDate": "2025-12-31T00:00:00Z",
  "specialty": "Cardiology",
  "subSpecialty": "Interventional Cardiology",
  "yearsOfExperience": 10,
  "hospitalAffiliation": "City Hospital",
  "clinicAddress": "123 Medical St, City",
  "documents": {
    "idProof": "base64_encoded_file",
    "medicalDegree": "base64_encoded_file",
    "licenseDocument": "base64_encoded_file"
  }
}
```

**Admin: Approve Doctor**
```http
POST /api/v1/doctor-verification/{userId}/approve
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "verificationNotes": "All documents verified"
}
```

**Admin: Reject Doctor**
```http
POST /api/v1/doctor-verification/{userId}/reject
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "rejectionReason": "Invalid license number"
}
```

### Posting Replies (Doctor)

**Create Reply**
```http
POST /api/replies
Content-Type: application/json

{
  "threadId": "thread_id",
  "authorId": "doctor_user_id",
  "content": "Medical advice here..."
}

Success Response (if approved):
{
  "id": "reply_id",
  "threadId": "thread_id",
  "authorId": "doctor_user_id",
  "authorRole": "DOCTOR",
  "content": "Medical advice here...",
  "doctorVerified": true,
  "createdAt": "2024-01-01T00:00:00Z"
}

Error Response (if pending):
{
  "error": "Doctor verification required",
  "message": "Your doctor account must be verified before you can post replies."
}
```

## Frontend Integration

### Check Authentication State

```typescript
import { useAuth } from '@/hooks/useAuth';

function MyComponent() {
  const { 
    user, 
    isAuthenticated, 
    isDoctor, 
    isDoctorVerified, 
    isDoctorPending 
  } = useAuth();

  if (isDoctorPending) {
    return <PendingVerificationBanner />;
  }

  if (isDoctorVerified) {
    return <DoctorDashboard />;
  }

  return <RegularDashboard />;
}
```

### Display Verification Status

```typescript
function VerificationBanner() {
  const { user } = useAuth();

  if (user?.role === 'DOCTOR') {
    switch (user.doctorVerificationStatus) {
      case 'PENDING':
        return <div>⏳ Verification Pending</div>;
      case 'UNDER_REVIEW':
        return <div>🔍 Under Review</div>;
      case 'APPROVED':
        return <div>✅ Verified Doctor</div>;
      case 'REJECTED':
        return <div>❌ Verification Rejected</div>;
      case 'SUSPENDED':
        return <div>⚠️ Account Suspended</div>;
    }
  }
  return null;
}
```

### Handle Reply Submission

```typescript
async function submitReply(content: string) {
  const { user, isDoctorVerified } = useAuth();

  if (user?.role === 'DOCTOR' && !isDoctorVerified) {
    alert('Your doctor account must be verified before posting.');
    return;
  }

  try {
    const response = await axios.post('/api/replies', {
      threadId: threadId,
      authorId: user.id,
      content: content
    });
    
    console.log('Reply posted:', response.data);
  } catch (error) {
    if (error.response?.status === 403) {
      alert(error.response.data.message);
    }
  }
}
```

## Database Schema Reference

```prisma
model User {
  id                       String    @id @default(cuid())
  email                    String    @unique
  username                 String    @unique
  passwordHash             String
  role                     UserRole  @default(PATIENT)
  
  // Doctor verification fields
  doctorVerificationStatus DoctorVerificationStatus?
  medicalLicenseNumber     String?
  licenseIssuingAuthority  String?
  licenseExpiryDate        DateTime?
  specialty                String?
  subSpecialty             String?
  yearsOfExperience        Int?
  hospitalAffiliation      String?
  clinicAddress            String?
  kycDocuments             Json?
  verificationDocuments    Json?
  verificationNotes        String?
  verifiedAt               DateTime?
  verifiedBy               String?
  rejectionReason          String?
}

model ThreadReply {
  id              String   @id @default(cuid())
  threadId        String
  authorId        String
  authorRole      UserRole
  content         String
  doctorVerified  Boolean  @default(false)  // true only if DOCTOR + APPROVED
}
```

## Testing Checklist

### Manual Testing Steps

1. **Doctor Registration**
   - [ ] Go to `/signup`
   - [ ] Select "Doctor" tab
   - [ ] Fill in all required fields
   - [ ] Upload documents
   - [ ] Submit registration
   - [ ] Verify success message
   - [ ] Check localStorage for user data with `doctorVerificationStatus: "PENDING"`

2. **Doctor Login**
   - [ ] Go to `/login`
   - [ ] Enter doctor credentials
   - [ ] Verify redirect to home with pending message
   - [ ] Check localStorage for verification status

3. **Attempt to Reply (Pending)**
   - [ ] Navigate to a medical thread
   - [ ] Try to post a reply
   - [ ] Verify error message appears
   - [ ] Verify reply is NOT created

4. **Admin Approval**
   - [ ] Login as admin
   - [ ] Navigate to verification dashboard
   - [ ] Find pending doctor
   - [ ] Review documents
   - [ ] Approve verification

5. **Doctor Reply (Approved)**
   - [ ] Logout and login as doctor again
   - [ ] Navigate to a medical thread
   - [ ] Post a reply
   - [ ] Verify reply is created
   - [ ] Verify "Verified Doctor" badge appears

### Automated Testing

Run the test script:
```bash
node test-doctor-auth.js
```

## Common Issues & Solutions

### Issue: Doctor can't log in
**Solution:** Check that role is 'DOCTOR' not 'VERIFIED_DOCTOR'

### Issue: Verification status not showing
**Solution:** Ensure backend returns `doctorVerificationStatus` in login response

### Issue: Approved doctor still can't post
**Solution:** Check database that `doctorVerificationStatus = 'APPROVED'` (not 'VERIFIED')

### Issue: Frontend shows wrong status
**Solution:** Clear localStorage and login again to refresh user data

## Security Considerations

1. **Document Storage**: Documents are stored as base64 in JSON field. Consider moving to secure file storage (S3, etc.) for production.

2. **Token Refresh**: Implement token refresh to update verification status without re-login.

3. **Rate Limiting**: Add rate limiting to verification submission endpoint.

4. **Document Validation**: Validate file types and sizes on backend.

5. **Audit Trail**: Log all verification status changes for compliance.

## Next Steps

1. Implement token refresh to update verification status
2. Add email notifications for verification status changes
3. Create admin dashboard for verification management
4. Add document preview in admin panel
5. Implement verification expiry and renewal
6. Add analytics for verification metrics
