# Testing Guide - Updated Frontend Integration

## 🚀 Servers Running

- **Web App**: http://localhost:3000
- **API**: http://localhost:3001

---

## ✅ What Was Fixed

### Issue 1: Posts Not Appearing After Creation
**Fixed**: Posts now call the API and appear immediately in the feed

### Issue 2: Username Showing as "current_user"
**Fixed**: Real usernames from JWT token now display correctly

### Issue 3: Placeholder Comments
**Fixed**: Comments now load from database, no more mock data

### Issue 4: Symptom Checker 404
**Fixed**: Created placeholder page at `/symptom-checker`

---

## 🧪 Testing Steps

### 1. Test Post Creation

1. Go to http://localhost:3000
2. Make sure you're logged in (if not, go to `/login`)
3. Click "Create Post" button
4. Fill in:
   - Title: "Testing API Integration"
   - Content: "This post should appear in the feed with my real username!"
   - Community: Select any community
5. Click "Post"
6. **Expected Results**:
   - ✅ Post is created successfully
   - ✅ You're redirected to the post detail page
   - ✅ Your real username appears as the author (not "current_user")
   - ✅ Post appears in the main feed when you go back

### 2. Test Post Sorting

1. Go to main feed
2. Click "New" sorting option
3. **Expected**: Your newly created post should appear at the top
4. Try other sorting options:
   - Hot
   - Top
   - Rising

### 3. Test Voting

1. Find any post in the feed
2. Click the upvote arrow (↑)
3. **Expected**: 
   - Arrow turns orange
   - Score increases by 1
4. Click upvote again
5. **Expected**:
   - Vote is removed (toggle)
   - Arrow returns to gray
   - Score decreases by 1
6. Click downvote (↓)
7. **Expected**:
   - Arrow turns blue
   - Score decreases

### 4. Test Comments

1. Click on any post to open detail page
2. Type a comment in the text box
3. Click "Comment"
4. **Expected**:
   - ✅ Comment appears immediately
   - ✅ Your username shows correctly
   - ✅ If you're a verified doctor, you see the "Verified Doctor" badge
5. Click "Reply" on any comment
6. Type a reply and submit
7. **Expected**:
   - ✅ Reply appears nested under the parent comment
   - ✅ Proper indentation and tree structure

### 5. Test Comment Voting

1. On any comment, click upvote
2. **Expected**: Score increases, arrow turns yellow
3. Click upvote again
4. **Expected**: Vote removed (toggle)

### 6. Test Save/Hide

1. On any post, click "Save"
2. **Expected**: Button text changes to "Saved"
3. Click "Hide"
4. **Expected**: Post disappears from feed

### 7. Test Symptom Checker

1. Go to http://localhost:3000/symptom-checker
2. **Expected**:
   - ✅ Page loads without 404 error
   - ✅ Beautiful UI with symptom input
   - ✅ Medical disclaimer visible
   - ✅ "Coming Soon" notice

---

## 🐛 Known Issues (Not Yet Implemented)

### Image/Video Upload
- **Status**: UI exists but backend not implemented
- **What happens**: Upload button doesn't work
- **Next step**: Need to implement file storage service

### Link Posts
- **Status**: Tab exists but not functional
- **What happens**: Can't create link posts yet
- **Next step**: Need URL validation and preview fetching

### Poll Posts
- **Status**: Tab exists but not functional
- **What happens**: Can't create polls yet
- **Next step**: Need poll options and voting system

---

## 🔍 Debugging Tips

### If posts don't appear:
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for errors
4. Check Network tab for failed API calls

### If you see "current_user":
1. Make sure you're logged in
2. Check localStorage for `auth_token`
3. Try logging out and back in

### If comments don't load:
1. Check browser console for errors
2. Verify API is running on port 3001
3. Check Network tab for `/api/v1/comments` call

### If voting doesn't work:
1. Make sure you're logged in
2. Check if JWT token exists in localStorage
3. Look for 401 Unauthorized errors in Network tab

---

## 📊 Success Criteria

After testing, you should see:

- ✅ Posts created via UI appear in feed
- ✅ Real usernames on posts and comments
- ✅ No "current_user" placeholder
- ✅ No mock/placeholder comments
- ✅ Voting persists after page refresh
- ✅ Comments load from database
- ✅ Symptom checker page loads
- ✅ No 404 errors

---

## 🎯 What to Test Next

1. **Create multiple posts** - Test pagination and sorting
2. **Vote on multiple posts** - Test karma calculation
3. **Create nested comments** - Test up to 3-4 levels deep
4. **Test as different users** - Login with different accounts
5. **Test doctor vs patient** - Verify badges and permissions

---

## 🔐 Authentication Notes

- JWT token stored in `localStorage` as `auth_token`
- User data stored as `user` (JSON object)
- Token automatically included in all API calls
- Token expires after 24 hours (need to re-login)

---

## 📝 API Endpoints Being Used

### Posts
- `POST /api/v1/posts` - Create post
- `GET /api/v1/posts?sort=new` - Get posts
- `GET /api/v1/posts/:id` - Get single post
- `POST /api/v1/posts/:id/vote` - Vote
- `POST /api/v1/posts/:id/save` - Save
- `POST /api/v1/posts/:id/hide` - Hide

### Comments
- `POST /api/v1/comments` - Create comment
- `GET /api/v1/comments?postId=:id` - Get comments
- `POST /api/v1/comments/:id/vote` - Vote on comment

---

## 🎉 Expected Behavior

### Creating a Post:
1. Fill form → Click "Post"
2. Loading state: "Posting..."
3. Success: Redirect to post detail
4. Post appears in feed with real username

### Voting:
1. Click vote arrow
2. Immediate UI update (optimistic)
3. API call in background
4. If error: Revert to previous state

### Comments:
1. Type comment → Click "Comment"
2. Loading state: "Posting..."
3. Comment appears immediately
4. Nested replies work up to 10 levels

---

**Ready to test!** 🚀

All core functionality is now connected to the API. The app should feel much more responsive and real!
