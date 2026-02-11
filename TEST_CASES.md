# MedThread - Database & Authentication Test Cases

## Test Environment Setup
- **API Server**: http://localhost:3001
- **Web App**: http://localhost:3000
- **Database**: Supabase PostgreSQL
- **Test Date**: February 10, 2026

---

## 1. DATABASE CONNECTION TESTS

### Test 1.1: Verify Supabase Connection
**Objective**: Ensure the API can connect to Supabase database

**Steps**:
1. Open terminal in project root
2. Run: `node test-supabase-connection.js`

**Expected Result**:
```
✅ Connection successful!
📊 PostgreSQL version: PostgreSQL 17.6
```

**Actual Result**: _____________

**Status**: ☐ Pass ☐ Fail

---

### Test 1.2: Check Database Tables
**Objective**: Verify all required tables exist in Supabase

**Steps**:
1. Go to Supabase Dashboard: https://supabase.com/dashboard/project/lfjqtefsfhkzlzixleee/editor
2. Check for these tables in the "public" schema:
   - User
   - Post
   - Comment
   - Community
   - Vote
   - Appointment
   - DoctorVerification (if exists)

**Expected Result**: All tables listed above should be visible

**Actual Result**: _____________

**Status**: ☐ Pass ☐ Fail

---

### Test 1.3: API Health Check
**Objective**: Verify API server is running and responding

**Steps**:
1. Open browser
2. Navigate to: http://localhost:3001/health

**Expected Result**:
```json
{
  "status": "ok",
  "timestamp": "2026-02-10T..."
}
```

**Actual Result**: _____________

**Status**: ☐ Pass ☐ Fail

---

## 2. PATIENT REGISTRATION TESTS

### Test 2.1: Register New Patient - Valid Data
**Objective**: Successfully create a patient account

**Test Data**:
- Email: `patient1@test.com`
- Username: `patient_test1`
- Password: `TestPass123!`
- Role: Patient

**Steps**:
1. Go to http://localhost:3000/signup
2. Click "Patient" button
3. Fill in the form with test data above
4. Click "Create Patient Account"

**Expected Result**:
- Success message: "Account created successfully! Welcome to MedThread."
- Redirected to home page (/)
- Token stored in localStorage

**Actual Result**: _____________

**Status**: ☐ Pass ☐ Fail

---

### Test 2.2: Register Patient - Duplicate Email
**Objective**: Verify duplicate email validation

**Test Data**:
- Email: `patient1@test.com` (same as Test 2.1)
- Username: `patient_test2`
- Password: `TestPass123!`

**Steps**:
1. Go to http://localhost:3000/signup
2. Fill in form with duplicate email
3. Click "Create Patient Account"

**Expected Result**:
- Error message: "Email already registered"
- Account NOT created

**Actual Result**: _____________

**Status**: ☐ Pass ☐ Fail

---

### Test 2.3: Register Patient - Weak Password
**Objective**: Verify password strength validation

**Test Data**:
- Email: `patient3@test.com`
- Username: `patient_test3`
- Password: `123` (too short)

**Steps**:
1. Go to http://localhost:3000/signup
2. Fill in form with weak password
3. Observe password strength indicator
4. Try to submit

**Expected Result**:
- Password strength shows "Weak" in red
- Error message: "Password must be at least 8 characters"

**Actual Result**: _____________

**Status**: ☐ Pass ☐ Fail

---

### Test 2.4: Register Patient - Invalid Email Format
**Objective**: Verify email format validation

**Test Data**:
- Email: `notanemail` (invalid format)
- Username: `patient_test4`
- Password: `TestPass123!`

**Steps**:
1. Go to http://localhost:3000/signup
2. Fill in form with invalid email
3. Click "Create Patient Account"

**Expected Result**:
- Error message: "Please enter a valid email address"

**Actual Result**: _____________

**Status**: ☐ Pass ☐ Fail

---

## 3. DOCTOR REGISTRATION TESTS

### Test 3.1: Register New Doctor - Complete Valid Data
**Objective**: Successfully create a doctor account with verification

**Test Data**:
- **Basic Info**:
  - Email: `doctor1@test.com`
  - Username: `doctor_test1`
  - Password: `DoctorPass123!`
  
- **Doctor Details**:
  - Medical License Number: `MED123456`
  - Issuing Authority: `Medical Council of India (MCI)` (select from dropdown)
  - License Expiry Date: `2027-12-31`
  - Specialty: `Cardiology` (select from dropdown)
  - Sub-Specialty: `Interventional Cardiology`
  - Years of Experience: `10`
  - Hospital Affiliation: `Apollo Hospital`
  - Clinic Address: `123 Medical Street, Mumbai`
  
- **Documents**: Upload any 3 image/PDF files (< 5MB each)

**Steps**:
1. Go to http://localhost:3000/signup
2. Click "Doctor" button
3. Fill in all fields with test data above
4. Upload 3 documents
5. Click "Create Doctor Account"

**Expected Result**:
- Success message: "Doctor account created successfully! Your verification request has been submitted..."
- Redirected to /login
- Account created with role: DOCTOR
- Verification status: PENDING

**Actual Result**: _____________

**Status**: ☐ Pass ☐ Fail

---

### Test 3.2: Register Doctor - Missing Required Fields
**Objective**: Verify required field validation

**Test Data**:
- Email: `doctor2@test.com`
- Username: `doctor_test2`
- Password: `DoctorPass123!`
- Medical License Number: (leave empty)

**Steps**:
1. Go to http://localhost:3000/signup
2. Click "Doctor" button
3. Fill basic info only, skip license number
4. Try to submit

**Expected Result**:
- Error message: "Please fill all required doctor fields"
- Form NOT submitted

**Actual Result**: _____________

**Status**: ☐ Pass ☐ Fail

---

### Test 3.3: Register Doctor - Missing Documents
**Objective**: Verify document upload validation

**Test Data**:
- Complete all text fields correctly
- Upload only 2 documents (missing 1)

**Steps**:
1. Go to http://localhost:3000/signup
2. Click "Doctor" button
3. Fill all text fields
4. Upload only 2 of 3 required documents
5. Try to submit

**Expected Result**:
- Error message: "Please upload all required documents"
- Form NOT submitted

**Actual Result**: _____________

**Status**: ☐ Pass ☐ Fail

---

### Test 3.4: Register Doctor - File Size Validation
**Objective**: Verify file size limit (5MB)

**Test Data**:
- Complete all fields correctly
- Upload a file larger than 5MB

**Steps**:
1. Go to http://localhost:3000/signup
2. Click "Doctor" button
3. Fill all fields
4. Try to upload a file > 5MB

**Expected Result**:
- Error message: "File size must be less than 5MB"
- File NOT uploaded

**Actual Result**: _____________

**Status**: ☐ Pass ☐ Fail

---

### Test 3.5: Register Doctor - Expired License Date
**Objective**: Verify license expiry date validation

**Test Data**:
- Complete all fields
- License Expiry Date: `2020-01-01` (past date)

**Steps**:
1. Go to http://localhost:3000/signup
2. Click "Doctor" button
3. Fill all fields with past expiry date
4. Try to submit

**Expected Result**:
- Error message: "License expiry date must be in the future"
- Form NOT submitted

**Actual Result**: _____________

**Status**: ☐ Pass ☐ Fail

---

## 4. LOGIN TESTS

### Test 4.1: Login as Patient
**Objective**: Successfully login with patient credentials

**Test Data**:
- Email: `patient1@test.com` (from Test 2.1)
- Password: `TestPass123!`

**Steps**:
1. Go to http://localhost:3000/login
2. Enter credentials
3. Click "Login"

**Expected Result**:
- Success login
- Redirected to `/dashboard/patient`
- Token stored in localStorage
- User data stored in localStorage

**Actual Result**: _____________

**Status**: ☐ Pass ☐ Fail

---

### Test 4.2: Login as Doctor
**Objective**: Successfully login with doctor credentials

**Test Data**:
- Email: `doctor1@test.com` (from Test 3.1)
- Password: `DoctorPass123!`

**Steps**:
1. Go to http://localhost:3000/login
2. Enter credentials
3. Click "Login"

**Expected Result**:
- Success login
- Redirected to `/dashboard/doctor`
- Token stored in localStorage
- User data stored in localStorage

**Actual Result**: _____________

**Status**: ☐ Pass ☐ Fail

---

### Test 4.3: Login - Invalid Credentials
**Objective**: Verify invalid login handling

**Test Data**:
- Email: `patient1@test.com`
- Password: `WrongPassword123!`

**Steps**:
1. Go to http://localhost:3000/login
2. Enter wrong password
3. Click "Login"

**Expected Result**:
- Error message: "Invalid credentials"
- NOT logged in
- Stays on login page

**Actual Result**: _____________

**Status**: ☐ Pass ☐ Fail

---

### Test 4.4: Login - Non-existent User
**Objective**: Verify handling of non-existent user

**Test Data**:
- Email: `nonexistent@test.com`
- Password: `AnyPassword123!`

**Steps**:
1. Go to http://localhost:3000/login
2. Enter non-existent email
3. Click "Login"

**Expected Result**:
- Error message: "Invalid credentials"
- NOT logged in

**Actual Result**: _____________

**Status**: ☐ Pass ☐ Fail

---

## 5. DATABASE VERIFICATION TESTS

### Test 5.1: Verify Patient Record in Database
**Objective**: Confirm patient data is correctly stored

**Steps**:
1. Go to Supabase Dashboard: https://supabase.com/dashboard/project/lfjqtefsfhkzlzixleee/editor
2. Open "User" table
3. Find record with email: `patient1@test.com`

**Expected Result**:
- Record exists
- role = 'PATIENT'
- email = 'patient1@test.com'
- username = 'patient_test1'
- passwordHash exists (not plain text)
- doctorVerificationStatus = null

**Actual Result**: _____________

**Status**: ☐ Pass ☐ Fail

---

### Test 5.2: Verify Doctor Record in Database
**Objective**: Confirm doctor data and verification details are stored

**Steps**:
1. Go to Supabase Dashboard
2. Open "User" table
3. Find record with email: `doctor1@test.com`

**Expected Result**:
- Record exists
- role = 'DOCTOR'
- email = 'doctor1@test.com'
- username = 'doctor_test1'
- doctorVerificationStatus = 'PENDING'
- medicalLicenseNumber = 'MED123456'
- specialty = 'Cardiology'
- yearsOfExperience = 10
- kycDocuments contains base64 data

**Actual Result**: _____________

**Status**: ☐ Pass ☐ Fail

---

### Test 5.3: Verify Password Hashing
**Objective**: Ensure passwords are hashed, not stored in plain text

**Steps**:
1. Go to Supabase Dashboard
2. Open "User" table
3. Check passwordHash column for any user

**Expected Result**:
- passwordHash starts with `$2b$` (bcrypt hash)
- passwordHash is NOT the plain text password
- Length is approximately 60 characters

**Actual Result**: _____________

**Status**: ☐ Pass ☐ Fail

---

## 6. API ENDPOINT TESTS

### Test 6.1: POST /api/auth/register (Patient)
**Objective**: Test patient registration API directly

**Steps**:
1. Open Postman or use curl
2. Send POST request to: http://localhost:3001/api/auth/register
3. Body (JSON):
```json
{
  "email": "api_patient@test.com",
  "username": "api_patient",
  "password": "TestPass123!",
  "role": "PATIENT"
}
```

**Expected Result**:
- Status: 200 OK
- Response:
```json
{
  "success": true,
  "data": {
    "token": "eyJ...",
    "user": {
      "id": "...",
      "username": "api_patient",
      "email": "api_patient@test.com",
      "role": "PATIENT"
    }
  }
}
```

**Actual Result**: _____________

**Status**: ☐ Pass ☐ Fail

---

### Test 6.2: POST /api/auth/register (Doctor)
**Objective**: Test doctor registration API directly

**Steps**:
1. Send POST request to: http://localhost:3001/api/auth/register
2. Body (JSON):
```json
{
  "email": "api_doctor@test.com",
  "username": "api_doctor",
  "password": "DoctorPass123!",
  "role": "DOCTOR"
}
```

**Expected Result**:
- Status: 200 OK
- Response contains token and user with role: "DOCTOR"

**Actual Result**: _____________

**Status**: ☐ Pass ☐ Fail

---

### Test 6.3: POST /api/auth/login
**Objective**: Test login API directly

**Steps**:
1. Send POST request to: http://localhost:3001/api/auth/login
2. Body (JSON):
```json
{
  "email": "patient1@test.com",
  "password": "TestPass123!"
}
```

**Expected Result**:
- Status: 200 OK
- Response contains valid JWT token
- User object returned

**Actual Result**: _____________

**Status**: ☐ Pass ☐ Fail

---

### Test 6.4: POST /api/v1/doctor-verification/submit
**Objective**: Test doctor verification submission API

**Steps**:
1. First login as doctor to get token
2. Send POST request to: http://localhost:3001/api/v1/doctor-verification/submit
3. Headers: `Authorization: Bearer <token>`
4. Body (JSON):
```json
{
  "medicalLicenseNumber": "API_TEST_123",
  "licenseIssuingAuthority": "Medical Council of India (MCI)",
  "licenseExpiryDate": "2027-12-31T00:00:00.000Z",
  "specialty": "Cardiology",
  "yearsOfExperience": 5,
  "documents": {
    "idProof": "data:image/png;base64,iVBORw0KG...",
    "medicalDegree": "data:image/png;base64,iVBORw0KG...",
    "licenseDocument": "data:image/png;base64,iVBORw0KG..."
  }
}
```

**Expected Result**:
- Status: 200 OK
- Verification request created
- User's doctorVerificationStatus updated to PENDING

**Actual Result**: _____________

**Status**: ☐ Pass ☐ Fail

---

## 7. EDGE CASES & ERROR HANDLING

### Test 7.1: SQL Injection Prevention
**Objective**: Verify SQL injection protection

**Test Data**:
- Email: `test@test.com'; DROP TABLE User; --`
- Password: `TestPass123!`

**Steps**:
1. Try to register with malicious email
2. Check if registration fails safely

**Expected Result**:
- Registration fails with validation error
- Database tables remain intact
- No SQL executed

**Actual Result**: _____________

**Status**: ☐ Pass ☐ Fail

---

### Test 7.2: XSS Prevention
**Objective**: Verify XSS attack prevention

**Test Data**:
- Username: `<script>alert('XSS')</script>`
- Email: `xss@test.com`
- Password: `TestPass123!`

**Steps**:
1. Try to register with script in username
2. Check if data is sanitized

**Expected Result**:
- Registration succeeds or fails with validation
- Script NOT executed
- Data stored safely (escaped)

**Actual Result**: _____________

**Status**: ☐ Pass ☐ Fail

---

### Test 7.3: Concurrent Registration
**Objective**: Test race condition handling

**Steps**:
1. Open two browser tabs
2. Try to register same email simultaneously in both tabs
3. Submit both forms at the same time

**Expected Result**:
- Only ONE account created
- Second attempt gets "Email already registered" error

**Actual Result**: _____________

**Status**: ☐ Pass ☐ Fail

---

### Test 7.4: Token Expiration
**Objective**: Verify JWT token expiration handling

**Steps**:
1. Login and get token
2. Wait for token to expire (7 days based on JWT_EXPIRES_IN)
3. Try to access protected endpoint with expired token

**Expected Result**:
- Request rejected with 401 Unauthorized
- Error message about expired token

**Actual Result**: _____________

**Status**: ☐ Pass ☐ Fail

---

## 8. UI/UX VALIDATION TESTS

### Test 8.1: Password Strength Indicator
**Objective**: Verify password strength visual feedback

**Steps**:
1. Go to signup page
2. Type passwords of varying strength:
   - `123` (weak)
   - `password123` (medium)
   - `P@ssw0rd!2024` (strong)

**Expected Result**:
- Weak: Red bar, "Weak" label
- Medium: Yellow bar, "Medium" label
- Strong: Green bar, "Strong" label

**Actual Result**: _____________

**Status**: ☐ Pass ☐ Fail

---

### Test 8.2: Dropdown Functionality
**Objective**: Verify specialty and authority dropdowns work

**Steps**:
1. Go to doctor signup
2. Click "Medical Specialty" dropdown
3. Click "Issuing Authority" dropdown

**Expected Result**:
- Specialty dropdown shows 25+ options
- Authority dropdown shows 6+ options
- Can select and value is captured

**Actual Result**: _____________

**Status**: ☐ Pass ☐ Fail

---

### Test 8.3: File Upload Feedback
**Objective**: Verify file upload visual feedback

**Steps**:
1. Go to doctor signup
2. Upload a document
3. Check for confirmation

**Expected Result**:
- Green checkmark appears
- File name displayed
- "✓ Uploaded" message shown

**Actual Result**: _____________

**Status**: ☐ Pass ☐ Fail

---

### Test 8.4: Real-time Validation Messages
**Objective**: Verify inline validation feedback

**Steps**:
1. Go to signup page
2. Enter mismatched passwords
3. Check for real-time feedback

**Expected Result**:
- "✗ Passwords do not match" shown in red
- Updates as you type

**Actual Result**: _____________

**Status**: ☐ Pass ☐ Fail

---

## TEST SUMMARY

**Total Tests**: 34
**Passed**: _____
**Failed**: _____
**Pass Rate**: _____%

---

## DEBUGGING CHECKLIST

If tests fail, check these common issues:

### Database Connection Issues
- [ ] Verify DATABASE_URL in `.env` files
- [ ] Check Supabase project is not paused
- [ ] Confirm network can reach Supabase
- [ ] Run `node test-supabase-connection.js`

### API Server Issues
- [ ] Check API server is running on port 3001
- [ ] Verify no port conflicts
- [ ] Check API logs for errors
- [ ] Confirm CORS settings allow localhost:3000

### Authentication Issues
- [ ] Verify JWT_SECRET is set in .env
- [ ] Check token is being stored in localStorage
- [ ] Confirm Authorization header format: `Bearer <token>`
- [ ] Verify user role matches expected value

### Frontend Issues
- [ ] Check browser console for errors
- [ ] Verify NEXT_PUBLIC_API_URL is set correctly
- [ ] Confirm web server is running on port 3000
- [ ] Clear browser cache and localStorage

### Database Schema Issues
- [ ] Run `npx prisma db push` in packages/database
- [ ] Check all tables exist in Supabase
- [ ] Verify column names match schema
- [ ] Confirm enums are created correctly

---

## NOTES

**Test Environment**:
- Node.js Version: _____
- PostgreSQL Version: 17.6
- Prisma Version: 5.22.0
- Next.js Version: 14.1.0

**Tester Name**: _____________
**Test Date**: _____________
**Test Duration**: _____________

**Additional Comments**:
_____________________________________________
_____________________________________________
_____________________________________________
