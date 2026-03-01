# Quick Test Guide: Role-Based Post Creation

## 🎯 What Changed

Doctors and patients now see different post creation forms:
- **Doctors** → CreatePostModal (general discussions)
- **Patients** → /create page (symptom-based posts)

---

## ✅ Test 1: Doctor Flow (2 minutes)

### Steps
1. Login as doctor
2. Go to homepage: http://localhost:3000
3. Click "Create Post" in RightSidebar (right side)
4. **Expected**: Popup modal opens
5. Close modal
6. Click "Discussion Threads" in Sidebar (left side)
7. **Expected**: Same popup modal opens

### What to Look For
- ✅ Modal opens (not a new page)
- ✅ Shows post type tabs (Text, Image, Video, Link, Poll)
- ✅ Has community selector
- ✅ Has title and content fields

---

## ✅ Test 2: Patient Flow (2 minutes)

### Steps
1. Login as patient
2. Go to homepage: http://localhost:3000
3. Click "Create Post" in RightSidebar (right side)
4. **Expected**: Navigates to new page (/create)
5. **Expected**: Shows 3-step symptom form

### What to Look For
- ✅ Navigates to /create page (not a modal)
- ✅ Shows "Step 1 of 3" progress bar
- ✅ Has age, gender, weight fields
- ✅ Can click "Continue" to next step
- ✅ Step 3 has Public/Private privacy options

---

## ⚠️ Test 3: Post Creation (5 minutes)

### As Doctor
1. Click "Create Post"
2. Fill in:
   - Title: "Test Doctor Post"
   - Select any community
   - Add some text content
3. Click "Post"
4. **Check**: Does post appear in feed?

### As Patient
1. Click "Create Post"
2. Fill in Step 1 (age, gender, weight)
3. Click "Continue"
4. Select symptoms in Step 2
5. Click "Continue"
6. Choose "Public" or "Private" in Step 3
7. Add description
8. Click "Publish Post"
9. **Check**: Does post appear in feed?

---

## 🔍 If Posts Don't Show

### Open DevTools
1. Press F12
2. Go to Network tab
3. Create a post
4. Look for these requests:
   - **POST** `/api/v1/posts` → Should be 200 or 201
   - **GET** `/api/v1/posts` → Should return array

### Take Screenshots
- Screenshot of POST request response
- Screenshot of GET request response
- Screenshot of Console tab (any errors)

### Share Results
Report what you see:
- "POST succeeded but GET failed"
- "POST failed with error: ..."
- "Both succeeded but posts not showing"

---

## 🎯 Quick Checklist

### Doctor Tests
- [ ] "Create Post" button opens modal
- [ ] "Discussion Threads" link opens modal
- [ ] Modal has post type tabs
- [ ] Can create a post
- [ ] Post appears in feed

### Patient Tests
- [ ] "Create Post" button navigates to /create
- [ ] Shows 3-step symptom form
- [ ] Can complete all 3 steps
- [ ] Privacy options work
- [ ] Can create a post
- [ ] Post appears in feed

---

## 📝 Expected Results

| Action | Doctor | Patient |
|--------|--------|---------|
| Click "Create Post" | Modal opens | Navigate to /create |
| Form Type | General discussion | Symptom-based |
| Post Types | Text/Image/Video/Link/Poll | Medical consultation |
| Privacy | Community-based | Public/Private modes |

---

## 🚨 Known Issue

**Posts may not show in feed** - This is being investigated.

If you see "Post created successfully" but the post doesn't appear:
1. Open DevTools → Network tab
2. Check POST and GET requests
3. Take screenshots
4. Report findings

---

## ⏱️ Total Test Time: ~10 minutes

1. Doctor flow: 2 min
2. Patient flow: 2 min
3. Post creation: 5 min
4. Debugging (if needed): 5 min

---

## 🎉 Success!

If both doctor and patient flows work correctly, the implementation is successful!

The post visibility issue is separate and being investigated.
