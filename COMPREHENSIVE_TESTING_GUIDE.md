# MedThread Comprehensive Testing Guide

## 📚 Table of Contents
1. [Communities & Social Features](#1-communities--social-features)
2. [Chat System](#2-chat-system)
3. [Appointments & Consultations](#3-appointments--consultations)
4. [Gamification & Rewards](#4-gamification--rewards)
5. [Admin Panel](#5-admin-panel)
6. [Doctor Features](#6-doctor-features)
7. [Patient Features](#7-patient-features)
8. [Search & Discovery](#8-search--discovery)
9. [Notifications](#9-notifications)
10. [Backend API Testing](#10-backend-api-testing)

---

## 1. Communities & Social Features

### 1.1 View Communities
**Route**: `/communities` or `/m/[community]`

**Test Steps**:
1. Navigate to homepage
2. Look for communities in sidebar
3. Click on a community name
4. Verify community page loads with:
   - Community name and description
   - Member count
   - Posts from that community
   - "Join" button (if not a member)

**Expected Results**:
- ✅ Community page displays correctly
- ✅ Posts are filtered by community
- ✅ Join/Leave button works

### 1.2 Create Community
**Route**: `/communities/create`

**Test Steps**:
1. Login as any user
2. Navigate to `/communities/create`
3. Fill in form:
   - Name: `m/TestCommunity`
   - Description: "Test community description"
   - Rules (optional)
   - Privacy: Public/Private
4. Click "Create Community"

**Expected Results**:
- ✅ Community created successfully
- ✅ Redirect to new community page
- ✅ You are automatically a member

**API Endpoint**: `POST /api/communities`

### 1.3 Join/Leave Community
**Test Steps**:
1. Navigate to a community you're not a member of
2. Click "Join Community"
3. Verify member count increases
4. Verify "Leave Community" button appears
5. Click "Leave Community"
6. Verify member count decreases

**API Endpoints**:
- `POST /api/communities/:id/join`
- `POST /api/communities/:id/leave`

### 1.4 Post in Community
**Test Steps**:
1. Join a community
2. Click "Create Post"
3. Select the community from dropdown
4. Fill in title and content
5. Submit post
6. Verify post appears in community feed

**Expected Results**:
- ✅ Post shows community badge
- ✅ Post appears in community page
- ✅ Post appears in "All" feed

---

## 2. Chat System

### 2.1 Access Chat
**Route**: `/chat`

**Prerequisites**:
- Must have an approved appointment with another user

**Test Steps**:
1. Login as patient with approved appointment
2. Navigate to `/chat`
3. Verify conversation list loads
4. Click on a conversation
5. Verify chat window opens

**Expected Results**:
- ✅ Conversation list shows all chats
- ✅ Last message preview visible
- ✅ Unread count badge shows (if unread messages)
- ✅ Online status indicator works

### 2.2 Send Messages
**Test Steps**:
1. Open a conversation
2. Type message: "Test message"
3. Press Enter or click Send
4. Verify message appears immediately (optimistic UI)
5. Verify message persists after page refresh
6. Login as other user
7. Verify message appears in their chat

**Expected Results**:
- ✅ Messages send instantly
- ✅ Messages persist in database
- ✅ Real-time delivery via Socket.io
- ✅ Read receipts show (✓ sent, ✓✓ read)
- ✅ Typing indicators work

**Backend Logs to Check**:
```
[API] Message saved to database successfully
Socket authenticated for user: [userId]
```

### 2.3 Upload Attachments
**Test Steps**:
1. In chat window, click attachment icon
2. Select image file (< 10MB)
3. Verify preview shows
4. Send message
5. Verify image displays in chat

**API Endpoint**: `POST /api/chat/upload`

### 2.4 Edit/Delete Messages
**Test Steps**:
1. Send a message
2. Within 5 minutes, click Edit icon
3. Modify message text
4. Save changes
5. Verify "(edited)" label appears
6. Click Delete icon
7. Confirm deletion
8. Verify message shows "This message was deleted"

**API Endpoints**:
- `PUT /api/chat/messages/:id`
- `DELETE /api/chat/messages/:id`

---

## 3. Appointments & Consultations

### 3.1 Book Appointment (Patient)
**Route**: `/appointments`

**Test Steps**:
1. Login as patient
2. Navigate to verified doctor's profile
3. Click "Book Appointment"
4. Select date and time slot
5. Add reason for visit (optional)
6. Submit booking request

**Expected Results**:
- ✅ Appointment request created with status "PENDING"
- ✅ Doctor receives notification
- ✅ Appointment appears in patient's appointments list

**API Endpoint**: `POST /api/appointments`

### 3.2 Manage Appointments (Doctor)
**Route**: `/appointments` or `/dashboard/doctor`

**Test Steps**:
1. Login as doctor
2. Navigate to appointments page
3. View pending appointment requests
4. Click "Approve" on a request
5. Verify status changes to "APPROVED"
6. Verify chat conversation is created
7. Try rejecting an appointment
8. Verify status changes to "REJECTED"

**Expected Results**:
- ✅ Appointment status updates
- ✅ Chat conversation created on approval
- ✅ Patient receives notification

**API Endpoints**:
- `GET /api/appointments`
- `PUT /api/appointments/:id/approve`
- `PUT /api/appointments/:id/reject`
- `PUT /api/appointments/:id/complete`

### 3.3 Appointment History
**Route**: `/appointments/history`

**Test Steps**:
1. Navigate to appointment history
2. Verify all past appointments show
3. Filter by status (Completed, Cancelled, etc.)
4. View appointment details

**Expected Results**:
- ✅ All appointments listed with status
- ✅ Filters work correctly
- ✅ Can view appointment details

---

## 4. Gamification & Rewards

### 4.1 Karma System
**Test Steps**:
1. Create a post
2. Have another user upvote it
3. Check your karma score increases
4. Downvote should decrease karma
5. Navigate to `/leaderboard`
6. Verify your position on leaderboard

**Expected Results**:
- ✅ Karma updates in real-time
- ✅ Karma shows in profile
- ✅ Leaderboard ranks users correctly

**API Endpoints**:
- `GET /api/karma/user/:userId`
- `GET /api/karma/leaderboard`

### 4.2 Badges & Achievements
**Route**: `/badges`

**Test Steps**:
1. Navigate to badges page
2. View all available badges
3. Check which badges you've earned
4. View badge requirements
5. Complete actions to earn badges:
   - First Post badge
   - Helpful badge (10 upvotes)
   - Active Member (30 days)
   - etc.

**Expected Results**:
- ✅ Badges display with icons
- ✅ Earned badges highlighted
- ✅ Progress bars show for in-progress badges
- ✅ Badges appear on profile

**API Endpoint**: `GET /api/badges`

### 4.3 Awards
**Test Steps**:
1. View a high-quality post
2. Click "Give Award" button
3. Select award type (Gold, Silver, etc.)
4. Confirm award
5. Verify award appears on post
6. Verify recipient receives notification

**API Endpoints**:
- `GET /api/awards`
- `POST /api/awards/give`

---

## 5. Admin Panel

### 5.1 Access Admin Panel
**Route**: `/admin`

**Prerequisites**:
- Must be logged in as ADMIN role

**Test Steps**:
1. Login as admin user
2. Navigate to `/admin`
3. Verify admin dashboard loads

**Expected Results**:
- ✅ Dashboard shows statistics
- ✅ Navigation to admin sections works
- ✅ Non-admin users get 403 error

### 5.2 User Management
**Route**: `/admin/users`

**Test Steps**:
1. Navigate to admin users page
2. View list of all users
3. Search for specific user
4. Click on user to view details
5. Test actions:
   - Ban user
   - Unban user
   - Change user role
   - Delete user (soft delete)

**Expected Results**:
- ✅ User list loads with pagination
- ✅ Search works
- ✅ Actions execute successfully
- ✅ Audit log created for each action

**API Endpoints**:
- `GET /api/admin/users`
- `PUT /api/admin/users/:id/ban`
- `PUT /api/admin/users/:id/role`
- `DELETE /api/admin/users/:id`

### 5.3 Doctor Verification
**Route**: `/admin` or `/doctor-verification`

**Test Steps**:
1. Navigate to doctor verification queue
2. View pending doctor applications
3. Click on application to review:
   - View uploaded documents
   - Check license details
   - Verify credentials
4. Approve or reject application
5. Add notes/reason

**Expected Results**:
- ✅ Applications listed with status
- ✅ Documents viewable
- ✅ Approval/rejection works
- ✅ Doctor receives notification
- ✅ Approved doctors get verification badge

**API Endpoints**:
- `GET /api/doctor-verification/pending`
- `PUT /api/doctor-verification/:id/approve`
- `PUT /api/doctor-verification/:id/reject`

### 5.4 Content Moderation
**Route**: `/admin/posts` and `/admin/comments`

**Test Steps**:
1. Navigate to posts moderation
2. View reported posts
3. Review post content
4. Take action:
   - Remove post
   - Warn user
   - Ban user
   - Dismiss report
5. Repeat for comments

**Expected Results**:
- ✅ Reported content shows with report reason
- ✅ Moderation actions work
- ✅ Users receive notifications
- ✅ Audit trail created

**API Endpoints**:
- `GET /api/admin/posts/reported`
- `DELETE /api/admin/posts/:id`
- `GET /api/admin/comments/reported`
- `DELETE /api/admin/comments/:id`

### 5.5 Reports Management
**Route**: `/admin/reports`

**Test Steps**:
1. Navigate to reports page
2. View all user reports
3. Filter by type (Post, Comment, User)
4. Filter by status (Pending, Resolved)
5. Review and resolve reports

**API Endpoint**: `GET /api/admin/reports`

### 5.6 Analytics Dashboard
**Route**: `/admin/analytics`

**Test Steps**:
1. Navigate to analytics page
2. View metrics:
   - Total users
   - Active users (daily/weekly/monthly)
   - Total posts/comments
   - Appointments booked
   - Revenue (if applicable)
3. View charts and graphs
4. Export data (if available)

**API Endpoint**: `GET /api/analytics`

### 5.7 Cron Jobs Management
**Route**: `/admin/cron-jobs`

**Test Steps**:
1. Navigate to cron jobs page
2. View all scheduled jobs
3. Check job status (running, completed, failed)
4. Manually trigger a job
5. View job execution logs

**Expected Results**:
- ✅ All cron jobs listed
- ✅ Can trigger jobs manually
- ✅ Logs show execution history

**API Endpoints**:
- `GET /api/cron-jobs`
- `POST /api/cron-jobs/:id/trigger`

### 5.8 Audit Logs
**Route**: `/admin/audit-logs`

**Test Steps**:
1. Navigate to audit logs
2. View all admin actions
3. Filter by:
   - Admin user
   - Action type
   - Date range
4. Search for specific actions

**Expected Results**:
- ✅ All admin actions logged
- ✅ Filters work correctly
- ✅ Shows who, what, when, why

**API Endpoint**: `GET /api/admin/audit-logs`

---

## 6. Doctor Features

### 6.1 Doctor Dashboard
**Route**: `/dashboard/doctor`

**Test Steps**:
1. Login as verified doctor
2. Navigate to doctor dashboard
3. Verify sections show:
   - Upcoming appointments
   - Recent consultations
   - Earnings (if applicable)
   - Patient reviews
   - CME credits

**Expected Results**:
- ✅ Dashboard loads with all widgets
- ✅ Data is accurate and up-to-date
- ✅ Quick actions work

### 6.2 Doctor Profile Enhancement
**Route**: `/doctor/[username]`

**Test Steps**:
1. Navigate to your doctor profile
2. Verify enhanced profile shows:
   - Specialization
   - Experience
   - Education
   - Hospital affiliation
   - Consultation fees
   - Available time slots
   - Patient reviews
   - Verification badge

**Expected Results**:
- ✅ All information displays correctly
- ✅ "Book Appointment" button works
- ✅ Reviews show with ratings

**API Endpoint**: `GET /api/doctor-profile/:username`

### 6.3 CME Credits
**Route**: `/dashboard/doctor/cme`

**Test Steps**:
1. Navigate to CME credits page
2. View current CME points
3. View CME history
4. Complete CME activities:
   - Answer medical questions
   - Participate in discussions
   - Complete courses
5. Verify points awarded

**Expected Results**:
- ✅ CME points tracked correctly
- ✅ Activities award appropriate points
- ✅ History shows all activities

**API Endpoints**:
- `GET /api/cme-credits`
- `POST /api/cme-credits/activity`

### 6.4 Consultation Funnel
**Test Steps**:
1. Patient books appointment
2. Doctor approves appointment
3. Chat conversation created
4. Conduct consultation via chat
5. Doctor marks consultation complete
6. Patient can leave review

**Expected Results**:
- ✅ Full funnel works end-to-end
- ✅ Status updates at each step
- ✅ Notifications sent appropriately

**API Endpoints**:
- `POST /api/consultation-funnel/start`
- `PUT /api/consultation-funnel/:id/complete`

### 6.5 Doctor Location & Ranking
**Route**: `/doctors`

**Test Steps**:
1. Navigate to doctors listing page
2. Filter by:
   - Specialization
   - Location
   - Rating
   - Availability
3. Sort by:
   - Rating
   - Experience
   - Consultation fee
4. View doctor rankings

**Expected Results**:
- ✅ Filters work correctly
- ✅ Sorting works
- ✅ Rankings based on multiple factors

**API Endpoints**:
- `GET /api/doctors`
- `GET /api/doctor-ranking`
- `GET /api/doctor-location`

---

## 7. Patient Features

### 7.1 Patient Dashboard
**Route**: `/dashboard/patient`

**Test Steps**:
1. Login as patient
2. Navigate to patient dashboard
3. Verify sections show:
   - Upcoming appointments
   - Health records
   - Prescriptions
   - Consultation history

**Expected Results**:
- ✅ Dashboard loads correctly
- ✅ All data displays accurately

### 7.2 Symptom Checker
**Route**: `/symptom-checker`

**Test Steps**:
1. Navigate to symptom checker
2. Enter symptoms:
   - Headache
   - Fever
   - Cough
3. Answer follow-up questions
4. View suggested conditions
5. Get doctor recommendations

**Expected Results**:
- ✅ Symptom input works
- ✅ AI provides relevant suggestions
- ✅ Doctor recommendations shown
- ✅ Can book appointment from results

### 7.3 Create Patient Post
**Route**: `/create`

**Test Steps**:
1. Login as patient
2. Navigate to `/create`
3. Fill in symptom form:
   - Description of issue
   - Symptoms (multiple selection)
   - Duration
   - Age, gender, weight
   - Privacy (Public/Private)
   - Community selection
4. Submit post

**Expected Results**:
- ✅ Post created with formatted content
- ✅ Post shows in feed
- ✅ Privacy setting respected
- ✅ Doctors can respond

### 7.4 Health Insights
**Test Steps**:
1. Navigate to health insights
2. View personalized health tips
3. View health trends
4. Track symptoms over time

**API Endpoint**: `GET /api/health-insights`

---

## 8. Search & Discovery

### 8.1 Global Search
**Route**: `/search`

**Test Steps**:
1. Click search bar in navbar
2. Type query: "headache"
3. Verify autocomplete shows:
   - Posts matching query
   - Users matching query
   - Communities matching query
4. Press Enter to see full results
5. Filter results by type
6. Sort results by relevance/date

**Expected Results**:
- ✅ Autocomplete works (debounced)
- ✅ Results show with icons
- ✅ Full search page shows all results
- ✅ Filters work correctly

**API Endpoint**: `GET /api/search?q=query&type=all`

### 8.2 Recent Searches
**Test Steps**:
1. Perform several searches
2. Click search bar (empty)
3. Verify recent searches show
4. Click "Clear All"
5. Verify searches cleared

**Expected Results**:
- ✅ Recent searches stored locally
- ✅ Can click to repeat search
- ✅ Clear all works

### 8.3 Trending Topics
**Route**: `/trending`

**Test Steps**:
1. Navigate to trending page
2. View trending posts
3. View trending communities
4. View trending hashtags

**Expected Results**:
- ✅ Trending content shows
- ✅ Based on recent activity
- ✅ Updates periodically

**API Endpoint**: `GET /api/trending`

### 8.4 Popular Posts
**Route**: `/popular`

**Test Steps**:
1. Navigate to popular page
2. View posts sorted by:
   - Most upvoted
   - Most commented
   - Most awarded
3. Filter by time period (today, week, month, all time)

**Expected Results**:
- ✅ Popular posts show correctly
- ✅ Sorting works
- ✅ Time filters work

---

## 9. Notifications

### 9.1 View Notifications
**Route**: `/notifications`

**Test Steps**:
1. Click notifications bell in navbar
2. View notification dropdown
3. Click "View All" to go to notifications page
4. Verify notifications show for:
   - New comments on your posts
   - Replies to your comments
   - Upvotes on your content
   - New followers
   - Appointment updates
   - Chat messages
   - Awards received

**Expected Results**:
- ✅ Notifications show with icons
- ✅ Unread count badge shows
- ✅ Clicking notification navigates to relevant page
- ✅ Notifications marked as read

**API Endpoints**:
- `GET /api/notifications`
- `PUT /api/notifications/:id/read`
- `PUT /api/notifications/read-all`

### 9.2 Notification Settings
**Route**: `/settings/notifications`

**Test Steps**:
1. Navigate to notification settings
2. Toggle notification types:
   - Email notifications
   - Push notifications
   - In-app notifications
3. Configure preferences for each type
4. Save settings

**Expected Results**:
- ✅ Settings save correctly
- ✅ Notifications respect preferences
- ✅ Can disable specific types

**API Endpoint**: `PUT /api/notifications/settings`

### 9.3 Real-time Notifications
**Test Steps**:
1. Have another user interact with your content
2. Verify notification appears in real-time
3. Verify notification bell shows red dot
4. Verify notification count updates

**Expected Results**:
- ✅ Real-time via Socket.io
- ✅ No page refresh needed
- ✅ Sound/visual indicator (if enabled)

---

## 10. Backend API Testing

### 10.1 Authentication Endpoints

#### Register Patient
```bash
POST http://localhost:3001/api/auth/register
Content-Type: application/json

{
  "email": "test@example.com",
  "username": "testuser",
  "password": "TestPass123!",
  "role": "PATIENT"
}
```

**Expected Response**: 201 Created
```json
{
  "user": { "id": "...", "username": "testuser", "role": "PATIENT" },
  "token": "jwt_token_here"
}
```

#### Login
```bash
POST http://localhost:3001/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "TestPass123!"
}
```

**Expected Response**: 200 OK
```json
{
  "user": { "id": "...", "username": "testuser", "role": "PATIENT" },
  "token": "jwt_token_here"
}
```

#### Verify Token
```bash
GET http://localhost:3001/api/auth/verify
Authorization: Bearer {token}
```

**Expected Response**: 200 OK
```json
{
  "valid": true,
  "user": { "id": "...", "username": "testuser" }
}
```

### 10.2 Posts Endpoints

#### Get All Posts
```bash
GET http://localhost:3001/api/posts
Authorization: Bearer {token}
```

**Expected Response**: 200 OK
```json
{
  "posts": [
    {
      "id": "...",
      "title": "Post Title",
      "content": "Post content",
      "author": { "username": "...", "avatar": "..." },
      "upvotes": 10,
      "comments": 5
    }
  ]
}
```

#### Create Post
```bash
POST http://localhost:3001/api/posts
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Test Post",
  "content": "This is a test post",
  "communityId": "optional_community_id"
}
```

**Expected Response**: 201 Created

#### Upvote Post
```bash
POST http://localhost:3001/api/posts/:id/upvote
Authorization: Bearer {token}
```

**Expected Response**: 200 OK

### 10.3 Comments Endpoints

#### Get Comments for Post
```bash
GET http://localhost:3001/api/posts/:id/comments
Authorization: Bearer {token}
```

#### Create Comment
```bash
POST http://localhost:3001/api/comments
Authorization: Bearer {token}
Content-Type: application/json

{
  "postId": "post_id",
  "content": "This is a comment"
}
```

### 10.4 Communities Endpoints

#### Get All Communities
```bash
GET http://localhost:3001/api/communities
```

#### Create Community
```bash
POST http://localhost:3001/api/communities
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "TestCommunity",
  "description": "Test community",
  "privacy": "PUBLIC"
}
```

#### Join Community
```bash
POST http://localhost:3001/api/communities/:id/join
Authorization: Bearer {token}
```

### 10.5 Appointments Endpoints

#### Get User Appointments
```bash
GET http://localhost:3001/api/appointments
Authorization: Bearer {token}
```

#### Create Appointment
```bash
POST http://localhost:3001/api/appointments
Authorization: Bearer {token}
Content-Type: application/json

{
  "doctorId": "doctor_user_id",
  "startTime": "2026-03-01T10:00:00Z",
  "endTime": "2026-03-01T10:30:00Z",
  "reason": "Consultation"
}
```

#### Approve Appointment (Doctor only)
```bash
PUT http://localhost:3001/api/appointments/:id/approve
Authorization: Bearer {token}
```

### 10.6 Chat Endpoints

#### Get Conversations
```bash
GET http://localhost:3001/api/chat/conversations
Authorization: Bearer {token}
```

#### Get Messages
```bash
GET http://localhost:3001/api/chat/conversations/:id/messages
Authorization: Bearer {token}
```

#### Send Message
```bash
POST http://localhost:3001/api/chat/messages
Authorization: Bearer {token}
Content-Type: application/json

{
  "conversationId": "conversation_id",
  "content": "Hello!",
  "type": "TEXT"
}
```

### 10.7 User Profile Endpoints

#### Get User Profile
```bash
GET http://localhost:3001/api/users/:username
```

#### Update Profile
```bash
PUT http://localhost:3001/api/profile
Authorization: Bearer {token}
Content-Type: application/json

{
  "bio": "Updated bio",
  "specialty": "Cardiology"
}
```

#### Upload Avatar
```bash
POST http://localhost:3001/api/upload/avatar
Authorization: Bearer {token}
Content-Type: multipart/form-data

file: [image file]
```

### 10.8 Admin Endpoints

#### Get All Users (Admin only)
```bash
GET http://localhost:3001/api/admin/users
Authorization: Bearer {admin_token}
```

#### Ban User (Admin only)
```bash
PUT http://localhost:3001/api/admin/users/:id/ban
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "reason": "Violation of terms",
  "duration": "permanent"
}
```

### 10.9 Testing with Postman/Thunder Client

**Setup**:
1. Install Postman or Thunder Client (VS Code extension)
2. Create environment variables:
   - `API_URL`: http://localhost:3001
   - `TOKEN`: (set after login)
3. Create collection for each endpoint category

**Test Flow**:
1. Register user → Save token
2. Login → Update token
3. Test authenticated endpoints
4. Test error cases (invalid data, unauthorized, etc.)

---

## 🔍 Backend Monitoring

### Check Backend Logs
```bash
# Backend is running in Terminal ID: 13
# Check logs for:
- API requests: [GET/POST/PUT/DELETE] /api/...
- Database queries: [Prisma] ...
- Errors: [ERROR] ...
- Socket connections: [Chat] User connected: ...
```

### Database Inspection
```bash
cd packages/database
npx prisma studio --schema=prisma/schema.prisma
# Opens at http://localhost:5555
```

**Tables to Check**:
- User
- Post
- Comment
- Community
- Appointment
- Message
- Conversation
- Notification
- Badge
- Award

### Performance Monitoring
- Check response times in browser DevTools Network tab
- Monitor database query performance
- Check for N+1 query problems
- Monitor memory usage

---

## ✅ Testing Checklist Summary

### Core Features
- [ ] Authentication (Register, Login, Logout)
- [ ] User Profiles (View, Edit, Avatar, Banner)
- [ ] Posts (Create, View, Edit, Delete, Upvote, Downvote)
- [ ] Comments (Create, Reply, Edit, Delete)
- [ ] Communities (View, Create, Join, Leave, Post)
- [ ] Search (Global, Autocomplete, Filters)

### Medical Features
- [ ] Doctor Registration & Verification
- [ ] Appointments (Book, Approve, Reject, Complete)
- [ ] Chat System (Send, Receive, Persist, Attachments)
- [ ] Symptom Checker
- [ ] Patient Posts (Symptom-based)
- [ ] Doctor Profiles (Enhanced)
- [ ] CME Credits

### Gamification
- [ ] Karma System
- [ ] Badges & Achievements
- [ ] Awards
- [ ] Leaderboard

### Admin
- [ ] User Management
- [ ] Doctor Verification
- [ ] Content Moderation
- [ ] Reports Management
- [ ] Analytics Dashboard
- [ ] Cron Jobs
- [ ] Audit Logs

### Backend APIs
- [ ] All endpoints return correct status codes
- [ ] Authentication works on protected routes
- [ ] Error handling works correctly
- [ ] Data validation works
- [ ] Database operations succeed

---

## 🐛 Common Issues to Watch For

1. **CORS Errors**: Check backend CORS configuration
2. **401 Unauthorized**: Token expired or invalid
3. **404 Not Found**: Route doesn't exist or typo
4. **500 Server Error**: Check backend logs for details
5. **Database Connection**: Check DATABASE_URL in .env
6. **Socket Disconnects**: Check Socket.io configuration
7. **File Upload Fails**: Check file size limits and formats
8. **Slow Performance**: Check database queries and indexes

---

## 📊 Test Report Template

### Test Session
- **Date**: [Date]
- **Tester**: [Name]
- **Environment**: Development
- **Backend**: http://localhost:3001
- **Frontend**: http://localhost:3000

### Results
| Feature | Status | Notes |
|---------|--------|-------|
| Communities | ✅ Pass | All features working |
| Chat | ✅ Pass | Messages persist correctly |
| Appointments | ⚠️ Partial | Approval works, rejection needs fix |
| Admin Panel | ❌ Fail | 403 error on access |

### Bugs Found
1. **Bug Title**: Description
   - **Severity**: High/Medium/Low
   - **Steps to Reproduce**: ...
   - **Expected**: ...
   - **Actual**: ...
   - **Screenshot**: [if applicable]

---

**Happy Testing! 🚀**
