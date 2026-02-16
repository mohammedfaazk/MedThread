# Quick Reference - MedThread Posts & Comments

## 🚀 Servers

```bash
# Web App
http://localhost:3000

# API
http://localhost:3001
```

---

## ✅ What's Working

| Feature | Status | Notes |
|---------|--------|-------|
| Create Text Post | ✅ | Full API integration |
| View Posts | ✅ | Fetches from database |
| Vote on Posts | ✅ | Upvote/downvote/toggle |
| Save Posts | ✅ | Persists to database |
| Hide Posts | ✅ | Removes from feed |
| Create Comments | ✅ | Top-level and nested |
| Vote on Comments | ✅ | Same as posts |
| Sort Posts | ✅ | Hot, New, Top, Rising |
| Real Usernames | ✅ | From JWT token |
| Symptom Checker | ✅ | Placeholder page |

---

## ⏳ What's Pending

| Feature | Status | Priority |
|---------|--------|----------|
| Image Upload | ⏳ | High |
| Video Upload | ⏳ | High |
| Link Posts | ⏳ | Medium |
| Poll Posts | ⏳ | Medium |
| Tags/Flair | ⏳ | Low |
| Post Editing | ⏳ | Medium |

---

## 🔑 Key Files

### Frontend
```
apps/web/src/components/
├── CreatePostModal.tsx    # Post creation
├── PostCard.tsx           # Post display
├── PostDetail.tsx         # Single post view
├── PostFeed.tsx           # Feed with sorting
├── CommentSection.tsx     # Comment list
└── Comment.tsx            # Single comment

apps/web/src/store/
└── useStore.ts            # Zustand store with API calls

apps/web/src/context/
└── JWTAuthContext.tsx     # Authentication
```

### Backend
```
apps/api/src/services/
├── post.service.ts        # Post logic
└── comment.service.ts     # Comment logic

apps/api/src/routes/
├── posts.ts               # Post endpoints
└── comments.ts            # Comment endpoints
```

---

## 📡 API Endpoints

### Posts
```
POST   /api/v1/posts              # Create post
GET    /api/v1/posts              # Get all posts
GET    /api/v1/posts/:id          # Get single post
PUT    /api/v1/posts/:id          # Update post
DELETE /api/v1/posts/:id          # Delete post
POST   /api/v1/posts/:id/vote     # Vote on post
POST   /api/v1/posts/:id/save     # Save post
POST   /api/v1/posts/:id/hide     # Hide post
```

### Comments
```
POST   /api/v1/comments           # Create comment
GET    /api/v1/comments           # Get comments
PUT    /api/v1/comments/:id       # Update comment
DELETE /api/v1/comments/:id       # Delete comment
POST   /api/v1/comments/:id/vote  # Vote on comment
```

---

## 🔐 Authentication

### Get Token
```javascript
const token = localStorage.getItem('auth_token')
```

### Use in API Call
```javascript
axios.post(url, data, {
  headers: {
    Authorization: `Bearer ${token}`
  }
})
```

### Get User Data
```javascript
import { useJWTAuth } from '@/context/JWTAuthContext'

const { user, role } = useJWTAuth()
```

---

## 🎨 Algorithms

| Algorithm | Complexity | Use Case |
|-----------|------------|----------|
| Hot Ranking | O(1) | Default feed |
| Rising | O(1) | Trending posts |
| Comment Tree | O(n) | Nested comments |
| Karma | O(1) | User reputation |
| Vote Toggle | O(1) | Remove vote |

---

## 🧪 Quick Test

```bash
1. Go to http://localhost:3000
2. Login
3. Click "Create Post"
4. Fill title: "Test Post"
5. Fill content: "Testing API integration"
6. Click "Post"
7. Verify post appears with your username
8. Click upvote
9. Add a comment
10. Click reply on your comment
```

---

## 🐛 Debugging

### Post not appearing?
- Check browser console for errors
- Verify API is running on port 3001
- Check Network tab for failed requests

### Username shows "current_user"?
- Logout and login again
- Check localStorage for auth_token
- Verify JWT token is valid

### Comments not loading?
- Check browser console
- Verify postId is correct
- Check API logs for errors

### Voting not working?
- Make sure you're logged in
- Check JWT token exists
- Look for 401 errors in Network tab

---

## 📚 Documentation

- `FRONTEND_API_INTEGRATION_COMPLETE.md` - Detailed fixes
- `TESTING_GUIDE_UPDATED.md` - Testing instructions
- `ALGORITHMS_EXPLAINED.md` - Algorithm details
- `TASK_COMPLETION_SUMMARY.md` - High-level overview
- `QUICK_REFERENCE.md` - This file

---

## 🎯 Success Criteria

- [x] Posts created via UI appear in feed
- [x] Real usernames display
- [x] Comments load from database
- [x] Voting persists
- [x] No mock data
- [x] No 404 errors
- [x] Optimistic updates work
- [x] Error handling in place

---

## 💡 Pro Tips

1. **Optimistic Updates**: UI updates immediately, API call in background
2. **Error Handling**: Always revert on failure
3. **Loading States**: Show feedback during async operations
4. **JWT Token**: Automatically included in all API calls
5. **Vote Toggle**: Click same button to remove vote

---

## 🔗 Quick Links

- Web App: http://localhost:3000
- API: http://localhost:3001
- Symptom Checker: http://localhost:3000/symptom-checker
- Emergency: http://localhost:3000/emergency

---

**Last Updated**: February 16, 2026
**Status**: ✅ All core features working
