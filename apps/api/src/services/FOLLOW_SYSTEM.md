# Follow System Documentation

## Overview
Production-ready follow system allowing users to follow verified doctors, view followers/following lists, and get personalized feeds.

## Database Schema

### Follow Model
```prisma
model Follow {
  id          String   @id @default(cuid())
  followerId  String
  follower    User     @relation("Following", fields: [followerId], references: [id])
  followingId String
  following   User     @relation("Followers", fields: [followingId], references: [id])
  createdAt   DateTime @default(now())

  @@unique([followerId, followingId])
  @@index([followerId])
  @@index([followingId])
}
```

**Indexes:**
- `followerId` - Fast lookup of who a user is following
- `followingId` - Fast lookup of a user's followers
- Unique constraint on `[followerId, followingId]` - Prevents duplicates

## Business Rules

1. **Can only follow verified doctors**
   - User must have `role: DOCTOR`
   - User must have `doctorVerificationStatus: APPROVED`

2. **Cannot follow self**
   - Validation prevents users from following themselves

3. **Cannot follow blocked users**
   - Checks both directions of blocking

4. **Duplicate prevention**
   - Unique constraint at database level
   - Service layer validation

5. **Notification integration**
   - Creates `FOLLOWER` notification when someone follows you

## API Endpoints

### Follow a User
```
POST /api/follow/:userId
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "follow_id",
    "followerId": "user_id",
    "followingId": "doctor_id",
    "createdAt": "2026-02-18T...",
    "following": {
      "id": "doctor_id",
      "username": "dr_smith",
      "avatar": "...",
      "role": "DOCTOR",
      "specialty": "Cardiology"
    }
  },
  "message": "Successfully followed user"
}
```

### Unfollow a User
```
DELETE /api/follow/:userId
Authorization: Bearer <token>
```

### Check if Following
```
GET /api/follow/:userId/check
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "isFollowing": true
  }
}
```

### Get Followers List
```
GET /api/follow/:userId/followers?cursor=<cursor>&limit=20
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "user_id",
      "username": "john_doe",
      "avatar": "...",
      "role": "PATIENT",
      "bio": "...",
      "totalKarma": 150,
      "verified": false
    }
  ],
  "pagination": {
    "nextCursor": "cursor_id",
    "hasMore": true
  }
}
```

### Get Following List
```
GET /api/follow/:userId/following?cursor=<cursor>&limit=20
```

### Get Follow Counts
```
GET /api/follow/:userId/counts
```

**Response:**
```json
{
  "success": true,
  "data": {
    "followersCount": 150,
    "followingCount": 25
  }
}
```

### Get Following Feed
```
GET /api/follow/feed?cursor=<cursor>&limit=20
Authorization: Bearer <token>
```

Returns posts from users you follow, ordered by creation date.

### Discover Doctors
```
GET /api/follow/discover?specialty=<specialty>&cursor=<cursor>&limit=20
Authorization: Bearer <token>
```

Returns verified doctors you're not following, ordered by karma.

### Bulk Check Following
```
POST /api/follow/check-multiple
Authorization: Bearer <token>
Content-Type: application/json

{
  "userIds": ["user1", "user2", "user3"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user1": true,
    "user2": false,
    "user3": true
  }
}
```

## Frontend Components

### FollowButton
```tsx
import FollowButton from '@/components/follow/FollowButton';

<FollowButton
  userId="doctor_id"
  initialIsFollowing={false}
  onFollowChange={(isFollowing) => console.log(isFollowing)}
  size="md"
  variant="primary"
/>
```

**Props:**
- `userId` - ID of user to follow
- `initialIsFollowing` - Initial follow state
- `onFollowChange` - Callback when follow state changes
- `size` - 'sm' | 'md' | 'lg'
- `variant` - 'primary' | 'secondary'

### FollowList
```tsx
import FollowList from '@/components/follow/FollowList';

<FollowList userId="user_id" type="followers" />
<FollowList userId="user_id" type="following" />
```

### DiscoverDoctors
```tsx
import DiscoverDoctors from '@/components/follow/DiscoverDoctors';

<DiscoverDoctors specialty="Cardiology" />
```

### FollowingFeed
```tsx
import FollowingFeed from '@/components/follow/FollowingFeed';

<FollowingFeed />
```

## Performance Optimizations

### Database Indexes
- Composite index on `[followerId, followingId]` for fast lookups
- Individual indexes on `followerId` and `followingId`

### Cursor Pagination
All list endpoints use cursor-based pagination for efficient large dataset handling.

### Query Optimization
- Uses `select` to fetch only needed fields
- Batch queries with `Promise.all` where possible
- Includes related data in single query (no N+1 problems)

### Caching Strategy (Recommended)
```typescript
// Redis caching for follow counts
const cacheKey = `follow:counts:${userId}`;
const cached = await redis.get(cacheKey);
if (cached) return JSON.parse(cached);

const counts = await getFollowCounts(userId);
await redis.setex(cacheKey, 300, JSON.stringify(counts)); // 5 min cache
```

## Error Handling

All endpoints return consistent error format:
```json
{
  "success": false,
  "error": "Error message"
}
```

**Common Errors:**
- `Cannot follow yourself` - 400
- `User not found` - 400
- `Can only follow verified doctors` - 400
- `Cannot follow blocked users` - 400
- `Already following this user` - 400
- `Not following this user` - 400

## Security

1. **Authentication Required**
   - All write operations require JWT token
   - Read operations (lists) are public

2. **Authorization Checks**
   - Validates user can only follow verified doctors
   - Checks blocking relationships

3. **Rate Limiting** (Recommended)
   ```typescript
   // Add rate limiting middleware
   app.use('/api/follow', rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 100 // limit each IP to 100 requests per windowMs
   }));
   ```

## Testing

### Unit Tests
```typescript
describe('FollowService', () => {
  it('should follow a verified doctor', async () => {
    const follow = await followService.followUser(userId, doctorId);
    expect(follow.followerId).toBe(userId);
  });

  it('should not allow following self', async () => {
    await expect(
      followService.followUser(userId, userId)
    ).rejects.toThrow('Cannot follow yourself');
  });

  it('should not allow following non-doctors', async () => {
    await expect(
      followService.followUser(userId, patientId)
    ).rejects.toThrow('Can only follow verified doctors');
  });
});
```

## Integration with Existing Systems

### Notifications
- Creates `FOLLOWER` notification when someone follows you
- Integrates with existing notification service

### Feed Aggregation
- `getFollowingFeed()` returns posts from followed users
- Can be used for personalized home feed

### User Profiles
- Display follower/following counts
- Show follow button on doctor profiles

## Future Enhancements

1. **Follow Suggestions**
   - ML-based recommendations
   - Similar specialty suggestions

2. **Follow Activity Feed**
   - See when people you follow interact with posts
   - Trending among followed users

3. **Follow Categories**
   - Organize followed doctors by specialty
   - Create custom lists

4. **Mutual Follows**
   - Highlight mutual connections
   - "Followed by X people you follow"

5. **Follow Limits**
   - Prevent spam by limiting follows per day
   - Premium users get higher limits
