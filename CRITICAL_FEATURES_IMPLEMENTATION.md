# Critical Features Implementation Guide 🚨

**Priority:** P0 - Ship Blockers  
**Timeline:** 1-2 weeks  
**Status:** Ready to implement

---

## 1. Medical Disclaimers & Legal Protection ⚠️

### Timeline: 2 days
### Risk: CRITICAL - Legal liability

### Implementation Checklist

#### A. Global Disclaimer Component
**File:** `apps/web/src/components/MedicalDisclaimer.tsx`

```typescript
export function MedicalDisclaimer() {
  return (
    <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6">
      <div className="flex">
        <AlertTriangle className="h-5 w-5 text-amber-500 mr-3" />
        <div>
          <h3 className="text-sm font-semibold text-amber-800">
            Medical Disclaimer
          </h3>
          <p className="text-sm text-amber-700 mt-1">
            This platform provides general health information only and is not a 
            substitute for professional medical advice, diagnosis, or treatment. 
            Always seek the advice of your physician or qualified health provider 
            with any questions regarding a medical condition.
          </p>
        </div>
      </div>
    </div>
  );
}
```

#### B. Pages Requiring Disclaimers
- [ ] Homepage (`apps/web/src/app/page.tsx`)
- [ ] Doctor Feed (`apps/web/src/app/doctor-feed/page.tsx`)
- [ ] Chat/Messages (`apps/web/src/app/messages/page.tsx`)
- [ ] Post Creation (`apps/web/src/components/CreatePost.tsx`)
- [ ] Signup Page (`apps/web/src/app/signup/page.tsx`)

#### C. Terms of Service Updates
**File:** `apps/web/src/app/terms/page.tsx` (create if missing)

Required sections:
- Medical advice limitations
- Doctor liability protection
- User responsibilities
- Emergency situations
- Age restrictions (13+ or 18+)
- Data privacy (HIPAA-ready)

#### D. Consent Checkboxes
Add to signup flow:
```typescript
<Checkbox required>
  I understand this platform does not provide emergency medical services 
  and I should call emergency services for urgent medical situations.
</Checkbox>
```

---

## 2. Emergency Detection System 🚨

### Timeline: 5 days
### Risk: CRITICAL - Patient safety

### Implementation Plan

#### A. Emergency Keywords Database
**File:** `apps/api/src/constants/emergency-keywords.ts`

```typescript
export const EMERGENCY_KEYWORDS = {
  IMMEDIATE_DANGER: [
    'suicide', 'kill myself', 'end my life', 'want to die',
    'chest pain', 'heart attack', 'can\'t breathe', 'difficulty breathing',
    'severe bleeding', 'unconscious', 'seizure', 'stroke',
    'overdose', 'poisoning', 'severe burn'
  ],
  HIGH_URGENCY: [
    'severe pain', 'high fever', 'vomiting blood', 'blood in stool',
    'severe headache', 'vision loss', 'paralysis', 'confusion',
    'severe allergic reaction', 'anaphylaxis'
  ],
  MENTAL_HEALTH_CRISIS: [
    'self harm', 'hurt myself', 'suicidal thoughts', 'panic attack',
    'severe anxiety', 'psychotic episode'
  ]
};

export const EMERGENCY_HOTLINES = {
  US: '911',
  INDIA: '112',
  UK: '999',
  SUICIDE_PREVENTION_US: '988',
  SUICIDE_PREVENTION_INDIA: '9152987821'
};
```

#### B. Emergency Detection Service
**File:** `apps/api/src/services/emergency-detection.service.ts`

```typescript
export class EmergencyDetectionService {
  detectEmergency(content: string): {
    isEmergency: boolean;
    level: 'IMMEDIATE' | 'HIGH' | 'MENTAL_HEALTH' | null;
    matchedKeywords: string[];
  } {
    const lowerContent = content.toLowerCase();
    
    // Check immediate danger
    const immediateMatches = EMERGENCY_KEYWORDS.IMMEDIATE_DANGER
      .filter(keyword => lowerContent.includes(keyword));
    
    if (immediateMatches.length > 0) {
      return {
        isEmergency: true,
        level: 'IMMEDIATE',
        matchedKeywords: immediateMatches
      };
    }
    
    // Check mental health crisis
    const mentalHealthMatches = EMERGENCY_KEYWORDS.MENTAL_HEALTH_CRISIS
      .filter(keyword => lowerContent.includes(keyword));
    
    if (mentalHealthMatches.length > 0) {
      return {
        isEmergency: true,
        level: 'MENTAL_HEALTH',
        matchedKeywords: mentalHealthMatches
      };
    }
    
    // Check high urgency
    const highUrgencyMatches = EMERGENCY_KEYWORDS.HIGH_URGENCY
      .filter(keyword => lowerContent.includes(keyword));
    
    if (highUrgencyMatches.length > 0) {
      return {
        isEmergency: true,
        level: 'HIGH',
        matchedKeywords: highUrgencyMatches
      };
    }
    
    return { isEmergency: false, level: null, matchedKeywords: [] };
  }
}
```

#### C. Emergency Alert Component
**File:** `apps/web/src/components/EmergencyAlert.tsx`

```typescript
export function EmergencyAlert({ level, country = 'INDIA' }: Props) {
  const hotline = EMERGENCY_HOTLINES[country];
  
  if (level === 'IMMEDIATE' || level === 'MENTAL_HEALTH') {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg max-w-md w-full p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="h-8 w-8 text-red-600" />
            <h2 className="text-xl font-bold text-red-600">
              Emergency Detected
            </h2>
          </div>
          
          <p className="text-gray-700 mb-4">
            Your message contains keywords that suggest you may need immediate 
            medical attention. This platform cannot provide emergency services.
          </p>
          
          <div className="bg-red-50 border border-red-200 rounded p-4 mb-4">
            <p className="font-semibold text-red-800 mb-2">
              If this is a medical emergency:
            </p>
            <a 
              href={`tel:${hotline}`}
              className="text-2xl font-bold text-red-600 hover:text-red-700"
            >
              📞 Call {hotline}
            </a>
          </div>
          
          {level === 'MENTAL_HEALTH' && (
            <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-4">
              <p className="font-semibold text-blue-800 mb-2">
                Mental Health Crisis Support:
              </p>
              <a 
                href={`tel:${EMERGENCY_HOTLINES.SUICIDE_PREVENTION_INDIA}`}
                className="text-lg font-bold text-blue-600"
              >
                📞 {EMERGENCY_HOTLINES.SUICIDE_PREVENTION_INDIA}
              </a>
            </div>
          )}
          
          <div className="flex gap-3">
            <button 
              onClick={handleCallEmergency}
              className="flex-1 bg-red-600 text-white py-3 rounded font-semibold"
            >
              Call Emergency Services
            </button>
            <button 
              onClick={handleContinue}
              className="flex-1 bg-gray-200 text-gray-700 py-3 rounded"
            >
              I'm Safe, Continue
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return null;
}
```

#### D. Integration Points
Add emergency detection to:
- [ ] Post creation (`apps/api/src/routes/posts.ts`)
- [ ] Comment creation (`apps/api/src/routes/comments.ts`)
- [ ] Message sending (`apps/api/src/routes/messages.ts`)
- [ ] Symptom reporting (`apps/api/src/routes/symptom-reports.ts`)

#### E. Admin Notification
When emergency detected:
```typescript
// Log to audit trail
await prisma.auditLog.create({
  data: {
    action: 'EMERGENCY_DETECTED',
    adminId: 'SYSTEM',
    targetType: 'POST',
    targetId: post.id,
    details: {
      level: emergencyResult.level,
      keywords: emergencyResult.matchedKeywords,
      userId: user.id
    }
  }
});

// Send alert to admin team
await sendAdminAlert({
  type: 'EMERGENCY',
  severity: emergencyResult.level,
  userId: user.id,
  content: post.content
});
```

---

## 3. Push Notifications Setup 📱

### Timeline: 7 days
### Priority: P1 - High

### Implementation Plan

#### A. Choose Service
**Recommended:** Firebase Cloud Messaging (FCM)
- Free tier: Unlimited notifications
- Cross-platform (web, iOS, Android)
- Reliable delivery

**Alternative:** OneSignal
- Easier setup
- Better analytics
- Free tier: 10k subscribers

#### B. Database Schema (Already Exists! ✅)
```prisma
model notification_preferences {
  id              String   @id
  userId          String   @unique
  inApp           Json     // {enabled: true, types: [...]}
  email           Json     // {enabled: true, types: [...]}
  push            Json     // {enabled: true, types: [...]}
  quietHoursStart String?  // "22:00"
  quietHoursEnd   String?  // "08:00"
  digestFrequency String   // "daily", "weekly", "never"
}

model notifications {
  type        NotificationType // REPLY, MENTION, APPOINTMENT_REQUEST, etc.
  recipientId String
  actorId     String
  contentId   String?
  metadata    Json
  isRead      Boolean
  createdAt   DateTime
}
```

#### C. FCM Setup Steps

1. **Create Firebase Project**
   - Go to https://console.firebase.google.com
   - Create new project
   - Enable Cloud Messaging

2. **Install Dependencies**
```bash
npm install firebase firebase-admin
```

3. **Environment Variables**
```env
# apps/api/.env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email

# apps/web/.env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

4. **Service Worker**
**File:** `apps/web/public/firebase-messaging-sw.js`

```javascript
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "your-api-key",
  authDomain: "your-auth-domain",
  projectId: "your-project-id",
  storageBucket: "your-storage-bucket",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
```

5. **Frontend Integration**
**File:** `apps/web/src/lib/firebase.ts`

```typescript
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export async function requestNotificationPermission() {
  const permission = await Notification.requestPermission();
  
  if (permission === 'granted') {
    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
    });
    
    // Save token to backend
    await fetch('/api/v1/notifications/register-device', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    });
    
    return token;
  }
  
  return null;
}

export function onMessageListener() {
  return new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });
}
```

6. **Backend Notification Service**
**File:** `apps/api/src/services/notification.service.ts`

```typescript
import admin from 'firebase-admin';

export class NotificationService {
  private messaging: admin.messaging.Messaging;
  
  constructor() {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL
        })
      });
    }
    this.messaging = admin.messaging();
  }
  
  async sendNotification(userId: string, notification: {
    title: string;
    body: string;
    data?: Record<string, string>;
  }) {
    // Get user's device tokens
    const devices = await prisma.userDevice.findMany({
      where: { userId, isActive: true }
    });
    
    if (devices.length === 0) return;
    
    // Check notification preferences
    const prefs = await prisma.notification_preferences.findUnique({
      where: { userId }
    });
    
    if (!prefs?.push?.enabled) return;
    
    // Check quiet hours
    if (this.isQuietHours(prefs)) return;
    
    // Send to all devices
    const tokens = devices.map(d => d.fcmToken);
    
    await this.messaging.sendMulticast({
      tokens,
      notification: {
        title: notification.title,
        body: notification.body
      },
      data: notification.data,
      webpush: {
        fcmOptions: {
          link: notification.data?.url || 'https://medthread.com'
        }
      }
    });
  }
  
  private isQuietHours(prefs: any): boolean {
    if (!prefs.quietHoursStart || !prefs.quietHoursEnd) return false;
    
    const now = new Date();
    const currentHour = now.getHours();
    const start = parseInt(prefs.quietHoursStart.split(':')[0]);
    const end = parseInt(prefs.quietHoursEnd.split(':')[0]);
    
    if (start < end) {
      return currentHour >= start && currentHour < end;
    } else {
      return currentHour >= start || currentHour < end;
    }
  }
}
```

#### D. Notification Triggers

**New Message:**
```typescript
await notificationService.sendNotification(receiverId, {
  title: `New message from Dr. ${sender.username}`,
  body: message.content.substring(0, 100),
  data: {
    type: 'MESSAGE',
    conversationId: message.conversationId,
    url: `/messages/${message.conversationId}`
  }
});
```

**Appointment Request:**
```typescript
await notificationService.sendNotification(doctorId, {
  title: 'New Appointment Request',
  body: `${patient.username} requested an appointment`,
  data: {
    type: 'APPOINTMENT_REQUEST',
    appointmentId: appointment.id,
    url: `/dashboard/doctor/appointments`
  }
});
```

**Urgent Post Reply:**
```typescript
if (post.priority?.priorityLevel === 'HIGH') {
  await notificationService.sendNotification(post.authorId, {
    title: '🔴 Urgent: Doctor replied to your post',
    body: comment.content.substring(0, 100),
    data: {
      type: 'URGENT_REPLY',
      postId: post.id,
      url: `/posts/${post.id}`
    }
  });
}
```

---

## 4. Database Migrations Needed

### Add Device Tokens Table
```prisma
model UserDevice {
  id        String   @id @default(cuid())
  userId    String
  fcmToken  String   @unique
  deviceType String  // web, ios, android
  isActive  Boolean  @default(true)
  lastUsed  DateTime @default(now())
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@index([fcmToken])
}
```

Run migration:
```bash
npx prisma migrate dev --name add_user_devices
```

---

## 5. Testing Checklist

### Medical Disclaimers
- [ ] Disclaimer visible on all key pages
- [ ] Terms of service accessible
- [ ] Consent checkbox on signup
- [ ] Footer links to legal pages

### Emergency Detection
- [ ] Test with emergency keywords
- [ ] Verify alert modal appears
- [ ] Test emergency call button
- [ ] Check admin notification
- [ ] Test false positive handling

### Push Notifications
- [ ] Request permission flow
- [ ] Receive notification on new message
- [ ] Receive notification on appointment
- [ ] Test quiet hours
- [ ] Test notification preferences
- [ ] Test on multiple devices

---

## 6. Deployment Steps

### 1. Environment Setup
```bash
# Update .env files with new variables
# - Firebase credentials
# - Emergency hotline numbers
```

### 2. Database Migration
```bash
npm run db:generate
npm run db:push
```

### 3. Deploy Backend
```bash
cd apps/api
npm run build
# Deploy to your hosting (Vercel, Railway, etc.)
```

### 4. Deploy Frontend
```bash
cd apps/web
npm run build
# Deploy to Vercel/Netlify
```

### 5. Test in Production
- [ ] Verify disclaimers visible
- [ ] Test emergency detection
- [ ] Send test push notification
- [ ] Monitor error logs

---

## 7. Monitoring & Alerts

### Set up monitoring for:
- Emergency detection triggers (daily report)
- Push notification delivery rate
- Failed notification sends
- User consent acceptance rate

### Analytics to track:
- Emergency alert dismissal rate
- Notification click-through rate
- Notification opt-out rate
- Time to first notification

---

## Success Criteria

### Medical Disclaimers
✅ Visible on 100% of key pages  
✅ 95%+ consent acceptance rate  
✅ Zero legal complaints  

### Emergency Detection
✅ <1% false positive rate  
✅ 100% detection of critical keywords  
✅ <2 second response time  

### Push Notifications
✅ 70%+ permission grant rate  
✅ 95%+ delivery success rate  
✅ 30%+ click-through rate  
✅ <5% opt-out rate  

---

## Next Steps

1. ✅ Review this implementation guide
2. ⚠️ Start with medical disclaimers (2 days)
3. 🚨 Implement emergency detection (5 days)
4. 📱 Set up push notifications (7 days)
5. 🧪 Comprehensive testing (3 days)
6. 🚀 Deploy to production
7. 📊 Monitor metrics for 1 week

**Total Timeline:** 2-3 weeks for all critical features

