# Blocking System

## Overview
Secure blocking system that prevents all interactions between blocked users across the entire platform.

## Features
- ✅ Bidirectional blocking enforcement
- ✅ Automatic cleanup of relationships
- ✅ Global query filtering
- ✅ Middleware enforcement
- ✅ Real-time notifications
- ✅ Profile visibility control

## When User A Blocks User B

### Immediate Actions
1. **Remove Follow Relations** - Both directions unfollowed
2. **Deactivate Conversations** - All chats marked inactive
3. **Delete Notifications** - All notifications between users removed
4. **Cancel Appointments** - Pending/approved appointments cancelled
5. **Real-time Event** - Socket.IO notification sent to blocked user

### Ongoing Restrictions
- ❌ Cannot follow each other
- ❌ Cannot send messages
- ❌ Cannot see profiles
- ❌ Cannot book appointments
- ❌ Cannot receive notifications
- ❌ Filtered from all queries (posts, comments, search)

## API Endpoints

### Block a User
```
POST /api/block/:userId
Authorization: Bearer <token>
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "block_id",
    "blockerId": "user_a_id",
    "blockedId": "user_b_id",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "User blocked successfully"
}
```

### Unblock a User
```
DELETE /api/block/:userId
Authorization: Bearer <token>
```

### Check Block Status
```
GET /api/block/:userId/check
Authorization: Bearer <token>
```

Response:
```json
{
  "success": true,
  "data": {
    "isBlocked": true,  // Current user blocked target
    "hasBlock": true    // Any block exists between users
  }
}
```

### Get Blocked Users List
```
GET /api/block/list?cursor=<cursor>&limit=20
Authorization: Bearer <token>
```

## Middleware

### checkBlock
Prevents interactions between blocked users:

```typescript
import { checkBlock } from '../middleware/blockCheck';

router.post(
  '/follow/:userId',
  authenticate,
  checkBlock('userId'),  // Param name containing target user ID
  asyncHandler(async (req, res) => {
    // Will return 403 if blocked
  })
);
```

### attachBlockedUsers
Attaches blocked user IDs to request for query filtering:

```typescript
import { attachBlockedUsers } from '../middleware/blockCheck';

router.get(
  '/posts',
  authenticate,
  attachBlockedUsers,
  asyncHandler(async (req: AuthRequest, res) => {
    const blockedIds = req.blockedUserIds || [];
    
    // Filter query
    const posts = await prisma.post.findMany({
      where: {
        authorId: {
          notIn: blockedIds
        }
      }
    });
  })
);
```

## Service Methods

### blockUser
```typescript
await blockService.blockUser(blockerId, blockedId);
```

### unblockUser
```typescript
await blockService.unblockUser(blockerId, blockedId);
```

### isBlocked
Check if user A blocked user B:
```typescript
const blocked = await blockService.isBlocked(userA, userB);
```

### hasBlockBetween
Check if any block exists (either direction):
```typescript
const hasBlock = await blockService.hasBlockBetween(userA, userB);
```

### getBlockedUserIds
Get all blocked user IDs for filtering:
```typescript
const blockedIds = await blockService.getBlockedUserIds(userId);
```

## Integration Examples

### Follow System
```typescript
// In follow.service.ts
const hasBlock = await blockService.hasBlockBetween(followerId, followingId);
if (hasBlock) {
  throw new Error('Cannot follow blocked users');
}
```

### Profile Access
```typescript
// In profile.controller.ts
if (currentUserId && user.id !== currentUserId) {
  const { blockService } = await import('../services/block.service');
  const hasBlock = await blockService.hasBlockBetween(currentUserId, user.id);
  
  if (hasBlock) {
    return res.status(403).json({
      success: false,
      error: 'Profile not accessible',
    });
  }
}
```

### Query Filtering
```typescript
// In any service
const blockedIds = await blockService.getBlockedUserIds(currentUserId);

const posts = await prisma.post.findMany({
  where: {
    authorId: {
      notIn: blockedIds
    }
  }
});
```

### Chat System
```typescript
// In chat handler
socket.on('join_conversation', async (data) => {
  const hasBlock = await blockService.hasBlockBetween(userId, otherUserId);
  
  if (hasBlock) {
    socket.emit('access_denied', {
      reason: 'Cannot chat with blocked users'
    });
    return;
  }
});
```

## Frontend Components

### BlockButton
```tsx
import BlockButton from '@/components/BlockButton'

<BlockButton 
  userId={targetUserId}
  username={targetUsername}
  onBlockChange={(isBlocked) => {
    // Handle block state change
    if (isBlocked) {
      setIsFollowing(false)
    }
  }}
/>
```

## Database Schema

```prisma
model Block {
  id        String   @id @default(cuid())
  blockerId String
  blocker   User     @relation("Blocker", fields: [blockerId], references: [id])
  blockedId String
  blocked   User     @relation("Blocked", fields: [blockedId], references: [id])
  createdAt DateTime @default(now())

  @@unique([blockerId, blockedId])
  @@index([blockerId])
  @@index([blockedId])
}
```

## Real-time Events

### blocked_by_user
Emitted when a user is blocked:
```typescript
socket.on('blocked_by_user', (data) => {
  console.log('You were blocked by:', data.blockerId);
  // Redirect or show message
});
```

## Security Considerations

1. **Bidirectional Enforcement** - Blocks work both ways
2. **Cascade Cleanup** - All relationships automatically removed
3. **Query Filtering** - Blocked users filtered from all queries
4. **Profile Privacy** - Blocked users cannot access profiles
5. **No Bypass** - No way to interact with blocked users

## Performance Optimization

1. **Indexed Queries** - Block table has indexes on both user IDs
2. **Cached Blocked IDs** - Attach to request once, use multiple times
3. **Batch Operations** - Cleanup operations run in parallel
4. **Efficient Checks** - Single query checks both directions

## Testing

### Block a User
```bash
curl -X POST http://localhost:3001/api/block/USER_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Check Block Status
```bash
curl http://localhost:3001/api/block/USER_ID/check \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Unblock a User
```bash
curl -X DELETE http://localhost:3001/api/block/USER_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Future Enhancements

- [ ] Block reasons/reporting
- [ ] Temporary blocks (mute)
- [ ] Block history/audit log
- [ ] Admin override capabilities
- [ ] Bulk block operations
- [ ] Block suggestions based on behavior
