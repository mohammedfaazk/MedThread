# Quick Start Guide - Appointment System

## 🚀 Getting Started

### 1. Start the Backend API
```bash
cd apps/api
npm run dev
```
The API should start on `http://localhost:3001`

### 2. Start the Web Application
```bash
cd apps/web
npm run dev
```
The web app should start on `http://localhost:3000`

## 👥 Test User Accounts

### Admin Account
- **Email**: admin@medthread.com
- **Password**: Admin@123456
- **Purpose**: Approve doctor verification requests

### Create Test Accounts

#### 1. Create a Doctor Account
1. Go to `http://localhost:3000/signup`
2. Fill in the form:
   - Username: `dr_john`
   - Email: `doctor@test.com`
   - Password: `Doctor@123`
   - Role: Select "Doctor"
3. Upload documents:
   - ID Proof (any image/PDF)
   - Medical Degree (any image/PDF)
   - License Document (any image/PDF)
4. Fill in doctor details:
   - License Number: `MED123456`
   - Issuing Authority: `Medical Board`
   - Specialty: `Cardiology`
   - Years of Experience: `10`
   - Hospital: `City Hospital`
5. Click "Sign Up"

#### 2. Approve the Doctor (Admin)
1. Login as admin at `http://localhost:3000/login`
2. Go to `http://localhost:3000/admin`
3. Find the pending doctor request
4. Click "Approve"
5. Logout

#### 3. Create a Patient Account
1. Go to `http://localhost:3000/signup`
2. Fill in the form:
   - Username: `patient_jane`
   - Email: `patient@test.com`
   - Password: `Patient@123`
   - Role: Select "Patient"
3. Click "Sign Up"

## 🔄 Complete Workflow Test

### Step 1: Patient Books Appointment
1. Login as patient (`patient@test.com` / `Patient@123`)
2. You should see the patient dashboard
3. Click "Book Appointment" button (green button)
4. You'll see the list of verified doctors
5. Click on "Dr. dr_john" card
6. Select an available time slot from the right panel
7. Optionally add a reason: "Chest pain consultation"
8. Click "Request Appointment"
9. You should see success message
10. Go back to dashboard - you'll see the appointment with "PENDING" status

### Step 2: Doctor Approves Appointment
1. Logout and login as doctor (`doctor@test.com` / `Doctor@123`)
2. You should see the doctor dashboard
3. In the left column "Pending Appointments", you'll see the patient's request
4. Review the details (patient name, time, reason)
5. Click "Approve" button (green)
6. You should see success message
7. The appointment disappears from pending list

### Step 3: Chat Between Patient and Doctor
1. As doctor, click on the patient in "Recent Chats" (right column)
   - OR go to the conversation via the chat icon
2. You can now send messages to the patient
3. Logout and login as patient
4. Go to dashboard and click "Consultations" button
5. You'll see the conversation with the doctor
6. Send messages back and forth

### Step 4: Doctor Sets Custom Availability (Optional)
1. Login as doctor
2. In the middle column "Schedule Availability":
   - Select day: Monday
   - Start time: 09:00
   - End time: 17:00
3. Click "Add Availability Slot"
4. The slot will appear in "Upcoming Slots"
5. Logout and login as patient
6. Go to "Book Appointment"
7. Click on the doctor
8. You'll see the custom slot along with default slots

## 🎯 Key Features to Test

### Patient Features:
- ✅ View dashboard with upcoming appointments
- ✅ Book new appointments
- ✅ Search doctors by name/specialty
- ✅ Filter doctors by specialty
- ✅ View doctor details and ratings
- ✅ Select time slots
- ✅ Add reason for visit
- ✅ Chat with approved doctors

### Doctor Features:
- ✅ View pending appointment requests
- ✅ Approve/reject appointments
- ✅ Set custom availability
- ✅ View recent chats
- ✅ See appointment statistics
- ✅ Chat with patients

### Admin Features:
- ✅ View pending doctor verifications
- ✅ Approve/reject doctor accounts
- ✅ View doctor documents

## 🐛 Troubleshooting

### Issue: Patient dashboard loading forever
**Solution**: 
- Check browser console for errors
- Verify you're logged in (check localStorage for `auth_token`)
- Ensure API server is running on port 3001

### Issue: No doctors showing in booking page
**Solution**:
- Ensure at least one doctor is approved by admin
- Check API endpoint: `http://localhost:3001/api/v1/doctor-verification/verified`
- Check browser network tab for errors

### Issue: Appointments not appearing
**Solution**:
- Check if appointment was created successfully
- Verify API endpoint: `http://localhost:3001/api/v1/appointments/appointments`
- Check database for appointment records

### Issue: Chat not working
**Solution**:
- Verify appointment is APPROVED (not PENDING)
- Check Socket.IO connection in browser console
- Ensure both users are logged in

### Issue: Can't approve doctor as admin
**Solution**:
- Verify you're logged in as admin
- Check admin credentials: `admin@medthread.com` / `Admin@123456`
- If admin doesn't exist, run: `cd apps/api && npm run seed:admin`

## 📊 Database Check

### Check if admin exists:
```bash
node check-admin.js
```

### Create admin if missing:
```bash
cd apps/api
npm run seed:admin
```

### Check appointments in database:
Use your database client to query:
```sql
SELECT * FROM "Appointment" ORDER BY "createdAt" DESC;
```

### Check verified doctors:
```sql
SELECT id, username, email, specialty, "doctorVerificationStatus" 
FROM "User" 
WHERE role = 'DOCTOR' AND "doctorVerificationStatus" = 'APPROVED';
```

## 🎉 Success Indicators

You'll know everything is working when:
1. ✅ Patient can see verified doctors in booking page
2. ✅ Patient can select time slots and book appointment
3. ✅ Doctor sees pending request in dashboard
4. ✅ Doctor can approve the request
5. ✅ Both can chat after approval
6. ✅ No console errors in browser
7. ✅ API responds to all requests

## 📝 Notes

- Default time slots are automatically generated if doctor hasn't set custom availability
- Weekdays: 4pm-8pm (1-hour slots)
- Weekends: 10am-7pm (1-hour slots)
- All times are in local timezone
- Appointments require doctor approval before chat is enabled
- Only APPROVED doctors appear in booking page

## 🔗 Important URLs

- Web App: http://localhost:3000
- API Server: http://localhost:3001
- Patient Dashboard: http://localhost:3000/dashboard/patient
- Doctor Dashboard: http://localhost:3000/dashboard/doctor
- Admin Dashboard: http://localhost:3000/admin
- Book Appointment: http://localhost:3000/appointments
- Login: http://localhost:3000/login
- Signup: http://localhost:3000/signup

## 💡 Tips

1. Keep both terminal windows open (API and Web)
2. Check browser console for any errors
3. Use browser DevTools Network tab to debug API calls
4. Clear localStorage if you encounter auth issues: `localStorage.clear()`
5. Refresh page after login if dashboard doesn't load
6. Use different browsers/incognito for testing multiple users simultaneously
