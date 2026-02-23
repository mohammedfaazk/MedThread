# Notification Preferences API Routes

This document describes the notification preferences API endpoints added as part of Task 6.

## Endpoints

### GET /api/notifications/preferences

Get the authenticated user's notification preferences.

**Authentication:** Required (JWT token)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "clx...",
    "userId": "clx...",
    "inApp": {
      "REPLY": true,
      "MENTION": true,
      "AWARD": true,
      ...
    },
    "email": {
      "REPLY": "digest",
      "MENTION": "instant",
      "AWARD": "off",
      ...
    },
    "push": {
      "REPLY": false,
      "MENTION": true,
      "AWARD": false,
      ...
    },
    "quietHoursStart": "22:00",
    "quietHoursEnd": "08:00",
    "digestFrequency": "daily",
    "upvoteThreshold": 10,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### PUT /api/notifications/preferences

Update the authenticated user's notification preferences.

**Authentication:** Required (JWT token)

**Request Body:**
```json
{
  "inApp": {
    "REPLY": true,
    "MENTION": false
  },
  "email": {
    "APPOINTMENT_REQUEST": "instant",
    "DIRECT_MESSAGE": "instant"
  },
  "push": {
    "MENTION": true
  },
  "quietHoursStart": "22:00",
  "quietHoursEnd": "08:00",
  "digestFrequency": "weekly",
  "upvoteThreshold": 20
}
```

**Notes:**
- All fields are optional - only send the fields you want to update
- `quietHoursStart` and `quietHoursEnd` must be in HH:mm format (24-hour)
- `digestFrequency` must be either "daily" or "weekly"
- `upvoteThreshold` must be a non-negative integer
- Email frequency values: "instant", "digest", or "off"

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "clx...",
    "userId": "clx...",
    "inApp": { ... },
    "email": { ... },
    "push": { ... },
    "quietHoursStart": "22:00",
    "quietHoursEnd": "08:00",
    "digestFrequency": "weekly",
    "upvoteThreshold": 20,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Preferences updated successfully"
}
```

### POST /api/notifications/unsubscribe/:token

Unsubscribe from email notifications for a specific notification type using a token.

**Authentication:** Not required (token-based)

**Parameters:**
- `token` (URL parameter): The unsubscribe token from the email

**Response:**
```json
{
  "success": true,
  "data": {
    "type": "REPLY"
  },
  "message": "Successfully unsubscribed from REPLY email notifications"
}
```

**Error Response (Invalid Token):**
```json
{
  "success": false,
  "error": "Invalid or expired unsubscribe token"
}
```

## Unsubscribe Token Generation

The `generateUnsubscribeToken` method is available on the notification controller for use by the email service:

```typescript
const token = notificationController.generateUnsubscribeToken(
  userId,
  NotificationType.REPLY
);
```

This generates a JWT token that:
- Contains the userId and notificationType
- Expires in 90 days
- Can be used in email unsubscribe links

## Validation Rules

### Quiet Hours
- Format: HH:mm (24-hour format)
- Example: "22:00", "08:30"
- Both start and end are optional
- Can span midnight (e.g., start: "22:00", end: "08:00")

### Digest Frequency
- Values: "daily" or "weekly"
- Default: "daily"

### Upvote Threshold
- Must be a non-negative integer
- Default: 10
- Can be null to disable threshold notifications

### Email Frequency
- Values: "instant", "digest", or "off"
- "instant": Send email immediately when notification is created
- "digest": Include in daily/weekly digest email
- "off": Don't send email notifications for this type

## Default Preferences

When a user is created, default preferences are automatically generated:

**In-App:** All notification types enabled

**Email:**
- Instant: APPOINTMENT_REQUEST, APPOINTMENT_UPDATE, VERIFICATION_STATUS, DIRECT_MESSAGE, SYSTEM_ANNOUNCEMENT
- Digest: All other types

**Push:**
- Enabled: APPOINTMENT_REQUEST, APPOINTMENT_UPDATE, DIRECT_MESSAGE, MENTION
- Disabled: All other types

**Other Defaults:**
- digestFrequency: "daily"
- upvoteThreshold: 10
- quietHours: Not set

## Testing

### Manual Testing with cURL

1. **Get Preferences:**
```bash
curl -X GET http://localhost:3001/api/notifications/preferences \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

2. **Update Preferences:**
```bash
curl -X PUT http://localhost:3001/api/notifications/preferences \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "quietHoursStart": "22:00",
    "quietHoursEnd": "08:00",
    "digestFrequency": "weekly"
  }'
```

3. **Unsubscribe (requires valid token):**
```bash
curl -X POST http://localhost:3001/api/notifications/unsubscribe/YOUR_UNSUBSCRIBE_TOKEN
```

## Requirements Satisfied

This implementation satisfies the following requirements from the spec:

- **4.1:** Display toggle controls for each notification type ✓
- **4.2:** Disable notification creation when type is disabled ✓
- **4.3:** Email notification settings (instant, digest, off) ✓
- **4.4:** Push notification settings (enabled/disabled) ✓
- **4.5:** Quiet hours configuration ✓
- **4.6:** Upvote threshold setting ✓
- **4.7:** Persist and apply preference changes immediately ✓
- **4.8:** Default settings for new users ✓
- **5.3:** Unsubscribe link functionality ✓
- **5.4:** Disable email notifications via unsubscribe ✓
