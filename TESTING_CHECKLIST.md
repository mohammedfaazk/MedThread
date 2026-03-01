# MedThread Testing Checklist

## 🚀 Application Status

### Servers Running
- ✅ **Backend API**: http://localhost:3001
- ✅ **Frontend**: http://localhost:3000
- ✅ **Database**: Connected to Supabase PostgreSQL
- ✅ **Prisma Client**: Generated
- ⚠️ **Email**: Console logging (credentials not configured)

---

## 📋 Core Features Testing Guide

### 1. Authentication & User Management

#### Patient Registration
- [ ] Navigate to http://localhost:3000/signup
- [ ] Fill in patient registration form:
  - Email: test-patient@example.com
  - Username: test_patient (3-20 chars, alphanumeric + underscore)
  - Password: TestPass123! (min 8 chars)
  - Confirm Password
- [ ] Verify password strength indicator works
- [ ] Click "Create Patient Account"
- [ ] Verify successful registration and redirect to homepage
- [ ] Check that user is logged in (avatar in navbar)

#### Doctor Registration
- [ ] Navigate to http://localhost:3000/signup/doctor
- [ ] Complete Step 1 - Account Details:
  - Full Name: Dr. Test Doctor
  - Email: test-doctor@example.com
  - Phone: +91 9876543210
  - Password: TestPass123!
  - Confirm Password
- [ ] Click "Next Step"
- [ ] Complete Step 2 - Professional Info:
  - Medical License Number: MCI-12345
  - License Authority: Medical Council of India
  - License Expiry Date: (future date)
  - Specialization: General Physician
  - Years of Experience: 5
  - Hospital Name: Test Hospital
  - Hospital Address: Test Address
- [ ] Click "Next Step"
- [ ] Complete Step 3 - Verification:
  - Capture profile photo (or skip if camera not available)
  - Upload medical license document (PDF/JPG/PNG, max 5MB)
- [ ] Click "Submit Application"
- [ ] Verify success message about verification pending
- [ ] Verify redirect to login page

#### Login
- [ ] Navigate to http://localhost:3000/login
- [ ] Login with patient credentials
- [ ] Verify successful login and redirect
- [ ] Check navbar shows correct avatar and username
- [ ] Logout
- [ ] Login with doctor credentials
- [ ] Verify doctor role badge shows in navbar

---

### 2. Profile Management (Task 7 Features)

#### Username Availability Check
- [ ] Login as any user
- [ ] Navigate to http://localhost:3000/settings/profile
- [ ] Try changing username to existing username
- [ ] Verify ✗ indicator and "Username is already taken" message
- [ ] Try changing to available username
- [ ] Verify ✓ indicator and "Username is available" message
- [ ] Verify debounced checking (500ms delay)
- [ ] Try invalid format (special chars, too short, too long)
- [ ] Verify format validation messages

#### Avatar Upload
- [ ] In profile settings, click "Upload Avatar"
- [ ] Select image file (max 2MB, JPEG/PNG/WebP)
- [ ] Verify preview shows
- [ ] Click "Save Changes"
- [ ] Verify avatar updates in navbar immediately
- [ ] Verify no error when saving without changing avatar
- [ ] Try uploading file > 2MB
- [ ] Verify error message

#### Banner Upload
- [ ] In profile settings, click banner upload area
- [ ] Select image file (max 5MB, JPEG/PNG/WebP)
- [ ] Verify preview shows
- [ ] Click "Save Changes"
- [ ] Verify banner saves successfully
- [ ] Verify no error when saving without changing banner

#### Bio & Specialty
- [ ] Update bio (max 500 characters)
- [ ] Verify character counter works
- [ ] For doctors: Update specialty field
- [ ] Click "Save Changes"
- [ ] Verify success message

---

### 3. User Profile Page

#### View Own Profile
- [ ] Click on your avatar in navbar
- [ ] Click "My Profile"
- [ ] Verify route is `/u/[username]` (not `/u/[username]/profile`)
- [ ] Verify banner displays full-width at top
- [ ] Verify avatar overlaps banner correctly
- [ ] Verify name, username, bio display
- [ ] Verify stats show (karma, posts, comments)
- [ ] For doctors: Verify specialty badge shows
- [ ] For verified doctors: Verify verification badge shows
- [ ] Verify tabs work (Posts, Comments, About)

#### View Other User Profile
- [ ] Create second user account
- [ ] Navigate to first user's profile: `/u/[username]`
- [ ] Verify all profile information displays
- [ ] Verify "Message" button shows
- [ ] For verified doctors: Verify "Book Appointment" button shows (if viewing as patient)
- [ ] Verify "Report" button shows
- [ ] Verify cannot see "Edit Profile" button

---

### 4. Post Management

#### Create Post
- [ ] Navigate to homepage http://localhost:3000
- [ ] Click "Create Post" button
- [ ] Fill in post details:
  - Title: Test Post Title
  - Content: Test post content
  - Select community (if available)
- [ ] Click "Post"
- [ ] Verify post appears in feed
- [ ] Verify post shows author avatar and username

#### View Post
- [ ] Click on a post in the feed
- [ ] Verify post detail page loads
- [ ] Verify all post content displays
- [ ] Verify author information shows
- [ ] Verify upvote/downvote buttons work

#### Comment on Post
- [ ] On post detail page, scroll to comments
- [ ] Write a comment
- [ ] Click "Comment"
- [ ] Verify comment appears
- [ ] Verify comment shows your avatar and username

---

### 5. Search Functionality

#### Search Autocomplete
- [ ] Click on search bar in navbar
- [ ] Type at least 2 characters
- [ ] Verify autocomplete suggestions appear
- [ ] Verify suggestions show:
  - Posts (with search icon)
  - Users (with user icon and verification badge if applicable)
  - Communities (with community icon)
- [ ] Click on a suggestion
- [ ] Verify navigation to correct page

#### Recent Searches
- [ ] Click on search bar (empty)
- [ ] Verify recent searches show
- [ ] Click "Clear All"
- [ ] Verify recent searches cleared
- [ ] Perform new search
- [ ] Verify it appears in recent searches

---

### 6. Navigation & UI

#### Navbar
- [ ] Verify logo links to homepage
- [ ] Verify search bar works
- [ ] Verify notifications bell shows (with red dot if notifications exist)
- [ ] Verify user menu dropdown works
- [ ] Verify avatar displays correctly
- [ ] Verify username and role display below avatar
- [ ] For verified doctors: Verify verification badge shows

#### Sidebar
- [ ] Verify sidebar shows on homepage
- [ ] Verify navigation links work
- [ ] Verify community list shows (if available)

#### Mobile Responsiveness
- [ ] Resize browser to mobile width
- [ ] Verify navbar adapts to mobile
- [ ] Verify sidebar collapses or adapts
- [ ] Verify all features work on mobile

---

### 7. Doctor-Specific Features

#### Doctor Dashboard
- [ ] Login as doctor
- [ ] Navigate to http://localhost:3000/dashboard/doctor
- [ ] Verify dashboard loads
- [ ] Verify doctor-specific features show

#### Appointment Booking
- [ ] Login as patient
- [ ] Navigate to verified doctor's profile
- [ ] Click "Book Appointment"
- [ ] Verify appointment calendar shows
- [ ] Select date and time
- [ ] Submit appointment request
- [ ] Verify success message

---

### 8. Settings

#### Profile Settings
- [ ] Navigate to http://localhost:3000/settings
- [ ] Click "Profile Settings"
- [ ] Verify all fields load with current data
- [ ] Test all profile update features (covered in section 2)

#### Security Settings
- [ ] Navigate to http://localhost:3000/settings/security
- [ ] Test password change:
  - Current password
  - New password (min 8 chars)
  - Confirm new password
- [ ] Verify password change works
- [ ] Test 2FA setup (if implemented)

---

### 9. Error Handling

#### Invalid Routes
- [ ] Navigate to http://localhost:3000/invalid-route
- [ ] Verify 404 page shows

#### Network Errors
- [ ] Stop backend server
- [ ] Try to perform action requiring API
- [ ] Verify error message shows
- [ ] Restart backend server

#### Validation Errors
- [ ] Try submitting forms with invalid data
- [ ] Verify validation messages show
- [ ] Verify form doesn't submit

---

### 10. Data Persistence

#### Logout/Login
- [ ] Update profile (avatar, bio, etc.)
- [ ] Logout
- [ ] Login again
- [ ] Verify all changes persisted
- [ ] Verify avatar shows in navbar

#### Browser Refresh
- [ ] Make changes (create post, update profile, etc.)
- [ ] Refresh browser
- [ ] Verify changes persisted
- [ ] Verify still logged in

---

## 🐛 Known Issues to Watch For

1. **Avatar Sync**: Existing users may need to logout/login to see avatar in navbar
2. **Email**: Email notifications will log to console (not sent via email)
3. **Doctor Verification**: Requires admin approval (manual process)
4. **Image Upload**: Only JPEG, PNG, WebP supported
5. **File Size Limits**: Avatar 2MB, Banner 5MB

---

## 📊 Test Results Template

### Test Session Information
- **Date**: February 25, 2026
- **Tester**: [Your Name]
- **Browser**: [Chrome/Firefox/Safari/Edge]
- **OS**: Windows

### Results Summary
- Total Tests: [X]
- Passed: [X]
- Failed: [X]
- Blocked: [X]

### Failed Tests
| Test Case | Expected | Actual | Severity | Notes |
|-----------|----------|--------|----------|-------|
| Example | Should work | Doesn't work | High | Error message XYZ |

---

## 🔧 Quick Commands

### View Backend Logs
```bash
# In terminal, the backend logs are visible in the running process
# Or check the process output
```

### View Frontend Logs
- Open browser DevTools (F12)
- Go to Console tab
- Check for errors or warnings

### Restart Servers
```bash
# Stop and restart if needed
# Backend: Ctrl+C in backend terminal, then npm run dev
# Frontend: Ctrl+C in frontend terminal, then npm run dev
```

### Check Database
```bash
# Use Prisma Studio
cd packages/database
npx prisma studio
# Opens at http://localhost:5555
```

---

## ✅ Testing Complete

Once all tests are complete:
1. Document any bugs found
2. Note any performance issues
3. Suggest improvements
4. Verify all Task 7 features work correctly

**Happy Testing! 🎉**
