# Badge & Achievement System

## Overview
Production-ready badge and achievement system with automatic trigger evaluation, background job processing, and profile integration.

## Features
- ✅ Automatic badge evaluation on user actions
- ✅ Background job processing (non-blocking)
- ✅ Real-time notifications via Socket.IO
- ✅ Badge points and statistics
- ✅ Profile integration with display components
- ✅ Multiple badge categories and rarities

## Badge Categories

### 1. Appointment Badges
- **First Appointment** (10 pts) - Booked first appointment
- **Regular Patient** (50 pts) - 10 appointments completed
- **Health Conscious** (200 pts) - 50 appointments completed
- **Healthcare Champion** (500 pts) - 100 appointments completed

### 2. Consultation Badges (Doctors)
- **First Consultation** (10 pts) - Completed first consultation
- **Helping Hand** (50 pts) - 10 consultations completed
- **Dedicated Healer** (200 pts) - 50 consultations completed
- **Master Physician** (500 pts) - 100 consultations completed

### 3. Social Badges
- **First Follower** (10 pts) - Got first follower
- **Rising Star** (50 pts) - 10 followers
- **Popular Doctor** (200 pts) - 50 followers
- **Community Favorite** (500 pts) - 100 followers
- **Medical Influencer** (1000 pts) - 500 followers

### 4. Verification Badges
- **Verified Doctor** (100 pts) - Successfully verified
- **Verified Specialist** (200 pts) - Verified with specialty

### 5. Engagement Badges
- **First Post** (10 pts) - Created first post
- **Active Contributor** (50 pts) - 10 posts
- **Prolific Writer** (200 pts) - 50 posts
- **Helpful Contributor** (150 pts) - 100+ upvotes
- **Community Leader** (300 pts) - 500+ karma

### 6. Streak Badges
- **7-Day Streak** (50 pts) - Active 7 consecutive days
- **30-Day Streak** (200 pts) - Active 30 consecutive days
- **100-Day Streak** (500 pts) - Active 100 consecutive days

## Rarity Levels
- **COMMON** - Gray gradient
- **RARE** - Blue gradient
- **EPIC** - Purple gradient
- **LEGENDARY** - Gold gradient

## API Endpoints

### Get All Available Badges
```
GET /api/badges
```

### Get User's Badges
```
GET /api/badges/user/:userId
GET /api/badges/me (authenticated)
```

### Get Badge Statistics
```
GET /api/badges/user/:userId/stats
GET /api/badges/me/stats (authenticated)
```

### Trigger Badge Evaluation
```
POST /api/badges/evaluate (authenticated)
```

## Automatic Triggers

### Follow System
When a user gains a follower:
```typescript
import { badgeService } from './badge.service';
await badgeService.checkFollowerBadges(followingId);
```

### Post Creation
When a user creates a post:
```typescript
import { badgeService } from './badge.service';
await badgeService.checkEngagementBadges(authorId);
```

### Appointment Completion
When an appointment is completed:
```typescript
import { badgeService } from './badge.service';
await badgeService.checkAppointmentBadges(userId);
await badgeService.checkConsultationBadges(doctorId);
```

### Doctor Verification
When a doctor is verified:
```typescript
import { badgeService } from './badge.service';
await badgeService.checkVerificationBadges(userId);
```

## Background Job Processing

All badge checks run in background (non-blocking):
```typescript
badgeService.checkFollowerBadges(userId).catch(err => {
  console.error('Error checking badges:', err);
});
```

## Real-time Notifications

When a badge is earned:
1. Socket.IO event emitted: `badge_earned`
2. System notification created
3. Badge points added to user profile

## Frontend Components

### BadgeDisplay
Display user's badges with tooltips:
```tsx
import BadgeDisplay from '@/components/badges/BadgeDisplay'

<BadgeDisplay userId={userId} limit={6} />
<BadgeDisplay userId={userId} showAll={true} />
```

### BadgeStats
Show badge statistics and breakdown:
```tsx
import BadgeStats from '@/components/badges/BadgeStats'

<BadgeStats userId={userId} />
```

## Database Schema

```prisma
model User {
  badgePoints Int @default(0)
  badges      UserBadge[]
}

model UserBadge {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  badgeType String
  earnedAt  DateTime @default(now())

  @@unique([userId, badgeType])
}
```

## Adding New Badges

1. Add badge type to `BadgeType` enum in `badge.service.ts`
2. Add definition to `BADGE_DEFINITIONS`
3. Create check function if needed
4. Add trigger in relevant service

Example:
```typescript
export enum BadgeType {
  NEW_BADGE = 'NEW_BADGE',
}

const BADGE_DEFINITIONS: Record<BadgeType, BadgeDefinition> = {
  [BadgeType.NEW_BADGE]: {
    type: BadgeType.NEW_BADGE,
    name: 'New Badge',
    description: 'Description here',
    icon: '🎉',
    category: 'ENGAGEMENT',
    rarity: 'RARE',
    points: 50
  },
};

async checkNewBadge(userId: string): Promise<void> {
  // Check logic here
  if (condition) {
    await this.awardBadge(userId, BadgeType.NEW_BADGE);
  }
}
```

## Performance Considerations

- Badge checks run asynchronously (non-blocking)
- Duplicate badge prevention via unique constraint
- Indexed queries for fast lookups
- Cached badge definitions (no DB queries)
- Background job processing

## Testing

Manually trigger badge evaluation:
```bash
curl -X POST http://localhost:3001/api/badges/evaluate \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Future Enhancements

- [ ] Badge progress tracking (e.g., "45/50 consultations")
- [ ] Badge showcase (pin favorite badges)
- [ ] Badge leaderboards
- [ ] Seasonal/limited-time badges
- [ ] Badge trading/gifting
- [ ] Achievement notifications in-app
- [ ] Badge unlock animations
