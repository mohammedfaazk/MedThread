# Email Notification Service

This document describes the email notification features added to the EmailService for the MedThread notification system.

## Features

### 1. Instant Notification Emails

The `sendNotificationEmail` method sends immediate email notifications for individual events.

**Supported Notification Types:**
- `REPLY` - When someone replies to your post/comment
- `MENTION` - When you're mentioned with @username
- `AWARD` - When your content receives an award
- `FOLLOWER` - When someone follows you
- `APPOINTMENT_REQUEST` - New appointment request (for doctors)
- `APPOINTMENT_UPDATE` - Appointment status changes
- `VERIFICATION_STATUS` - Doctor verification status updates
- `COMMUNITY_INVITE` - Invitation to moderate a community
- `DIRECT_MESSAGE` - New direct message
- `SYSTEM_ANNOUNCEMENT` - System-wide announcements
- `UPVOTE_MILESTONE` - When your content reaches upvote milestones

**Usage:**
```typescript
await emailService.sendNotificationEmail(user, notification);
```

### 2. Digest Emails

The `sendDigestEmail` method sends aggregated notification summaries at configured intervals (daily or weekly).

**Features:**
- Groups notifications by type
- Shows counts for each notification type
- Displays up to 5 notifications per type with preview
- Indicates remaining notifications if more than 5
- Skips sending if no notifications exist

**Usage:**
```typescript
await emailService.sendDigestEmail(user, notifications, 'daily');
// or
await emailService.sendDigestEmail(user, notifications, 'weekly');
```

### 3. Unsubscribe Functionality

**Generate Unsubscribe Token:**
```typescript
const token = emailService.generateUnsubscribeToken(userId, notificationType);
```

**Handle Unsubscribe Request:**
```typescript
const result = await emailService.handleUnsubscribe(token);
if (result) {
  // Update user preferences to disable this notification type
  const { userId, notificationType } = result;
}
```

**Token Features:**
- JWT-based with 90-day expiration
- Signed with application secret
- Contains userId and notificationType
- Purpose-specific to prevent misuse

### 4. Branded Email Templates

All emails include:
- MedThread branded header with logo
- Consistent styling and formatting
- Unsubscribe link in footer (when applicable)
- Copyright notice
- Responsive design

## Email Template Structure

Each notification type has a custom template with:
- **Subject line** - Personalized with actor name and action
- **HTML content** - Rich formatted email with preview text and call-to-action
- **Plain text** - Fallback for email clients that don't support HTML

## Integration Points

### With Notification Service
The email service is called by the notification delivery system when:
1. A notification is created and user has instant email enabled
2. Digest job runs (daily/weekly) and user has digest email enabled

### With Preferences Service
Email delivery respects user preferences:
- Check if email notifications are enabled for the notification type
- Respect quiet hours settings
- Honor digest frequency preferences (daily/weekly)

## Environment Variables

Required environment variables:
- `JWT_SECRET` - Secret key for signing unsubscribe tokens
- `FRONTEND_URL` - Base URL for links in emails
- `EMAIL_PROVIDER` - Email provider (console, sendgrid, ses, smtp)
- Provider-specific credentials (SENDGRID_API_KEY, AWS credentials, SMTP settings)

## Testing

Comprehensive test suite covers:
- Token generation and validation
- All notification type templates
- Digest email grouping and formatting
- Empty notification handling
- Invalid token handling
- Expired token handling

Run tests with:
```bash
npm test -- email.service.test.ts
```

## Future Enhancements

Potential improvements:
1. HTML email template engine (Handlebars, Pug)
2. Email preview generation
3. A/B testing for email templates
4. Email open tracking
5. Click tracking for links
6. Localization support for multiple languages
7. Custom email templates per user preference
8. Rich media support (images, videos)
9. Email scheduling
10. Batch email sending optimization
