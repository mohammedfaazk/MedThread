# Task 21: Karma System - Implementation Complete ✅

## Overview
Implemented a comprehensive karma system for MedThread that tracks user contributions through post and comment votes, provides karma milestones, leaderboards, and detailed analytics.

---

## What Was Implemented

### 1. Database Schema (Already Existed)
The User model already had karma fields:
- `postKarma` - Karma from post votes
- `commentKarma` - Karma from comment votes  
- `totalKarma` - Combined karma score

### 2. Karma Service (`apps/api/src/services/karma.service.ts`)

#### Core Features:
- **Karma Calculation**: Automatically calculates karma from all votes
- **Karma Breakdown**: Separate tracking for posts and comments
- **Karma Milestones**: 7 levels from Newcomer to Legend
- **Leaderboards**: Global, doctor-only, and specialty-specific
- **Rank Tracking**: User rank and percentile calculation
- **Platform Statistics**: Total karma, averages, and activity metrics

#### Karma Milestones:
1. 🌱 **Newcomer** (0-99 karma) - Gray
2. 📝 **Contributor** (100-499 karma) - Blue
3. ⭐ **Active Member** (500-999 karma) - Green
4. 💎 **Trusted Voice** (1,000-2,499 karma) - Purple
5. 🏆 **Expert** (2,500-4,999 karma) - Orange
6. 👑 **Master** (5,000-9,999 karma) - Red
7. 🌟 **Legend** (10,000+ karma) - Gold

### 3. API Routes (`apps/api/src/routes/karma.ts`)

#### Endpoints:
```
GET  /api/v1/karma/me                          - Get current user's karma
GET  /api/v1/karma/user/:userId                - Get specific user's karma
POST /api/v1/karma/update/:userId              - Manually recalculate karma
GET  /api/v1/karma/leaderboard                 - Global leaderboard (top 50)
GET  /api/v1/karma/leaderboard/doctors         - Doctor leaderboard
GET  /api/v1/karma/leaderboard/specialty/:name - Specialty leaderboard
GET  /api/v1/karma/rank/me                     - Get current user's rank
GET  /api/v1/karma/rank/:userId                - Get specific user's rank
GET  /api/v1/karma/milestones                  - Get all milestone definitions
GET  /api/v1/karma/stats                       - Platform-wide karma stats
```

### 4. Frontend Components

#### KarmaDisplay Component (`apps/web/src/components/KarmaDisplay.tsx`)
- Displays total karma with milestone badge
- Shows karma breakdown (posts vs comments)
- Progress bar to next milestone
- Responsive sizing (small, medium, large)
- Color-coded by milestone level

#### Leaderboard Page (`apps/web/src/app/leaderboard/page.tsx`)
- Global and doctor-only leaderboards
- Top 50 users with rankings
- Special icons for top 3 (crown, medals)
- Platform statistics dashboard
- User profiles with karma breakdown
- Milestone badges and colors
- Responsive design with Liquid Glass UI

### 5. Integration with Existing Systems

#### Updated Services:
- **post.service.ts**: Uses centralized karma service for updates
- **comment.service.ts**: Uses centralized karma service for updates
- Removed duplicate `updateUserKarma` functions
- Karma updates automatically on vote changes

---

## API Usage Examples

### Get Current User's Karma
```bash
GET /api/v1/karma/me
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "postKarma": 450,
    "commentKarma": 320,
    "totalKarma": 770,
    "postCount": 25,
    "commentCount": 89,
    "averagePostKarma": 18.0,
    "averageCommentKarma": 3.6,
    "milestone": {
      "level": 3,
      "name": "Active Member",
      "minKarma": 500,
      "maxKarma": 999,
      "badge": "⭐",
      "color": "#34d399"
    }
  }
}
```

### Get Leaderboard
```bash
GET /api/v1/karma/leaderboard?limit=10&offset=0

Response:
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "user123",
        "username": "dr_smith",
        "avatar": "...",
        "role": "VERIFIED_DOCTOR",
        "verified": true,
        "specialty": "Cardiology",
        "totalKarma": 5420,
        "postKarma": 3200,
        "commentKarma": 2220,
        "rank": 1,
        "milestone": {
          "level": 6,
          "name": "Master",
          "badge": "👑",
          "color": "#ef4444"
        },
        "_count": {
          "posts": 145,
          "comments": 523
        }
      }
    ],
    "pagination": {
      "limit": 10,
      "offset": 0,
      "total": 1250,
      "totalPages": 125
    }
  }
}
```

### Get User Rank
```bash
GET /api/v1/karma/rank/me
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "rank": 42,
    "totalUsers": 1250,
    "percentile": 96.64
  }
}
```

### Get Platform Stats
```bash
GET /api/v1/karma/stats

Response:
{
  "success": true,
  "data": {
    "totalKarma": 125430,
    "averageKarma": 100,
    "topUser": {
      "username": "dr_smith",
      "totalKarma": 5420,
      "avatar": "..."
    },
    "recentVotes24h": 1523
  }
}
```

---

## Frontend Usage

### Using KarmaDisplay Component
```tsx
import { KarmaDisplay } from '@/components/KarmaDisplay'

// In your component
<KarmaDisplay
  postKarma={450}
  commentKarma={320}
  totalKarma={770}
  postCount={25}
  commentCount={89}
  milestone={milestone}
  showBreakdown={true}
  size="medium"
/>
```

### Accessing Leaderboard
Navigate to `/leaderboard` to view:
- Global leaderboard (all users)
- Doctor leaderboard (verified doctors only)
- Platform statistics
- User rankings with milestone badges

---

## How Karma Works

### Karma Calculation
1. **Post Karma**: Sum of all votes on user's posts
   - Upvote = +1 karma
   - Downvote = -1 karma

2. **Comment Karma**: Sum of all votes on user's comments
   - Upvote = +1 karma
   - Downvote = -1 karma

3. **Total Karma**: Post Karma + Comment Karma

### Automatic Updates
Karma is automatically recalculated when:
- A user votes on a post
- A user votes on a comment
- A vote is changed (upvote → downvote or vice versa)
- A vote is removed (toggle off)

### Manual Recalculation
Users can manually trigger karma recalculation:
```bash
POST /api/v1/karma/update/:userId
Authorization: Bearer <token>
```

---

## Leaderboard Features

### Global Leaderboard
- Shows top 50 users by total karma
- Includes all user types (patients, doctors, etc.)
- Excludes suspended and shadow-banned users

### Doctor Leaderboard
- Shows top 50 verified doctors
- Filters by `doctorVerificationStatus: 'APPROVED'`
- Displays specialty and experience

### Specialty Leaderboard
- Filter doctors by medical specialty
- Case-insensitive search
- Top 20 per specialty

### Ranking Display
- 🥇 Rank 1: Crown icon (gold)
- 🥈 Rank 2: Medal icon (silver)
- 🥉 Rank 3: Medal icon (bronze)
- Others: #4, #5, etc.

---

## Performance Considerations

### Optimizations Implemented:
1. **Indexed Fields**: `totalKarma` field is indexed for fast sorting
2. **Aggregation**: Uses Prisma aggregation for efficient vote counting
3. **Pagination**: All leaderboards support limit/offset pagination
4. **Selective Fields**: Only fetches necessary user data
5. **Caching Ready**: Karma values stored in database for quick access

### Future Optimizations:
1. **Background Jobs**: Calculate karma asynchronously with cron jobs
2. **Redis Caching**: Cache leaderboards for 5-10 minutes
3. **Materialized Views**: Pre-calculate rankings for faster queries
4. **Incremental Updates**: Update karma incrementally instead of full recalculation

---

## Testing Checklist

### Backend Tests
- [x] Karma calculation from votes
- [x] Milestone assignment
- [x] Leaderboard sorting
- [x] Rank calculation
- [x] Specialty filtering
- [x] Pagination
- [x] Authorization (own karma vs others)

### Frontend Tests
- [x] KarmaDisplay component renders
- [x] Milestone badges display correctly
- [x] Progress bar shows correct percentage
- [x] Leaderboard page loads
- [x] Tab switching (all vs doctors)
- [x] User profile links work
- [x] Responsive design

### Integration Tests
- [x] Karma updates on vote
- [x] Karma persists across sessions
- [x] Leaderboard reflects recent changes
- [x] Rank updates correctly

---

## Files Created/Modified

### Created:
- `apps/api/src/services/karma.service.ts` - Karma business logic
- `apps/api/src/routes/karma.ts` - API endpoints (uses `authenticate` middleware)
- `apps/web/src/components/KarmaDisplay.tsx` - Karma display component
- `apps/web/src/app/leaderboard/page.tsx` - Leaderboard page

### Modified:
- `apps/api/src/index.ts` - Registered karma routes
- `apps/api/src/services/post.service.ts` - Use centralized karma service
- `apps/api/src/services/comment.service.ts` - Use centralized karma service

### Fixed:
- Corrected auth middleware import (changed from `auth` to `authenticate`)

---

## Next Steps (Optional Enhancements)

### Phase 2 Features:
1. **Karma History**: Track karma changes over time
2. **Karma Notifications**: Notify users of milestone achievements
3. **Karma Badges**: Display badges on user profiles
4. **Karma Rewards**: Unlock features at certain karma levels
5. **Weekly/Monthly Leaderboards**: Time-based rankings
6. **Community Leaderboards**: Per-community karma rankings
7. **Karma Decay**: Reduce karma over time for inactive users
8. **Karma Multipliers**: Bonus karma for quality content

### Analytics:
1. **Karma Trends**: Graph of karma growth over time
2. **Top Contributors**: Daily/weekly/monthly top earners
3. **Karma Distribution**: Histogram of karma across users
4. **Engagement Metrics**: Correlation between karma and activity

---

## Status
✅ **COMPLETE** - All core features implemented and tested

## Summary
The karma system is fully functional with automatic calculation, milestone tracking, multiple leaderboards, and a beautiful UI. Users can now earn karma through contributions, track their progress, and compete on leaderboards. The system is performant, scalable, and ready for production use.
