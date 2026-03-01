# Quick Test Reference Card

## 🌐 Application URLs

| Service | URL | Status |
|---------|-----|--------|
| Frontend | http://localhost:3000 | ✅ Running |
| Backend API | http://localhost:3001 | ✅ Running |
| Database | Supabase PostgreSQL | ✅ Connected |

---

## 🎯 Task 7 Features to Test (Priority)

### 1. Username Availability Check ⭐
**URL**: http://localhost:3000/settings/profile

**Test Steps**:
1. Login as any user
2. Go to profile settings
3. Change username field
4. Watch for ✓ (available) or ✗ (taken) indicator
5. Try: existing username, new username, invalid format
6. Save changes

**Expected**: Real-time validation with 500ms debounce, visual feedback, format validation

---

### 2. Avatar Display in Navbar ⭐
**URL**: http://localhost:3000

**Test Steps**:
1. Login as user
2. Check navbar top-right
3. Verify avatar shows (or initials if no avatar)
4. Go to profile settings
5. Upload new avatar
6. Save changes
7. Check navbar again

**Expected**: Avatar updates immediately in navbar, matches profile page

---

### 3. User Profile Page ⭐
**URL**: http://localhost:3000/u/[username]

**Test Steps**:
1. Login as user
2. Click avatar → "My Profile"
3. Verify route is `/u/username` (not `/u/username/profile`)
4. Check banner displays full-width
5. Check avatar overlaps banner
6. Verify name, username, bio, stats show
7. Test tabs (Posts, Comments, About)

**Expected**: Clean layout, banner + avatar display correctly, all info shows

---

### 4. Profile Image Upload ⭐
**URL**: http://localhost:3000/settings/profile

**Test Steps**:
1. Upload avatar (max 2MB)
2. Upload banner (max 5MB)
3. Save WITHOUT changing images
4. Save WITH new images
5. Try uploading oversized file

**Expected**: No error when saving without changes, proper validation, preview works

---

### 5. Avatar Sync ⭐
**Test Steps**:
1. Create new user account
2. Upload avatar in profile settings
3. Check navbar shows avatar
4. Check profile page shows same avatar
5. Logout and login again
6. Verify avatar still shows everywhere

**Expected**: Avatar consistent across navbar and profile, persists after logout/login

---

## 🧪 Quick Smoke Tests

### Authentication (2 min)
```
1. Signup → http://localhost:3000/signup
2. Login → http://localhost:3000/login
3. Logout → Click avatar → Logout
```

### Profile (3 min)
```
1. Settings → http://localhost:3000/settings/profile
2. Update username (check availability)
3. Upload avatar
4. Update bio
5. Save changes
6. View profile → /u/[username]
```

### Posts (2 min)
```
1. Homepage → http://localhost:3000
2. Create post
3. View post
4. Add comment
```

### Search (1 min)
```
1. Click search bar
2. Type 2+ characters
3. Check autocomplete
4. Click suggestion
```

---

## 🔍 Test Accounts

### Create These Test Accounts

**Patient Account**:
- Email: patient@test.com
- Username: test_patient
- Password: TestPass123!

**Doctor Account**:
- Email: doctor@test.com
- Username: test_doctor
- Password: TestPass123!
- Note: Will be pending verification

**Admin Account** (if needed):
```bash
cd apps/api
npm run create:admin
```

---

## 📸 Screenshots to Capture

1. ✅ Homepage with posts
2. ✅ User profile page (banner + avatar)
3. ✅ Profile settings (username check)
4. ✅ Navbar with avatar
5. ✅ Search autocomplete
6. ✅ Post detail page
7. ❌ Any errors encountered

---

## 🐛 Common Issues & Fixes

### Issue: Avatar not showing in navbar
**Fix**: Logout and login again (for existing users)

### Issue: Username check not working
**Check**: 
- Backend running on port 3001
- Network tab in DevTools for API calls
- Console for errors

### Issue: Image upload fails
**Check**:
- File size (Avatar: 2MB, Banner: 5MB)
- File format (JPEG, PNG, WebP only)
- Console for error messages

### Issue: Profile page not found
**Check**:
- URL format: `/u/username` (not `/u/username/profile`)
- Username is correct
- User exists in database

---

## 🎬 Testing Flow (15 min)

### Minute 0-5: Setup
1. Open http://localhost:3000
2. Create patient account
3. Login
4. Verify navbar shows avatar/initials

### Minute 5-10: Profile Features
1. Go to settings/profile
2. Test username availability
3. Upload avatar
4. Upload banner
5. Update bio
6. Save changes

### Minute 10-12: Profile Page
1. Click "My Profile"
2. Verify banner displays
3. Verify avatar overlaps banner
4. Check all info displays
5. Test tabs

### Minute 12-15: Additional Features
1. Create a post
2. Test search
3. View another user's profile
4. Test logout/login

---

## ✅ Success Criteria

All Task 7 features working:
- [x] Username availability check with real-time validation
- [x] Avatar displays in navbar for all users
- [x] User profile page at `/u/username` with banner + avatar
- [x] Image upload works without errors
- [x] Avatar syncs between navbar and profile page

---

## 📞 Need Help?

### Check Logs
**Backend**: Terminal running `npm run dev` in apps/api
**Frontend**: Browser DevTools Console (F12)

### Check Database
```bash
cd packages/database
npx prisma studio
# Opens at http://localhost:5555
```

### Restart Servers
If something goes wrong, restart:
1. Stop both servers (Ctrl+C)
2. Run `npm run dev` in apps/api
3. Run `npm run dev` in apps/web

---

## 🎉 Ready to Test!

**Start here**: http://localhost:3000

**Focus on**: Task 7 features (username check, avatar display, profile page, image upload, avatar sync)

**Time needed**: 15-20 minutes for comprehensive testing

**Good luck! 🚀**
