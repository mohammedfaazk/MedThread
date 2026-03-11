# Chat Conversation ID Mismatch Fix

## Problem
The doctor was getting a "Conversation not found" error when trying to send messages because there was a mismatch between conversation IDs used by different parts of the system.

## Root Cause
The application was using two different chat API systems:

1. **Old Chat API** (`/api/chat/conversations`):
   - Uses mock store (temp_store.json)
   - Generates conversation IDs with `conv-` prefix (e.g., `conv-cmmlikqe20002ugvhy2b2e0ep`)
   - Used by doctor dashboard to display conversation list

2. **New Chat API v2** (`/api/v2/chat/*`):
   - Uses database (Prisma)
   - Uses actual database conversation IDs (e.g., `cmmlknjuy0001yfgwgkpu6kb4`)
   - Used by ChatWindow for sending/receiving messages

## The Mismatch Flow
1. Doctor dashboard fetches conversations from old API → gets `conv-cmmlikqe20002ugvhy2b2e0ep`
2. User clicks conversation → navigates to `/chat?conversation=conv-cmmlikqe20002ugvhy2b2e0ep`
3. ChatWindow tries to send message using v2 API with this ID
4. V2 API looks in database for `conv-cmmlikqe20002ugvhy2b2e0ep` → not found
5. Returns 403 "Conversation not found" error

## Solution Applied
Updated the doctor dashboard to use the v2 Chat API consistently:

### File: `MedThread/apps/web/src/app/dashboard/doctor/page.tsx`

**Before:**
```typescript
// Used old API
const res = await axios.get(`${API_URL}/api/chat/conversations?userId=${effectiveUserId}`)

// Expected old data structure
const patient = conv.participants?.find((p: any) => p.id !== effectiveUserId)
```

**After:**
```typescript
// Now uses v2 API with authentication
const token = localStorage.getItem('auth_token')
const res = await axios.get(`${API_URL}/api/v2/chat/conversations`, {
    headers: {
        'Authorization': `Bearer ${token}`
    }
})

// Updated for v2 data structure
const patient = conv.appointment?.patient?.id !== effectiveUserId 
    ? conv.appointment?.patient 
    : conv.appointment?.doctor
```

## Data Structure Differences

### Old API Response:
```json
[
  {
    "id": "conv-cmmlikqe20002ugvhy2b2e0ep",
    "participants": [
      { "id": "patient-id", "username": "Patient" },
      { "id": "doctor-id", "username": "Doctor" }
    ]
  }
]
```

### V2 API Response:
```json
{
  "data": [
    {
      "id": "cmmlknjuy0001yfgwgkpu6kb4",
      "appointment": {
        "patient": { "id": "patient-id", "username": "Patient" },
        "doctor": { "id": "doctor-id", "username": "Doctor" }
      }
    }
  ]
}
```

## Result
- ✅ Doctor dashboard now uses consistent conversation IDs
- ✅ ChatWindow can find conversations in the database
- ✅ Messages can be sent successfully
- ✅ No more "Conversation not found" errors

## Additional Benefits
- Proper authentication for conversation access
- Real-time unread counts from database
- Consistent data source across the application
- Better error handling and security

## Files Modified
- `MedThread/apps/web/src/app/dashboard/doctor/page.tsx` - Updated to use v2 Chat API

The chat system now works consistently across all components using the database as the single source of truth.