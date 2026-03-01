# Read-Only Mode for Guests and Unverified Doctors

## Overview
Implemented read-only restrictions for:
1. **Guest users** (not logged in)
2. **Unverified doctors** (pending admin approval)

These users can only view content but cannot interact with any features until they sign up or get verified.

---

## Restrictions Implemented

### What Read-Only Users CAN Do ✅
- View public posts (NOT private posts)
- Read post content
- View comments
- Browse communities
- View user profiles
- Share posts (copy link)

### What Read-Only Users CANNOT Do ❌
- Upvote/downvote posts
- Comment on posts
- Create posts
- Create communities
- Save posts
- Hide posts
- Give awards
- Report content
- Book appointments
- Access chat
- Any other interactive features

---

## Files Modified

### 1. PostCard Component (`apps/web/src/components/PostCard.tsx`)

**Added**:
```typescript
const { user, role, verified: isVerified } = useJWTAuth()

// Check if user can interact
const canInteract = user && (role !== 'DOCTOR' || isVerified)
const isReadOnly = !canInteract
```

**Changes**:
- Vote buttons disabled with `opacity-50` and `cursor-not-allowed`
- Vote buttons show tooltip: "Sign in to vote" or "Pending verification"
- Clicking vote/save/hide shows alert message
- Comment link disabled for read-only users
- Award button hidden for read-only users
- Save/Hide/Report buttons hidden for read-only users

### 2. Sidebar Component (`apps/web/src/components/Sidebar.tsx`)

**Added**:
```typescript
const { role, loading, isDoctorVerified, isDoctorPending, user } = useJWTAuth()

const canInteract = user && (role !== 'DOCTOR' || isDoctorVerified)
const isReadOnly = !canInteract
```

**Changes**:
- "Discussion Threads" (Create Post) button disabled for read-only users
- Shows lock icon 🔒 next to disabled button
- Clicking shows alert: "Please sign up or log in" or "Pending verification"

### 3. RightSidebar Component (`apps/web/src/components/RightSidebar.tsx`)

**Added**:
```typescript
const { role, user, isDoctorVerified, isDoctorPending } = useJWTAuth()

const canInteract = user && (role !== 'DOCTOR' || isDoctorVerified)
const isReadOnly = !canInteract
```

**Changes**:
- "Create Post" button disabled for read-only users
- "Create Community" button disabled for read-only users
- Both buttons show lock icon 🔒 when disabled
- Clicking shows appropriate alert message

---

## User Experience

### Guest User (Not Logged In)

**Scenario 1: Try to Upvote**
1. Click upvote button
2. Alert: "Please sign up or log in to vote on posts"
3. Button appears grayed out with tooltip

**Scenario 2: Try to Comment**
1. Click "Comments" link
2. Alert: "Please sign up or log in to comment on posts"
3. Link appears grayed out

**Scenario 3: Try to Create Post**
1. Click "Create Post" button
2. Alert: "Please sign up or log in to create posts"
3. Button shows 🔒 icon and is disabled

### Unverified Doctor (Pending Approval)

**Scenario 1: Try to Upvote**
1. Click upvote button
2. Alert: "Your doctor account is pending verification. You can vote once verified by an admin."
3. Button appears grayed out

**Scenario 2: Try to Create Post**
1. Click "Create Post" button
2. Alert: "Your doctor account is pending verification. You can create posts once verified by an admin."
3. Button shows 🔒 icon and is disabled

**Scenario 3: View Posts**
1. Can see all public posts
2. Cannot see private posts
3. Can read content but cannot interact

---

## Alert Messages

### For Guests
- "Please sign up or log in to vote on posts"
- "Please sign up or log in to comment on posts"
- "Please sign up or log in to save posts"
- "Please sign up or log in to hide posts"
- "Please sign up or log in to create posts"
- "Please sign up or log in to create communities"

### For Unverified Doctors
- "Your doctor account is pending verification. You can vote once verified by an admin."
- "Your doctor account is pending verification. You can comment once verified by an admin."
- "Your doctor account is pending verification. You can save posts once verified by an admin."
- "Your doctor account is pending verification. You can hide posts once verified by an admin."
- "Your doctor account is pending verification. You can create posts once verified by an admin."
- "Your doctor account is pending verification. You can create communities once verified by an admin."

---

## Visual Indicators

### Disabled Buttons
```css
opacity-50 cursor-not-allowed
```

### Lock Icons
- 🔒 appears next to disabled "Create Post" and "Create Community" buttons
- Indicates feature is locked until verification/login

### Tooltips
- Upvote button: "Sign in to vote" or "Pending verification"
- Downvote button: "Sign in to vote" or "Pending verification"
- Comment link: "Sign in to comment" or "Pending verification"

---

## Testing Instructions

### Test 1: Guest User Restrictions
1. Logout (or open incognito window)
2. Navigate to homepage
3. Try to upvote a post → Should show alert
4. Try to click comments → Should show alert
5. Try to click "Create Post" → Should show alert
6. Verify all interactive buttons are disabled

### Test 2: Unverified Doctor Restrictions
1. Create new doctor account
2. Complete signup (don't get admin approval yet)
3. Login as unverified doctor
4. Navigate to homepage
5. Try to upvote a post → Should show "pending verification" alert
6. Try to create post → Should show "pending verification" alert
7. Verify all interactive features are disabled

### Test 3: Verified User Can Interact
1. Login as verified doctor or patient
2. Navigate to homepage
3. Verify can upvote/downvote posts
4. Verify can comment on posts
5. Verify can create posts
6. Verify all interactive features work

### Test 4: Privacy Still Enforced
1. Logout
2. Navigate to homepage
3. Verify private posts do NOT appear
4. Login as patient
5. Verify private posts from other patients do NOT appear
6. Login as verified doctor
7. Verify private posts DO appear

---

## Backend Considerations

The backend already has proper authentication checks on all endpoints:
- POST /api/v1/posts - Requires authentication
- POST /api/v1/comments - Requires authentication
- POST /api/v1/posts/:id/vote - Requires authentication
- POST /api/v1/posts/:id/save - Requires authentication

The frontend now prevents unauthorized requests from being sent in the first place, providing better UX with immediate feedback.

---

## Future Enhancements

### Possible Improvements:
1. **Banner Message**: Show persistent banner for unverified doctors
   - "Your account is pending verification. Limited features available."
   
2. **Verification Status Page**: Dedicated page showing verification progress
   - "Your application is under review"
   - "Estimated time: 24-48 hours"
   
3. **Email Notifications**: Notify doctors when verified
   - "Your account has been verified! You can now access all features."

4. **Onboarding Tour**: Guide new users through features
   - Highlight what they can/cannot do
   - Encourage sign up for guests

---

## Summary

Read-only mode is now fully implemented for guests and unverified doctors. They can browse and read content but cannot interact with any features. Clear feedback is provided when they attempt restricted actions, encouraging them to sign up or wait for verification.

**Key Benefits**:
- ✅ Prevents unauthorized interactions
- ✅ Clear user feedback with alerts
- ✅ Visual indicators (disabled buttons, lock icons)
- ✅ Encourages sign up for guests
- ✅ Sets expectations for unverified doctors
- ✅ Maintains privacy controls (no private posts for guests)
- ✅ Consistent with social media platform behavior

**Refresh your browser to see the changes!**
