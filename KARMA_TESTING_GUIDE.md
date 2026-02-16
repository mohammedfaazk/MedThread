# Karma System Testing Guide

## Quick Start

### 1. Start the API Server
```bash
cd apps/api
npm run dev
```

### 2. Start the Web App
```bash
cd apps/web
npm run dev
```

---

## API Testing

### Test Karma Endpoints

#### 1. Get Your Karma
```bash
# Login first to get token
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your@email.com","password":"yourpassword"}'

# Get your karma
curl http://localhost:3001/api/v1/karma/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Expected Response:
```json
{
  "success": true,
  "data": {
    "postKarma": 0,
    "commentKarma": 0,
    "totalKarma": 0,
    "postCount": 0,
    "commentCount": 0,
    "averagePostKarma": 0,
    "averageCommentKarma": 0,
    "milestone": {
      "level": 1,
      "name": "Newcomer",
      "minKarma": 0,
      "maxKarma": 99,
      "badge": "🌱",
      "color": "#94a3b8"
    }
  }
}
```

#### 2. Get Leaderboard
```bash
curl http://localhost:3001/api/v1/karma/leaderboard?limit=10
```

#### 3. Get Doctor Leaderboard
```bash
curl http://localhost:3001/api/v1/karma/leaderboard/doctors?limit=10
```

#### 4. Get Your Rank
```bash
curl http://localhost:3001/api/v1/karma/rank/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### 5. Get Platform Stats
```bash
curl http://localhost:3001/api/v1/karma/stats
```

#### 6. Get Milestones
```bash
curl http://localhost:3001/api/v1/karma/milestones
```

---

## Frontend Testing

### 1. View Leaderboard
1. Navigate to http://localhost:3000
2. Login with your account
3. Click "Leaderboard" in the sidebar
4. You should see:
   - Platform statistics at the top
   - Tabs for "All Users" and "Doctors Only"
   - List of top users with karma breakdown
   - Milestone badges and colors

### 2. Earn Karma
1. Create a post
2. Have another user upvote your post
3. Check your karma:
   - Visit `/leaderboard`
   - Your rank should update
   - Your karma should increase by 1

### 3. Test Karma Display
1. Visit any user profile
2. You should see their karma displayed
3. Milestone badge should be visible
4. Karma breakdown (posts vs comments) should show

### 4. Test Milestones
Create test data to reach different milestones:
- 0-99 karma: 🌱 Newcomer (Gray)
- 100-499 karma: 📝 Contributor (Blue)
- 500-999 karma: ⭐ Active Member (Green)
- 1,000-2,499 karma: 💎 Trusted Voice (Purple)
- 2,500-4,999 karma: 🏆 Expert (Orange)
- 5,000-9,999 karma: 👑 Master (Red)
- 10,000+ karma: 🌟 Legend (Gold)

---

## Integration Testing

### Test Karma Updates on Voting

#### Scenario 1: Upvote a Post
1. User A creates a post
2. User B upvotes the post
3. Check User A's karma:
   ```bash
   curl http://localhost:3001/api/v1/karma/user/USER_A_ID
   ```
4. `postKarma` should increase by 1
5. `totalKarma` should increase by 1

#### Scenario 2: Downvote a Post
1. User A creates a post
2. User B downvotes the post
3. Check User A's karma
4. `postKarma` should decrease by 1
5. `totalKarma` should decrease by 1

#### Scenario 3: Toggle Vote
1. User A creates a post
2. User B upvotes the post (karma +1)
3. User B clicks upvote again (removes vote, karma back to 0)
4. Check User A's karma - should be back to original

#### Scenario 4: Change Vote
1. User A creates a post
2. User B upvotes the post (karma +1)
3. User B changes to downvote (karma -2 total: -1 from removing upvote, -1 from downvote)
4. Check User A's karma

#### Scenario 5: Comment Karma
1. User A creates a comment
2. User B upvotes the comment
3. Check User A's karma
4. `commentKarma` should increase by 1
5. `totalKarma` should increase by 1

---

## Database Testing

### Check Karma Values Directly
```sql
-- Connect to your database
psql -U your_user -d medthread

-- Check user karma
SELECT username, "postKarma", "commentKarma", "totalKarma" 
FROM "User" 
ORDER BY "totalKarma" DESC 
LIMIT 10;

-- Check vote counts
SELECT 
  u.username,
  COUNT(DISTINCT v."postId") as posts_voted_on,
  COUNT(DISTINCT v."commentId") as comments_voted_on,
  SUM(CASE WHEN v."postId" IS NOT NULL THEN v.value ELSE 0 END) as post_karma,
  SUM(CASE WHEN v."commentId" IS NOT NULL THEN v.value ELSE 0 END) as comment_karma
FROM "User" u
LEFT JOIN "Post" p ON p."authorId" = u.id
LEFT JOIN "Comment" c ON c."authorId" = u.id
LEFT JOIN "Vote" v ON (v."postId" = p.id OR v."commentId" = c.id)
GROUP BY u.id, u.username
ORDER BY (post_karma + comment_karma) DESC
LIMIT 10;
```

---

## Performance Testing

### Test Leaderboard Performance
```bash
# Time the leaderboard request
time curl http://localhost:3001/api/v1/karma/leaderboard?limit=50

# Should complete in < 500ms
```

### Test Karma Calculation Performance
```bash
# Time karma update for a user
time curl -X POST http://localhost:3001/api/v1/karma/update/USER_ID \
  -H "Authorization: Bearer YOUR_TOKEN"

# Should complete in < 1000ms
```

---

## Edge Cases to Test

### 1. User with No Posts/Comments
- Karma should be 0
- Milestone should be "Newcomer"
- Should appear at bottom of leaderboard

### 2. User with Negative Karma
- Create posts/comments
- Have them all downvoted
- Karma can go negative
- Should still show milestone (Newcomer)

### 3. Suspended User
- Suspended users should NOT appear in leaderboard
- Their karma should still be calculated
- They can still view their own karma

### 4. Deleted Posts/Comments
- When a post is deleted, votes should be removed
- Karma should recalculate correctly
- Use soft delete to maintain karma history

### 5. Large Numbers
- Test with users having 10,000+ karma
- Numbers should format with commas (10,000 not 10000)
- Percentages should be accurate

---

## Common Issues & Solutions

### Issue: Karma Not Updating
**Solution**: Check that karma service is being called after votes
```typescript
// In post.service.ts and comment.service.ts
const { karmaService } = await import('./karma.service');
await karmaService.updateUserKarma(authorId);
```

### Issue: Leaderboard Empty
**Solution**: 
1. Check that users exist in database
2. Check that users are not suspended
3. Check API response for errors

### Issue: Milestone Not Showing
**Solution**: 
1. Verify karma value is correct
2. Check milestone thresholds in karma.service.ts
3. Ensure milestone is being returned in API response

### Issue: Rank Calculation Wrong
**Solution**:
1. Verify totalKarma index exists in database
2. Check that suspended users are excluded
3. Recalculate karma for all users

---

## Automated Testing (Future)

### Unit Tests
```typescript
// karma.service.test.ts
describe('KarmaService', () => {
  it('should calculate karma correctly', async () => {
    const karma = await karmaService.updateUserKarma(userId);
    expect(karma.totalKarma).toBe(expectedKarma);
  });

  it('should assign correct milestone', () => {
    const milestone = karmaService.getKarmaMilestone(500);
    expect(milestone.name).toBe('Active Member');
  });

  it('should rank users correctly', async () => {
    const leaderboard = await karmaService.getLeaderboard(10);
    expect(leaderboard.users[0].rank).toBe(1);
  });
});
```

### Integration Tests
```typescript
// karma.integration.test.ts
describe('Karma Integration', () => {
  it('should update karma when post is upvoted', async () => {
    // Create post
    // Upvote post
    // Check karma increased
  });

  it('should update leaderboard when karma changes', async () => {
    // Get initial leaderboard
    // Earn karma
    // Check leaderboard updated
  });
});
```

---

## Success Criteria

✅ Karma calculates correctly from votes
✅ Milestones assign correctly based on karma
✅ Leaderboard shows top users
✅ Rank calculation is accurate
✅ Frontend displays karma beautifully
✅ Performance is acceptable (< 500ms for leaderboard)
✅ No errors in console
✅ Karma persists across sessions

---

## Next Steps After Testing

1. Monitor karma calculation performance
2. Add caching for leaderboards (Redis)
3. Create background job for karma recalculation
4. Add karma notifications
5. Implement karma badges on profiles
6. Add karma history tracking
