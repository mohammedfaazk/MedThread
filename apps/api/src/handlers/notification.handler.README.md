# Notification Socket.io Handler

This module implements real-time notification delivery using Socket.io for the MedThread notification system.

## Overview

The notification handler provides real-time bidirectional communication between the server and clients for instant notification delivery, cross-tab synchronization, and unread count updates.

## Features

- **Socket Authentication**: JWT-based authentication for socket connections
- **Room-based Delivery**: Users join their own notification rooms for targeted delivery
- **Connection Tracking**: Tracks connected users for delivery status monitoring
- **Cross-tab Sync**: Synchronizes notification read status across multiple browser tabs
- **Real-time Updates**: Instant delivery of new notifications and unread count updates

## Socket Events

### Client → Server

#### `notification:join`
Join the user's notification room to receive real-time updates.

**Payload:**
```typescript
{
  userId: string
}
```

**Response:**
- Emits `notification:unread-count` with current unread count
- Emits `error` if unauthorized

**Example:**
```typescript
socket.emit('notification:join', { userId: 'user123' });
```

#### `notification:leave`
Leave the notification room.

**Payload:** None

**Example:**
```typescript
socket.emit('notification:leave');
```

#### `notification:read`
Mark a notification as read and sync across all user's connected clients.

**Payload:**
```typescript
{
  notificationId: string
}
```

**Response:**
- Broadcasts `notification:read` to all user's clients
- Emits `notification:unread-count` with updated count
- Emits `error` if operation fails

**Example:**
```typescript
socket.emit('notification:read', { notificationId: 'notif123' });
```

### Server → Client

#### `notification:new`
Emitted when a new notification is created for the user.

**Payload:**
```typescript
{
  id: string;
  type: NotificationType;
  recipientId: string;
  actorId: string;
  actor: {
    id: string;
    username: string;
    avatar?: string;
  };
  contentId?: string;
  contentType?: string;
  metadata: {
    title?: string;
    body?: string;
    preview?: string;
    link?: string;
    communityName?: string;
    postTitle?: string;
    [key: string]: any;
  };
  isRead: boolean;
  createdAt: string;
}
```

**Example:**
```typescript
socket.on('notification:new', (notification) => {
  console.log('New notification:', notification);
  // Update UI, show toast, play sound, etc.
});
```

#### `notification:unread-count`
Emitted when the unread notification count changes.

**Payload:**
```typescript
number // The unread count
```

**Example:**
```typescript
socket.on('notification:unread-count', (count) => {
  console.log('Unread count:', count);
  // Update badge in UI
});
```

#### `notification:read`
Emitted when a notification is marked as read (for cross-tab sync).

**Payload:**
```typescript
string // The notification ID
```

**Example:**
```typescript
socket.on('notification:read', (notificationId) => {
  console.log('Notification marked as read:', notificationId);
  // Update UI to reflect read status
});
```

#### `notification:all-read`
Emitted when all notifications are marked as read.

**Payload:** None

**Example:**
```typescript
socket.on('notification:all-read', () => {
  console.log('All notifications marked as read');
  // Update UI to mark all as read
});
```

#### `error`
Emitted when an error occurs.

**Payload:**
```typescript
{
  message: string
}
```

**Example:**
```typescript
socket.on('error', (error) => {
  console.error('Socket error:', error.message);
});
```

## Authentication

Socket connections must be authenticated using a JWT token. The token can be provided in two ways:

1. **Auth object** (recommended):
```typescript
const socket = io('http://localhost:3001', {
  auth: {
    token: 'your-jwt-token'
  }
});
```

2. **Authorization header**:
```typescript
const socket = io('http://localhost:3001', {
  extraHeaders: {
    Authorization: 'Bearer your-jwt-token'
  }
});
```

If authentication fails, the socket will be disconnected immediately with an error event.

## Server-side Helper Functions

### `sendNotificationToUser(io, userId, notification)`
Send a new notification to a specific user.

**Parameters:**
- `io`: Socket.io Server instance
- `userId`: Target user ID
- `notification`: Notification object

**Example:**
```typescript
import { sendNotificationToUser } from './handlers/notification.handler';
import { getSocketInstance } from './socket';

const io = getSocketInstance();
sendNotificationToUser(io, 'user123', notification);
```

### `sendUnreadCountUpdate(io, userId, count)`
Send an unread count update to a specific user.

**Parameters:**
- `io`: Socket.io Server instance
- `userId`: Target user ID
- `count`: Unread count

**Example:**
```typescript
import { sendUnreadCountUpdate } from './handlers/notification.handler';
import { getSocketInstance } from './socket';

const io = getSocketInstance();
sendUnreadCountUpdate(io, 'user123', 5);
```

### `broadcastNotificationRead(io, userId, notificationId)`
Broadcast notification read event to all user's connected clients.

**Parameters:**
- `io`: Socket.io Server instance
- `userId`: Target user ID
- `notificationId`: Notification ID

**Example:**
```typescript
import { broadcastNotificationRead } from './handlers/notification.handler';
import { getSocketInstance } from './socket';

const io = getSocketInstance();
broadcastNotificationRead(io, 'user123', 'notif123');
```

### `broadcastAllNotificationsRead(io, userId)`
Broadcast all notifications read event to all user's connected clients.

**Parameters:**
- `io`: Socket.io Server instance
- `userId`: Target user ID

**Example:**
```typescript
import { broadcastAllNotificationsRead } from './handlers/notification.handler';
import { getSocketInstance } from './socket';

const io = getSocketInstance();
broadcastAllNotificationsRead(io, 'user123');
```

### `isUserConnected(userId)`
Check if a user is currently connected via socket.

**Parameters:**
- `userId`: User ID to check

**Returns:** `boolean`

**Example:**
```typescript
import { isUserConnected } from './handlers/notification.handler';

if (isUserConnected('user123')) {
  console.log('User is online');
}
```

### `getConnectedUsers()`
Get all currently connected user IDs.

**Returns:** `string[]`

**Example:**
```typescript
import { getConnectedUsers } from './handlers/notification.handler';

const connectedUsers = getConnectedUsers();
console.log('Connected users:', connectedUsers);
```

## Connection Tracking

The handler maintains a map of connected users to their socket IDs. This allows:
- Checking if a user is online
- Sending notifications only to connected users
- Tracking delivery status
- Supporting multiple connections per user (multiple tabs/devices)

## Security

- **Authentication Required**: All socket connections must provide a valid JWT token
- **Authorization**: Users can only join their own notification rooms
- **Room Isolation**: Notifications are delivered only to the intended recipient's room
- **Token Verification**: JWT tokens are verified on connection and for sensitive operations

## Error Handling

- Failed socket broadcasts don't fail the HTTP request
- Errors are logged for debugging
- Clients receive error events for failed operations
- Disconnections are handled gracefully with automatic cleanup

## Integration with Notification Service

The notification handler integrates with the notification service and controller:

1. **Notification Creation**: When a notification is created, use `sendNotificationToUser()` to deliver it in real-time
2. **Mark as Read**: The controller broadcasts read events via socket when notifications are marked as read
3. **Mark All as Read**: The controller broadcasts all-read events via socket
4. **Delete**: The controller sends updated unread counts via socket when notifications are deleted

## Testing

To test the socket implementation:

1. **Connect with authentication**:
```typescript
const socket = io('http://localhost:3001', {
  auth: { token: 'your-jwt-token' }
});
```

2. **Join notification room**:
```typescript
socket.emit('notification:join', { userId: 'your-user-id' });
```

3. **Listen for events**:
```typescript
socket.on('notification:new', (notification) => console.log(notification));
socket.on('notification:unread-count', (count) => console.log(count));
socket.on('notification:read', (id) => console.log(id));
socket.on('notification:all-read', () => console.log('All read'));
```

4. **Mark as read**:
```typescript
socket.emit('notification:read', { notificationId: 'notif123' });
```

## Requirements Satisfied

This implementation satisfies the following requirements from the notification system spec:

- **2.1**: Real-time notification delivery within 2 seconds
- **2.2**: Visual indicator and unread count updates
- **2.3**: Browser notification support (client-side implementation needed)
- **2.4**: Desktop notifications for inactive tabs (client-side implementation needed)
- **2.5**: Audio alerts (client-side implementation needed)
- **2.6**: Sync missed notifications on reconnection
- **12.6**: Socket authentication with JWT

## Next Steps

1. Implement client-side socket connection in the frontend
2. Create NotificationContext provider for state management
3. Integrate with NotificationBell and NotificationCenter components
4. Add browser push notification support
5. Implement audio alerts for new notifications
