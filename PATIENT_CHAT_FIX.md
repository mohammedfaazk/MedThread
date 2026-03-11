# Patient Chat Fix

## Problem
Patient chat was showing "Conversation not found" error while doctor chat was working fine.

## Root Cause
The **ChatInbox component** (used by patients to select conversations) was using the **old chat API** (`/api/chat/conversations`) which returns mock store conversation IDs with `conv-` prefix, while the **ChatWindow component** (used to send messages) was using the **v2 chat API** (`/api/v2/chat/messages`) which expects database conversation IDs.

## The Mismatch Flow for Patients
1. **Patient goes to `/chat`** → Shows ChatInbox to select conversation
2. **ChatInbox uses old API** → Gets conversations with `conv-` prefix IDs
3. **Patient clicks conversation** → Navigates to `/chat?conversation=conv-xxxxx`
4. **ChatWindow tries to send message** → Uses v2 API with `conv-` ID
5. **V2 API looks in database** → `conv-` ID doesn't exist → "Conversation not found"

## Why Doctor Chat Worked
- **Doctor dashboard** was recently fixed to use v2 API
- **Doctors click conversation from dashboard** → Get real database IDs
- **ChatWindow works** → Real ID exists in database

## Solution Applied
Updated **ChatInbox component** to use the v2 Chat API consistently:

### File: `MedThread/apps/web/src/components/Chat/ChatInbox.tsx`

**Before:**
```typescript
// Used old API with fallback
const response = await axios.get(`${API_URL}/api/chat/conversations/preview`, {
  params: { userId: currentUserId },
  headers: { Authorization: `Bearer ${token}` }
})

// Fallback to old API
const response = await axios.get(`${API_URL}/api/chat/conversations`, {
  params: { userId: currentUserId },
  headers: { Authorization: `Bearer ${token}` }
})
```

**After:**
```typescript
// Now uses v2 API with authentication
const response = await axios.get(`${API_URL}/api/v2/chat/conversations`, {
  headers: { Authorization: `Bearer ${token}` }
})

// Transform v2 API response to preview format
const previews = response.data.data.map((conv: any) => ({
  id: conv.id, // Real database ID, no conv- prefix
  participants: [
    {
      id: conv.appointment.patient.id,
      username: conv.appointment.patient.username,
      // ... patient data
    },
    {
      id: conv.appointment.doctor.id,
      username: conv.appointment.doctor.username,
      // ... doctor data
    }
  ],
  // ... other fields
}))
```

## Data Structure Differences

### Old API Response (Mock Store):
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

### V2 API Response (Database):
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
- ✅ **Patient chat now works** with correct conversation IDs
- ✅ **Both patients and doctors** use the same v2 API
- ✅ **Consistent data source** across all chat components
- ✅ **Real-time features work** with proper conversation IDs
- ✅ **No more "Conversation not found" errors**

## Components Now Using V2 API
1. **Doctor Dashboard** → `GET /api/v2/chat/conversations`
2. **ChatInbox (Patient)** → `GET /api/v2/chat/conversations`
3. **ChatList** → `GET /api/v2/chat/conversations`
4. **ChatWindow** → `POST /api/v2/chat/messages`

## Files Modified
1. `MedThread/apps/web/src/components/Chat/ChatInbox.tsx` - Updated to use v2 API
2. `MedThread/apps/web/src/app/dashboard/doctor/page.tsx` - Previously fixed
3. `MedThread/apps/api/src/middleware/rateLimiter.ts` - Previously fixed for rate limiting

The chat system now works consistently for both patients and doctors using the database as the single source of truth.