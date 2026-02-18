# Medical Chat System - Implementation Documentation

## Overview

Production-ready, appointment-gated medical chat system with real-time messaging, read receipts, typing indicators, and comprehensive security controls.

## Architecture

### Tech Stack
- **Backend**: Express.js + Socket.io
- **Frontend**: Next.js 14 (App Router) + React 18
- **Database**: PostgreSQL with Prisma ORM
- **Real-time**: WebSocket (Socket.io)
- **Authentication**: JWT tokens

### Key Features
✅ Appointment-gated access (APPROVED appointments only)
✅ Doctor verification requirement
✅ Real-time messaging with WebSocket
✅ Read receipts and typing indicators
✅ Message editing (5-minute window)
✅ Soft delete messages
✅ File attachments (images, PDFs, docs)
✅ Cursor-based pagination
✅ Rate limiting (30 messages/minute)
✅ Unread message counts
✅ Mobile-responsive UI
✅ Automatic conversation lifecycle management
✅ Block user integration

## Database Schema

### Conversation Model
```prisma
model Conversation {
  id             String       @id @default(cuid())
  appointmentId  String?      @unique
  appointment    Appointment? @relation(fields: [appointmentId], references: [id])
  patientId      String?
  patient        User?        @relation("PatientConversations", fields: [patientId], references: [id])
  doctorId       String?
  doctor         User?        @relation("DoctorConversations", fields: [doctorId], references: [id])
  participants   User[]       @relation("ConversationParticipants")
  messages       Message[]
  isActive       Boolean      @default(true)
  lastMessageAt  DateTime?
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt

  @@index([appointmentId])
  @@index([patientId])
  @@index([doctorId])
  @@index([isActive])
}
```

### Message Model
```prisma
model Message {
  id             String        @id @default(cuid())
  senderId       String
  sender         User          @relation("Sender", fields: [senderId], references: [id])
  receiverId     String
  receiver       User          @relation("Receiver", fields: [receiverId], references: [id])
  conversationId String?
  conversation   Conversation? @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  content        String
  attachment     String?
  type           MessageType   @default(TEXT)
  isEdited       Boolean       @default(false)
  isDeleted      Boolean       @default(false)
  readAt         DateTime?
  editedAt       DateTime?
  deletedAt      DateTime?
  createdAt      DateTime      @default(now())

  @@index([conversationId, createdAt])
  @@index([senderId])
  @@index([readAt])
  @@index([isDeleted])
}
```

## Security Rules

### Access Control
1. **Doctor Verification**: Doctor must have `doctorVerificationStatus = APPROVED`
2. **Appointment Status**: Appointment must be `status = APPROVED`
3. **Participant Validation**: User must be either patient or assigned doctor
4. **Expiry Check**: Chat expires 24 hours after appointment ends
5. **Block Check**: No active blocks between participants

### Rate Limiting
- **Message Rate**: 30 messages per minute per user per conversation
- **File Upload**: Max 10MB per file
- **MIME Types**: 
  - Images: jpeg, png, gif, webp
  - Documents: pdf, doc, docx, txt

### Permission Middleware
```typescript
// apps/api/src/middleware/chatPermission.ts
export const validateChatAccess = async (req, res, next) => {
  // 1. Validate user authentication
  // 2. Check conversation exists and is active
  // 3. Verify user is participant
  // 4. Validate doctor verification
  // 5. Check appointment status
  // 6. Verify not expired
  // 7. Check for blocks
}
```

## API Endpoints

### REST API (v2)

#### Get Conversations
```
GET /api/v2/chat/conversations
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": [
    {
      "id": "conv_123",
      "appointment": {...},
      "messages": [...],
      "unreadCount": 3
    }
  ]
}
```

#### Get Messages
```
GET /api/v2/chat/conversations/:conversationId/messages?limit=50&cursor=msg_123
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": [...messages],
  "pagination": {
    "nextCursor": "msg_456",
    "hasMore": true
  }
}
```

#### Send Message
```
POST /api/v2/chat/messages
Authorization: Bearer <token>
Content-Type: application/json

{
  "conversationId": "conv_123",
  "content": "Hello doctor",
  "type": "TEXT",
  "attachment": null
}

Response:
{
  "success": true,
  "data": {
    "id": "msg_789",
    "content": "Hello doctor",
    "createdAt": "2026-02-17T10:00:00Z",
    "sender": {...}
  }
}
```

#### Edit Message
```
PUT /api/v2/chat/messages/:messageId
Authorization: Bearer <token>

{
  "content": "Updated message"
}

Response:
{
  "success": true,
  "data": {
    "id": "msg_789",
    "content": "Updated message",
    "isEdited": true,
    "editedAt": "2026-02-17T10:05:00Z"
  }
}
```

#### Delete Message
```
DELETE /api/v2/chat/messages/:messageId
Authorization: Bearer <token>

Response:
{
  "success": true,
  "message": "Message deleted successfully"
}
```

#### Upload Attachment
```
POST /api/v2/chat/upload
Authorization: Bearer <token>

{
  "base64Data": "...",
  "filename": "image.jpg",
  "mimeType": "image/jpeg"
}

Response:
{
  "success": true,
  "data": {
    "url": "data:image/jpeg;base64,...",
    "filename": "image.jpg",
    "size": 123456
  }
}
```

#### Check Access
```
GET /api/v2/chat/conversations/:conversationId/access
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "allowed": true,
    "reason": null,
    "code": null
  }
}
```

### WebSocket Events

#### Client → Server

**authenticate**
```javascript
socket.emit('authenticate', { userId: 'user_123', token: 'jwt_token' });
```

**join_conversation**
```javascript
socket.emit('join_conversation', { conversationId: 'conv_123' });
```

**leave_conversation**
```javascript
socket.emit('leave_conversation', { conversationId: 'conv_123' });
```

**typing**
```javascript
socket.emit('typing', { conversationId: 'conv_123', isTyping: true });
```

**mark_read**
```javascript
socket.emit('mark_read', { conversationId: 'conv_123' });
```

**get_unread_counts**
```javascript
socket.emit('get_unread_counts');
```

#### Server → Client

**authenticated**
```javascript
socket.on('authenticated', (data) => {
  console.log('Authenticated:', data.success);
});
```

**conversation_joined**
```javascript
socket.on('conversation_joined', (data) => {
  console.log('Joined:', data.conversationId);
  console.log('Active users:', data.activeUsers);
});
```

**receive_message**
```javascript
socket.on('receive_message', (message) => {
  // Add message to UI
});
```

**user_typing**
```javascript
socket.on('user_typing', (data) => {
  // Show typing indicator
});
```

**message_edited**
```javascript
socket.on('message_edited', (message) => {
  // Update message in UI
});
```

**message_deleted**
```javascript
socket.on('message_deleted', (data) => {
  // Remove or mark message as deleted
});
```

**messages_read**
```javascript
socket.on('messages_read', (data) => {
  // Update read receipts
});
```

**conversation_deactivated**
```javascript
socket.on('conversation_deactivated', (data) => {
  alert(`Chat deactivated: ${data.reason}`);
});
```

**access_denied**
```javascript
socket.on('access_denied', (data) => {
  console.error('Access denied:', data.reason, data.code);
});
```

## Frontend Components

### ChatWindow Component
Location: `apps/web/src/components/chat/ChatWindow.tsx`

Features:
- Real-time message display
- Optimistic UI updates
- Typing indicators
- Read receipts (single check = sent, double check = read)
- Message editing (5-minute window)
- Message deletion
- File attachments
- Cursor-based pagination (load more on scroll)
- Auto-scroll to bottom
- Connection status indicator
- Mobile-responsive

### ChatList Component
Location: `apps/web/src/components/chat/ChatList.tsx`

Features:
- List all conversations
- Show last message preview
- Unread count badges
- Appointment status indicators
- User avatars
- Timestamp formatting
- Empty state handling

### Chat Page
Location: `apps/web/src/app/chat/page.tsx`

Features:
- Desktop: Split view (list + chat)
- Mobile: Single view with navigation
- URL-based conversation selection
- Access denied handling
- Authentication check

## Chat Lifecycle Management

### Automatic Deactivation

Conversations are automatically deactivated when:

1. **Appointment Cancelled**
   ```typescript
   chatLifecycleService.handleAppointmentStatusChange(appointmentId, 'CANCELLED');
   ```

2. **Appointment Rejected**
   ```typescript
   chatLifecycleService.handleAppointmentStatusChange(appointmentId, 'REJECTED');
   ```

3. **Appointment Completed**
   ```typescript
   chatLifecycleService.handleAppointmentStatusChange(appointmentId, 'COMPLETED');
   ```

4. **Doctor Loses Verification**
   ```typescript
   chatLifecycleService.handleDoctorVerificationChange(doctorId, 'SUSPENDED');
   ```

5. **User Blocked**
   ```typescript
   chatLifecycleService.handleUserBlocked(blockerId, blockedId);
   ```

6. **Appointment Expired** (24 hours after end time)
   ```typescript
   // Run as cron job
   chatLifecycleService.cleanupExpiredConversations();
   ```

### Integration Points

Update these files to integrate lifecycle management:

**Appointment Status Change**
```typescript
// apps/api/src/routes/appointments.ts
import { chatLifecycleService } from '../services/chat-lifecycle.service';

// After updating appointment status
await chatLifecycleService.handleAppointmentStatusChange(appointmentId, newStatus);
```

**Doctor Verification Change**
```typescript
// apps/api/src/routes/doctor-verification.routes.ts
import { chatLifecycleService } from '../services/chat-lifecycle.service';

// After changing verification status
await chatLifecycleService.handleDoctorVerificationChange(doctorId, newStatus);
```

**User Blocking**
```typescript
// apps/api/src/routes/users.ts (or wherever blocking is handled)
import { chatLifecycleService } from '../services/chat-lifecycle.service';

// After blocking user
await chatLifecycleService.handleUserBlocked(blockerId, blockedId);
```

## Error Handling

### Error Codes

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `AUTH_REQUIRED` | Authentication required | 401 |
| `CONVERSATION_NOT_FOUND` | Conversation doesn't exist | 404 |
| `CONVERSATION_INACTIVE` | Conversation deactivated | 403 |
| `NO_APPOINTMENT` | No appointment linked | 403 |
| `NOT_PARTICIPANT` | User not in conversation | 403 |
| `DOCTOR_NOT_VERIFIED` | Doctor not verified | 403 |
| `APPOINTMENT_NOT_APPROVED` | Appointment not approved | 403 |
| `APPOINTMENT_EXPIRED` | Appointment expired | 403 |
| `USER_BLOCKED` | User blocked | 403 |
| `RATE_LIMIT_EXCEEDED` | Too many messages | 429 |
| `EDIT_WINDOW_EXPIRED` | Can't edit old message | 403 |
| `FILE_TOO_LARGE` | File exceeds 10MB | 413 |
| `INVALID_MIME_TYPE` | Unsupported file type | 400 |

### Frontend Error Handling

```typescript
try {
  const response = await fetch('/api/v2/chat/messages', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ conversationId, content })
  });

  if (!response.ok) {
    const error = await response.json();
    
    switch (error.code) {
      case 'RATE_LIMIT_EXCEEDED':
        alert('Sending too fast. Please slow down.');
        break;
      case 'APPOINTMENT_NOT_APPROVED':
        alert('Chat is only available for approved appointments.');
        break;
      case 'DOCTOR_NOT_VERIFIED':
        alert('Doctor must be verified to chat.');
        break;
      default:
        alert(error.error || 'Failed to send message');
    }
    
    return;
  }

  const data = await response.json();
  // Handle success
} catch (error) {
  console.error('Network error:', error);
  alert('Connection error. Please check your internet.');
}
```

## Testing

### Unit Tests

```typescript
// apps/api/src/services/__tests__/chat.service.test.ts
describe('ChatService', () => {
  describe('createMessage', () => {
    it('should create message with valid input', async () => {
      // Test implementation
    });

    it('should reject empty content', async () => {
      // Test implementation
    });

    it('should enforce rate limit', async () => {
      // Test implementation
    });
  });
});
```

### Integration Tests

```typescript
// apps/api/src/routes/__tests__/chat.test.ts
describe('Chat API', () => {
  describe('POST /api/v2/chat/messages', () => {
    it('should send message with valid permissions', async () => {
      // Test implementation
    });

    it('should reject unapproved appointment', async () => {
      // Test implementation
    });

    it('should reject unverified doctor', async () => {
      // Test implementation
    });
  });
});
```

### WebSocket Tests

```typescript
// apps/api/src/handlers/__tests__/chat.handler.test.ts
describe('Chat WebSocket Handler', () => {
  it('should join conversation with valid permissions', async () => {
    // Test implementation
  });

  it('should emit typing indicator', async () => {
    // Test implementation
  });

  it('should broadcast messages to room', async () => {
    // Test implementation
  });
});
```

## Deployment

### Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/medthread

# JWT
JWT_SECRET=your-secret-key

# API
PORT=3001
NODE_ENV=production

# Frontend
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_WS_URL=wss://api.yourdomain.com

# File Storage (optional)
CDN_DOMAIN=cdn.yourdomain.com
STORAGE_DOMAIN=storage.yourdomain.com
```

### Database Migration

```bash
# Run migration
cd packages/database
npx prisma migrate deploy

# Or apply SQL directly
psql -d medthread -f prisma/migrations/20260217_chat_system.sql
```

### Build & Start

```bash
# Install dependencies
npm install

# Build
npm run build

# Start production server
npm run start
```

### Nginx Configuration (WebSocket)

```nginx
server {
    listen 443 ssl;
    server_name api.yourdomain.com;

    location /socket.io/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket timeout
        proxy_read_timeout 86400;
    }

    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Performance Optimization

### Database Indexes
All critical indexes are included in the migration:
- `conversation.appointmentId`
- `conversation.patientId`
- `conversation.doctorId`
- `conversation.isActive`
- `message.conversationId + createdAt` (composite)
- `message.senderId`
- `message.readAt`
- `message.isDeleted`

### Caching Strategy
- Cache conversation access checks (5 minutes)
- Cache unread counts (1 minute)
- Use Redis for rate limiting in production

### Pagination
- Cursor-based pagination for messages
- Load 50 messages per page
- Infinite scroll support

## Monitoring

### Metrics to Track
- Message send rate
- WebSocket connection count
- Average message latency
- Rate limit hits
- Permission denial rate
- File upload success rate

### Logging
```typescript
console.log('[Chat] User connected:', userId);
console.log('[Chat] Message sent:', messageId);
console.error('[Chat] Permission denied:', { userId, conversationId, reason });
console.warn('[Chat] Rate limit exceeded:', { userId, conversationId });
```

## Future Enhancements

- [ ] Voice messages
- [ ] Video calls
- [ ] Message reactions
- [ ] Message search
- [ ] Conversation archiving
- [ ] Message forwarding
- [ ] Group chats (multi-doctor consultations)
- [ ] End-to-end encryption
- [ ] Message translation
- [ ] AI-powered message suggestions

## Support

For issues or questions:
1. Check error codes in this documentation
2. Review server logs
3. Test with Postman/curl
4. Check WebSocket connection in browser DevTools
5. Verify database migrations applied

## License

Proprietary - MedThread Platform
