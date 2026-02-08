# Quick Test Guide - Appointment & Chat System

## 🚀 Prerequisites

1. **Web app running:** `http://localhost:3000`
2. **API running:** `http://localhost:3001`
3. **Supabase doctors table populated** with John Doe and Jane Doe

## 📋 Test Checklist

### ✅ Test 1: View Doctors List (2 minutes)

**Steps:**
1. Open `http://localhost:3000/doctors`
2. Look for doctor cards

**Expected Results:**
- [ ] See "Dr. John Doe M" card
- [ ] See "Dr. Jane Doe" card (if in Supabase)
- [ ] Both show "✓ Verified" badge
- [ ] Both show specialization
- [ ] Both show reputation score
- [ ] Both show hospital name

**If Failed:**
- Check browser console for errors
- Verify Supabase `doctors` table has data
- Check `doctor_data.json` exists in `apps/web/public/`

---

### ✅ Test 2: Doctor Profile Access (2 minutes)

**Steps:**
1. From doctors list, click on "Dr. John Doe M"
2. URL should be `/u/[some-uuid]`

**Expected Results:**
- [ ] Profile page loads successfully
- [ ] Shows doctor name and specialization
- [ ] Shows "Book Appointment" button (if logged in as patient)
- [ ] NO "User not found" error

**If Failed:**
- Check console log: "Found profile: ..."
- Verify `user_id` field exists in Supabase doctors table
- Check fallback to `doctor_data.json` is working

---

### ✅ Test 3: Appointment Booking (5 minutes)

**Prerequisites:** Login as a patient

**Steps:**
1. Go to doctor's profile
2. Click "Book Appointment"
3. View the calendar

**Expected Results:**
- [ ] Calendar shows next 7 days
- [ ] Each day has multiple time slots
- [ ] Slots are clickable (not red)
- [ ] Can select a slot (turns blue)
- [ ] Can enter reason for consultation
- [ ] Can click "Request Appointment"

**After Booking:**
- [ ] Success message appears
- [ ] Slot turns RED with "Not Available"
- [ ] Cannot click the same slot again

**If Failed:**
- Check API endpoint: `/api/appointments/doctors/[doctorId]/availability`
- Check browser network tab for errors
- Verify patient ID is being passed correctly

---

### ✅ Test 4: Doctor Approval (3 minutes)

**Prerequisites:** Login as doctor (John Doe or Jane Doe)

**Steps:**
1. Go to Profile → Appointments tab
2. Look for pending appointments

**Expected Results:**
- [ ] See appointment request from patient
- [ ] Shows patient username
- [ ] Shows appointment time
- [ ] Shows reason for consultation
- [ ] Shows "Approve" and "Reject" buttons
- [ ] Status shows "PENDING"

**After Clicking Approve:**
- [ ] Status changes to "APPROVED"
- [ ] Success message appears
- [ ] Appointment stays in list

**If Failed:**
- Check API endpoint: `/api/appointments/appointments?userId=X&role=doctor`
- Verify doctor ID matches the appointment's `doctorId`
- Check console for errors

---

### ✅ Test 5: Automatic Chat Creation (3 minutes)

**Prerequisites:** Appointment must be APPROVED

**Steps:**
1. Stay logged in as doctor
2. Go to Profile → Online Consultation tab

**Expected Results:**
- [ ] See conversation with the patient
- [ ] Shows patient username
- [ ] Shows appointment status and time
- [ ] Can click to open chat

**As Patient:**
1. Login as the patient who booked
2. Go to Profile → Online Consultation tab

**Expected Results:**
- [ ] See conversation with the doctor
- [ ] Shows doctor username
- [ ] Can click to open chat

**If Failed:**
- Check API: `/api/chat/conversations?userId=X`
- Verify conversation was created on approval
- Check `temp_store.json` for conversation data

---

### ✅ Test 6: Chat Messaging (5 minutes)

**Prerequisites:** Open chat window with doctor/patient

**Steps:**
1. Type a message: "Hello, this is a test"
2. Click Send

**Expected Results:**
- [ ] Message appears in chat window
- [ ] Shows on the right side (your message)
- [ ] Blue background
- [ ] Shows timestamp

**As Other User:**
1. Open the same conversation
2. Look for the message

**Expected Results:**
- [ ] Message appears on the left side
- [ ] Gray background
- [ ] Shows sender username
- [ ] Shows timestamp

**If Failed:**
- Check Socket.io connection in console
- Verify API endpoint: `/api/chat/messages`
- Check if message is saved in `temp_store.json`

---

### ✅ Test 7: Document Attachments (5 minutes)

**Prerequisites:** Open chat window

**Steps:**
1. Click the 📎 attachment button
2. Select an image file (JPG, PNG)
3. Wait for upload

**Expected Results:**
- [ ] Image appears in chat
- [ ] Shows as thumbnail
- [ ] Can click to view full size
- [ ] Shows timestamp

**Test with Document:**
1. Click 📎 again
2. Select a PDF or Word document
3. Wait for upload

**Expected Results:**
- [ ] Document appears with 📄 icon
- [ ] Shows filename
- [ ] Shows "Click to download"
- [ ] Can click to download

**Test File Size Limit:**
1. Try uploading a file > 10MB

**Expected Results:**
- [ ] Error message: "File size must be less than 10MB"
- [ ] File is NOT uploaded

**If Failed:**
- Check API endpoint: `/api/chat/upload`
- Verify file input accepts correct types
- Check browser console for errors

---

### ✅ Test 8: Data Persistence (3 minutes)

**Steps:**
1. Book an appointment
2. Send a few chat messages
3. Stop the API server (Ctrl+C)
4. Restart the API server
5. Refresh the web page

**Expected Results:**
- [ ] Appointment still shows in list
- [ ] Chat messages are still visible
- [ ] Booked slot still shows as red/unavailable
- [ ] No data loss

**Verify File Storage:**
1. Open `apps/api/temp_store.json`

**Expected Results:**
- [ ] File contains appointments array
- [ ] File contains conversations array
- [ ] File contains messages array
- [ ] Data matches what you see in UI

**If Failed:**
- Check if `saveStore()` is being called
- Verify file permissions
- Check if database connection is working

---

## 🐛 Common Issues & Solutions

### Issue: "User not found" on doctor profile
**Solution:**
```bash
# Check if doctor_data.json is accessible
curl http://localhost:3000/doctor_data.json

# Should return JSON with doctor data
```

### Issue: Slots not showing as booked
**Solution:**
```javascript
// Check browser console for:
console.log('Booked appointments:', appointments);
console.log('Slot isBooked:', slot.isBooked);
```

### Issue: Conversation not appearing
**Solution:**
```bash
# Check API logs for:
[API] Created Mock Conversation for approved appointment: conv-xxxxx

# Check temp_store.json:
cat apps/api/temp_store.json | grep conversationsStore
```

### Issue: File upload fails
**Solution:**
```javascript
// Check file size
console.log('File size:', file.size / 1024 / 1024, 'MB');

// Check file type
console.log('File type:', file.type);
```

---

## 📊 Success Criteria

All tests should pass:
- [x] Doctors list shows both John Doe and Jane Doe
- [x] Doctor profiles load without errors
- [x] Can book appointments
- [x] Booked slots show as red/unavailable
- [x] Doctor can approve appointments
- [x] Conversations appear automatically after approval
- [x] Can send text messages
- [x] Can attach images and documents
- [x] Data persists after server restart

---

## 🎯 Next Actions

### If All Tests Pass:
1. ✅ System is working correctly
2. ✅ Ready for production database setup
3. ✅ Can proceed with Supabase migration

### If Tests Fail:
1. Note which test failed
2. Check the "If Failed" section for that test
3. Review console logs and network tab
4. Check `temp_store.json` for data
5. Share error messages for debugging

---

**Estimated Total Testing Time:** 25-30 minutes
**Recommended:** Test in order, as later tests depend on earlier ones
