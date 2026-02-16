# Comment Loading Fix

## Issue
Comments were not displaying when clicking on a post until after posting a new comment.

## Root Causes

### 1. Frontend State Management Issue
In `CommentSection.tsx`, the first `useEffect` was trying to read from `storeComments[postId]` immediately after calling `fetchCommentsFromStore(postId)`, but the store update is asynchronous. This caused the component to set an empty array before the store was updated.

### 2. Backend Authentication Issue
In `comments.ts` route, the GET endpoint was trying to access `req.userId` without running the auth middleware, which caused it to be undefined even when a token was provided.

## Solutions

### Frontend Fix
**File: `apps/web/src/components/CommentSection.tsx`**

Separated concerns between the two useEffects:
- First useEffect: Only fetches comments from API
- Second useEffect: Updates local state when store changes

```typescript
// Fetch comments on mount
useEffect(() => {
  const loadComments = async () => {
    setIsLoading(true)
    try {
      await fetchCommentsFromStore(postId)
    } catch (error) {
      console.error('Failed to load comments:', error)
    } finally {
      setIsLoading(false)
    }
  }

  loadComments()
}, [postId, fetchCommentsFromStore])

// Update local comments when store changes
useEffect(() => {
  const postComments = storeComments[postId] || []
  setComments(postComments as CommentData[])
}, [storeComments, postId])
```

### Backend Fix
**File: `apps/api/src/routes/comments.ts`**

Updated GET endpoint to handle optional authentication:
- Manually extracts and verifies JWT token if provided
- Continues without userId if no token or invalid token
- This allows both authenticated and unauthenticated users to view comments
- Authenticated users get their vote status included

```typescript
// Extract userId from token if provided (optional auth)
let userId: string | undefined;
const token = req.headers.authorization?.split(' ')[1];
if (token) {
  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
    userId = decoded.userId;
  } catch (error) {
    // Invalid token, continue without userId
  }
}

const comments = await commentService.getCommentsByPost(postId as string, userId);
```

## Testing

1. Restart the API server
2. Navigate to any post with existing comments
3. Comments should load immediately without needing to post a new comment
4. Verified doctor badges should appear on comments by verified doctors
5. Vote buttons should work for authenticated users

## Files Modified

- `apps/web/src/components/CommentSection.tsx` - Fixed state management
- `apps/api/src/routes/comments.ts` - Fixed optional authentication
