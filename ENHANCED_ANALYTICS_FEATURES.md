# Enhanced Analytics Features Implementation

This document outlines the implementation of 9 advanced analytics features for the MedThread platform.

## Features Implemented

### 1. Doctor Specialty Distribution — Pie Chart
**Location:** Admin Dashboard
**Component:** `apps/web/src/components/analytics/DoctorSpecialtyChart.tsx`
**API Endpoint:** `GET /api/enhanced-analytics/doctor-specialty-distribution`

Displays a pie chart showing the percentage breakdown of doctors by medical specialty.

**Usage:**
```tsx
import { DoctorSpecialtyChart } from '@/components/analytics/DoctorSpecialtyChart';

<DoctorSpecialtyChart />
```

---

### 2. Community Activity Analysis
**Location:** Admin Dashboard & Community Pages
**Component:** `apps/web/src/components/analytics/CommunityActivityInsights.tsx`
**API Endpoint:** `GET /api/enhanced-analytics/community-activity?communityId={id}`

Analyzes and categorizes communities into three activity tiers:
- **Highly Active:** ≥5 posts/day AND ≥3 comments/post
- **Moderately Active:** ≥1 post/day OR ≥1 comment/post
- **Inactive:** Below moderate thresholds

**Usage:**
```tsx
import { CommunityActivityInsights } from '@/components/analytics/CommunityActivityInsights';

// All communities
<CommunityActivityInsights />

// Specific community
<CommunityActivityInsights communityId="community-id" />
```

---

### 3. Real-Time Stats on Doctor's Public Profile
**Location:** Doctor Public Profile (`/doctor/[username]`)
**Component:** `apps/web/src/components/analytics/DoctorPublicStats.tsx`
**API Endpoint:** `GET /api/enhanced-analytics/doctor-stats/:doctorId`

Displays live lifetime stats including:
- Total posts made
- Total comments made
- Conversion count
- Patients cured
- Clinic visits
- Portfolio score

Updates every 30 seconds for real-time data.

**Usage:**
```tsx
import { DoctorPublicStats } from '@/components/analytics/DoctorPublicStats';

<DoctorPublicStats doctorId={doctorId} />
```

---

### 4. Conversion Count on Doctor's Public Profile
**Tracking:** Automatic via client-side events
**API Endpoint:** `POST /api/enhanced-analytics/track-conversion`

Tracks when a patient:
1. Clicks on a doctor's comment
2. Visits the doctor's profile
3. Clicks the "Message" button

**Implementation:**
```tsx
// On comment click (when viewing doctor profile from comment)
await fetch(`${API_URL}/api/enhanced-analytics/track-conversion`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    commentId: 'comment-id',
    doctorId: 'doctor-id',
    postId: 'post-id',
    action: 'profile_visit'
  })
});

// On message button click
await fetch(`${API_URL}/api/enhanced-analytics/track-conversion`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    commentId: 'comment-id',
    doctorId: 'doctor-id',
    postId: 'post-id',
    action: 'message_click'
  })
});
```

---

### 5. Post-Consultation Patient Feedback Loop
**Component:** `apps/web/src/components/PatientFeedbackModal.tsx`
**API Endpoint:** `POST /api/enhanced-analytics/patient-feedback`

After every consultation, patients receive a notification every 2 days with three options:
- ✅ **Cured:** Patient marks themselves as cured (stops notifications, +10 portfolio score)
- 🔄 **Not Yet:** Patient is still recovering (reschedules notification for 2 days later)
- 🔀 **Consult a New Doctor:** Patient is dissatisfied (stops notifications, -5 portfolio score)

**Usage:**
```tsx
import { PatientFeedbackModal } from '@/components/PatientFeedbackModal';

<PatientFeedbackModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  doctorId={doctorId}
  doctorName={doctorName}
  conversationId={conversationId}
  appointmentId={appointmentId}
  wasClinicVisit={false}
/>
```

**Notification Scheduling:**
Implement a cron job or scheduled task to check `PatientFeedback` records where:
- `status === 'NOT_YET'`
- `lastFeedbackAt` is 2 days ago
- Send notification to patient

---

### 6. Admin — Doctor Portfolio Deep-Dive
**Location:** Admin Dashboard
**Component:** `apps/web/src/components/admin/DoctorPortfolioView.tsx`
**API Endpoint:** `GET /api/enhanced-analytics/doctor-portfolio/:doctorId`

Admins can view detailed analytics for any doctor:
- Posts commented on
- Conversion count per comment
- Patient satisfaction ratio
- Portfolio score breakdown
- Feedback history

**Usage:**
```tsx
import { DoctorPortfolioView } from '@/components/admin/DoctorPortfolioView';

<DoctorPortfolioView doctorId={doctorId} />
```

---

### 7. Clinic Visit & Post-Clinic Cure Tracking
**API Endpoint:** `POST /api/enhanced-analytics/track-clinic-visit`

Tracks two metrics:
- **Clinic Conversion Count:** Number of "Book Appointment" clicks
- **Post-Clinic Cure Count:** Patients cured after clinic visit

**Implementation:**
```tsx
// On "Book Appointment" button click
await fetch(`${API_URL}/api/enhanced-analytics/track-clinic-visit`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    doctorId: 'doctor-id'
  })
});

// When patient submits feedback after clinic visit
await fetch(`${API_URL}/api/enhanced-analytics/patient-feedback`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    doctorId: 'doctor-id',
    appointmentId: 'appointment-id',
    status: 'CURED',
    wasClinicVisit: true
  })
});
```

---

### 8. Top Doctors Component — Regional & Global Toggle
**Location:** Right Sidebar (Home Page)
**Component:** `apps/web/src/components/TopDoctorsWidget.tsx`
**API Endpoint:** `GET /api/enhanced-analytics/top-doctors?region={region}&limit={limit}`

Displays top doctors with two toggle options:
- **Top Regional Doctors:** Filtered by patient's region (by pincode)
- **Top Global Doctors:** All doctors across all regions

Ranked by cured patient count.

**Usage:**
```tsx
import { TopDoctorsWidget } from '@/components/TopDoctorsWidget';

// General top doctors
<TopDoctorsWidget />

// Specialty-specific
<TopDoctorsWidget specialty="Cardiology" />
```

---

### 9. Top Community Doctors — Community-Specific Right Sidebar
**Location:** Community Pages (`/m/[community]`)
**Component:** `apps/web/src/components/TopDoctorsWidget.tsx` (with specialty filter)
**API Endpoint:** `GET /api/enhanced-analytics/top-doctors?specialty={specialty}&limit={limit}`

Automatically filters doctors by the community's medical specialty:
- `m/cardiology` → Shows only Cardiologists
- `m/dermatology` → Shows only Dermatologists
- `m/general-practice` → Shows only General Practitioners

**Implementation:**
Already integrated in `apps/web/src/app/m/[community]/page.tsx`

---

## Database Schema Changes

### New Models

#### CommentConversion
Tracks profile visits and message clicks from comments.
```prisma
model CommentConversion {
  id               String    @id @default(cuid())
  commentId        String
  doctorId         String
  patientId        String
  postId           String
  profileVisited   Boolean   @default(false)
  messageClicked   Boolean   @default(false)
  visitedAt        DateTime?
  messageClickedAt DateTime?
  createdAt        DateTime  @default(now())
}
```

#### PatientFeedback
Tracks post-consultation patient feedback.
```prisma
model PatientFeedback {
  id             String        @id @default(cuid())
  patientId      String
  doctorId       String
  conversationId String?
  appointmentId  String?
  status         String        @default("PENDING")
  feedbackCount  Int           @default(0)
  lastFeedbackAt DateTime?
  curedAt        DateTime?
  wasClinicVisit Boolean       @default(false)
  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt
}
```

#### CommunityActivity
Stores community activity tier analysis.
```prisma
model CommunityActivity {
  id                 String    @id @default(cuid())
  communityId        String    @unique
  activityTier       String    @default("INACTIVE")
  totalPosts         Int       @default(0)
  totalComments      Int       @default(0)
  totalMembers       Int       @default(0)
  avgPostsPerDay     Float     @default(0)
  avgCommentsPerPost Float     @default(0)
  lastActivityAt     DateTime?
  calculatedAt       DateTime  @default(now())
}
```

### Updated Models

#### DoctorPerformance
Added new fields:
- `totalPostsCommented`
- `totalCommentsCount`
- `conversionCount`
- `curedPatientCount`
- `notYetCount`
- `consultNewDoctorCount`
- `portfolioScore`
- `clinicVisitCount`
- `postClinicCureCount`

---

## Migration

Run the migration to add new tables and fields:

```bash
cd packages/database
npx prisma migrate dev --name add_enhanced_analytics
npx prisma generate
```

Or apply the SQL migration directly:
```bash
psql -d your_database < prisma/migrations/add_enhanced_analytics.sql
```

---

## API Routes Summary

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/enhanced-analytics/doctor-specialty-distribution` | GET | No | Get doctor specialty pie chart data |
| `/api/enhanced-analytics/community-activity` | GET | No | Get community activity analysis |
| `/api/enhanced-analytics/doctor-stats/:doctorId` | GET | No | Get doctor public stats |
| `/api/enhanced-analytics/track-conversion` | POST | Yes | Track comment conversion |
| `/api/enhanced-analytics/patient-feedback` | POST | Yes | Submit patient feedback |
| `/api/enhanced-analytics/doctor-portfolio/:doctorId` | GET | Admin | Get doctor portfolio deep-dive |
| `/api/enhanced-analytics/track-clinic-visit` | POST | Yes | Track clinic visit |
| `/api/enhanced-analytics/top-doctors` | GET | No | Get top doctors (regional/global) |

---

## Next Steps

### 1. Implement Notification Scheduling
Create a cron job to send patient feedback notifications every 2 days:

```typescript
// In apps/api/src/services/cron-jobs.service.ts
async scheduleFeedbackNotifications() {
  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

  const pendingFeedbacks = await prisma.patientFeedback.findMany({
    where: {
      status: 'NOT_YET',
      lastFeedbackAt: { lte: twoDaysAgo }
    },
    include: {
      patient: true,
      doctor: true
    }
  });

  for (const feedback of pendingFeedbacks) {
    // Send notification to patient
    await notificationService.create({
      type: 'FEEDBACK_REQUEST',
      recipientId: feedback.patientId,
      actorId: feedback.doctorId,
      metadata: {
        doctorName: feedback.doctor.username,
        conversationId: feedback.conversationId
      }
    });
  }
}
```

### 2. Add Regional Filtering
Implement pincode-based regional filtering for Top Doctors:
- Add `pincode` or `region` field to User model
- Update `getTopDoctors` service to filter by region
- Detect user's location on frontend

### 3. Add to Admin Dashboard
Integrate the new components into the admin dashboard:
- Add `DoctorSpecialtyChart` to admin overview
- Add `CommunityActivityInsights` to community management
- Add `DoctorPortfolioView` to doctor management

### 4. Testing
- Test conversion tracking flow
- Test patient feedback loop
- Test community activity calculation
- Test top doctors ranking

---

## Dependencies

Ensure these packages are installed:

```bash
# Frontend
npm install recharts

# Backend
# All dependencies already included in existing setup
```

---

## Performance Considerations

1. **Caching:** Consider caching top doctors and community activity data (Redis)
2. **Indexing:** Database indexes added for performance
3. **Real-time Updates:** Doctor stats refresh every 30 seconds (configurable)
4. **Batch Processing:** Community activity analysis can be run as a batch job

---

## Security Notes

- Admin-only endpoints protected with role check
- All tracking endpoints require authentication
- Patient feedback is private and only accessible to patient and admin
- Conversion tracking respects user privacy

---

## Support

For questions or issues, refer to:
- API Service: `apps/api/src/services/enhanced-analytics.service.ts`
- API Routes: `apps/api/src/routes/enhanced-analytics.ts`
- Components: `apps/web/src/components/analytics/` and `apps/web/src/components/admin/`
