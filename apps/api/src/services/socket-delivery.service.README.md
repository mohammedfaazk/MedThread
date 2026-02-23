# Socket Delivery Service

The `SocketDeliveryService` handles real-time notification delivery via Socket.io with retry logic, latency tracking, and connection management.

## Features

- **Real-time Delivery**: Send notifications instantly to connected users
- **Retry Logic**: Automatically retries failed deliveries up to 3 times with exponential backoff
- **Latency Tracking**: Monitors delivery performance and provides metrics
- **Connection Management**: Checks user connection status before delivery
- **Cross-tab Sync**: Broadcasts read status across all user's connected clients

## Usage

### Basic Notification Delivery

```typescript
import { socketDeliveryService } from './socket-delivery.service';
import { notificationService } from './notification.service';

// Create a notification
const notifications = await notificationService.createNotification({
  type: 'REPLY',
  recipientIds: ['user-123'],
  actorId: 'user-456',
  metadata: {
    title: 'New reply to your post',
    body: 'John Doe replied to your post',
    link: '/posts/abc123',
  },
  contentId: 'post-abc123',
  contentType: 'POST',
});

// Send via socket to connected users
for (const notification of notifications) {
  await socketDeliveryService.sendNotification(
    notification.recipientId,
    notification
  );
  
  // Update unread count
  const unreadCount = await notificationService.getUnreadCount(notification.recipientId);
  await socketDeliveryService.sendUnreadCountUpdate(
    notification.recipientId,
    unreadCount
  );
}
```

### Send to Multiple Users

```typescript
// Send notification to multiple users at once
await socketDeliveryService.sendNotification(
  ['user-1', 'user-2', 'user-3'],
  notification
);
```

### Check Connection Status

```typescript
// Check if a user is connected
const isConnected = socketDeliveryService.isUserConnected('user-123');

if (isConnected) {
  console.log('User is online, sending notification...');
  await socketDeliveryService.sendNotification('user-123', notification);
} else {
  console.log('User is offline, notification will be queued');
}

// Get all connected users
const connectedUsers = socketDeliveryService.getConnectedUsers();
console.log(`${connectedUsers.length} users currently connected`);
```

### Broadcast Read Status

```typescript
// When a user marks a notification as read
await notificationService.markAsRead('notif-123', 'user-456');

// Broadcast to all user's connected clients (cross-tab sync)
await socketDeliveryService.broadcastNotificationRead('user-456', 'notif-123');

// Update unread count
const unreadCount = await notificationService.getUnreadCount('user-456');
await socketDeliveryService.sendUnreadCountUpdate('user-456', unreadCount);
```

### Broadcast All Read

```typescript
// When a user marks all notifications as read
await notificationService.markAllAsRead('user-456');

// Broadcast to all user's connected clients
await socketDeliveryService.broadcastAllNotificationsRead('user-456');

// Update unread count to 0
await socketDeliveryService.sendUnreadCountUpdate('user-456', 0);
```

## Delivery Metrics

The service tracks delivery performance metrics:

```typescript
// Get metrics for a specific notification
const metrics = socketDeliveryService.getDeliveryMetrics('notif-123');
console.log('Delivery attempts:', metrics.length);
metrics.forEach(m => {
  console.log(`User ${m.userId}: ${m.success ? 'Success' : 'Failed'} (${m.latency}ms)`);
});

// Get average delivery latency
const avgLatency = socketDeliveryService.getAverageLatency();
console.log(`Average delivery latency: ${avgLatency}ms`);

// Get success rate
const successRate = socketDeliveryService.getSuccessRate();
console.log(`Delivery success rate: ${successRate}%`);

// Clear old metrics (older than 1 hour)
socketDeliveryService.clearMetrics(60 * 60 * 1000);
```

## Integration with Notification Controller

Example integration in the notification controller:

```typescript
import { socketDeliveryService } from '../services/socket-delivery.service';
import { notificationService } from '../services/notification.service';

// Mark notification as read
export const markAsRead = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user.id;

  await notificationService.markAsRead(id, userId);
  
  // Broadcast to all user's connected clients
  await socketDeliveryService.broadcastNotificationRead(userId, id);
  
  // Send updated unread count
  const unreadCount = await notificationService.getUnreadCount(userId);
  await socketDeliveryService.sendUnreadCountUpdate(userId, unreadCount);

  res.json({ success: true });
};

// Mark all as read
export const markAllAsRead = async (req: Request, res: Response) => {
  const userId = req.user.id;

  const count = await notificationService.markAllAsRead(userId);
  
  // Broadcast to all user's connected clients
  await socketDeliveryService.broadcastAllNotificationsRead(userId);
  
  // Send updated unread count (should be 0)
  await socketDeliveryService.sendUnreadCountUpdate(userId, 0);

  res.json({ success: true, count });
};
```

## Retry Logic

The service implements exponential backoff for failed deliveries:

- **Attempt 1**: Immediate delivery
- **Attempt 2**: Retry after 1 second
- **Attempt 3**: Retry after 2 seconds
- **Attempt 4**: Retry after 4 seconds

After 3 retries (4 total attempts), the delivery is marked as failed and logged.

## Performance Considerations

- **Timeout**: Each delivery attempt has a 5-second timeout
- **Metrics Cleanup**: Periodically clear old metrics to prevent memory growth
- **Connection Checks**: Fast O(1) lookup for user connection status
- **Batch Delivery**: Use array of user IDs for efficient multi-user delivery

## Requirements Satisfied

- **Requirement 2.1**: Real-time delivery within 2 seconds (with retry logic)
- **Requirement 2.2**: Visual indicator and unread count updates
- **Requirement 10.4**: Delivery latency tracking and metrics

## Socket Events

The service emits the following Socket.io events:

- `notification:new` - New notification received
- `notification:unread-count` - Unread count updated
- `notification:read` - Notification marked as read (cross-tab sync)
- `notification:all-read` - All notifications marked as read (cross-tab sync)
