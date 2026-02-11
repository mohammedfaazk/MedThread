# Doctor Verification System - Complete Implementation

## Overview
This document outlines the complete doctor verification system where doctors can sign up, upload KYC documents, and get verified by admins before they can post/reply.

---

## System Flow

```
1. Doctor Signs Up → role: DOCTOR, doctorVerificationStatus: PENDING
2. Doctor Logs In → Can access dashboard but cannot post/reply
3. Doctor Uploads KYC Documents → Stored in database
4. Admin Reviews → Verification dashboard
5. Admin Approves → doctorVerificationStatus: APPROVED
6. Doctor Logs In Again → Full access granted
```

---

## Database Schema (Already Implemented)

The `User` table in Prisma schema already has:

```prisma
model User {
  id                String    @id @default(cuid())
  email             String    @unique
  username          String    @unique
  passwordHash      String
  role              UserRole  @default(PATIENT)
  
  // Doctor-specific fields
  doctorVerificationStatus DoctorVerificationStatus?  // PENDING, APPROVED, REJECTED
  medicalLicenseNumber     String?
  licenseIssuingAuthority  String?
  licenseExpiryDate        DateTime?
  specialty                String?
  subSpecialty             String?
  yearsOfExperience        Int?
  hospitalAffiliation      String?
  clinicAddress            String?
  
  // KYC Documents (base64 encoded)
  kycDocuments             Json?  // { idProof, medicalDegree, licenseDocument }
  verificationNotes        String?
  verifiedAt               DateTime?
  verifiedBy               String?  // Admin user ID
  rejectionReason          String?
}

enum DoctorVerificationStatus {
  PENDING
  UNDER_REVIEW
   │  ├─ Access doctor-only features
   │  └─ Display specialty and credentials
   └─ Backend enforces: doctorVerificationStatus === "APPROVED"

5. SUSPENSION (if needed)
   ├─ Admin can suspend verified doctor
   ├─ doctorVerificationStatus = "SUSPENDED"
   ├─ verified = false
   └─ Doctor loses verification privileges
```

## Database Schema Changes

### User Model Updates
```prisma
enum DoctorVerificationStatus {
  PENDING
  UNDER_REVIEW
  APPROVED
  REJECTED
  SUSPENDED
}

model User {
  // ... existing fields ...
  
  // Doctor Verification Fields
  doctorVerificationStatus DoctorVerificationStatus?
  medicalLicenseNumber     String?
  licenseIssuingAuthority  String?
  licenseExpiryDate        DateTime?
  specialty                String?
  subSpecialty             String?
  yearsOfExperience        Int?
  hospitalAffiliation      String?
  clinicAddress            String?
  
  // KYC Documents (JSON)
  kycDocuments             Json?
  verificationDocuments    Json?
  verificationNotes        String?
  verifiedAt               DateTime?
  verifiedBy               String?
  rejectionReason          String?
}
```

## API Endpoints

### Doctor Endpoints

#### 1. Submit Verification Request
```http
POST /api/v1/doctor-verification/submit
Authorization: Bearer {token}
Content-Type: application/json

{
  "medicalLicenseNumber": "MD123456",
  "licenseIssuingAuthority": "Medical Council of India",
  "licenseExpiryDate": "2030-12-31",
  "specialty": "Cardiology",
  "subSpecialty": "Interventional Cardiology",
  "yearsOfExperience": 10,
  "hospitalAffiliation": "Apollo Hospital",
  "clinicAddress": "123 Medical Street, City",
  "documents": {
    "idProof": "base64_or_url",
    "medicalDegree": "base64_or_url",
    "licenseDocument": "base64_or_url",
    "additionalCertificates": ["base64_or_url"]
  }
}

Response:
{
  "success": true,
  "data": {
    "message": "Verification request submitted successfully",
    "user": {
      "id": "user_id",
      "username": "dr_john",
      "doctorVerificationStatus": "UNDER_REVIEW"
    }
  }
}
```

#### 2. Get Verified Doctors (Public)
```http
GET /api/v1/doctor-verification/verified?page=1&limit=50

Response:
{
  "success": true,
  "data": {
    "doctors": [...],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 150,
      "totalPages": 3
    }
  }
}
```

### Admin Endpoints

#### 1. Get Pending Verifications
```http
GET /api/v1/doctor-verification/pending?page=1&limit=20
Authorization: Bearer {admin_token}

Response:
{
  "success": true,
  "data": {
    "requests": [
      {
        "id": "user_id",
        "username": "dr_john",
        "email": "john@example.com",
        "doctorVerificationStatus": "UNDER_REVIEW",
        "medicalLicenseNumber": "MD123456",
        "specialty": "Cardiology",
        "kycDocuments": {...},
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ],
    "pagination": {...}
  }
}
```

#### 2. Get Verification Details
```http
GET /api/v1/doctor-verification/{userId}
Authorization: Bearer {admin_token}

Response:
{
  "success": true,
  "data": {
    "id": "user_id",
    "username": "dr_john",
    "email": "john@example.com",
    "medicalLicenseNumber": "MD123456",
    "licenseIssuingAuthority": "Medical Council",
    "licenseExpiryDate": "2030-12-31",
    "specialty": "Cardiology",
    "kycDocuments": {
      "idProof": "url",
      "medicalDegree": "url",
      "licenseDocument": "url"
    },
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

#### 3. Approve Verification
```http
POST /api/v1/doctor-verification/{userId}/approve
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "notes": "All documents verified. License is valid."
}

Response:
{
  "success": true,
  "data": {
    "message": "Doctor verification approved successfully",
    "user": {
      "id": "user_id",
      "username": "dr_john",
      "doctorVerificationStatus": "APPROVED",
      "verifiedAt": "2024-01-15T10:30:00Z"
    }
  }
}
```

#### 4. Reject Verification
```http
POST /api/v1/doctor-verification/{userId}/reject
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "reason": "Medical license could not be verified with issuing authority"
}

Response:
{
  "success": true,
  "data": {
    "message": "Doctor verification rejected",
    "user": {
      "id": "user_id",
      "doctorVerificationStatus": "REJECTED",
      "rejectionReason": "Medical license could not be verified..."
    }
  }
}
```

#### 5. Suspend Doctor
```http
POST /api/v1/doctor-verification/{userId}/suspend
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "reason": "Violation of medical ethics guidelines"
}

Response:
{
  "success": true,
  "data": {
    "message": "Doctor suspended successfully",
    "user": {
      "id": "user_id",
      "doctorVerificationStatus": "SUSPENDED",
      "isSuspended": true
    }
  }
}
```

#### 6. Get Verification Statistics
```http
GET /api/v1/doctor-verification/stats
Authorization: Bearer {admin_token}

Response:
{
  "success": true,
  "data": {
    "totalDoctors": 500,
    "pendingVerifications": 25,
    "approvedDoctors": 450,
    "rejectedDoctors": 20,
    "suspendedDoctors": 5,
    "recentApprovals": 15,
    "approvalRate": "90.00"
  }
}
```

## Admin Dashboard Endpoints

### Platform Statistics
```http
GET /api/v1/admin/stats
Authorization: Bearer {admin_token}

Response:
{
  "success": true,
  "data": {
    "users": {
      "total": 10000,
      "active24h": 1500,
      "newToday": 50
    },
    "content": {
      "totalPosts": 5000,
      "totalComments": 15000,
      "totalCommunities": 100
    },
    "doctors": {
      "total": 500,
      "verified": 450,
      "pendingVerification": 25
    }
  }
}
```

### User Management
```http
GET /api/v1/admin/users?role=DOCTOR&search=john&page=1&limit=50
Authorization: Bearer {admin_token}
```

## Setup Instructions

### 1. Update Database Schema
```bash
cd packages/database
npx prisma generate
npx prisma db push
```

### 2. Create Admin User
```bash
cd apps/api
npm run seed:admin
```

**Default Admin Credentials:**
- Email: `admin@medthread.com`
- Username: `admin`
- Password: `Admin@123456`

⚠️ **IMPORTANT**: Change the password after first login!

### 3. Start the Application
```bash
# Terminal 1 - API
cd apps/api
npm run dev

# Terminal 2 - Web
cd apps/web
npm run dev
```

### 4. Access Admin Dashboard
```
http://localhost:3000/admin/login
```

## Frontend Implementation

### Doctor Registration Flow
1. User selects "Doctor" role during signup
2. After registration, redirect to verification submission page
3. Doctor fills form and uploads documents
4. Show "Verification Pending" status
5. Disable doctor-specific features until approved

### Admin Dashboard
1. Login with admin credentials
2. View pending verification requests
3. Click on request to view details
4. Review documents
5. Approve or reject with notes
6. View statistics and manage users

### Doctor Profile Display
```typescript
// Show verification badge
{user.role === 'DOCTOR' && user.doctorVerificationStatus === 'APPROVED' && (
  <span className="verified-badge">
    <CheckCircle /> Verified Doctor
  </span>
)}

// Show specialty
{user.specialty && (
  <span className="specialty">{user.specialty}</span>
)}
```

## Security Considerations

1. **Document Storage**: Store documents securely (S3, encrypted storage)
2. **Access Control**: Only admins can approve/reject
3. **Audit Trail**: Log all verification actions
4. **License Validation**: Verify with issuing authority APIs
5. **Expiry Checks**: Monitor license expiry dates
6. **Rate Limiting**: Prevent abuse of verification endpoints

## Middleware Protection

### Doctor Actions Middleware
```typescript
export const requireVerifiedDoctor = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.userId) {
    return next(new UnauthorizedError('Authentication required'));
  }

  const canAct = await doctorVerificationService.canDoctorAct(req.userId);
  
  if (!canAct) {
    return next(new ForbiddenError(
      'Only verified doctors can perform this action'
    ));
  }

  next();
};
```

### Usage in Routes
```typescript
// Protect doctor-specific endpoints
router.post('/medical-advice', 
  authenticate, 
  requireVerifiedDoctor, 
  postController.createMedicalAdvice
);
```

## Testing

### Test Doctor Registration
```bash
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "doctor@test.com",
    "username": "testdoctor",
    "password": "Test@123456",
    "role": "DOCTOR"
  }'
```

### Test Admin Login
```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@medthread.com",
    "password": "Admin@123456"
  }'
```

## Notifications (To Implement)

1. **Email Notifications**:
   - Doctor: Verification submitted
   - Doctor: Verification approved
   - Doctor: Verification rejected (with reason)
   - Admin: New verification request

2. **In-App Notifications**:
   - Real-time updates on verification status
   - Admin dashboard alerts for pending requests

## Future Enhancements

1. **Automated Verification**: Integration with medical license APIs
2. **Video Verification**: Optional video call for identity verification
3. **Periodic Re-verification**: Annual license renewal checks
4. **Reputation System**: Track doctor performance and feedback
5. **Specialization Badges**: Different badges for different specialties
6. **Multi-level Verification**: Basic, Advanced, Expert levels

## Support

For issues or questions:
- Check logs in `apps/api/logs/`
- Review Prisma Studio: `npx prisma studio`
- Contact: admin@medthread.com
