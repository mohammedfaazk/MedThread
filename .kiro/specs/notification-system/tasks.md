# Implementation Plan: Notifications System

## Overview

This implementation plan breaks down the notification system into incremental coding tasks. The system will be built in layers: database models and migrations, backend services and APIs, real-time socket integration, frontend UI components, and testing. Each task builds on previous work to ensure continuous integration and early validation.

## Tasks

### Phase 1: Database Foundation

- [x] 1. Set up database models and migrations
  - Create Prisma schema for Notification model with all fields (id, type, recipientId, actorId, contentId, contentType, metadata, isRead, readAt, isDeleted, deletedAt, timestamps)
  - Create Prisma schema for NotificationPreferences model with channel configurations
  - Create Prisma schema for EmailQueue model for async email delivery
  - Add NotificationType enum with all types (REPLY, MENTION, AWARD, FOLLOWER, APPOINTMENT_REQUEST, APPOINTMENT_UPDATE, VERIFICATION_STATUS, COMMUNITY_INVITE, DIRECT_MESSAGE, SYSTEM_ANNOUNCEMENT, UPVOTE_MILESTONE)
  - Add ContentType enum (POST, COMMENT, APPOINTMENT, COMMUNITY)
  - Add indexes for efficient querying (recipientId + isRead + createdAt, recipientId + type, recipientId + isDeleted)
  - Generate and test database migrations
  - _Requirements: 6.1, 6.6_

### Phase 2: Backend Services - Core Notification Logic

- [x] 2. Implement Notification Service core functionality
  - Create NotificationService class in `apps/api/src/services/notification.service.ts`
  - Implement `createNotification` method with recipient filtering and preference checking
  - Implement `getNotifications` method with pagination, filtering by type/read status
  - Implement `markAsRead` method for single notification
  - Implement `markAllAsRead` method for bulk updates
  - Implement `deleteNotification` method with soft delete
  - Implement `getUnreadCount` method with caching
  - Add metadata handling for different notification types
  - Add error handling and logging
  - _Requirements: 3.1-3.11, 6.1-6.6, 8.1-8.6_

- [x] 3. Implement Preferences Service
  - Create PreferencesService class in `apps/api/src/services/notification-preferences.service.ts`
  - Implement `getPreferences` method with default values for new users
  - Implement `updatePreferences` method with validation
  - Implement `isNotificationEnabled` method for checking channel preferences
  - Implement `isInQuietHours` method for time-based filtering
  - Create default preferences configuration
  - Add preference validation logic
  - _Requirements: 4.1-4.8_

- [x] 4. Implement notification aggregation logic
  - Add `aggregateNotifications` method to NotificationService
  - Implement grouping by type + contentId + time window (1 hour)
  - Implement actor list aggregation (max 50 actors)
  - Add aggregated count and display logic
  - _Requirements: 9.1-9.5_

### Phase 3: Backend API Endpoints

- [x] 5. Create notification API routes and controllers
  - Create `apps/api/src/routes/notification.routes.ts`
  - Create `apps/api/src/controllers/notification.controller.ts`
  - Implement GET `/api/notifications` with query params (page, limit, type, isRead, startDate, endDate)
  - Implement GET `/api/notifications/unread-count`
  - Implement POST `/api/notifications/:id/read`
  - Implement POST `/api/notifications/mark-all-read`
  - Implement DELETE `/api/notifications/:id`
  - Add authentication middleware to all routes
  - Add input validation middleware
  - Add rate limiting
  - _Requirements: 1.3, 6.2, 6.3, 6.4, 6.5, 12.1_

- [x] 6. Create notification preferences API routes
  - Add routes to `apps/api/src/routes/notification.routes.ts`
  - Implement GET `/api/notifications/preferences`
  - Implement PUT `/api/notifications/preferences`
  - Implement POST `/api/notifications/unsubscribe/:token`
  - Add preference validation
  - Add unsubscribe token generation and verification
  - _Requirements: 4.1-4.8, 5.3, 5.4_

### Phase 4: Real-time Socket Integration

- [x] 7. Implement Socket.io notification delivery
  - Extend existing Socket.io server in `apps/api/src/handlers/chat.handler.ts` or create new handler
  - Implement `notification:join` event handler for room joining
  - Implement `notification:leave` event handler
  - Implement `notification:read` event handler for cross-tab sync
  - Implement server-side `notification:new` emission
  - Implement server-side `notification:unread-count` emission
  - Implement server-side `notification:read` broadcast
  - Implement server-side `notification:all-read` broadcast
  - Add socket authentication middleware
  - Add connection tracking for delivery status
  - _Requirements: 2.1-2.6, 12.6_

- [x] 8. Create socket delivery service
  - Create SocketDeliveryService in `apps/api/src/services/socket-delivery.service.ts`
  - Implement `sendNotification` method for real-time delivery
  - Implement `sendUnreadCountUpdate` method
  - Implement `isUserConnected` check
  - Add retry logic for failed deliveries
  - Add delivery latency tracking
  - _Requirements: 2.1, 2.2, 10.4_

### Phase 5: Email Notification System

- [x] 9. Extend email service for notifications
  - Extend existing EmailService in `apps/api/src/services/email.service.ts`
  - Create email templates for each notification type
  - Implement `sendNotificationEmail` method for instant delivery
  - Implement `sendDigestEmail` method for aggregated notifications
  - Implement `generateUnsubscribeToken` method
  - Implement `handleUnsubscribe` method
  - Add email formatting with branded templates
  - Add unsubscribe link to all emails
  - _Requirements: 5.1-5.7_

- [x] 10. Implement email queue and job processing
  - Create email queue worker service
  - Implement job enqueueing for instant and digest emails
  - Implement retry logic with exponential backoff (max 3 attempts)
  - Implement digest email cron job (daily and weekly)
  - Add email delivery status tracking
  - Add circuit breaker for email service failures
  - _Requirements: 5.1, 5.2, 5.6, 10.1, 10.5, 11.1, 11.5_

### Phase 6: Notification Triggers Integration

- [x] 11. Integrate notification triggers in post/comment services
  - Update PostService to trigger REPLY notifications
  - Update CommentService to trigger REPLY notifications
  - Implement @mention parsing and MENTION notification triggers
  - Update award logic to trigger AWARD notifications
  - Update upvote logic to trigger UPVOTE_MILESTONE notifications (with threshold check)
  - _Requirements: 3.1, 3.2, 3.3, 3.11_

- [x] 12. Integrate notification triggers in user/follow services
  - Update UserService to trigger FOLLOWER notifications
  - Update follow logic to create notifications
  - _Requirements: 3.4_

- [x] 13. Integrate notification triggers in appointment services
  - Update appointment creation to trigger APPOINTMENT_REQUEST notifications
  - Update appointment status changes to trigger APPOINTMENT_UPDATE notifications
  - Ensure both doctor and patient receive appropriate notifications
  - _Requirements: 3.5, 3.6_

- [x] 14. Integrate notification triggers in verification and community services
  - Update doctor verification service to trigger VERIFICATION_STATUS notifications
  - Update community moderation invites to trigger COMMUNITY_INVITE notifications
  - _Requirements: 3.7, 3.8, 7.4, 7.5_

- [x] 15. Implement system announcement and direct message notifications
  - Add admin endpoint for creating SYSTEM_ANNOUNCEMENT notifications
  - Update chat/messaging service to trigger DIRECT_MESSAGE notifications
  - _Requirements: 3.9, 3.10_

### Phase 7: Frontend - Notification Bell Component

- [x] 16. Create NotificationBell component
  - Create `apps/web/src/components/NotificationBell.tsx`
  - Implement bell icon with unread count badge
  - Implement dropdown panel showing 10 most recent notifications
  - Add socket connection for real-time updates
  - Implement unread count updates via socket
  - Add "Mark all as read" action
  - Add "View all" link to full notification page
  - Add loading and error states
  - Style with Tailwind CSS matching MedThread design
  - _Requirements: 1.1, 1.2, 2.2, 2.3_

- [x] 17. Integrate NotificationBell into navbar
  - Update navbar component to include NotificationBell
  - Position bell icon appropriately
  - Ensure responsive design
  - Test across different screen sizes
  - _Requirements: 1.1_

### Phase 8: Frontend - Notification Center Page

- [x] 18. Create NotificationCenter page component
  - Create `apps/web/src/app/notifications/page.tsx`
  - Implement full notification list with pagination
  - Add filter controls for notification type
  - Add filter controls for read/unread status
  - Implement infinite scroll or pagination
  - Add "Mark all as read" bulk action
  - Add loading states and skeleton loaders
  - Add empty state when no notifications
  - Style with Tailwind CSS
  - _Requirements: 1.3, 1.7, 1.8_

- [x] 19. Create NotificationItem component
  - Create `apps/web/src/components/NotificationItem.tsx`
  - Display actor avatar and username
  - Display notification content with preview
  - Display relative timestamps (e.g., "2 hours ago")
  - Display absolute dates for notifications older than 7 days
  - Add read/unread visual indicator
  - Add delete button
  - Implement click to navigate to content
  - Implement mark as read on click
  - Handle aggregated notifications display
  - _Requirements: 1.4, 1.5, 1.6, 8.1-8.6, 9.2, 9.5_

### Phase 9: Frontend - Notification Preferences

- [x] 20. Create NotificationPreferences page component
  - Create `apps/web/src/app/settings/notifications/page.tsx`
  - Implement toggle controls for each notification type
  - Implement channel selection (in-app, email, push) for each type
  - Implement email frequency selection (instant, digest, off)
  - Implement quiet hours time picker
  - Implement upvote threshold input
  - Implement digest frequency selection (daily, weekly)
  - Add save and reset actions
  - Add loading and saving states
  - Add success/error feedback
  - Style with Tailwind CSS
  - _Requirements: 4.1-4.8_

### Phase 10: Frontend - Socket Integration

- [x] 21. Create notification socket client
  - Create `apps/web/src/lib/notificationSocket.ts`
  - Implement socket connection with authentication
  - Implement `notification:join` emission on connect
  - Implement `notification:new` event listener
  - Implement `notification:unread-count` event listener
  - Implement `notification:read` event listener for cross-tab sync
  - Implement `notification:all-read` event listener
  - Add reconnection logic
  - Add connection state management
  - _Requirements: 2.1-2.6_

- [x] 22. Create notification context provider
  - Create `apps/web/src/contexts/NotificationContext.tsx`
  - Implement global notification state management
  - Implement socket connection management
  - Implement unread count state
  - Implement notification list state
  - Provide methods for marking as read, deleting, etc.
  - Add audio alert for new notifications (if enabled)
  - _Requirements: 2.2, 2.5_

### Phase 11: Browser Push Notifications

- [x] 23. Implement browser push notification support
  - Create service worker for push notifications
  - Implement push subscription flow
  - Add "Enable notifications" prompt in UI
  - Create API endpoint for storing push subscriptions
  - Implement push notification sending in backend
  - Add push notification click handler to navigate to content
  - Test across different browsers
  - _Requirements: 2.3, 2.4_

### Phase 12: Security and Performance

- [x] 24. Implement security measures
  - Add authorization checks to all API endpoints
  - Implement input sanitization for notification content
  - Add rate limiting to notification creation
  - Implement blocked user filtering
  - Add socket authentication validation
  - Implement unsubscribe token signing and verification
  - Add XSS prevention in notification display
  - _Requirements: 12.1-12.6_

- [x] 25. Implement performance optimizations
  - Add Redis caching for unread counts
  - Add Redis caching for recent notifications
  - Implement database query optimization
  - Add batch processing for bulk notification creation
  - Implement connection pooling
  - Add CDN configuration for static assets
  - Optimize socket room management
  - _Requirements: 10.1-10.5_

### Phase 13: Testing

- [x] 26. Write unit tests for backend services
  - Test NotificationService methods
  - Test PreferencesService methods
  - Test aggregation logic
  - Test email service methods
  - Test socket delivery service
  - Achieve >80% code coverage

- [x] 27. Write integration tests for API endpoints
  - Test all notification API endpoints
  - Test preferences API endpoints
  - Test authentication and authorization
  - Test error handling
  - Test rate limiting

- [x] 28. Write E2E tests for notification flows
  - Test notification creation to delivery flow
  - Test real-time socket delivery
  - Test email delivery
  - Test preference updates
  - Test notification center UI interactions
  - Test cross-tab synchronization

- [x] 29. Write load tests
  - Test high-volume notification creation
  - Test concurrent socket connections
  - Test API endpoint performance under load
  - Verify system meets performance requirements (1000 notifications/sec, 10,000 concurrent connections)
  - _Requirements: 10.2, 10.4_

### Phase 14: Monitoring and Documentation

- [x] 30. Implement monitoring and logging
  - Add metrics collection (creation rate, delivery success rate, latency)
  - Add structured logging for key events
  - Configure alerts for failures and performance issues
  - Create monitoring dashboard
  - Add error tracking integration

- [x] 31. Write documentation
  - Document API endpoints with examples
  - Document socket events
  - Document notification types and metadata structure
  - Create user guide for notification preferences
  - Create developer guide for adding new notification types
  - Document deployment and migration procedures

### Phase 15: Deployment

- [x] 32. Deploy to staging environment
  - Run database migrations
  - Deploy backend services
  - Deploy frontend changes
  - Test all functionality in staging
  - Perform load testing
  - Fix any issues found

- [x] 33. Deploy to production
  - Schedule maintenance window if needed
  - Run database migrations
  - Deploy backend services with feature flags
  - Deploy frontend changes
  - Gradually enable notification types (low-volume first)
  - Monitor system performance and errors
  - Enable all notification types
  - Remove feature flags
  - Announce feature to users

## Task Dependencies

```
1 → 2, 3
2, 3 → 4, 5, 6
5, 6 → 7, 8
2, 3 → 9, 10
2, 3, 5 → 11, 12, 13, 14, 15
5, 6 → 16, 17
5, 6 → 18, 19
6 → 20
7, 8 → 21, 22
9, 10, 21, 22 → 23
All implementation tasks → 24, 25
All implementation tasks → 26, 27, 28, 29
All tasks → 30, 31
All tasks → 32 → 33
```

## Estimated Timeline

- Phase 1 (Database): 1-2 days
- Phase 2 (Core Services): 3-4 days
- Phase 3 (API Endpoints): 2-3 days
- Phase 4 (Socket Integration): 2-3 days
- Phase 5 (Email System): 3-4 days
- Phase 6 (Trigger Integration): 3-4 days
- Phase 7 (Notification Bell): 2-3 days
- Phase 8 (Notification Center): 3-4 days
- Phase 9 (Preferences UI): 2-3 days
- Phase 10 (Socket Client): 2-3 days
- Phase 11 (Push Notifications): 2-3 days
- Phase 12 (Security & Performance): 2-3 days
- Phase 13 (Testing): 4-5 days
- Phase 14 (Monitoring & Docs): 2-3 days
- Phase 15 (Deployment): 2-3 days

Total: 6-8 weeks

## Notes

- Tasks can be parallelized where dependencies allow
- Each task should include appropriate error handling and logging
- All code should follow existing MedThread coding standards
- All user-facing text should be clear and professional
- All components should be responsive and accessible
- Consider creating feature flags for gradual rollout
- Monitor system performance closely during initial deployment
- Be prepared to scale infrastructure if needed

