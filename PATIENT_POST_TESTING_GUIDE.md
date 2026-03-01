# Patient Post Features - Testing Guide

## 📋 Overview
Patient posts are symptom-based medical consultation posts created by patients. They differ from regular posts by including structured medical information and privacy controls.

---

## 🎯 Features to Test

### 1. Access Patient Post Creation
### 2. Fill Symptom Form (3 Steps)
### 3. Post Formatting & Display
### 4. Privacy Controls
### 5. Community Selection
### 6. Post Visibility & Responses

---

## 🧪 Test 1: Access Patient Post Creation

### Prerequisites
- ✅ Backend running on http://localhost:3001
- ✅ Frontend running on http://localhost:3000
- ✅ Logged in as PATIENT role

### Test Steps

1. **Login as Patient**
   - Navigate to http://localhost:3000/login
   - Login with patient credentials (e.g., navin_7)
   - Verify you're logged in (avatar in navbar)

2. **Access Create Post**
   - From homepage, click "Create Post" button in sidebar OR
   - Click "Create Post" in right sidebar
   - **Expected**: Should navigate to `/create` page (NOT open modal)
   - **Why**: Patients use full form, doctors use modal

3. **Verify Page Loads**
   - ✅ Page title: "Share Your Health Concern"
   - ✅ Step indicator shows: Step 1 of 3
   - ✅ Form fields visible
   - ✅ "Next" button visible

### Expected Results
- ✅ Patient redirected to `/create` page
- ✅ Doctor would see modal instead
- ✅ Form loads without errors

### Console Logs to Check
```
No errors should appear
```

---

## 🧪 Test 2: Fill Symptom Form - Step 1 (Description)

### Test Steps

1. **Fill Description Field**
   ```
   Description: "I have been experiencing severe headaches for the past 3 days. 
   The pain is mostly on the right side of my head and gets worse in the evening. 
   I also feel nauseous sometimes."
   ```
   - Character limit: 500 characters
   - Verify character counter updates
   - Try exceeding limit (should prevent)

2. **Validation Tests**
   - Leave description empty → Click "Next"
   - **Expected**: Error message "Please describe your symptoms"
   - Fill description → Click "Next"
   - **Expected**: Proceed to Step 2

### Expected Results
- ✅ Character counter shows: "X / 500"
- ✅ Cannot exceed 500 characters
- ✅ Validation prevents empty submission
- ✅ Proceeds to Step 2 when valid

---

## 🧪 Test 3: Fill Symptom Form - Step 2 (Symptoms & Details)

### Test Steps

1. **Select Symptoms**
   - Click on symptom chips to select:
     - ✅ Headache
     - ✅ Nausea
     - ✅ Fatigue
   - Verify selected symptoms are highlighted
   - Click again to deselect
   - Verify deselection works

2. **Fill Patient Information**
   ```
   Age: 25
   Gender: Male
   Weight: 70 kg
   ```
   - Verify all fields accept input
   - Try invalid values (negative age, letters in weight)
   - **Expected**: Validation prevents invalid input

3. **Select Duration**
   - Choose: "1-3 days"
   - Verify selection highlights

4. **Validation Tests**
   - Leave symptoms empty → Click "Next"
   - **Expected**: Error "Please select at least one symptom"
   - Leave age empty → Click "Next"
   - **Expected**: Error "Please fill all required fields"
   - Fill all fields → Click "Next"
   - **Expected**: Proceed to Step 3

### Expected Results
- ✅ Symptom selection works (multi-select)
- ✅ Patient info fields validate correctly
- ✅ Duration selection works
- ✅ Cannot proceed without required fields
- ✅ Proceeds to Step 3 when valid

---

## 🧪 Test 4: Fill Symptom Form - Step 3 (Privacy & Community)

### Test Steps

1. **Select Privacy Mode**
   - Two options available:
     - 🌐 **Public**: "Visible to all users"
     - 🔒 **Private**: "Only visible to doctors"
   - Click "Public"
   - Verify selection highlights
   - Click "Private"
   - Verify selection changes

2. **Select Community**
   - Dropdown should show available communities
   - Select a community (e.g., "m/mentalhealth")
   - Verify selection shows in dropdown
   - **Note**: Communities should be fetched from API

3. **Review Summary**
   - Verify summary shows:
     - ✅ Description preview
     - ✅ Selected symptoms
     - ✅ Patient details
     - ✅ Duration
     - ✅ Privacy mode
     - ✅ Community

4. **Submit Post**
   - Click "Publish Post" button
   - Verify loading state shows
   - Wait for success message

### Expected Results
- ✅ Privacy toggle works
- ✅ Community dropdown loads communities
- ✅ Summary displays all entered data
- ✅ Submit button shows loading state
- ✅ Success message appears
- ✅ Redirects to homepage after success

### API Call to Check
```
POST http://localhost:3001/api/posts
Authorization: Bearer {token}

Request Body:
{
  "title": "Headache, Nausea, Fatigue and more",
  "content": "[Formatted content with symptoms]",
  "communityId": "selected_community_id",
  "flair": "💬 Consultation" or "🔒 Private",
  "isPrivate": true/false
}
```

### Backend Logs to Check
```
POST /api/posts 201
[API] Post created successfully
```

---

## 🧪 Test 5: Post Formatting & Display

### Test Steps

1. **Navigate to Homepage**
   - After post creation, you should be redirected
   - Scroll through feed to find your post

2. **Verify Post Format**
   The post should display with this format:
   ```
   [Username] • [Time ago]
   [Flair: 💬 Consultation or 🔒 Private]
   
   Title: Headache, Nausea, Fatigue and more
   
   [Description]
   I have been experiencing severe headaches for the past 3 days...
   
   ─────────────────────────
   
   📋 Patient Information
   Age: 25 • Gender: Male • Weight: 70 kg
   
   🩺 Symptoms
   • Headache
   • Nausea
   • Fatigue
   
   ⏱️ Duration: 1-3 days
   ```

3. **Check Formatting Elements**
   - ✅ Description appears first (most prominent)
   - ✅ Horizontal line separator
   - ✅ Emoji icons (📋 🩺 ⏱️)
   - ✅ Patient details on one line
   - ✅ Symptoms as bullet points
   - ✅ Clean, readable format
   - ✅ NO visible JSON or markdown syntax

4. **Verify Post Metadata**
   - ✅ Author username and avatar
   - ✅ Time posted (e.g., "5 minutes ago")
   - ✅ Flair badge (Consultation or Private)
   - ✅ Community badge (if selected)
   - ✅ Upvote/downvote buttons
   - ✅ Comment count
   - ✅ Share button

### Expected Results
- ✅ Post displays with clean, readable format
- ✅ All information visible and well-organized
- ✅ Emojis render correctly
- ✅ No JSON-like formatting visible
- ✅ Professional medical consultation appearance

---

## 🧪 Test 6: Privacy Controls

### Test Public Post

1. **Create Public Post**
   - Follow steps 1-4 above
   - Select "Public" privacy mode
   - Submit post

2. **Verify Visibility**
   - ✅ Post appears in main feed
   - ✅ Post visible to all users (logout and check)
   - ✅ Flair shows: "💬 Consultation"
   - ✅ Anyone can view and comment

3. **Test as Different Users**
   - Login as another patient → Can see post
   - Login as doctor → Can see post
   - Logout (guest) → Can see post

### Test Private Post

1. **Create Private Post**
   - Follow steps 1-4 above
   - Select "Private" privacy mode
   - Submit post

2. **Verify Visibility**
   - ✅ Post appears in main feed
   - ✅ Flair shows: "🔒 Private"
   - ✅ Only doctors can view full content
   - ✅ Other patients see limited info

3. **Test as Different Users**
   - Login as patient (not author) → Limited view
   - Login as doctor → Full view
   - Logout (guest) → Cannot see or limited view

### Expected Results
- ✅ Public posts visible to everyone
- ✅ Private posts restricted to doctors
- ✅ Flair correctly indicates privacy level
- ✅ Privacy enforced on backend

### API Endpoint
```
GET http://localhost:3001/api/posts/:id
Authorization: Bearer {token}

Response should respect privacy settings based on user role
```

---

## 🧪 Test 7: Community Selection

### Test Steps

1. **Verify Communities Load**
   - In Step 3, check community dropdown
   - **Expected**: List of communities appears
   - **API Call**: `GET /api/communities`

2. **Select Community**
   - Choose "m/mentalhealth"
   - Submit post
   - Verify post shows community badge

3. **View in Community**
   - Navigate to `/m/mentalhealth`
   - Verify your post appears in community feed
   - Verify community filter works

4. **Test Without Community**
   - Create post without selecting community
   - **Expected**: Post still creates successfully
   - Post appears in "All" feed but not in any community

### Expected Results
- ✅ Communities load dynamically from API
- ✅ Can select community
- ✅ Post appears in selected community
- ✅ Community badge shows on post
- ✅ Optional field (can skip)

### Backend Logs
```
GET /api/communities 200
[API] Fetched X communities
```

---

## 🧪 Test 8: Post Interactions

### Test Steps

1. **View Post Details**
   - Click on your patient post
   - Verify detail page loads
   - Verify all information displays correctly

2. **Doctor Response**
   - Login as verified doctor
   - Find the patient post
   - Add a comment with medical advice
   - Verify comment appears

3. **Patient Reply**
   - Login back as patient
   - View doctor's comment
   - Reply to doctor's comment
   - Verify reply appears

4. **Upvote/Downvote**
   - Test upvoting the post
   - Verify count increases
   - Test downvoting
   - Verify count decreases

5. **Edit Post (if allowed)**
   - Try editing your own post
   - Verify edit works or shows appropriate message

6. **Delete Post**
   - Try deleting your own post
   - Confirm deletion
   - Verify post removed from feed

### Expected Results
- ✅ Post detail page works
- ✅ Doctors can comment
- ✅ Patients can reply
- ✅ Voting works correctly
- ✅ Edit/delete works for author

---

## 🧪 Test 9: Edge Cases & Error Handling

### Test Cases

1. **Empty Form Submission**
   - Try submitting without filling any fields
   - **Expected**: Validation errors show

2. **Very Long Description**
   - Try entering 501+ characters
   - **Expected**: Prevented or truncated

3. **No Symptoms Selected**
   - Skip symptom selection
   - **Expected**: Error message

4. **Invalid Patient Info**
   - Age: -5 or 200
   - Weight: "abc" or -10
   - **Expected**: Validation errors

5. **Network Error**
   - Stop backend server
   - Try submitting post
   - **Expected**: Error message shows
   - Restart backend and retry

6. **Duplicate Submission**
   - Submit post
   - Quickly click submit again
   - **Expected**: Prevented or handled gracefully

7. **Special Characters**
   - Use special characters in description
   - **Expected**: Handled correctly, no XSS

### Expected Results
- ✅ All edge cases handled gracefully
- ✅ Clear error messages
- ✅ No crashes or blank screens
- ✅ Data validation works

---

## 🧪 Test 10: Mobile Responsiveness

### Test Steps

1. **Resize Browser**
   - Open DevTools (F12)
   - Toggle device toolbar (Ctrl+Shift+M)
   - Select mobile device (iPhone, Android)

2. **Test Form on Mobile**
   - Navigate through all 3 steps
   - Verify form is readable
   - Verify buttons are tappable
   - Verify dropdowns work

3. **Test Post Display on Mobile**
   - View created post on mobile
   - Verify formatting is readable
   - Verify no horizontal scroll
   - Verify all elements visible

### Expected Results
- ✅ Form works on mobile
- ✅ All fields accessible
- ✅ Buttons properly sized
- ✅ Post displays correctly
- ✅ No layout issues

---

## 📊 Test Results Checklist

### Form Functionality
- [ ] Step 1: Description field works
- [ ] Step 2: Symptom selection works
- [ ] Step 2: Patient info fields work
- [ ] Step 2: Duration selection works
- [ ] Step 3: Privacy toggle works
- [ ] Step 3: Community dropdown works
- [ ] Step 3: Submit button works
- [ ] Validation prevents invalid submissions
- [ ] Success message appears
- [ ] Redirects to homepage after submit

### Post Display
- [ ] Post appears in feed
- [ ] Description shows first
- [ ] Formatting is clean and readable
- [ ] Emojis render correctly
- [ ] Patient info displays correctly
- [ ] Symptoms list displays correctly
- [ ] Duration displays correctly
- [ ] No JSON or markdown visible
- [ ] Flair badge shows correctly
- [ ] Community badge shows (if selected)

### Privacy Controls
- [ ] Public posts visible to all
- [ ] Private posts restricted to doctors
- [ ] Flair indicates privacy level correctly
- [ ] Privacy enforced on backend

### Community Integration
- [ ] Communities load in dropdown
- [ ] Can select community
- [ ] Post appears in community feed
- [ ] Community badge shows on post
- [ ] Can create post without community

### Interactions
- [ ] Can view post details
- [ ] Doctors can comment
- [ ] Patients can reply
- [ ] Upvote/downvote works
- [ ] Can edit own post
- [ ] Can delete own post

### Error Handling
- [ ] Empty form validation works
- [ ] Character limit enforced
- [ ] Invalid data prevented
- [ ] Network errors handled
- [ ] Clear error messages shown

### Mobile
- [ ] Form works on mobile
- [ ] Post displays correctly on mobile
- [ ] No layout issues

---

## 🐛 Known Issues & Fixes

### Issue 1: Post Content Looks Like JSON
**Symptom**: Post shows raw JSON format
**Fix**: Already implemented - content is now formatted with emojis and clean layout
**Verify**: Check that post displays with 📋 🩺 ⏱️ icons and bullet points

### Issue 2: Community Not Selectable
**Symptom**: Community dropdown empty or not working
**Fix**: Already implemented - communities fetched from API
**Verify**: Dropdown shows list of communities

### Issue 3: Post Not Persisting
**Symptom**: Post creates but doesn't appear in feed
**Fix**: Check backend logs for errors
**Debug**: 
```bash
# Check backend logs (Terminal ID: 13)
# Look for: POST /api/posts 201
# If 500 error, check database connection
```

---

## 🔧 Debugging Tips

### Frontend Console Errors
```javascript
// Open DevTools (F12) → Console tab
// Look for:
- Network errors (red)
- API call failures
- React errors
- Validation errors
```

### Backend Logs
```bash
# Check Terminal ID: 13
# Look for:
POST /api/posts 201 Created
[API] Post created successfully

# Or errors:
POST /api/posts 500 Internal Server Error
[ERROR] Database error: ...
```

### Network Tab
```
1. Open DevTools → Network tab
2. Submit post
3. Find POST request to /api/posts
4. Check:
   - Status: 201 Created
   - Response: Post object with ID
   - Request payload: All data sent correctly
```

### Database Check
```bash
cd packages/database
npx prisma studio --schema=prisma/schema.prisma
# Navigate to Post table
# Verify new post exists with correct data
```

---

## ✅ Quick Test Script

### 5-Minute Quick Test

1. **Login as patient** (30 seconds)
2. **Click "Create Post"** → Should go to `/create` (10 seconds)
3. **Step 1**: Enter description (30 seconds)
4. **Step 2**: Select symptoms, fill patient info (1 minute)
5. **Step 3**: Select privacy & community (30 seconds)
6. **Submit** → Wait for success (30 seconds)
7. **Verify post in feed** → Check formatting (1 minute)
8. **Test as doctor** → Login and view post (1 minute)

**Total**: ~5 minutes

### Expected Outcome
- ✅ Post created successfully
- ✅ Displays with clean formatting
- ✅ Privacy controls work
- ✅ Visible to appropriate users

---

## 📝 Test Report Template

### Test Session
- **Date**: March 1, 2026
- **Tester**: [Your Name]
- **Patient Account**: navin_7
- **Doctor Account**: dr_navin

### Results
| Test | Status | Notes |
|------|--------|-------|
| Form Access | ✅ Pass | Redirects to /create correctly |
| Step 1 - Description | ✅ Pass | Validation works |
| Step 2 - Symptoms | ✅ Pass | Multi-select works |
| Step 3 - Privacy | ✅ Pass | Toggle works |
| Post Formatting | ✅ Pass | Clean display with emojis |
| Privacy Controls | ✅ Pass | Public/Private enforced |
| Community Selection | ✅ Pass | Dropdown loads communities |

### Bugs Found
None / [List any bugs]

### Screenshots
[Attach screenshots of successful post creation and display]

---

**Ready to test! 🚀**

Start with the Quick Test Script above, then go through detailed tests as needed.
