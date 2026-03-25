# Quick Integration Snippets

## 1. Register Routes in Main App

**File: `apps/api/src/index.ts` or `apps/api/src/main.ts`**

```typescript
import featureRoutes from './routes';

// Add this line with other route registrations
app.use(featureRoutes);
```

## 2. Add Rate Limiting to Routes

**File: `apps/api/src/index.ts`**

```typescript
import {
  generalRateLimit,
  authRateLimit,
  postingRateLimit,
  searchRateLimit,
  medicalAIRateLimit
} from './middleware/rateLimiter';

// Apply to routes
app.use('/api/v1/auth', authRateLimit);
app.use('/api/v1/posts', postingRateLimit);
app.use('/api/v1/search', searchRateLimit);
app.use('/api/v1/medical-verification', medicalAIRateLimit);
app.use('/api/v1', generalRateLimit);
```

## 3. Initialize Performance Monitoring

**File: `apps/api/src/index.ts`**

```typescript
import { performanceMonitorService } from './services/performance-monitor.service';

// Start monitoring
performanceMonitorService.monitorSystemResources();

// Add monitoring middleware
app.use(performanceMonitorService.createApiMonitoringMiddleware());
```

## 4. Add Offline Sync Indicator to Layout

**File: `apps/web/src/app/layout.tsx`**

```typescript
import { OfflineSyncIndicator } from '@/components/features/OfflineSyncIndicator';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>
        {children}
        <OfflineSyncIndicator />
      </body>
    </html>
  );
}
```

## 5. Integrate Medical Verification in Post Creation

**File: `apps/web/src/components/CreatePost.tsx`**

```typescript
import { MedicalVerificationBadge } from '@/components/features/MedicalVerificationBadge';

export function CreatePost() {
  const [content, setContent] = useState('');
  const [verification, setVerification] = useState(null);

  const handleVerify = async () => {
    const response = await fetch('/api/v1/medical-verification/verify-content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content,
        authorRole: userRole
      })
    });
    const data = await response.json();
    setVerification(data);
  };

  return (
    <div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write your post..."
      />
      <button onClick={handleVerify}>Verify Medical Content</button>
      
      {verification && (
        <MedicalVerificationBadge {...verification} />
      )}
    </div>
  );
}
```

## 6. Integrate Enhanced Search

**File: `apps/web/src/app/search/page.tsx`**

```typescript
import { EnhancedSearch } from '@/components/features/EnhancedSearch';

export default function SearchPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Search MedThread</h1>
      <EnhancedSearch />
    </div>
  );
}
```

## 7. Add Liability Waiver Check

**File: `apps/web/src/components/DoctorInteraction.tsx`**

```typescript
import { LiabilityWaiverModal } from '@/components/features/LiabilityWaiverModal';

export function DoctorInteraction({ doctorId, patientId }) {
  const [showWaiver, setShowWaiver] = useState(false);
  const [waiverAccepted, setWaiverAccepted] = useState(false);

  useEffect(() => {
    const checkWaiver = async () => {
      const response = await fetch(
        `/api/v1/liability/check-waiver/${doctorId}/${patientId}/CONSULTATION`
      );
      const { required } = await response.json();
      setShowWaiver(required);
    };
    checkWaiver();
  }, [doctorId, patientId]);

  if (showWaiver && !waiverAccepted) {
    return (
      <LiabilityWaiverModal
        doctorId={doctorId}
        patientId={patientId}
        interactionType="CONSULTATION"
        onAccept={() => setWaiverAccepted(true)}
        onReject={() => window.history.back()}
      />
    );
  }

  return <div>Doctor interaction content...</div>;
}
```

## 8. Queue Offline Action

**File: `apps/web/src/components/CreateComment.tsx`**

```typescript
import { queueOfflineAction } from '@/lib/offlineSync';

export function CreateComment({ postId }) {
  const [content, setContent] = useState('');

  const handleSubmit = async () => {
    if (navigator.onLine) {
      // Send immediately
      await fetch(`/api/v1/posts/${postId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ content })
      });
    } else {
      // Queue for later
      await queueOfflineAction('CREATE_COMMENT', {
        postId,
        content
      });
      alert('Comment saved offline. Will sync when online.');
    }
  };

  return (
    <div>
      <textarea value={content} onChange={(e) => setContent(e.target.value)} />
      <button onClick={handleSubmit}>Post Comment</button>
    </div>
  );
}
```

## 9. Cache Data for Offline Access

**File: `apps/web/src/lib/api.ts`**

```typescript
import { cache, cacheKeys } from '@/lib/cache';

export async function getDoctors(filters) {
  const cacheKey = cacheKeys.doctorSearch(filters);
  
  // Try cache first
  const cached = await cache.get(cacheKey);
  if (cached) return cached;

  // Fetch and cache
  const response = await fetch(`/api/v1/search/doctors?${new URLSearchParams(filters)}`);
  const data = await response.json();
  
  await cache.set(cacheKey, data, 60 * 60 * 1000); // 1 hour
  return data;
}
```

## 10. Send Notification

**File: `apps/api/src/services/appointment.service.ts`**

```typescript
import { notificationService } from './notification.service';

export async function createAppointment(patientId, doctorId, startTime) {
  // Create appointment...
  
  // Send notification to patient
  await notificationService.sendNotification(patientId, {
    title: 'Appointment Scheduled',
    body: `Your appointment is scheduled for ${startTime}`,
    type: 'APPOINTMENT_REMINDER',
    data: { appointmentId }
  });

  // Send notification to doctor
  await notificationService.sendNotification(doctorId, {
    title: 'New Appointment',
    body: `You have a new appointment scheduled`,
    type: 'APPOINTMENT_REQUEST',
    data: { appointmentId }
  });
}
```

## 11. Moderate Content Before Posting

**File: `apps/api/src/routes/posts.ts`**

```typescript
import { contentModerationService } from '../services/content-moderation.service';

router.post('/create', authMiddleware, async (req, res) => {
  const { title, content } = req.body;

  // Moderate content
  const moderation = await contentModerationService.moderateContent(
    content,
    req.userId,
    'post'
  );

  if (moderation.action === 'REMOVE') {
    return res.status(400).json({ error: 'Content violates guidelines' });
  }

  if (moderation.action === 'FLAG') {
    // Flag for review but allow posting
    await contentModerationService.autoFlagContent(postId, moderation.categories);
  }

  // Create post...
});
```

## 12. Get Health Status

**File: `apps/web/src/components/AdminDashboard.tsx`**

```typescript
import { useEffect, useState } from 'react';

export function AdminDashboard() {
  const [health, setHealth] = useState(null);

  useEffect(() => {
    const checkHealth = async () => {
      const response = await fetch('/api/v1/performance/health');
      const data = await response.json();
      setHealth(data);
    };

    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Every 30 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <h2>System Health</h2>
      {health && (
        <div>
          <div className={`status-${health.overall}`}>
            Overall: {health.overall}
          </div>
          {health.services.map(service => (
            <div key={service.service}>
              {service.service}: {service.status}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

## 13. Create Backup

**File: `apps/api/src/routes/admin.ts`**

```typescript
import { backupService } from '../services/backup.service';

router.post('/backup/create', adminMiddleware, async (req, res) => {
  const result = await backupService.createFullBackup();
  res.json(result);
});

router.get('/backup/status', adminMiddleware, async (req, res) => {
  const status = await backupService.getBackupStatus();
  res.json(status);
});
```

## 14. Save Search History

**File: `apps/web/src/lib/api.ts`**

```typescript
export async function searchAndSave(query, type) {
  // Save to history
  await fetch('/api/v1/search/history', {
    method: 'POST',
    body: JSON.stringify({ query, type })
  });

  // Perform search
  const response = await fetch(`/api/v1/search/${type}?q=${query}`);
  return response.json();
}
```

## 15. Environment Variables Template

**File: `.env.example`**

```
# Medical AI
OPENAI_API_KEY=your_key_here
GROQ_API_KEY=your_key_here

# Firebase
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_email

# Redis
REDIS_URL=redis://localhost:6379

# Backup
BACKUP_PATH=./backups

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/medthread
```

---

**All snippets are ready to copy-paste. Just update the file paths and environment variables for your setup.**
