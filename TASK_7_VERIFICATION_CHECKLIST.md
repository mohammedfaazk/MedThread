# Task 7 - Verification Checklist

Use this checklist to verify all features are working correctly.

## ✅ Task 1: Username Availability Check

### Backend Verification
- [ ] API endpoint exists: `GET /api/profile/check-username?username=test`
- [ ] Returns `available: true` for new usernames
- [ ] Returns `available: false` for existing usernames
- [ ] Validates format (3-20 chars, alphanumeric + underscore)
- [ ] Returns proper error messages

### Frontend Verification - Profile Settings
- [ ] Navigate to `/settings/profile`
- [ ] Username field is visible
- [ ] Type a new username
- [ ] See loading spinner while checking
- [ ] See green ✓ for available username
- [ ] See red ✗ for taken username
- [ ] See validation message below field
- [ ] Try username with 2 chars (should show error)
- [ ] Try username with special chars (should show error)
- [ ] Try username with 21 chars (should show error)

### Frontend Verification - Signup
- [ ] Navigate to `/signup`
- [ ] Username field is present
- [ ] Has validation rules displayed
- [ ] Can enter username
- [ ] Form validates before submission

- [ ] Navigate to `/signup/doctor`
- [ ] Username field is present in step 1
- [ ] Has validation rules
- [ ] Can enter username

---

## ✅ Task 2: Navbar Avatar Update

### Initial State
- [ ] Login to your account
- [ ] Check navbar profile button
- [ ] Should show avatar if you have one
- [ ] Should show initials if no avatar
- [ ] Avatar should be circular
- [ ] Should have proper styling

### After Upload
- [ ] Go to `/settings/profile`
- [ ] Click "Upload Avatar"
- [ ] Select an image file (JPG, PNG, or WebP)
- [ ] See preview of selected image
- [ ] Click "Save Changes"
- [ ] Wait for success message
- [ ] Page should reload automatically
- [ ] Check navbar - should show new avatar
- [ ] Avatar should be clear and not distorted

### Fallback Behavior
- [ ] Create a new account without avatar
- [ ] Check navbar
- [ ] Should show initials in colored circle
- [ ] Initials should be first letter of username
- [ ] Circle should have gradient background

---

## ✅ Task 3: User Profile Route & Display

### Profile Route
- [ ] Navigate to `/u/your_username`
- [ ] Page loads successfully
- [ ] No 404 error
- [ ] No console errors

### Banner Display
- [ ] Banner is visible at top of profile
- [ ] If you have a banner, it displays correctly
- [ ] If no banner, gradient fallback shows
- [ ] Banner is full width
- [ ] Banner height is appropriate (~200px)

### Avatar Display
- [ ] Avatar is visible
- [ ] Avatar overlaps the banner
- [ ] Avatar is large (~128px)
- [ ] Avatar has white border
- [ ] If no avatar, initials show in colored circle

### User Information
- [ ] Username is displayed correctly
- [ ] Role badge shows (Patient, Doctor, Verified Doctor)
- [ ] Bio displays if set
- [ ] Karma count shows
- [ ] For doctors: specialty displays
- [ ] For doctors: years of experience shows
- [ ] For doctors: hospital affiliation shows
- [ ] All text is readable and properly styled

### Profile Tabs
- [ ] Tabs are visible (Posts, Comments, About)
- [ ] Can click between tabs
- [ ] Content changes when switching tabs
- [ ] No errors when switching

---

## ✅ Task 4: All User Profile Instances

### PostCard Component
- [ ] Find a post on homepage
- [ ] Click on author's username (u/author)
- [ ] Should navigate to `/u/author`
- [ ] Profile loads correctly
- [ ] Go back to homepage
- [ ] Try with different posts
- [ ] All author links work

### Search Results
- [ ] Go to search page
- [ ] Search for a user
- [ ] User results show
- [ ] Each user has avatar or initials
- [ ] Click on a user
- [ ] Should navigate to `/u/username`
- [ ] Profile loads correctly

### Leaderboard
- [ ] Navigate to `/leaderboard`
- [ ] User cards are visible
- [ ] Each card shows avatar or initials
- [ ] Click on a user card
- [ ] Should navigate to `/u/username`
- [ ] Profile loads correctly

### Navbar Profile Menu
- [ ] Click on profile button in navbar
- [ ] Dropdown menu opens
- [ ] "My Profile" link is visible
- [ ] Click "My Profile"
- [ ] Should navigate to `/u/your_username`
- [ ] Your profile loads correctly

### RightSidebar (if visible)
- [ ] Check right sidebar on homepage
- [ ] Doctor cards are visible
- [ ] Each doctor has avatar
- [ ] Click on a doctor
- [ ] Should navigate to `/u/doctor_username`
- [ ] Doctor profile loads correctly

### Chat Window (if applicable)
- [ ] Open a chat conversation
- [ ] Other user's avatar is visible
- [ ] Username is displayed
- [ ] Avatar loads correctly

### Comment Sections
- [ ] Find a post with comments
- [ ] Each comment shows author
- [ ] Click on comment author
- [ ] Should navigate to `/u/author`
- [ ] Profile loads correctly

---

## Image Upload Verification

### Avatar Upload
- [ ] Go to `/settings/profile`
- [ ] Click "Upload Avatar"
- [ ] Select image < 2MB
- [ ] Preview shows correctly
- [ ] Click "Save Changes"
- [ ] No errors
- [ ] Success message appears
- [ ] Page reloads
- [ ] New avatar shows in navbar
- [ ] New avatar shows on profile page

### Avatar Upload - Error Cases
- [ ] Try uploading image > 2MB
- [ ] Should show error message
- [ ] Try uploading non-image file
- [ ] Should show error or be rejected
- [ ] Try uploading without selecting file
- [ ] Should not cause errors

### Banner Upload
- [ ] Go to `/settings/profile`
- [ ] Click on banner area
- [ ] Select image < 5MB
- [ ] Preview shows correctly
- [ ] Click "Save Changes"
- [ ] No errors
- [ ] Success message appears
- [ ] Page reloads
- [ ] Navigate to your profile
- [ ] New banner displays correctly

### Banner Upload - Error Cases
- [ ] Try uploading image > 5MB
- [ ] Should show error message
- [ ] Try uploading non-image file
- [ ] Should show error or be rejected

---

## Profile Update Verification

### Bio Update
- [ ] Go to `/settings/profile`
- [ ] Update bio text
- [ ] Click "Save Changes"
- [ ] Success message appears
- [ ] Navigate to your profile
- [ ] New bio displays correctly

### Specialty Update (Doctors Only)
- [ ] Login as doctor
- [ ] Go to `/settings/profile`
- [ ] Update specialty field
- [ ] Click "Save Changes"
- [ ] Success message appears
- [ ] Navigate to your profile
- [ ] New specialty displays correctly

### Username Update
- [ ] Go to `/settings/profile`
- [ ] Change username to available one
- [ ] See green ✓ checkmark
- [ ] Click "Save Changes"
- [ ] Success message appears
- [ ] Page reloads
- [ ] Navbar shows new username
- [ ] Navigate to `/u/new_username`
- [ ] Profile loads with new username

### Multiple Updates at Once
- [ ] Go to `/settings/profile`
- [ ] Upload new avatar
- [ ] Upload new banner
- [ ] Update bio
- [ ] Update username (if available)
- [ ] Click "Save Changes"
- [ ] All changes save successfully
- [ ] Page reloads
- [ ] All changes are visible

---

## Error Handling Verification

### Network Errors
- [ ] Disconnect internet
- [ ] Try to save profile
- [ ] Should show error message
- [ ] Reconnect internet
- [ ] Try again
- [ ] Should work

### Invalid Data
- [ ] Try to save with empty username
- [ ] Should show validation error
- [ ] Try to save with invalid username format
- [ ] Should show validation error
- [ ] Try to save with taken username
- [ ] Should show error message

### API Errors
- [ ] If backend is down
- [ ] Should show appropriate error
- [ ] Should not crash the app
- [ ] Should allow retry

---

## Cross-Browser Testing

### Chrome
- [ ] All features work
- [ ] Images load correctly
- [ ] No console errors

### Firefox
- [ ] All features work
- [ ] Images load correctly
- [ ] No console errors

### Safari
- [ ] All features work
- [ ] Images load correctly
- [ ] No console errors

### Edge
- [ ] All features work
- [ ] Images load correctly
- [ ] No console errors

---

## Mobile Responsiveness

### Mobile View (< 768px)
- [ ] Navbar shows avatar
- [ ] Profile page displays correctly
- [ ] Banner is responsive
- [ ] Avatar is visible
- [ ] Text is readable
- [ ] Buttons are clickable
- [ ] Forms work correctly

### Tablet View (768px - 1024px)
- [ ] Layout adjusts properly
- [ ] All features accessible
- [ ] Images display correctly

---

## Performance Verification

### Load Times
- [ ] Profile page loads in < 2 seconds
- [ ] Images load progressively
- [ ] No layout shift when images load
- [ ] Smooth navigation between pages

### Image Optimization
- [ ] Images are not too large
- [ ] Images load at appropriate resolution
- [ ] No pixelation or blur
- [ ] Proper aspect ratios maintained

---

## Security Verification

### Authentication
- [ ] Cannot access settings without login
- [ ] Cannot update other users' profiles
- [ ] Token is required for API calls
- [ ] Logout works correctly

### Input Validation
- [ ] Username validation prevents injection
- [ ] Bio length is limited (500 chars)
- [ ] Image size is validated
- [ ] File type is validated

---

## Final Checks

### Documentation
- [ ] All documentation files are present
- [ ] README is updated
- [ ] API endpoints are documented
- [ ] Testing guide is complete

### Code Quality
- [ ] No TypeScript errors
- [ ] No console errors in production
- [ ] Code is properly formatted
- [ ] Comments are clear

### User Experience
- [ ] All features are intuitive
- [ ] Error messages are helpful
- [ ] Success messages are clear
- [ ] Loading states are visible
- [ ] No broken links
- [ ] Consistent styling throughout

---

## Sign-Off

- [ ] All checklist items completed
- [ ] All features working as expected
- [ ] No critical bugs found
- [ ] Ready for production

**Verified By:** _______________
**Date:** _______________
**Notes:** _______________
