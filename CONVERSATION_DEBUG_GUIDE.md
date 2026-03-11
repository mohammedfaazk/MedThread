# Conversation Debug Guide

## Current Issue
Getting "Conversation not found" error when trying to send messages in chat.

## Debugging Steps

### 1. Check Browser Console
Open browser dev tools (F12) and look for these logs:
```
🔍 ChatWindow initialized with: {
  conversationId: "...",
  currentUserId: "...",
  tokenExists: true/false
}
```

### 2. Check Current URL
Look at the browser URL bar. It should be something like:
- ✅ Good: `localhost:3000/chat?conversation=cmmlknjuy0001yfgwgkpu6kb4`
- ❌ Bad: `localhost:3000/chat?conversation=conv-cmmlikqe20002ugvhy2b2e0ep`

If you see the `conv-` prefix, that's the old mock store ID that doesn't exist in the database.

### 3. Check Network Tab
In browser dev tools, go to Network tab and look for:
- `GET /api/v2/chat/conversations` - Should return conversations
- `POST /api/v2/chat/messages` - This is where the error occurs

### 4. Check API Response
When the message fails, check the response:
- Status 403 = Permission denied
- Status 404 = Conversation not found
- Status 429 = Rate limited

## Quick Fix Steps

### Option 1: Get Fresh Conversation ID
1. Go to doctor dashboard: `localhost:3000/dashboard/doctor`
2. Look for the chat section
3. Click on a conversation - this should use the correct ID from the v2 API

### Option 2: Manual URL Fix
If you know the correct conversation ID:
1. Replace the URL conversation parameter
2. Change from `conv-xxxxx` to the real database ID

### Option 3: Clear and Restart
1. Clear browser cache/localStorage
2. Log out and log back in
3. Navigate to chat through the dashboard

## Expected Flow
1. **Doctor Dashboard** → Uses v2 API → Gets real conversation IDs
2. **Click Conversation** → Navigates to `/chat?conversation=REAL_ID`
3. **ChatWindow** → Uses real ID → Messages work

## API Endpoints Used
- `GET /api/v2/chat/conversations` - Get conversation list (dashboard)
- `GET /api/v2/chat/conversations/:id/access` - Check access
- `POST /api/v2/chat/messages` - Send message
- `GET /api/v2/chat/conversations/:id/messages` - Get messages

All these endpoints expect **database conversation IDs**, not mock store IDs with `conv-` prefix.

## Files Recently Fixed
- `MedThread/apps/web/src/app/dashboard/doctor/page.tsx` - Now uses v2 API
- `MedThread/apps/api/src/middleware/rateLimiter.ts` - Fixed rate limiting
- `MedThread/apps/web/src/components/Chat/ChatWindow.tsx` - Better error handling

## Next Steps
1. Check browser console for conversation ID being used
2. Verify it's a real database ID (no `conv-` prefix)
3. If wrong ID, navigate through dashboard to get correct one
4. If correct ID but still failing, check API server logs