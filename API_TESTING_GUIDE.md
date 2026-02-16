# API Testing Guide - Posts & Comments System

## ✅ Servers Running

- **API Server**: http://localhost:3001
- **Web App**: http://localhost:3000

---

## 🧪 Testing the Posts & Comments API

### Prerequisites

1. You need a JWT token to test authenticated endpoints
2. You need a community ID to create posts
3. You need a user ID (from your JWT token)

### Get Your JWT Token

1. Login to the app at http://localhost:3000/login
2. Open browser DevTools (F12)
3. Go to Application > Local Storage
4. Find your JWT token

---

## 📝 API Endpoints to Test

### 1. Create a Post

```bash
curl -X POST http://localhost:3001/api/v1/posts \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My First Post via API",
    "content": "This is a test post created through the new API!",
    "communityId": "COMMUNITY_ID_HERE"
  }'
```

**Expected Response:**
```json
{
  "id": "clxxx...",
  "title": "My First Post via API",
  "content": "This is a test post created through the new API!",
  "score": 0,
  "upvotes": 0,
  "downvotes": 0,
  "commentCount": 0,
  "author": {
    "id": "...",
    "username": "...",
    "role": "PATIENT"
  },
  "community": {
    "id": "...",
    "name": "general",
    "displayName": "General Health"
  }
}
```

---

### 2. Get All Posts

```bash
curl http://localhost:3001/api/v1/posts?sort=new&limit=10
```

**Query Parameters:**
- `sort`: `hot`, `new`, `top`, `rising`
- `limit`: Number of posts (default: 20)
- `offset`: Pagination offset (default: 0)
- `community`: Filter by community name
- `authorId`: Filter by author

---

### 3. Get Single Post

```bash
curl http://localhost:3001/api/v1/posts/POST_ID
```

---

### 4. Vote on Post

**Upvote:**
```bash
curl -X POST http://localhost:3001/api/v1/posts/POST_ID/vote \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"value": 1}'
```

**Downvote:**
```bash
curl -X POST http://localhost:3001/api/v1/posts/POST_ID/vote \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"value": -1}'
```

**Remove Vote (Toggle):**
Click the same vote button again - the API will detect and remove your vote.

---

### 5. Save Post

```bash
curl -X POST http://localhost:3001/api/v1/posts/POST_ID/save \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "saved": true  // or false if unsaving
}
```

---

### 6. Hide Post

```bash
curl -X POST http://localhost:3001/api/v1/posts/POST_ID/hide \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 7. Create Comment

```bash
curl -X POST http://localhost:3001/api/v1/comments \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Great post! Thanks for sharing.",
    "postId": "POST_ID_HERE"
  }'
```

**Create Nested Reply:**
```bash
curl -X POST http://localhost:3001/api/v1/comments \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "I agree with this comment!",
    "postId": "POST_ID_HERE",
    "parentId": "PARENT_COMMENT_ID"
  }'
```

---

### 8. Get Comments for a Post

```bash
curl http://localhost:3001/api/v1/comments?postId=POST_ID
```

**Response:** Returns a nested tree structure
```json
[
  {
    "id": "comment1",
    "content": "Top level comment",
    "score": 5,
    "depth": 0,
    "author": {...},
    "replies": [
      {
        "id": "comment2",
        "content": "Nested reply",
        "score": 2,
        "depth": 1,
        "replies": []
      }
    ]
  }
]
```

---

### 9. Vote on Comment

```bash
curl -X POST http://localhost:3001/api/v1/comments/COMMENT_ID/vote \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"value": 1}'
```

---

### 10. Update Post

```bash
curl -X PUT http://localhost:3001/api/v1/posts/POST_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Title",
    "content": "Updated content"
  }'
```

---

### 11. Delete Post

```bash
curl -X DELETE http://localhost:3001/api/v1/posts/POST_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Note:** This is a soft delete - the post will show `[deleted]` instead of being removed.

---

## 🎯 Testing Scenarios

### Scenario 1: Create and Vote on a Post

1. Create a post
2. Get the post ID from response
3. Upvote the post
4. Check that score increased to 1
5. Upvote again (toggle off)
6. Check that score returned to 0

### Scenario 2: Nested Comments

1. Create a post
2. Add a top-level comment
3. Reply to that comment (use parentId)
4. Reply to the reply (nested 2 levels)
5. Get all comments and verify tree structure

### Scenario 3: Karma Calculation

1. Create a post
2. Have another user upvote it
3. Check your user profile - postKarma should increase
4. Create a comment
5. Have another user upvote it
6. Check your user profile - commentKarma should increase

### Scenario 4: Sorting Algorithms

1. Create multiple posts at different times
2. Vote on them with different scores
3. Test each sort option:
   - `?sort=new` - Newest first
   - `?sort=top` - Highest score first
   - `?sort=hot` - Hot algorithm
   - `?sort=rising` - Rising algorithm

---

## 🔍 Debugging Tips

### Check API Logs

The API server logs all requests. Watch the terminal where you ran `npm run dev` in `apps/api`.

### Check Database

```bash
cd packages/database
npx prisma studio
```

This opens a GUI to view your database tables.

### Common Errors

**401 Unauthorized:**
- Your JWT token is missing or invalid
- Get a fresh token by logging in again

**400 Bad Request:**
- Missing required fields
- Check the request body matches the expected format

**404 Not Found:**
- Post or comment ID doesn't exist
- Check you're using the correct ID

**403 Forbidden:**
- Trying to edit/delete someone else's post
- Only the author can modify their content

---

## 📊 Expected Behavior

### Voting
- ✅ Can upvote or downvote
- ✅ Clicking same vote removes it (toggle)
- ✅ Switching from upvote to downvote works
- ✅ Score updates immediately
- ✅ Karma updates for post author

### Comments
- ✅ Can nest up to 10 levels
- ✅ Returns as tree structure
- ✅ Depth is tracked automatically
- ✅ Can vote on comments
- ✅ Can edit own comments
- ✅ Soft delete shows [deleted]

### Posts
- ✅ Can create with title + content
- ✅ Can edit own posts
- ✅ Can delete own posts (soft delete)
- ✅ Can save/unsave
- ✅ Can hide/unhide
- ✅ Sorting works correctly

---

## ✅ Success Criteria

Test each of these:

- [ ] Create a post successfully
- [ ] Get list of posts
- [ ] Get single post by ID
- [ ] Upvote a post
- [ ] Downvote a post
- [ ] Toggle vote (remove vote)
- [ ] Save a post
- [ ] Hide a post
- [ ] Create a comment
- [ ] Create nested reply
- [ ] Vote on comment
- [ ] Edit own post
- [ ] Delete own post
- [ ] Get comment tree
- [ ] Karma updates after votes
- [ ] Hot sorting works
- [ ] Rising sorting works

---

## 🎉 Next Steps

Once you've verified the API works:

1. **Update Frontend** - Modify Zustand store to use these endpoints
2. **Add Communities** - Implement community creation and management
3. **Add Search** - Full-text search across posts
4. **Add Awards** - Award system for posts/comments

---

**Happy Testing! 🚀**

The posts and comments system is now fully functional with database persistence!