# Quick Test Guide: Doctor Login & Visibility

## 🚀 Quick Start

### 1. Start the Application
```bash
# Terminal 1: Start the web app
cd apps/web
npm run dev
```

The app should start at `http://localhost:3000`

### 2. Test Doctor Login

**Test Account:**
- **Email:** `drjohndoe.m@gmail.com`
- **Password:** (use your test password)
- **Expected User ID:** `9d8480d1-b32d-4290-b9f3-a7b23bb9c2f4`

**Steps:**
1. Open browser to `http://localhost:3000/login`
2. Enter the test doctor credentials
3. Click "Sign In"

**✅ Expected Behavior:**
- Should redirect to `/dashboard/doctor` (NOT home page)
- Should see "Doctor Dashboard" heading
- Should see "Manage your patient requests and schedule"

**❌ If it fails:**
- Check browser console for error messages
- Look for log: `User identified as VERIFIED_DOCTOR from doctor_data.json`
- Verify the user ID matches in Supabase Auth

### 3. Test Doctor Visibility

**Right Sidebar (Top Doctors):**
1. Navigate to home page `/`
2. Look at the right sidebar
3. Find "Top Doctors This Week" section

**✅ Expected:**
- Should see "Dr. John Doe M"
- Should show "Cardiologist" specialty
- Should show "⭐ 1500" reputation

**Doctors Directory:**
1. Navigate to `/doctors`
2. Check the doctor cards

**✅ Expected:**
- Should see "Dr. John Doe M" card
- Should have "✓ Verified" badge
- Should show "Cardiologist" specialty
- Should show "⭐ 1500 reputation"

## 🔍 Debugging

### Browser Console Logs to Check

**On Login:**
```
Fetching role for userId: 9d8480d1-b32d-4290-b9f3-a7b23bb9c2f4
User identified as VERIFIED_DOCTOR from doctor_data.json, profileId: 7f6b352f-961c-44aa-be98-fcc5debd10c8
[Login] Redirecting doctor to dashboard
```

**On Home Page:**
```
[UI] Supabase doctors empty, loading from doctor_data.json
```

### Common Issues

**Issue 1: Redirects to home instead of dashboard**
- **Cause:** Role not detected as VERIFIED_DOCTOR
- **Fix:** Check if user ID in Supabase Auth matches `9d8480d1-b32d-4290-b9f3-a7b23bb9c2f4`
- **Verify:** Look for console log showing role detection

**Issue 2: No doctors in sidebar/directory**
- **Cause:** `doctor_data.json` not accessible
- **Fix:** Verify file exists at `apps/web/public/doctor_data.json`
- **Test:** Open `http://localhost:3000/doctor_data.json` in browser

**Issue 3: 404 on doctor_data.json**
- **Cause:** Public folder not recognized by Next.js
- **Fix:** Restart the dev server
- **Verify:** Check `apps/web/public/` folder exists

## 📊 Test Checklist

- [ ] Web app starts without errors
- [ ] Can access login page
- [ ] Can login with test doctor credentials
- [ ] Redirects to `/dashboard/doctor` (not home)
- [ ] Dashboard shows doctor-specific content
- [ ] Right sidebar shows "Dr. John Doe M" in Top Doctors
- [ ] `/doctors` page shows "Dr. John Doe M" in directory
- [ ] Doctor has verification badge
- [ ] Doctor shows correct specialization
- [ ] Doctor shows reputation score

## 🎯 Success Criteria

All of the following should be TRUE:
1. ✅ Doctor login redirects to dashboard
2. ✅ Doctor appears in Top Doctors sidebar
3. ✅ Doctor appears in Doctors Directory
4. ✅ Verification badge is visible
5. ✅ Reputation score displays correctly

## 🔧 Next Steps After Testing

### If Tests Pass:
1. Document any additional test doctors needed
2. Proceed with Phase 1: Local database connection
3. Verify Postgres credentials
4. Run `npx prisma db push`

### If Tests Fail:
1. Share console error messages
2. Check Network tab for failed requests
3. Verify Supabase Auth user exists
4. Confirm user ID matches in doctor_data.json

---

**Ready to test?** Start the app and follow the steps above! 🚀
