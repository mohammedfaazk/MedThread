# User Experience & Social System - Implementation Guide

## Overview

This guide covers the implementation of all user experience and social features for MedThread, organized into 8 major tasks. This document serves as a comprehensive reference for implementing each feature correctly and consistently.

---

## Branch Information

**Branch:** `feature/user-social`
**Person:** PERSON 3 - User Experience & Social
**Tasks:** 7, 11, 18, 23, 24, 25, 26, 27

---

## Task 7: User Profiles

### Scope
Complete user profile management including editing, avatars, banners, bio, settings, password changes, and 2FA.

### Backend Components

#### API Endpoints
```
GET    /api/users/:username          - Get user profile by username
GET    /api/users/:userId/profile    - Get user profile by ID
PUT    /api/users/profile            - Update current user profile
PUT    /api/users/avatar             - Upload/update avatar
PUT    /api/users/banner             - Upload/update banner
PUT    /api/users/password           - Change password
POST   /api/users/2fa/enable         - Enable 2FA
POST   /api/users/2fa/verify         - Verify 2FA code
POST   /api/users/2fa/disable        - Disable 2FA
GET    /api/users/:username/posts    - Get user's posts
GET    /api/users/:username/comments - Get user's comments
```

#### Database Schema
```prisma
model User {
  // Existing fields...
  bio              String?
  avatar           String?
  banner           String?
  specialty        String?
  location         String?
  website          String?
  twoFactorEnabled Boolean @default(false)
  twoFactorSecret  String?
  
  // Relations
  posts            Post[]
  comments         Comment[]
  followers        Follow[] @relation("UserFollowers")
  following        Follow[] @relation("UserFollowing")
  blockedUsers     Block[]  @relation("BlockedUsers")
  blockedBy        Block[]  @relation("BlockedBy")
}
```

#### Services
- `UserService` - Profile CRUD operations
- `FileUploadService` - Avatar/banner uploads
- `TwoFactorService` - 2FA management

### Frontend Components

#### Pages
- `/profile/[username]` - Public profile view
- `/settings/profile` - Edit profile
- `/settings/account` - Account settings
- `/settings/security` - Password & 2FA

#### Components
- `UserProfile.tsx` - Profile display
- `ProfileHeader.tsx` - Avatar, banner, stats
- `ProfileTabs.tsx` - Posts, comments, about
- `EditProfileForm.tsx` - Profile editing
- `AvatarUpload.tsx` - Avatar upload with crop
- `BannerUpload.tsx` - Banner upload
- `PasswordChangeForm.tsx` - Password change
- `TwoFactorSetup.tsx` - 2FA setup flow

### Implementation Checklist

**Backend:**
- [ ] Create user profile endpoints
- [ ] Implement file upload service (avatar/banner)
- [ ] Add image processing (resize, crop, optimize)
- [ ] Implement password change with validation
- [ ] Implement 2FA with TOTP (speakeasy/otplib)
- [ ] Add profile validation (bio length, URL format)
- [ ] Implement rate limiting on profile updates

**Frontend:**
- [ ] Create profile page with tabs
- [ ] Implement avatar upload with preview
- [ ] Implement banner upload with preview
- [ ] Create profile edit form with validation
- [ ] Implement password change form
- [ ] Create 2FA setup flow with QR code
- [ ] Add profile stats (posts, comments, karma)
- [ ] Implement responsive design

**Security:**
- [ ] Validate file types (images only)
- [ ] Limit file sizes (avatar: 2MB, banner: 5MB)
- [ ] Sanitize bio/website inputs
- [ ] Require current password for changes
- [ ] Implement 2FA backup codes

---

## Task 11: Chat System

### Scope
Real-time chat with UI, attachments, images, edit, delete, read receipts, and typing indicators.

### Backend Components

#### API Endpoints
```
GET    /api/chat/conversations        - Get user's conversations
GET    /api/chat/conversations/:id    - Get conversation messages
POST   /api/chat/conversations         - Create conversation
POST   /api/chat/messages              - Send message
PUT    /api/chat/messages/:id          - Edit message
DELETE /api/chat/messages/:id          - Delete message
POST   /api/chat/messages/:id/read     - Mark as read
POST   /api/chat/upload                - Upload attachment
```

#### Socket Events
```typescript
// Client → Server
socket.emit('chat:join', { conversationId })
socket.emit('chat:leave', { conversationId })
socket.emit('chat:typing', { conversationId, isTyping })
socket.emit('chat:message', { conversationId, content, attachments })

// Server → Client
socket.on('chat:message', (message) => {})
socket.on('chat:typing', ({ userId, isTyping }) => {})
socket.on('chat:read', ({ messageId, userId }) => {})
socket.on('chat:deleted', ({ messageId }) => {})
socket.on('chat:edited', (message) => {})
```

#### Database Schema
```prisma
model Conversation {
  id           String    @id @default(cuid())
  participants User[]
  messages     Message[]
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
}

model Message {
  id             String       @id @default(cuid())
  conversationId String
  conversation   Conversation @relation(fields: [conversationId], references: [id])
  senderId       String
  sender         User         @relation(fields: [senderId], references: [id])
  content        String
  attachments    String[]     // URLs to uploaded files
  isEdited       Boolean      @default(false)
  editedAt       DateTime?
  isDeleted      Boolean      @default(false)
  deletedAt      DateTime?
  readBy         String[]     // Array of user IDs
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt
}
```

### Frontend Components

#### Pages
- `/chat` - Chat inbox
- `/chat/[conversationId]` - Conversation view

#### Components
- `ChatInbox.tsx` - Conversation list
- `ChatWindow.tsx` - Message display
- `MessageInput.tsx` - Send message input
- `MessageBubble.tsx` - Individual message
- `TypingIndicator.tsx` - Typing animation
- `AttachmentUpload.tsx` - File upload
- `ImagePreview.tsx` - Image viewer
- `MessageActions.tsx` - Edit/delete menu

### Implementation Checklist

**Backend:**
- [ ] Create chat API endpoints
- [ ] Implement Socket.io chat handlers
- [ ] Add file upload for attachments
- [ ] Implement message edit/delete
- [ ] Add read receipts tracking
- [ ] Implement typing indicators
- [ ] Add message pagination
- [ ] Implement conversation search

**Frontend:**
- [ ] Create chat inbox with conversation list
- [ ] Implement real-time message display
- [ ] Add message input with emoji picker
- [ ] Implement file/image upload
- [ ] Add typing indicators
- [ ] Implement read receipts display
- [ ] Add message edit/delete UI
- [ ] Implement infinite scroll for messages
- [ ] Add image lightbox viewer

**Features:**
- [ ] Support text, images, files
- [ ] Message timestamps
- [ ] Unread message count
- [ ] Last message preview
- [ ] Online status indicators
- [ ] Message search
- [ ] Conversation muting

---

## Task 18: Notifications

### Scope
Notification center UI, real-time delivery, email notifications, push notifications, and user preferences.

### Status
✅ **COMPLETED** - All notification system tasks (1-33) have been implemented.

### What Was Implemented

**Backend:**
- Notification service with 11 notification types
- API endpoints for notifications and preferences
- Socket.io real-time delivery
- Email notifications (instant + digest)
- Email queue with retry logic
- Notification triggers across all services

**Frontend:**
- NotificationBell component in navbar
- NotificationCenter page at `/notifications`
- NotificationItem component
- NotificationPreferences page at `/settings/notifications`
- Socket client with real-time updates
- React context provider for global state
- Browser push notification support

### Reference Documentation
- Requirements: `.kiro/specs/notification-system/requirements.md`
- Design: `.kiro/specs/notification-system/design.md`
- Tasks: `.kiro/specs/notification-system/tasks.md`
- Implementation: `.kiro/specs/notification-system/IMPLEMENTATION_SUMMARY.md`

### Integration Points
When implementing other tasks, integrate with the notification system:
- **Task 24 (Following)**: Trigger FOLLOWER notifications
- **Task 26 (Direct Messages)**: Trigger DIRECT_MESSAGE notifications
- **Task 23 (Badges)**: Create new notification type for badge achievements

---

## Task 23: Badges System

### Scope
Badge system with achievements, tracking, and display on profiles.

### Backend Components

#### API Endpoints
```
GET    /api/badges                    - Get all available badges
GET    /api/badges/:userId            - Get user's badges
POST   /api/badges/award              - Award badge to user (admin)
GET    /api/achievements              - Get user's achievement progress
```

#### Database Schema
```prisma
model Badge {
  id          String      @id @default(cuid())
  name        String      @unique
  description String
  icon        String
  tier        String      // bronze, silver, gold, platinum
  category    String      // contribution, expertise, community, special
  criteria    Json        // Achievement criteria
  awarded     UserBadge[]
  createdAt   DateTime    @default(now())
}

model UserBadge {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  badgeId   String
  badge     Badge    @relation(fields: [badgeId], references: [id])
  awardedAt DateTime @default(now())
  
  @@unique([userId, badgeId])
}

model Achievement {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  type        String   // post_count, helpful_votes, etc.
  progress    Int      @default(0)
  target      Int
  completed   Boolean  @default(false)
  completedAt DateTime?
  updatedAt   DateTime @updatedAt
}
```

#### Badge Types
```typescript
// Contribution Badges
- First Post
- 10 Posts
- 100 Posts
- First Comment
- 100 Comments
- 1000 Comments

// Expertise Badges
- Helpful (10 helpful votes)
- Expert (100 helpful votes)
- Guru (1000 helpful votes)
- Verified Doctor
- Specialist (specialty-specific)

// Community Badges
- Welcome (joined)
- Active Member (30 days active)
- Community Leader (moderator)
- Mentor (helped 10 users)

// Special Badges
- Early Adopter
- Beta Tester
- Bug Hunter
- Top Contributor (monthly)
```

### Frontend Components

#### Components
- `BadgeDisplay.tsx` - Badge icon with tooltip
- `BadgeGrid.tsx` - Grid of badges
- `BadgeModal.tsx` - Badge details modal
- `AchievementProgress.tsx` - Progress bars
- `BadgeShowcase.tsx` - Profile badge section

### Implementation Checklist

**Backend:**
- [ ] Create badge database models
- [ ] Implement badge API endpoints
- [ ] Create badge service with award logic
- [ ] Implement achievement tracking
- [ ] Add badge criteria evaluation
- [ ] Create background job for badge checks
- [ ] Integrate with notification system

**Frontend:**
- [ ] Create badge display components
- [ ] Add badges to user profiles
- [ ] Implement badge showcase section
- [ ] Create achievement progress UI
- [ ] Add badge tooltips with details
- [ ] Implement badge filtering/sorting
- [ ] Add badge animations

**Badge Logic:**
- [ ] Track user actions (posts, comments, votes)
- [ ] Evaluate badge criteria automatically
- [ ] Award badges when criteria met
- [ ] Send notification on badge award
- [ ] Display new badge modal
- [ ] Update profile badge count

---

## Task 24: Following System

### Scope
Follow users and doctors, manage following lists, and personalized feed.

### Backend Components

#### API Endpoints
```
POST   /api/users/:userId/follow      - Follow user
DELETE /api/users/:userId/follow      - Unfollow user
GET    /api/users/:userId/followers   - Get followers
GET    /api/users/:userId/following   - Get following
GET    /api/feed/following            - Get feed from followed users
GET    /api/feed/doctors              - Get feed from followed doctors
```

#### Database Schema
```prisma
model Follow {
  id          String   @id @default(cuid())
  followerId  String
  follower    User     @relation("UserFollowing", fields: [followerId], references: [id])
  followingId String
  following   User     @relation("UserFollowers", fields: [followingId], references: [id])
  createdAt   DateTime @default(now())
  
  @@unique([followerId, followingId])
  @@index([followerId])
  @@index([followingId])
}
```

### Frontend Components

#### Pages
- `/following` - Following feed
- `/users/:username/followers` - Followers list
- `/users/:username/following` - Following list

#### Components
- `FollowButton.tsx` - Follow/unfollow button
- `FollowersList.tsx` - List of followers
- `FollowingList.tsx` - List of following
- `FollowingFeed.tsx` - Personalized feed
- `UserCard.tsx` - User card with follow button

### Implementation Checklist

**Backend:**
- [ ] Create follow/unfollow endpoints
- [ ] Implement follower/following lists
- [ ] Create following feed algorithm
- [ ] Add follow notification trigger
- [ ] Implement follow suggestions
- [ ] Add privacy settings (private accounts)

**Frontend:**
- [ ] Create follow button component
- [ ] Implement follower/following lists
- [ ] Create following feed page
- [ ] Add follow suggestions
- [ ] Implement follow counts on profile
- [ ] Add follow status indicators

**Features:**
- [ ] Follow/unfollow with optimistic updates
- [ ] Follower/following counts
- [ ] Following feed with posts from followed users
- [ ] Follow suggestions based on interests
- [ ] Mutual follow indicators
- [ ] Follow notifications

---

## Task 25: Blocking System

### Scope
Block and unblock users, manage blocked list, and filter blocked content.

### Backend Components

#### API Endpoints
```
POST   /api/users/:userId/block       - Block user
DELETE /api/users/:userId/block       - Unblock user
GET    /api/users/blocked             - Get blocked users list
```

#### Database Schema
```prisma
model Block {
  id        String   @id @default(cuid())
  blockerId String
  blocker   User     @relation("BlockedUsers", fields: [blockerId], references: [id])
  blockedId String
  blocked   User     @relation("BlockedBy", fields: [blockedId], references: [id])
  reason    String?
  createdAt DateTime @default(now())
  
  @@unique([blockerId, blockedId])
  @@index([blockerId])
  @@index([blockedId])
}
```

### Frontend Components

#### Pages
- `/settings/blocked` - Blocked users list

#### Components
- `BlockButton.tsx` - Block/unblock button
- `BlockedUsersList.tsx` - List of blocked users
- `BlockConfirmModal.tsx` - Confirmation modal

### Implementation Checklist

**Backend:**
- [ ] Create block/unblock endpoints
- [ ] Implement blocked users list
- [ ] Filter blocked users from feeds
- [ ] Filter blocked users from notifications
- [ ] Prevent blocked users from messaging
- [ ] Prevent blocked users from commenting

**Frontend:**
- [ ] Create block button component
- [ ] Implement blocked users list
- [ ] Add block confirmation modal
- [ ] Filter blocked content from UI
- [ ] Add unblock functionality
- [ ] Show block status indicators

**Features:**
- [ ] Block/unblock users
- [ ] View blocked users list
- [ ] Hide posts/comments from blocked users
- [ ] Prevent interactions with blocked users
- [ ] Block reason (optional)
- [ ] Bulk unblock

---

## Task 26: Direct Messages

### Scope
Send direct messages, inbox management, and DM notifications.

### Status
**Overlaps with Task 11 (Chat System)**

### Implementation Notes
Direct messages are implemented as part of the chat system (Task 11). The key differences:

**Direct Messages (1-on-1):**
- Private conversations between two users
- Notification integration (DIRECT_MESSAGE type)
- Inbox view with unread counts
- Message preview in inbox

**Group Chat (if needed):**
- Multiple participants
- Group name and avatar
- Add/remove participants
- Group settings

### Integration with Notifications
- Trigger DIRECT_MESSAGE notification on new message
- Respect user notification preferences
- Support email notifications for DMs
- Push notifications for DMs

### Implementation Checklist

**Backend:**
- [ ] Ensure 1-on-1 conversation creation
- [ ] Integrate with notification system
- [ ] Add DM-specific privacy settings
- [ ] Implement message filtering

**Frontend:**
- [ ] Create DM inbox view
- [ ] Add unread message indicators
- [ ] Implement message preview
- [ ] Add "New Message" button
- [ ] Create user search for new DM

---

## Task 27: Mobile & Responsive

### Scope
Optimize UI for mobile, add touch gestures, and implement PWA features.

### Implementation Areas

#### Responsive Design
- Mobile-first approach
- Breakpoints: 640px (sm), 768px (md), 1024px (lg), 1280px (xl)
- Touch-friendly UI elements (min 44px tap targets)
- Responsive navigation (hamburger menu)
- Responsive tables and lists
- Mobile-optimized forms

#### Touch Gestures
- Swipe to delete (messages, notifications)
- Pull to refresh (feeds)
- Swipe navigation (between tabs)
- Long press menus
- Pinch to zoom (images)
- Double tap to like

#### PWA Features
- Service worker for offline support
- App manifest for install prompt
- Offline page
- Background sync
- Push notifications
- App icons and splash screens

### Implementation Checklist

**Responsive Design:**
- [ ] Audit all pages for mobile responsiveness
- [ ] Implement responsive navigation
- [ ] Optimize forms for mobile
- [ ] Add mobile-specific layouts
- [ ] Test on various screen sizes
- [ ] Optimize images for mobile

**Touch Gestures:**
- [ ] Implement swipe to delete
- [ ] Add pull to refresh
- [ ] Implement swipe navigation
- [ ] Add long press menus
- [ ] Test gesture conflicts
- [ ] Add haptic feedback (if supported)

**PWA:**
- [ ] Create service worker
- [ ] Add app manifest
- [ ] Implement offline page
- [ ] Add install prompt
- [ ] Configure app icons
- [ ] Test PWA installation
- [ ] Implement background sync

**Performance:**
- [ ] Optimize bundle size
- [ ] Implement lazy loading
- [ ] Add image optimization
- [ ] Minimize API calls
- [ ] Implement caching strategies
- [ ] Test on slow networks

---

## Implementation Order

### Recommended Sequence

1. **Task 7: User Profiles** (Foundation)
   - Basic profile viewing and editing
   - Avatar/banner uploads
   - Profile settings

2. **Task 25: Blocking System** (Security)
   - Block/unblock functionality
   - Content filtering

3. **Task 24: Following System** (Social)
   - Follow/unfollow
   - Following feed
   - Follower lists

4. **Task 23: Badges System** (Engagement)
   - Badge definitions
   - Achievement tracking
   - Badge display

5. **Task 11: Chat System** (Communication)
   - Real-time messaging
   - Attachments
   - Read receipts

6. **Task 26: Direct Messages** (Integration)
   - DM-specific features
   - Notification integration

7. **Task 27: Mobile & Responsive** (Polish)
   - Responsive design
   - Touch gestures
   - PWA features

---

## Common Patterns

### API Response Format
```typescript
// Success
{
  success: true,
  data: { ... },
  message?: string
}

// Error
{
  success: false,
  error: string,
  details?: any
}
```

### Authentication
All endpoints require JWT authentication via `authenticate` middleware:
```typescript
router.get('/endpoint', authenticate, handler);
```

### File Uploads
Use `multer` for file uploads with validation:
```typescript
const upload = multer({
  storage: multer.diskStorage({...}),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images allowed'));
    }
  }
});
```

### Real-time Updates
Use Socket.io for real-time features:
```typescript
// Server
io.to(`user:${userId}`).emit('event', data);

// Client
socket.on('event', (data) => {
  // Handle update
});
```

### Error Handling
Use custom error classes:
```typescript
throw new NotFoundError('User not found');
throw new ValidationError('Invalid input');
throw new ForbiddenError('Access denied');
```

---

## Testing Strategy

### Unit Tests
- Test individual service methods
- Mock database calls
- Test edge cases
- Aim for >80% coverage

### Integration Tests
- Test API endpoints
- Test authentication
- Test authorization
- Test error handling

### E2E Tests
- Test complete user flows
- Test real-time features
- Test file uploads
- Test mobile responsiveness

---

## Security Checklist

- [ ] Validate all user inputs
- [ ] Sanitize content (XSS prevention)
- [ ] Implement rate limiting
- [ ] Check authorization on all endpoints
- [ ] Validate file uploads (type, size)
- [ ] Use HTTPS for all requests
- [ ] Implement CSRF protection
- [ ] Secure WebSocket connections
- [ ] Hash sensitive data
- [ ] Implement proper session management

---

## Performance Checklist

- [ ] Implement pagination for lists
- [ ] Add database indexes
- [ ] Cache frequently accessed data
- [ ] Optimize images
- [ ] Minimize bundle size
- [ ] Implement lazy loading
- [ ] Use CDN for static assets
- [ ] Optimize database queries
- [ ] Implement connection pooling
- [ ] Monitor performance metrics

---

## Accessibility Checklist

- [ ] Semantic HTML
- [ ] ARIA labels
- [ ] Keyboard navigation
- [ ] Focus indicators
- [ ] Alt text for images
- [ ] Color contrast (WCAG AA)
- [ ] Screen reader testing
- [ ] Skip navigation links
- [ ] Form labels
- [ ] Error messages

---

## Documentation Requirements

For each task, document:
- API endpoints with examples
- Database schema changes
- Component props and usage
- Socket events
- Configuration options
- Deployment notes
- Known issues/limitations

---

## Deployment Checklist

- [ ] Run database migrations
- [ ] Update environment variables
- [ ] Build frontend assets
- [ ] Deploy backend services
- [ ] Deploy frontend
- [ ] Test in staging
- [ ] Monitor error logs
- [ ] Check performance metrics
- [ ] Verify real-time features
- [ ] Test mobile experience

---

## Support & Maintenance

### Monitoring
- Error tracking (Sentry)
- Performance monitoring (New Relic)
- User analytics (Google Analytics)
- Server metrics (Prometheus)

### Logging
- Structured logging
- Log levels (error, warn, info, debug)
- Request/response logging
- Error stack traces

### Alerts
- API errors > 5%
- Response time > 1s
- Database connection issues
- WebSocket disconnections
- File upload failures

---

## Resources

### Libraries & Tools
- **Backend:** Express, Socket.io, Multer, Sharp, Speakeasy
- **Frontend:** React, Next.js, Socket.io-client, React Query, Tailwind CSS
- **Database:** Prisma, PostgreSQL
- **Testing:** Vitest, Playwright
- **Deployment:** Docker, PM2, Nginx

### Documentation
- [Socket.io Docs](https://socket.io/docs/)
- [Prisma Docs](https://www.prisma.io/docs/)
- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

---

## Notes

- Follow existing MedThread code patterns
- Use TypeScript for type safety
- Write tests for critical functionality
- Document complex logic
- Keep components small and focused
- Optimize for performance
- Ensure mobile responsiveness
- Maintain accessibility standards

---

**Last Updated:** 2026-02-17
**Version:** 1.0
**Status:** Ready for Implementation
