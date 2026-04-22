# Pending Doctors Added for Admin Verification

## ✅ What Was Created

Two unverified doctors have been added to the database. They will appear in the Admin Dashboard under "Pending Approvals" for verification.

## 👨‍⚕️ Doctor 1: Dr. Sarah Johnson

**Specialty:** Cardiology (Interventional)

**Credentials:**
- Email: sarah.johnson@medthread.com
- Password: doctor123
- License: MCI-2012-45678
- Experience: 12 years
- Location: Mumbai, Maharashtra

**Qualifications:**
- MBBS - Grant Medical College, Mumbai (2010)
- MD (Cardiology) - AIIMS Delhi (2014)
- DM (Interventional Cardiology) - PGI Chandigarh (2017)

**Hospital Affiliations:**
- Lilavati Hospital, Mumbai
- Breach Candy Hospital, Mumbai

**Verification Documents:**
- Medical License ✓
- Degree Certificates ✓
- Government ID (Aadhar) ✓

**Submitted:** 2 days ago

---

## 👨‍⚕️ Doctor 2: Dr. Rajesh Kumar

**Specialty:** Orthopedics (Joint Replacement & Sports Medicine)

**Credentials:**
- Email: rajesh.kumar@medthread.com
- Password: doctor123
- License: MCI-2009-34567
- Experience: 15 years
- Location: Bangalore, Karnataka

**Qualifications:**
- MBBS - Bangalore Medical College (2007)
- MS (Orthopedics) - St. Johns Medical College (2011)
- Fellowship in Joint Replacement - Singapore General Hospital (2013)

**Hospital Affiliations:**
- Manipal Hospital, Bangalore
- Apollo Hospital, Bangalore
- Columbia Asia Hospital, Bangalore

**Verification Documents:**
- Medical License ✓
- Degree Certificates ✓
- Government ID (Aadhar) ✓

**Submitted:** 5 days ago

---

## 🔍 How to View in Admin Dashboard

### Step 1: Login as Admin
```
Email: admin@medthread.com
Password: admin123
```

### Step 2: Navigate to Doctor Verification
1. Go to Admin Dashboard
2. Look for "Doctor Verification" or "Pending Approvals" section
3. You should see 2 pending doctors

### Step 3: Review & Approve/Reject
For each doctor, you can:
- View full profile
- Check credentials
- Review verification documents
- Approve ✅ or Reject ❌

---

## 📋 Verification Checklist

When reviewing doctors, check:

✓ Medical license number is valid
✓ Qualifications match claimed degrees
✓ Hospital affiliations are legitimate
✓ Government ID is provided
✓ Experience years are reasonable
✓ Specialization is recognized
✓ Contact information is complete

---

## 🎯 Admin Actions Available

### Approve Doctor:
- Sets `isVerified: true`
- Sets `verificationStatus: 'APPROVED'`
- Doctor can now login and access platform
- Doctor appears in search results
- Can accept appointments

### Reject Doctor:
- Sets `verificationStatus: 'REJECTED'`
- Doctor receives rejection notification
- Can resubmit with corrected information
- Does not appear in search results

### Request More Information:
- Sets `verificationStatus: 'PENDING_INFO'`
- Send message to doctor
- Doctor must provide additional documents
- Returns to pending queue after submission

---

## 🔐 Security Features

**These doctors CANNOT:**
- Login to the platform (until verified)
- Access patient data
- Accept appointments
- Chat with patients
- Appear in doctor search
- Access doctor dashboard

**They CAN:**
- Check their application status
- Receive email notifications
- Update their profile (if allowed)

---

## 📊 Admin Dashboard Features

### Pending Doctors View:
- List of all unverified doctors
- Sort by submission date
- Filter by specialty
- Search by name/email
- Bulk actions (approve/reject multiple)

### Doctor Profile View:
- Complete profile information
- Verification documents viewer
- Education timeline
- Hospital affiliations
- Availability schedule
- Consultation fees

### Verification History:
- Who verified/rejected
- When action was taken
- Reason for rejection (if any)
- Communication logs

---

## 🧪 Testing the Feature

### Test Scenario 1: Approve Doctor
1. Login as admin
2. Go to pending doctors
3. Click on Dr. Sarah Johnson
4. Review credentials
5. Click "Approve"
6. Verify doctor can now login
7. Check doctor appears in search

### Test Scenario 2: Reject Doctor
1. Login as admin
2. Go to pending doctors
3. Click on Dr. Rajesh Kumar
4. Click "Reject"
5. Provide rejection reason
6. Verify doctor receives notification
7. Check doctor cannot login

### Test Scenario 3: Request More Info
1. Login as admin
2. Go to pending doctors
3. Click on any doctor
4. Click "Request More Information"
5. Specify what's needed
6. Verify doctor receives request
7. Check status changes to "Pending Info"

---

## 📧 Email Notifications

### Doctor Receives:
- Application submitted confirmation
- Application under review notification
- Approval notification (with login instructions)
- Rejection notification (with reason)
- Request for more information

### Admin Receives:
- New doctor application alert
- Doctor resubmission notification
- Urgent verification requests

---

## 🔄 Workflow

```
Doctor Registers
    ↓
Submits Credentials
    ↓
Status: PENDING
    ↓
Admin Reviews
    ↓
    ├─→ APPROVED → Doctor can login
    ├─→ REJECTED → Doctor notified
    └─→ PENDING_INFO → Doctor must provide more docs
```

---

## 💡 Tips for Admins

1. **Verify License Numbers:** Cross-check with Medical Council of India database
2. **Check Hospital Affiliations:** Verify with hospital websites
3. **Review Experience:** Ensure years match graduation dates
4. **Look for Red Flags:** Suspicious documents, fake credentials
5. **Be Thorough:** Patient safety depends on verified doctors
6. **Communicate Clearly:** If rejecting, explain why
7. **Set Standards:** Maintain consistent verification criteria

---

## 🚀 Quick Commands

### Run the script to add doctors:
```bash
cd apps/api
npx tsx add-pending-doctors.ts
```

### Check pending doctors in database:
```bash
npx prisma studio
# Navigate to User table
# Filter by: role = 'DOCTOR' AND isVerified = false
```

### Approve a doctor manually (if needed):
```sql
UPDATE "User" 
SET "isVerified" = true, "verificationStatus" = 'APPROVED'
WHERE email = 'sarah.johnson@medthread.com';
```

---

## ✅ Success Criteria

- [ ] 2 doctors appear in pending list
- [ ] Can view full doctor profiles
- [ ] Can approve doctors
- [ ] Can reject doctors
- [ ] Can request more information
- [ ] Approved doctors can login
- [ ] Rejected doctors cannot login
- [ ] Email notifications work
- [ ] Verification history is logged

---

## 🎉 Result

You now have 2 pending doctors in your admin dashboard ready for verification testing!
