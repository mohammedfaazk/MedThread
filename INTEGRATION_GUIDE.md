# Integration Guide for Enhanced Analytics Features

This guide shows how to integrate the tracking functionality into existing components.

## 1. Track Comment Conversions

### In Comment Component (when doctor's name is clicked)

**File:** `apps/web/src/components/Comment.tsx` or `apps/web/src/components/CommentSection.tsx`

```tsx
import { useRouter } from 'next/navigation';

const handleDoctorClick = async (comment: any) => {
  const router = useRouter();
  
  // Track profile visit
  if (comment.author.role === 'DOCTOR') {
    try {
      const token = localStorage.getItem('auth_token');
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/enhanced-analytics/track-conversion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          commentId: comment.id,
          doctorId: comment.authorId,
          postId: comment.postId,
          action: 'profile_visit'
        })
      });
    } catch (error) {
      console.error('Failed to track conversion:', error);
    }
  }
  
  router.push(`/doctor/${comment.author.username}`);
};
```

### In Doctor Profile Page (when Message button is clicked)

**File:** `apps/web/src/app/doctor/[username]/page.tsx` or doctor profile component

```tsx
const handleMessageClick = async () => {
  // Get the comment ID from URL params if user came from a comment
  const urlParams = new URLSearchParams(window.location.search);
  const commentId = urlParams.get('from_comment');
  const postId = urlParams.get('from_post');
  
  if (commentId && postId) {
    try {
      const token = localStorage.getItem('auth_token');
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/enhanced-analytics/track-conversion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          commentId,
          doctorId: doctor.id,
          postId,
          action: 'message_click'
        })
      });
    } catch (error) {
      console.error('Failed to track conversion:', error);
    }
  }
  
  // Continue with message functionality
  router.push(`/messages?to=${doctor.id}`);
};
```

**Update Comment Links:**
When linking to doctor profile from comment, add query params:
```tsx
<Link href={`/doctor/${comment.author.username}?from_comment=${comment.id}&from_post=${comment.postId}`}>
  {comment.author.username}
</Link>
```

---

## 2. Track Clinic Visits

### In Doctor Profile Page (when Book Appointment is clicked)

**File:** `apps/web/src/app/doctor/[username]/page.tsx`

```tsx
const handleBookAppointment = async () => {
  try {
    const token = localStorage.getItem('auth_token');
    
    // Track clinic visit
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/enhanced-analytics/track-clinic-visit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        doctorId: doctor.id
      })
    });
    
    // Continue with appointment booking
    router.push(`/appointments/book?doctor=${doctor.id}`);
  } catch (error) {
    console.error('Failed to track clinic visit:', error);
    // Still proceed with booking even if tracking fails
    router.push(`/appointments/book?doctor=${doctor.id}`);
  }
};
```

---

## 3. Patient Feedback Modal Integration

### In Chat/Conversation Component

**File:** `apps/web/src/components/Chat/ChatWindow.tsx` or conversation component

```tsx
import { PatientFeedbackModal } from '@/components/PatientFeedbackModal';
import { useEffect, useState } from 'react';

export function ChatWindow({ conversationId, doctorId, doctorName }: Props) {
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  
  useEffect(() => {
    // Check if feedback is needed (2 days after last message)
    const checkFeedbackNeeded = async () => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/enhanced-analytics/check-feedback-needed?conversationId=${conversationId}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      const result = await response.json();
      
      if (result.needsFeedback) {
        setShowFeedbackModal(true);
      }
    };
    
    checkFeedbackNeeded();
  }, [conversationId]);
  
  return (
    <>
      {/* Chat UI */}
      
      <PatientFeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        doctorId={doctorId}
        doctorName={doctorName}
        conversationId={conversationId}
      />
    </>
  );
}
```

### In Appointment Component (for clinic visits)

**File:** `apps/web/src/components/appointments/AppointmentDetail.tsx`

```tsx
import { PatientFeedbackModal } from '@/components/PatientFeedbackModal';

export function AppointmentDetail({ appointment }: Props) {
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  
  // Show feedback modal 2 days after appointment completion
  useEffect(() => {
    if (appointment.status === 'COMPLETED') {
      const completedDate = new Date(appointment.endTime);
      const twoDaysLater = new Date(completedDate);
      twoDaysLater.setDate(twoDaysLater.getDate() + 2);
      
      if (new Date() >= twoDaysLater) {
        setShowFeedbackModal(true);
      }
    }
  }, [appointment]);
  
  return (
    <>
      {/* Appointment details */}
      
      <PatientFeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        doctorId={appointment.doctorId}
        doctorName={appointment.doctor.username}
        appointmentId={appointment.id}
        wasClinicVisit={true}
      />
    </>
  );
}
```

---

## 4. Add Doctor Stats to Profile Page

**File:** `apps/web/src/app/doctor/[username]/page.tsx`

```tsx
import { DoctorPublicStats } from '@/components/analytics/DoctorPublicStats';

export default function DoctorProfilePage({ params }: { params: { username: string } }) {
  // ... existing code
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Doctor Info */}
        <div className="lg:col-span-2">
          {/* Existing doctor profile content */}
        </div>
        
        {/* Right: Stats Sidebar */}
        <div className="space-y-4">
          <DoctorPublicStats doctorId={doctor.id} />
          
          {/* Other sidebar content */}
        </div>
      </div>
    </div>
  );
}
```

---

## 5. Add to Admin Dashboard

**File:** `apps/web/src/app/admin/dashboard/page.tsx`

```tsx
import { DoctorSpecialtyChart } from '@/components/analytics/DoctorSpecialtyChart';
import { CommunityActivityInsights } from '@/components/analytics/CommunityActivityInsights';

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DoctorSpecialtyChart />
        <CommunityActivityInsights />
      </div>
      
      {/* Other admin content */}
    </div>
  );
}
```

**File:** `apps/web/src/app/admin/doctors/[id]/page.tsx`

```tsx
import { DoctorPortfolioView } from '@/components/admin/DoctorPortfolioView';

export default function AdminDoctorDetail({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Doctor Portfolio</h1>
      <DoctorPortfolioView doctorId={params.id} />
    </div>
  );
}
```

---

## 6. Notification System Integration

### Create Feedback Notification Handler

**File:** `apps/api/src/services/feedback-notification.service.ts`

```typescript
import { PrismaClient } from '@prisma/client';
import { notificationService } from './notification.service';

const prisma = new PrismaClient();

export class FeedbackNotificationService {
  async sendPendingFeedbackNotifications() {
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
      await notificationService.create({
        type: 'SYSTEM_ANNOUNCEMENT',
        recipientId: feedback.patientId,
        actorId: feedback.doctorId,
        metadata: {
          title: 'How are you feeling?',
          message: `It's been 2 days since your consultation with Dr. ${feedback.doctor.username}. Please let us know how you're doing.`,
          action: 'FEEDBACK_REQUEST',
          conversationId: feedback.conversationId,
          appointmentId: feedback.appointmentId
        }
      });
    }
  }
}

export const feedbackNotificationService = new FeedbackNotificationService();
```

### Add to Cron Jobs

**File:** `apps/api/src/services/cron-jobs.service.ts`

```typescript
import { feedbackNotificationService } from './feedback-notification.service';

// Add to existing cron jobs
cron.schedule('0 9 * * *', async () => {
  console.log('Running daily feedback notification check...');
  await feedbackNotificationService.sendPendingFeedbackNotifications();
});
```

---

## 7. Update RightSidebar (Already Done)

The RightSidebar has been updated to use the new `TopDoctorsWidget` component.

---

## 8. Update Community Pages (Already Done)

Community pages now include the `TopDoctorsWidget` with specialty filtering.

---

## Testing Checklist

- [ ] Test comment conversion tracking (profile visit)
- [ ] Test comment conversion tracking (message click)
- [ ] Test clinic visit tracking
- [ ] Test patient feedback submission (all 3 options)
- [ ] Test doctor stats display on profile
- [ ] Test top doctors widget (regional/global toggle)
- [ ] Test top community doctors (specialty filtering)
- [ ] Test admin doctor portfolio view
- [ ] Test doctor specialty chart
- [ ] Test community activity insights
- [ ] Test feedback notification scheduling

---

## Environment Variables

Ensure these are set in your `.env` files:

```bash
# API (.env)
DATABASE_URL="postgresql://..."
PORT=3001

# Web (.env.local)
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

---

## Database Migration

Before testing, run the migration:

```bash
cd packages/database
npx prisma migrate dev --name add_enhanced_analytics
npx prisma generate
```

Or apply the SQL directly:
```bash
psql -d your_database < prisma/migrations/add_enhanced_analytics.sql
```

---

## Troubleshooting

### Issue: Conversion tracking not working
- Check that user is authenticated
- Verify comment ID and post ID are being passed correctly
- Check browser console for errors

### Issue: Stats not updating in real-time
- Check that the 30-second interval is running
- Verify API endpoint is accessible
- Check for CORS issues

### Issue: Feedback modal not showing
- Verify conversation/appointment ID is correct
- Check that 2 days have passed since last feedback
- Ensure user is a patient (not doctor)

### Issue: Top doctors not showing
- Verify doctors have `curedPatientCount` > 0
- Check that doctors are verified (APPROVED status)
- Ensure specialty filtering is working correctly

---

## Performance Optimization

1. **Cache top doctors data** (Redis, 5-minute TTL)
2. **Batch community activity calculations** (run nightly)
3. **Index database fields** (already added in migration)
4. **Lazy load analytics components** (use React.lazy)

---

## Security Considerations

- All tracking endpoints require authentication
- Admin endpoints check for ADMIN role
- Patient feedback is private
- Conversion tracking respects user privacy
- No PII exposed in analytics

---

## Next Steps

1. Implement notification scheduling for feedback loop
2. Add regional filtering based on pincode
3. Create admin UI for viewing all analytics
4. Add export functionality for doctor portfolios
5. Implement real-time updates via WebSocket
6. Add analytics dashboard for doctors to view their own stats
