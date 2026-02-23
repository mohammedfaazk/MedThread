# Chat System Services

## Overview

This directory contains the core business logic for the medical chat system.

## Services

### chat.service.ts

Main chat service handling all message operations.

**Key Methods:**
- `createMessage()` - Create and send a message
- `getMessages()` - Fetch messages with pagination
- `editMessage()` - Edit message within 5-minute window
- `deleteMessage()` - Soft delete a message
- `markAsRead()` - Mark messages as read
- `getUnreadCount()` - Get unread message count
- `getAllUnreadCounts()` - Get all unread counts for user
- `getConversation()` - Get conversation details
- `getUserConversations()` - Get all user conversations
- `deactivateConversation()` - Deactivate a conversation

**Features:**
- Rate limiting (30 messages/minute)
- File attachment validation
- Real-time socket emissions
- Notification integration
- Cursor-based pagination

### chat-lifecycle.service.ts

Manages conversation lifecycle based on appointment and doctor status changes.

**Key Methods:**
- `handleAppointmentStatusChange()` - Deactivate chat when appointment cancelled/rejected/completed
- `handleDoctorVerificationChange()` - Deactivate chats when doctor loses verification
- `handleUserBlocked()` - Deactivate chats between blocked users
- `cleanupExpiredConversations()` - Cron job to cleanup expired chats
- `reactivateConversation()` - Reactivate chat if appointment re-approved

**Integration Points:**
- Appointment routes
- Doctor verification routes
- User blocking routes
- Cron jobs

## Usage Examples

### Send a Message

```typescript
import { chatService } from './chat.service';

const message = await chatService.createMessage({
  conversationId: 'conv_123',
  senderId: 'user_123',
  content: 'Hello doctor',
  type: 'TEXT'
});
```

### Get Messages with Pagination

```typescript
const result = await chatService.getMessages({
  conversationId: 'conv_123',
  limit: 50,
  cursor: 'msg_456' // Optional
});

console.log(result.messages); // Array of messages
console.log(result.hasMore); // Boolean
console.log(result.nextCursor); // Next cursor for pagination
```

### Edit a Message

```typescript
try {
  const updated = await chatService.editMessage({
    messageId: 'msg_123',
    userId: 'user_123',
    content: 'Updated content'
  });
} catch (error) {
  // Handle errors: edit window expired, not owner, etc.
}
```

### Mark Messages as Read

```typescript
await chatService.markAsRead('conv_123', 'user_123');
```

### Get Unread Counts

```typescript
// Single conversation
const count = await chatService.getUnreadCount('user_123', 'conv_123');

// All conversations
const counts = await chatService.getAllUnreadCounts('user_123');
// Returns: [{ conversationId: 'conv_123', count: 5 }, ...]
```

### Handle Appointment Cancellation

```typescript
import { chatLifecycleService } from './chat-lifecycle.service';

// When appointment is cancelled
await chatLifecycleService.handleAppointmentStatusChange(
  appointmentId,
  'CANCELLED'
);
```

### Handle Doctor Verification Loss

```typescript
// When doctor loses verification
await chatLifecycleService.handleDoctorVerificationChange(
  doctorId,
  'SUSPENDED'
);
```

### Cleanup Expired Conversations (Cron)

```typescript
// Run daily
const cleanedCount = await chatLifecycleService.cleanupExpiredConversations();
console.log(`Cleaned up ${cleanedCount} expired conversations`);
```

## Error Handling

All service methods throw descriptive errors that should be caught and handled:

```typescript
try {
  await chatService.createMessage({...});
} catch (error) {
  if (error.message.includes('Rate limit')) {
    // Handle rate limit
  } else if (error.message.includes('Invalid conversation')) {
    // Handle invalid conversation
  } else {
    // Handle other errors
  }
}
```

## Testing

Run tests:

```bash
npm test chat.service.test.ts
```

See `__tests__/chat.service.test.ts` for examples.

## Dependencies

- `@medthread/database` - Prisma client
- `../socket` - Socket.io instance
- `./notification.service` - Notification creation
- `../middleware/chatPermission` - Permission checks

## Performance Considerations

1. **Database Queries**: All queries use proper indexes
2. **Pagination**: Cursor-based for efficient large datasets
3. **Rate Limiting**: Prevents abuse and database overload
4. **Soft Deletes**: No permanent data loss
5. **Socket Emissions**: Non-blocking, failures don't affect message creation

## Security

1. **Permission Checks**: All operations validate user permissions
2. **Rate Limiting**: Prevents spam and abuse
3. **File Validation**: MIME type and size checks
4. **Content Sanitization**: Prevent XSS (handled by frontend)
5. **Soft Deletes**: Audit trail maintained

## Monitoring

Key metrics to track:
- Message send rate
- Rate limit hits
- Permission denials
- File upload failures
- Socket emission failures

## Future Enhancements

- [ ] Message reactions
- [ ] Voice messages
- [ ] Video calls
- [ ] Message search
- [ ] Message forwarding
- [ ] Group chats
- [ ] End-to-end encryption
