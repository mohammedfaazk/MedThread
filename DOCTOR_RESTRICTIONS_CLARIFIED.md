# Doctor Verification Restrictions - Clarified ✅

## Key Understanding

Unverified doctors have **READ-ONLY** access with the ability to **VIEW** their dashboard and appointments, but they **CANNOT PERFORM ANY WRITE OPERATIONS**.

---

## Important Clarification

### Dashboard & Appointments Access
Unverified doctors **CAN**:
- ✅ View their doctor dashboard
- ✅ See appointment requests (if any exist)
- ✅ View existing chat conversations (read-only)
- ✅ See their profile and stats

### Why This Makes Sense
Unverified doctors **won't be discoverable** by patients in:
- Doctor search/directory pages
- Appointment booking flows
- Community member lists
- Any patient-facing discovery features

This means they effectively **won't receive**:
- New appointment requests
- New chat messages from patients
- Profile visits from patients

So they can view the dashboard UI, but it will be mostly empty until they're verified.

---

## What They CANNOT Do (Write Operations)

### Content & Engagement
- ❌ Create posts or comments
- ❌ Vote on posts or comments
- ❌ Give awards
- ❌ Save or hide posts

### Communities
- ❌ Create communities
- ❌ Join or leave communities

### Appointments & Chat
- ❌ Set availability slots
- ❌ Approve/reject appointment requests
- ❌ Send chat messages
- ❌ Initiate conversations

---

## Implementation Details

### Backend Protection
All write operations protected with `requireVerifiedDoctor` middleware:
- Posts: create, update, delete, vote, save, hide, publish
- Comments: create, update, delete, vote
- Communities: create, update, join, leave
- Appointments: set availability, approve/reject
- Chat: send messages
- Awards: give awards

### Frontend Warnings
Clear warnings displayed in:
- Doctor dashboard (comprehensive banner)
- Create post modal (blocks submission)
- Comment reply box (blocks submission)

### User Experience
The warning banner on the doctor dashboard explains:
- What they cannot do (write operations)
- What they can do (read access + view dashboard)
- Why they won't receive appointments/chats (not discoverable)
- Verification timeline (24-48 hours)

---

## Updated Warning Banner

```
⚠️ Account Verification Required

Your doctor account is currently under review.
You have READ-ONLY access until verified.

What you CANNOT do:
• Create posts or comments
• Vote on posts or comments
• Create or join communities
• Set availability or manage appointments
• Initiate or send chat messages
• Give awards to posts or comments
• Save or hide posts

What you CAN do:
• Browse all posts and comments
• View user profiles and communities
• Search content
• View your dashboard and appointments
• View existing chats (read-only)

Note: You won't be discoverable by patients until verified,
so you won't receive new appointment requests or chat messages.

⏱️ Verification typically takes 24-48 hours

[Check Verification Status]
```

---

## Files Updated

1. **apps/web/src/app/dashboard/doctor/page.tsx**
   - Updated warning banner with clarified restrictions
   - Added note about discoverability
   - Clarified appointment/chat viewing vs. management

2. **UNVERIFIED_DOCTOR_RESTRICTIONS_COMPLETE.md**
   - Added key clarification section
   - Updated restrictions list
   - Updated allowed actions list
   - Updated dashboard banner example

3. **apps/api/src/routes/communities.ts**
   - Fixed `authenticate` reference error (changed to `auth`)

---

## Status: ✅ COMPLETE

All restrictions properly implemented with:
- ✅ Backend middleware protection (20+ routes)
- ✅ Frontend warnings and blocks
- ✅ Clear user communication
- ✅ Accurate documentation
- ✅ No syntax errors
- ✅ Ready for testing

The implementation correctly reflects that unverified doctors can VIEW their dashboard and appointments but cannot PERFORM any write operations, and they won't be discoverable by patients anyway.
