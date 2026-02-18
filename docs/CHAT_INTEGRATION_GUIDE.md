# Chat System Integration Guide

## Quick Start

### 1. Database Setup

Run the migration:

```bash
cd packages/database
npx prisma migrate dev --name chat_system
# Or apply SQL directly:
psql -d medthread -f prisma/migrations/20260217_chat_system.sql
```

Generate Prisma client:

```bash
npx prisma generate
```

### 2. Backend Setup

The chat system is already integrated into your Express server. No additional setup needed.

Routes are available at:
- `/api/v2/chat/*` - New chat endpoints
- `/api/chat/*` - Legacy endpoints (keep for backward compatibility)

### 3. Frontend Setup

Install Socket.io client (if not already installed):

```bash
cd apps/web
npm install socket.io-client
```

### 4. Test the System

#### Test 1: Create an Appointment

```bash
curl -X POST http://localhost:3001/api/appointments/book \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": "patient_123",
    "doctorId": "doctor_456",
    "startTime": "2026-02-20T10:00:00Z",
    "endTime": "2026-02-20T11:00:00Z",
    "reason": "Follow-up consultation"
  }'
```

#### Test 2: Approve Appointment (as verified doctor)

```bash
curl -X PUT http://localhost:3001/api/appointments/app_123 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <doctor_token>" \
  -d '{
    "status": "APPROVED",
    "doctorId": "doctor_456"
  }'
```

This automatically creates a conversation.

#### Test 3: Check Access

```bash
curl http://localhost:3001/api/v2/chat/conversations/conv_123/access \
  -H "Authorization: Bearer <token>"
```

Expected response:
```json
{
  "success": true,
  "data": {
    "allowed": true,
    "reason": null,
    "code": null
  }
}
```

#### Test 4: Send Message

```bash
curl -X POST http://localhost:3001/api/v2/chat/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "conversationId": "conv_123",
    "content": "Hello, how are you feeling today?"
  }'
```

#### Test 5: Get Messages

```bash
curl http://localhost:3001/api/v2/chat/conversations/conv_123/messages \
  -H "Authorization: Bearer <token>"
```

### 5. Frontend Integration

#### Add Chat Link to Navigation

```tsx
// apps/web/src/components/Navigation.tsx
import Link from 'next/link';
import { MessageCircle } from 'lucide-react';

export default function Navigation() {
  return (
    <nav>
      {/* ... other links ... */}
      <Link href="/chat" className="flex items-center gap-2">
        <MessageCircle size={20} />
        <span>Messages</span>
      </Link>
    </nav>
  );
}
```

#### Add Chat Button to Appointment Card

```tsx
// apps/web/src/components/AppointmentCard.tsx
import Link from 'next/link';
import { MessageCircle } from 'lucide-react';

export default function AppointmentCard({ appointment }) {
  const canChat = appointment.status === 'APPROVED' && 
                  appointment.conversation;

  return (
    <div className="appointment-card">
      {/* ... appointment details ... */}
      
      {canChat && (
        <Link 
          href={`/chat?conversation=${appointment.conversation.id}`}
          className="btn btn-primary"
        >
          <MessageCircle size={16} />
          Open Chat
        </Link>
      )}
    </div>
  );
}
```

#### Show Unread Count Badge

```tsx
// apps/web/src/components/UnreadBadge.tsx
'use client';

import { useEffect, useState } from 'react';

export default function UnreadBadge({ userId, token }) {
  const [totalUnread, setTotalUnread] = useState(0);

  useEffect(() => {
    const fetchUnread = async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v2/chat/unread`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      const data = await response.json();
      const total = data.data.reduce((sum, c) => sum + c.count, 0);
      setTotalUnread(total);
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, [userId, token]);

  if (totalUnread === 0) return null;

  return (
    <span className="badge badge-danger">
      {totalUnread > 99 ? '99+' : totalUnread}
    </span>
  );
}
```

## Integration with Existing Features

### 1. Appointment Lifecycle

Update appointment routes to trigger chat lifecycle:

```typescript
// apps/api/src/routes/appointments.ts
import { chatLifecycleService } from '../services/chat-lifecycle.service';

// When cancelling appointment
router.post('/appointments/:id/cancel', async (req, res) => {
  // ... existing cancel logic ...
  
  await chatLifecycleService.handleAppointmentStatusChange(
    appointmentId,
    'CANCELLED'
  );
  
  // ... rest of logic ...
});
```

### 2. Doctor Verification

Update doctor verification routes:

```typescript
// apps/api/src/routes/doctor-verification.routes.ts
import { chatLifecycleService } from '../services/chat-lifecycle.service';

// When changing verification status
router.put('/verify/:doctorId', async (req, res) => {
  // ... existing verification logic ...
  
  await chatLifecycleService.handleDoctorVerificationChange(
    doctorId,
    newStatus
  );
  
  // ... rest of logic ...
});
```

### 3. User Blocking

Update user blocking routes:

```typescript
// apps/api/src/routes/users.ts
import { chatLifecycleService } from '../services/chat-lifecycle.service';

// When blocking user
router.post('/users/:userId/block', async (req, res) => {
  // ... existing block logic ...
  
  await chatLifecycleService.handleUserBlocked(
    currentUserId,
    targetUserId
  );
  
  // ... rest of logic ...
});
```

### 4. Notification Integration

Chat messages already create notifications automatically via `notification.service.ts`.

To customize notification behavior:

```typescript
// apps/api/src/services/chat.service.ts

// In createMessage method, the notification is created:
await notificationService.createNotification({
  type: 'DIRECT_MESSAGE',
  recipientIds: [receiverId],
  actorId: senderId,
  contentId: conversationId,
  contentType: 'POST',
  metadata: {
    preview: content.substring(0, 100),
    link: `/chat?conversation=${conversationId}`,
    messageId: message.id
  }
});
```

## Cron Jobs

Add to your cron service to cleanup expired conversations:

```typescript
// apps/api/src/services/cron-jobs.service.ts
import { chatLifecycleService } from './chat-lifecycle.service';
import cron from 'node-cron';

class CronJobsService {
  initializeCronJobs() {
    // ... existing cron jobs ...
    
    // Cleanup expired conversations daily at 2 AM
    cron.schedule('0 2 * * *', async () => {
      console.log('[Cron] Running chat cleanup...');
      const count = await chatLifecycleService.cleanupExpiredConversations();
      console.log(`[Cron] Cleaned up ${count} expired conversations`);
    });
  }
}
```

## Common Issues & Solutions

### Issue 1: "Conversation not found"

**Cause**: Conversation wasn't created when appointment was approved.

**Solution**: Ensure conversation creation in appointment approval:

```typescript
if (status === 'APPROVED') {
  await prisma.conversation.create({
    data: {
      appointmentId: id,
      patientId: appointment.patientId,
      doctorId: appointment.doctorId,
      participants: {
        connect: [
          { id: appointment.patientId },
          { id: appointment.doctorId }
        ]
      }
    }
  });
}
```

### Issue 2: "Doctor not verified"

**Cause**: Doctor's verification status is not APPROVED.

**Solution**: Verify doctor first:

```bash
curl -X PUT http://localhost:3001/api/v1/doctor-verification/verify/doctor_456 \
  -H "Authorization: Bearer <admin_token>" \
  -d '{"status": "APPROVED"}'
```

### Issue 3: WebSocket not connecting

**Cause**: CORS or WebSocket configuration issue.

**Solution**: Check Socket.io CORS settings:

```typescript
// apps/api/src/index.ts
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});
```

### Issue 4: Messages not appearing in real-time

**Cause**: User not joined to conversation room.

**Solution**: Ensure socket joins room:

```typescript
// Frontend
useEffect(() => {
  socket.emit('authenticate', { userId, token });
  socket.on('authenticated', () => {
    socket.emit('join_conversation', { conversationId });
  });
}, [conversationId]);
```

### Issue 5: Rate limit errors

**Cause**: Sending too many messages too quickly.

**Solution**: Implement client-side throttling:

```typescript
import { throttle } from 'lodash';

const sendMessage = throttle(async () => {
  // Send message logic
}, 2000); // Max 1 message per 2 seconds
```

## Testing Checklist

- [ ] Create appointment as patient
- [ ] Approve appointment as verified doctor
- [ ] Verify conversation created automatically
- [ ] Send message from patient
- [ ] Receive message in real-time on doctor side
- [ ] Send message from doctor
- [ ] Verify read receipts work
- [ ] Test typing indicators
- [ ] Edit message within 5 minutes
- [ ] Try editing after 5 minutes (should fail)
- [ ] Delete message
- [ ] Upload image attachment
- [ ] Upload PDF attachment
- [ ] Try uploading file > 10MB (should fail)
- [ ] Cancel appointment
- [ ] Verify chat deactivated
- [ ] Try sending message after cancellation (should fail)
- [ ] Test on mobile device
- [ ] Test with slow network
- [ ] Test reconnection after disconnect

## Performance Tips

### 1. Enable Database Connection Pooling

```typescript
// packages/database/prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  connection_limit = 10
}
```

### 2. Add Redis for Rate Limiting (Production)

```typescript
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export const checkMessageRateLimit = async (userId: string, conversationId: string) => {
  const key = `rate:${userId}:${conversationId}`;
  const count = await redis.incr(key);
  
  if (count === 1) {
    await redis.expire(key, 60); // 1 minute window
  }
  
  return {
    allowed: count <= 30,
    remaining: Math.max(0, 30 - count)
  };
};
```

### 3. Optimize Message Queries

```typescript
// Use select to limit fields
const messages = await prisma.message.findMany({
  where: { conversationId },
  select: {
    id: true,
    content: true,
    createdAt: true,
    senderId: true,
    isEdited: true,
    readAt: true,
    sender: {
      select: {
        id: true,
        username: true,
        avatar: true
      }
    }
  },
  take: 50
});
```

## Security Checklist

- [x] JWT authentication required
- [x] Appointment-gated access
- [x] Doctor verification check
- [x] Participant validation
- [x] Rate limiting implemented
- [x] File size validation
- [x] MIME type validation
- [x] XSS prevention (content sanitization)
- [x] SQL injection prevention (Prisma ORM)
- [x] Block user integration
- [x] Conversation expiry
- [x] Soft delete (no permanent data loss)

## Monitoring Setup

### 1. Add Logging

```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'chat-error.log', level: 'error' }),
    new winston.transports.File({ filename: 'chat-combined.log' })
  ]
});

// Use in chat service
logger.info('Message sent', { userId, conversationId, messageId });
logger.error('Permission denied', { userId, conversationId, reason });
```

### 2. Add Metrics

```typescript
import { Counter, Histogram } from 'prom-client';

const messagesSent = new Counter({
  name: 'chat_messages_sent_total',
  help: 'Total messages sent'
});

const messageLatency = new Histogram({
  name: 'chat_message_latency_seconds',
  help: 'Message send latency'
});

// Use in service
messagesSent.inc();
const end = messageLatency.startTimer();
// ... send message ...
end();
```

## Next Steps

1. Run database migration
2. Test API endpoints with Postman
3. Test WebSocket connection
4. Integrate chat button in appointments UI
5. Add unread count badges
6. Test on mobile devices
7. Set up monitoring
8. Deploy to staging
9. Load test
10. Deploy to production

## Support

If you encounter issues:

1. Check server logs: `tail -f apps/api/logs/combined.log`
2. Check database: `psql -d medthread -c "SELECT * FROM \"Conversation\" LIMIT 10;"`
3. Test WebSocket: Use browser DevTools → Network → WS
4. Verify permissions: Use `/api/v2/chat/conversations/:id/access` endpoint
5. Check rate limits: Look for 429 responses

For additional help, refer to the main documentation: `docs/CHAT_SYSTEM.md`
