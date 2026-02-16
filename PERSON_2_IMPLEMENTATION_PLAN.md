# Person 2: Medical Features & Doctor Tools - Implementation Plan

## Branch: `feature/medical-doctor`

## Overview
This document tracks the implementation of all medical and doctor-specific features for MedThread.

---

## Task 5: Medical Threads ❌→✅

### Current Status
- ✅ Thread creation works
- ✅ Thread viewing works
- ❌ Cannot mark as resolved
- ❌ Cannot update thread status
- ❌ Timeline events not fully implemented
- ❌ AI analysis not connected
- ❌ Symptom checker not functional

### Implementation Steps
1. [ ] Add thread resolution API endpoint
2. [ ] Add thread status update endpoint
3. [ ] Implement timeline event creation
4. [ ] Add AI symptom analysis integration
5. [ ] Create symptom checker UI component
6. [ ] Add thread analytics dashboard

---

## Task 6: Thread Replies ❌→✅

### Current Status
- ✅ Doctors can reply
- ❌ Cannot mark replies as helpful
- ❌ Cannot upvote/downvote replies
- ❌ Peer review system not implemented
- ❌ Best answer marking not implemented

### Implementation Steps
1. [ ] Fix helpful marking functionality
2. [ ] Fix voting system (upvote/downvote)
3. [ ] Implement peer review workflow
4. [ ] Add best answer selection
5. [ ] Create reply quality scoring
6. [ ] Add voting analytics

---

## Task 8: Doctor Verification ✅→✅

### Current Status
- ✅ Doctors can submit verification
- ✅ Admin can approve/reject
- ❌ Email notifications not sent
- ❌ Document upload not fully working
- ❌ KYC document viewing broken
- ❌ Verification status emails missing

### Implementation Steps
1. [ ] Implement email notification service
2. [ ] Fix document upload (S3/Cloudinary integration)
3. [ ] Create KYC document viewer
4. [ ] Add verification status emails
5. [ ] Add document expiry reminders
6. [ ] Implement automated verification checks

---

## Task 9: Appointments ✅→✅

### Current Status
- ✅ Can create appointments
- ✅ Can set availability
- ❌ No calendar view
- ❌ No time slot selection UI
- ❌ No appointment reminders
- ❌ No appointment cancellation
- ❌ No rescheduling
- ❌ No appointment history
- ❌ No payment integration

### Implementation Steps
1. [ ] Create calendar view component
2. [ ] Build time slot selection UI
3. [ ] Implement appointment reminders
4. [ ] Add cancellation functionality
5. [ ] Add rescheduling functionality
6. [ ] Create appointment history page
7. [ ] Integrate payment system

---

## Task 10: Consultation Funnel UI ✅→✅

### Current Status
- ✅ Backend service created
- ❌ No "Book Consultation" button on replies
- ❌ No consultation request modal
- ❌ No doctor response UI
- ❌ No appointment scheduling UI
- ❌ No payment flow
- ❌ No conversion tracking dashboard

### Implementation Steps
1. [ ] Add "Book Consultation" button to thread replies
2. [ ] Create consultation request modal
3. [ ] Build doctor response interface
4. [ ] Create appointment scheduling UI
5. [ ] Implement payment flow
6. [ ] Build conversion tracking dashboard
7. [ ] Add funnel analytics visualization

---

## Task 12: Digital CV UI ✅→✅

### Current Status
- ✅ Backend service complete
- ✅ One profile page created
- ❌ No profile editing UI
- ❌ No education/certification forms
- ❌ No publication management
- ❌ No badge display
- ❌ No PDF export
- ❌ No profile sharing
- ❌ No LinkedIn integration

### Implementation Steps
1. [ ] Create profile editing page
2. [ ] Build education/certification forms
3. [ ] Add publication management UI
4. [ ] Implement badge display system
5. [ ] Add PDF export functionality
6. [ ] Create profile sharing features
7. [ ] Add social media integration

---

## Task 13: CME Credits UI ❌→✅

### Current Status
- ✅ Backend service complete
- ✅ API routes exist
- ❌ No CME dashboard page
- ❌ No credit tracking UI
- ❌ No certificate generation UI
- ❌ No leaderboard display
- ❌ No opportunities feed
- ❌ No auto-award notifications

### Implementation Steps
1. [ ] Create CME dashboard page (`/dashboard/doctor/cme`)
2. [ ] Build credit tracking UI
3. [ ] Create certificate generation UI
4. [ ] Build leaderboard display
5. [ ] Create opportunities feed
6. [ ] Implement auto-award notifications
7. [ ] Add credit history timeline

---

## Task 14: Health Insights UI ❌→✅

### Current Status
- ✅ Backend service complete
- ✅ API routes exist
- ❌ No insights dashboard page
- ❌ No trending symptoms display
- ❌ No regional alerts map
- ❌ No medication patterns UI
- ❌ No diagnostic patterns display
- ❌ No data export functionality

### Implementation Steps
1. [ ] Create insights dashboard page (`/dashboard/doctor/insights`)
2. [ ] Build trending symptoms visualization
3. [ ] Create regional alerts map
4. [ ] Build medication patterns display
5. [ ] Create diagnostic patterns UI
6. [ ] Add data export functionality
7. [ ] Implement real-time updates

---

## Priority Order

### Phase 1: Critical Fixes (Week 1)
1. Task 6: Thread Replies (voting, helpful marking, best answer)
2. Task 5: Medical Threads (resolution, status updates)
3. Task 9: Appointments (calendar, reminders, cancellation)

### Phase 2: Doctor Tools (Week 2)
4. Task 13: CME Credits UI (dashboard, tracking, certificates)
5. Task 14: Health Insights UI (dashboard, visualizations)
6. Task 10: Consultation Funnel UI (modal, payment, analytics)

### Phase 3: Profile & Verification (Week 3)
7. Task 12: Digital CV UI (editing, forms, PDF export)
8. Task 8: Doctor Verification (emails, document upload)

---

## Testing Checklist

### Medical Threads
- [ ] Can create thread
- [ ] Can reply to thread
- [ ] Can mark thread as resolved
- [ ] Can update thread status
- [ ] Timeline events are created
- [ ] AI analysis works

### Thread Replies
- [ ] Can upvote/downvote replies
- [ ] Can mark reply as helpful
- [ ] Can select best answer
- [ ] Peer review workflow works
- [ ] Reply quality scoring works

### Appointments
- [ ] Can view calendar
- [ ] Can select time slots
- [ ] Can book appointment
- [ ] Can cancel appointment
- [ ] Can reschedule appointment
- [ ] Reminders are sent
- [ ] Payment integration works

### CME Credits
- [ ] Dashboard displays correctly
- [ ] Credits are auto-awarded
- [ ] Certificates can be generated
- [ ] Leaderboard updates
- [ ] Opportunities are shown

### Health Insights
- [ ] Dashboard loads data
- [ ] Trending symptoms display
- [ ] Regional map works
- [ ] Medication patterns show
- [ ] Data can be exported

### Consultation Funnel
- [ ] Book button appears on replies
- [ ] Modal opens correctly
- [ ] Doctor can respond
- [ ] Appointment can be scheduled
- [ ] Payment flow works
- [ ] Analytics dashboard shows metrics

---

## Files to Create/Modify

### Frontend (apps/web/src/)
- `app/dashboard/doctor/cme/page.tsx` (NEW)
- `app/dashboard/doctor/insights/page.tsx` (NEW)
- `app/dashboard/doctor/consultations/page.tsx` (NEW)
- `app/dashboard/doctor/profile/edit/page.tsx` (NEW)
- `app/appointments/calendar/page.tsx` (NEW)
- `components/consultation/BookConsultationButton.tsx` (NEW)
- `components/consultation/ConsultationModal.tsx` (NEW)
- `components/cme/CmeDashboard.tsx` (NEW)
- `components/cme/CmeLeaderboard.tsx` (NEW)
- `components/insights/InsightsDashboard.tsx` (NEW)
- `components/insights/TrendingSymptoms.tsx` (NEW)
- `components/insights/RegionalMap.tsx` (NEW)
- `components/appointments/CalendarView.tsx` (NEW)
- `components/appointments/TimeSlotPicker.tsx` (NEW)
- `components/threads/ReplyActions.tsx` (MODIFY)
- `components/threads/ThreadActions.tsx` (MODIFY)

### Backend (apps/api/src/)
- `routes/threads.routes.ts` (MODIFY)
- `routes/replies.routes.ts` (MODIFY)
- `services/email.service.ts` (NEW)
- `services/notification.service.ts` (MODIFY)
- `services/payment.service.ts` (NEW)
- `services/file-upload.service.ts` (NEW)

---

## Dependencies to Install

```bash
# Frontend
npm install recharts date-fns react-calendar react-big-calendar
npm install @stripe/stripe-js @stripe/react-stripe-js
npm install react-pdf jspdf html2canvas
npm install react-leaflet leaflet

# Backend
npm install nodemailer @sendgrid/mail
npm install stripe
npm install aws-sdk @aws-sdk/client-s3
npm install cloudinary
```

---

## Environment Variables Needed

```env
# Email
SENDGRID_API_KEY=
EMAIL_FROM=

# Payment
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# File Upload
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=
AWS_REGION=

# Or Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

---

## Progress Tracking

- [ ] Task 5: Medical Threads (0/6 steps)
- [ ] Task 6: Thread Replies (0/6 steps)
- [ ] Task 8: Doctor Verification (0/6 steps)
- [ ] Task 9: Appointments (0/7 steps)
- [ ] Task 10: Consultation Funnel UI (0/7 steps)
- [ ] Task 12: Digital CV UI (0/7 steps)
- [ ] Task 13: CME Credits UI (0/7 steps)
- [ ] Task 14: Health Insights UI (0/7 steps)

**Total Progress: 0/52 steps (0%)**

---

## Notes

- All backend services are already implemented
- Focus is on frontend UI and integration
- Payment integration is critical for consultation funnel
- Email service is needed for notifications
- File upload service is needed for documents
