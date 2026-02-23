# Notification Triggers Implementation

## Overview

This document describes the implementation of notification triggers in the post, comment, and award services for the MedThread notification system (Task 11).

## Requirements Implemented

- **Requirement 3.1**: REPLY notifications when users receive replies to posts/comments
- **Requirement 3.2**: MENTION notifications when users are mentioned using @username syntax
- **Requirement 3.3**: AWARD notifications when posts/comments receive awards
- **Requirement 3.11**: UPVOTE_MILESTONE notifications when posts/comments reach upvote thresholds

## Implementation Details

### 1. Comment Service (`comment.service.ts`)

#### REPLY Notifications

When a comment is created:
- If it's a top-level comment, a REPLY notification is sent to the post author
- If it's a reply to another comment, a REPLY notification is sent to the parent comment author
- Self-notifications are filtered out (users don't get notified when replying to themselves)

**Code Location**: `commentService.createComment()`

**Notification Metadata**:
```typescript
{
  title: 'New reply',
  body: `${username} replied to your ${isComment ? 'comment' : 'post'}`,
  preview: content.substring(0, 100),
  link: `/post/${postId}?comment=${commentId}`,
  communityName: communityDisplayName,
  postTitle: postTitle,
}
```

#### MENTION Notifications (Comments)

When a comment is created with @mentions:
1. `parseMentions()` extracts all unique usernames from the content
2. Users are looked up in the database (case-insensitive)
3. MENTION notifications are created for each mentioned user
4. Self-mentions are filtered out

**Code Location**: `commentService.createComment()` and `commentService.parseMentions()`

**Mention Parsing**:
- Regex: `/@(\w+)/g`
- Supports alphanumeric characters and underscores
- Returns unique usernames (duplicates removed)

#### UPVOTE_MILESTONE Notifications (Comments)

When a comment is upvoted:
1. Check if the upvote crosses a milestone threshold (10, 25, 50, 100, 250, 500, 1000, etc.)
2. Get the user's upvote threshold preference (default: 10)
3. Only trigger notification if milestone >= user's threshold
4. Self-votes don't trigger notifications

**Code Location**: `commentService.voteComment()`

**Milestones**: `[10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000]`

### 2. Post Service (`post.service.ts`)

#### MENTION Notifications (Posts)

When a post is created with @mentions:
1. Only processes mentions for published posts (not drafts)
2. `parseMentions()` extracts usernames from post content
3. Users are looked up and MENTION notifications are created
4. Self-mentions are filtered out

**Code Location**: `postService.createPost()` and `postService.parseMentions()`

#### UPVOTE_MILESTONE Notifications (Posts)

When a post is upvoted:
1. Same logic as comment upvote milestones
2. Checks user's threshold preference
3. Triggers notification when crossing milestone thresholds

**Code Location**: `postService.votePost()`

### 3. Award Service (`award.service.ts`)

#### AWARD Notifications

When an award is given to a post or comment:
1. Award transaction is completed (coins deducted, award record created)
2. Recipient is identified from post/comment author
3. AWARD notification is created with award details
4. Self-awards don't trigger notifications

**Code Location**: `awardService.giveAward()`

**Notification Metadata**:
```typescript
{
  title: 'You received an award!',
  body: `${giverUsername} gave you a ${awardName} award`,
  preview: contentPreview || contentTitle,
  link: linkToContent,
  communityName: communityDisplayName,
  postTitle: postTitle,
  awardName: awardName,
  awardIcon: awardIcon,
}
```

## Utility Functions

### `parseMentions(content: string): string[]`

Extracts @mentions from text content.

**Features**:
- Case-sensitive extraction (preserves original case)
- Removes duplicates (returns unique usernames)
- Supports alphanumeric characters and underscores
- Returns empty array if no mentions found

**Examples**:
```typescript
parseMentions('Hello @user1 and @user2!') 
// Returns: ['user1', 'user2']

parseMentions('@user1 @user1 @user1')
// Returns: ['user1']

parseMentions('No mentions here')
// Returns: []
```

## Error Handling

All notification triggers are wrapped in try-catch blocks to ensure that:
- Notification failures don't break core functionality (post/comment creation, voting, awards)
- Errors are logged for debugging
- Users can still interact with content even if notifications fail

## Integration with Notification Service

All triggers use the `notificationService.createNotification()` method which:
1. Filters recipients based on notification preferences
2. Filters out blocked users
3. Creates notification records in the database
4. Enqueues email delivery jobs (if enabled)
5. Handles socket delivery for real-time notifications

## Testing

### Unit Tests

Test file: `apps/api/src/services/__tests__/notification-triggers.test.ts`

Tests cover:
- REPLY notifications for posts and comments
- MENTION notifications for posts and comments
- UPVOTE_MILESTONE notifications
- Self-notification filtering
- Mention parsing edge cases

### Manual Testing

Test script: `apps/api/src/scripts/test-notification-triggers-simple.ts`

Run with: `npx tsx src/scripts/test-notification-triggers-simple.ts`

Validates:
- @mention parsing functionality
- All edge cases (duplicates, no mentions, special characters)

## Configuration

### Upvote Milestones

Defined in both `postService.votePost()` and `commentService.voteComment()`:
```typescript
const milestones = [10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000];
```

### User Preferences

Users can configure:
- Upvote threshold (minimum milestone to trigger notification)
- Notification channel preferences (in-app, email, push)
- Quiet hours (suppress notifications during specific times)

## Performance Considerations

1. **Async Notification Creation**: Notifications are created asynchronously to avoid blocking main operations
2. **Batch Processing**: Multiple recipients are processed in a single transaction
3. **Error Isolation**: Notification failures don't affect core functionality
4. **Preference Caching**: User preferences are cached to reduce database queries

## Future Enhancements

1. **Rich Mentions**: Support for mentioning with display names
2. **Mention Autocomplete**: Frontend autocomplete for @mentions
3. **Notification Grouping**: Group multiple mentions/replies into single notification
4. **Custom Milestones**: Allow users to set custom milestone thresholds
5. **Mention Analytics**: Track mention engagement and response rates

## Dependencies

- `@medthread/database` - Prisma client for database operations
- `notification.service.ts` - Core notification service
- `notification-preferences.service.ts` - User preference management
- `email-queue.service.ts` - Email delivery queue

## Breaking Changes

None. This implementation adds new functionality without modifying existing APIs.

## Migration Notes

No database migrations required. Uses existing notification system infrastructure.

## Circular Dependency Fix

Fixed circular dependency between `notification.service.ts` and `email-queue.service.ts` by using dynamic imports:

```typescript
// Before (circular dependency)
import { emailQueueService } from './email-queue.service';

// After (dynamic import)
const { emailQueueService } = await import('./email-queue.service');
```

This ensures the email queue service is loaded only when needed, avoiding initialization issues.
