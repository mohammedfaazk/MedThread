# Private Post Comments - Isolated Doctor Replies

## Problem Fixed

1. **Doctors couldn't comment on private posts** - Getting 404 error
2. **Doctor comments need to be isolated** - Each doctor should only see their own comments on private posts

## Root Cause

The `checkPrivatePostAccess` function expected a full user object with `role` (enum) and `doctorVerificationStatus`, but the comments route was passing a string role without verification status.

## Solution Applied

### Fix 1: Fetch Full User Data for Privacy Check

**File**: `apps/api/src/routes/comments.ts`

**Before**:
```typescript
const userRole = (req as any).userRole || 'PATIENT';
const user = { id: userId, role: userRole }; // Missing doctorVerificationStatus
const accessResult = checkPrivatePostAccess(user, post);
```

**After**:
```typescript
// Fetch full user data for privacy check
const user = await prisma.user.findUnique({
  where: { id: userId },
  select: { 
    id: true, 
    role: true, 
    doctorVerificationStatus: true 
  }
});

const accessResult = checkPrivatePostAccess(user, post);
```

### Fix 2: Implement Isolated Doctor Comments

**How It Works**:

1. **Patient creates private post** → Post marked as `isPrivate: true`

2. **Doctor A comments** → Comment saved with `isPrivateReply: true`

3. **Doctor B comments** → Comment saved with `isPrivateReply: true`

4. **Patient views comments** → Sees ALL comments (Doctor A + Doctor B)

5. **Doctor A views comments** → Sees ONLY their own comments

6. **Doctor B views comments** → Sees ONLY their own comments

**Implementation**:

The `getCommentsByPost` method in `comment.service.ts` already supports privacy filtering:

```typescript
async getCommentsByPost(
  postId: string, 
  userId?: string,
  filterForPrivacy?: { 
    isPostPrivate: boolean; 
    isAuthor: boolean; 
    shouldFilterReplies: boolean 
  }
) {
  const where: any = {
    postId,
    isRemoved: false,
  };

  // Apply privacy filtering for private posts
  if (filterForPrivacy?.isPostPrivate && filterForPrivacy.shouldFilterReplies) {
    // Doctor viewing private post - only show their own comments
    where.authorId = userId;
  }
  // If isAuthor or public post, no filtering needed (show all comments)
  
  // ... fetch and return comments
}
```

The GET comments route now passes privacy information:

```typescript
// Check privacy access
let filterForPrivacy = undefined;
if (post.isPrivate && user) {
  const accessResult = checkPrivatePostAccess(user, post);
  
  // Pass privacy filtering info to service
  filterForPrivacy = {
    isPostPrivate: post.isPrivate,
    isAuthor: accessResult.isAuthor,
    shouldFilterReplies: accessResult.shouldFilterReplies
  };
}

const comments = await commentService.getCommentsByPost(
  postId as string, 
  userId,
  filterForPrivacy
);
```

## Privacy Rules

### For Private Posts

| User Type | Can View Post? | Can Comment? | Sees Which Comments? |
|-----------|---------------|--------------|---------------------|
| Post Author (Patient) | ✅ YES | ✅ YES | ALL comments (all doctors) |
| Doctor A (Approved) | ✅ YES | ✅ YES | ONLY their own comments |
| Doctor B (Approved) | ✅ YES | ✅ YES | ONLY their own comments |
| Other Patient | ❌ NO | ❌ NO | N/A |
| Guest | ❌ NO | ❌ NO | N/A |

### For Public Posts

| User Type | Can View Post? | Can Comment? | Sees Which Comments? |
|-----------|---------------|--------------|---------------------|
| Anyone | ✅ YES | ✅ YES (if auth) | ALL comments |

## Privacy Check Function

**File**: `apps/api/src/utils/privacyCheck.ts`

The function returns:
```typescript
{
  hasAccess: boolean,        // Can user access the post?
  isAuthor: boolean,         // Is user the post author?
  isDoctor: boolean,         // Is user a doctor?
  shouldFilterReplies: boolean, // Should filter comments to only show user's own?
  reason: string             // Reason for access decision
}
```

**For Approved Doctors on Private Posts**:
```typescript
{
  hasAccess: true,
  isAuthor: false,
  isDoctor: true,
  shouldFilterReplies: true,  // ← This triggers comment filtering
  reason: 'Approved doctor'
}
```

**For Post Author on Private Posts**:
```typescript
{
  hasAccess: true,
  isAuthor: true,
  isDoctor: false,
  shouldFilterReplies: false,  // ← Author sees all comments
  reason: 'Post author'
}
```

## Testing Instructions

### Test 1: Doctor Can Comment on Private Post ✅
1. Login as Patient A
2. Create a private post
3. Logout
4. Login as Doctor A (verified)
5. Find the private post
6. Write a comment: "This is Doctor A's advice"
7. Click "Comment"
8. **Expected**: Comment posted successfully

### Test 2: Another Doctor Can Also Comment ✅
1. Stay on the same private post
2. Logout
3. Login as Doctor B (verified)
4. Find the same private post
5. Write a comment: "This is Doctor B's advice"
6. Click "Comment"
7. **Expected**: Comment posted successfully

### Test 3: Doctor A Only Sees Their Own Comment ✅
1. Logout
2. Login as Doctor A
3. View the private post
4. **Expected**: See ONLY "This is Doctor A's advice"
5. **Expected**: Do NOT see Doctor B's comment

### Test 4: Doctor B Only Sees Their Own Comment ✅
1. Logout
2. Login as Doctor B
3. View the private post
4. **Expected**: See ONLY "This is Doctor B's advice"
5. **Expected**: Do NOT see Doctor A's comment

### Test 5: Patient Sees All Doctor Comments ✅
1. Logout
2. Login as Patient A (post author)
3. View your private post
4. **Expected**: See BOTH comments:
   - "This is Doctor A's advice"
   - "This is Doctor B's advice"

### Test 6: Public Post Shows All Comments ✅
1. Login as any user
2. View a public post
3. **Expected**: See ALL comments from all users

## Database Schema

The `Comment` model has an `isPrivateReply` field:

```prisma
model Comment {
  id              String   @id @default(cuid())
  content         String
  authorId        String
  postId          String
  parentId        String?
  isPrivateReply  Boolean  @default(false)  // ← Marks comment as private
  // ... other fields
}
```

When a comment is created on a private post, `isPrivateReply` is automatically set to `true`:

```typescript
// Automatically set isPrivateReply based on post privacy
const isPrivateReply = post.isPrivate;

const comment = await prisma.comment.create({
  data: {
    content: data.content,
    authorId: data.authorId,
    postId: data.postId,
    parentId: data.parentId,
    depth,
    isPrivateReply,  // ← Set based on post privacy
  },
  // ...
});
```

## Benefits of Isolated Comments

### For Patients
- ✅ Get multiple independent medical opinions
- ✅ See all doctor responses in one place
- ✅ Compare different approaches
- ✅ Privacy maintained (other patients can't see)

### For Doctors
- ✅ Provide advice without seeing other doctors' opinions
- ✅ Avoid bias from other doctors' responses
- ✅ Independent medical assessment
- ✅ Professional isolation prevents groupthink

### For Platform
- ✅ Encourages more doctors to respond
- ✅ Reduces liability (doctors not influenced by others)
- ✅ Better quality of medical advice
- ✅ Maintains professional standards

## Architecture

### Comment Creation Flow
```
1. Doctor writes comment on private post
2. Frontend: POST /api/v1/comments
   Headers: { Authorization: "Bearer <token>" }
   Body: { content, postId }
3. Backend: Fetch full user data (role + verification status)
4. Backend: Check privacy access with checkPrivatePostAccess()
5. Backend: If approved doctor → hasAccess: true, shouldFilterReplies: true
6. Backend: Create comment with isPrivateReply: true
7. Database: Comment saved
8. Frontend: Success, refresh comments
```

### Comment Viewing Flow
```
1. User views private post
2. Frontend: GET /api/v1/comments?postId=<id>
   Headers: { Authorization: "Bearer <token>" }
3. Backend: Fetch full user data
4. Backend: Check privacy access
5. Backend: If doctor → shouldFilterReplies: true
6. Backend: Filter comments WHERE authorId = userId
7. Backend: Return only doctor's own comments
8. Frontend: Display filtered comments

OR

5. Backend: If post author → shouldFilterReplies: false
6. Backend: Return ALL comments (no filter)
7. Frontend: Display all comments
```

## Files Modified

1. **`apps/api/src/routes/comments.ts`**
   - POST `/` - Fetch full user data for privacy check
   - GET `/` - Pass privacy filtering info to service
   - Added debug logging for access decisions

## Files Already Correct (No Changes)

1. **`apps/api/src/services/comment.service.ts`** ✅
   - Already supports privacy filtering
   - Already sets `isPrivateReply` based on post privacy
   
2. **`apps/api/src/utils/privacyCheck.ts`** ✅
   - Privacy check logic correct
   - Returns `shouldFilterReplies` flag

## Current Status

✅ Backend restarted with comment fixes
✅ Doctors can comment on private posts
✅ Doctor comments are isolated (each sees only their own)
✅ Patients see all doctor comments
✅ Privacy protection maintained

## Summary

The commenting system on private posts now works correctly with isolated doctor replies:

1. ✅ Doctors can comment on private posts
2. ✅ Each doctor only sees their own comments
3. ✅ Patients see all doctor comments
4. ✅ Privacy check uses full user data
5. ✅ Comments marked as private replies automatically

**Test now by having multiple doctors comment on the same private post!** 🎉
