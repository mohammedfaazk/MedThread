# Comments Persistence & Verified Doctor Badge Fix

## Issues Fixed

### 1. Comment Persistence
Comments were being created but not displaying properly due to missing data transformation.

### 2. Verified Doctor Badge on Comments
Comments by verified doctors were not showing the "Verified Doctor" badge.

### 3. Verified Doctor Badge Consistency
Badge styling was inconsistent across PostCard, PostDetail, and Comment components.

## Changes Made

### Backend (API)
**File: `apps/api/src/services/comment.service.ts`**
- Added `doctorVerificationStatus: true` to all author select statements:
  - `createComment()` - line 38
  - `getCommentsByPost()` - line 73
  - `updateComment()` - line 157

### Frontend (Web)

**File: `apps/web/src/store/useStore.ts`**
- Updated `transformComments()` function to properly check for verified doctors:
  ```typescript
  authorType: (comment.author?.role === 'VERIFIED_DOCTOR' || comment.author?.role === 'DOCTOR') ? 'doctor' : 'patient',
  verified: comment.author?.role === 'VERIFIED_DOCTOR' || (comment.author?.role === 'DOCTOR' && comment.author?.doctorVerificationStatus === 'APPROVED'),
  ```

**File: `apps/web/src/components/Comment.tsx`**
- Updated verified badge to match PostCard styling:
  - Solid blue background (`bg-blue-600`)
  - White text (`text-white`)
  - Shield icon (SVG)
  - "Verified Doctor" label (not just "Verified")
  - Bold font (`font-bold`)

**File: `apps/web/src/components/PostDetail.tsx`**
- Updated verified badge to match PostCard styling for consistency

## Verification Logic

The badge now shows when:
```typescript
verified: author?.role === 'VERIFIED_DOCTOR' || 
          (author?.role === 'DOCTOR' && author?.doctorVerificationStatus === 'APPROVED')
```

This applies to:
- Posts (PostCard and PostDetail)
- Comments (Comment component)
- All nested replies

## Badge Styling (Consistent Across All Components)

```tsx
<span className="px-2 py-0.5 bg-blue-600 text-white rounded-full text-xs font-bold flex items-center gap-1">
  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="..." clipRule="evenodd" />
  </svg>
  Verified Doctor
</span>
```

## Testing

1. Restart the API server
2. Create a comment as a verified doctor
3. The comment should persist and display with the "Verified Doctor" badge
4. Badge should appear consistently on:
   - Post cards in feed
   - Post detail view
   - Comments and replies
   - All nested comment levels

## Files Modified

### Backend
- `apps/api/src/services/comment.service.ts` - Added doctorVerificationStatus to author selects

### Frontend
- `apps/web/src/store/useStore.ts` - Fixed comment transformation logic
- `apps/web/src/components/Comment.tsx` - Updated badge styling
- `apps/web/src/components/PostDetail.tsx` - Updated badge styling for consistency
