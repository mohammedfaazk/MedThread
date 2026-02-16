# Person 1: Core Content & Posts System Implementation Guide

**Branch:** `feature/posts-communities`

**Assigned Tasks:** 1, 2, 3, 4, 16, 17, 21, 22

---

## 📋 Overview

You're responsible for building the core Reddit-like functionality that powers MedThread's community features. This includes posts, communities, comments, search, karma, and awards systems.

---

## 🎯 Task Breakdown

### **Task 1: Fix Data Persistence (localStorage → Database)**
**Priority:** 🔴 CRITICAL - Do this FIRST

**Current State:**
- Posts, comments, and votes are stored in Zustand with localStorage
- Data is lost on refresh or not shared across users
- Located in: `apps/web/src/store/useStore.ts`

**What to Build:**

1. **Database Schema** (Prisma)
```prisma
// packages/database/prisma/schema.prisma

model Post {
  id                String    @id @default(cuid())
  type              PostType  @default(TEXT)
  title             String
  content           String?   @db.Text
  authorId          String
  author            User      @relation(fields: [authorId], references: [id])
  communityId       String?
  community         Community? @relation(fields: [communityId], references: [id])
  tags              String[]
  isPinned          Boolean   @default(false)
  isHidden          Boolean   @default(false)
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  votes             Vote[]
  comments          Comment[]
  savedBy           SavedPost[]
  awards            PostAward[]
  
  @@index([authorId])
  @@index([communityId])
  @@index([createdAt])
}

enum PostType {
  TEXT
  IMAGE
  LINK
  POLL
}

model Vote {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  postId    String?
  post      Post?    @relation(fields: [postId], references: [id])
  commentId String?
  comment   Comment? @relation(fields: [commentId], references: [id])
  value     Int      // 1 for upvote, -1 for downvote
  createdAt DateTime @default(now())
  
  @@unique([userId, postId])
  @@unique([userId, commentId])
  @@index([postId])
  @@index([commentId])
}

model Comment {
  id        String    @id @default(cuid())
  content   String    @db.Text
  authorId  String
  author    User      @relation(fields: [authorId], references: [id])
  postId    String
  post      Post      @relation(fields: [postId], references: [id])
  parentId  String?
  parent    Comment?  @relation("CommentReplies", fields: [parentId], references: [id])
  replies   Comment[] @relation("CommentReplies")
  depth     Int       @default(0)
  isCollapsed Boolean @default(false)
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  
  votes     Vote[]
  
  @@index([postId])
  @@index([parentId])
  @@index([authorId])
}

model SavedPost {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  postId    String
  post      Post     @relation(fields: [postId], references: [id])
  createdAt DateTime @default(now())
  
  @@unique([userId, postId])
  @@index([userId])
}
```

2. **API Routes to Create**
```
POST   /api/v1/posts              - Create post
GET    /api/v1/posts              - List posts (with filters)
GET    /api/v1/posts/:id          - Get single post
PUT    /api/v1/posts/:id          - Update post
DELETE /api/v1/posts/:id          - Delete post
POST   /api/v1/posts/:id/vote     - Vote on post
POST   /api/v1/posts/:id/save     - Save/unsave post
POST   /api/v1/posts/:id/hide     - Hide post

POST   /api/v1/comments           - Create comment
GET    /api/v1/comments           - List comments (by post)
PUT    /api/v1/comments/:id       - Update comment
DELETE /api/v1/comments/:id       - Delete comment
POST   /api/v1/comments/:id/vote  - Vote on comment
```

3. **Migration Steps**
```bash
# 1. Add schema to prisma
cd packages/database
npx prisma format
npx prisma generate
npx prisma db push

# 2. Create migration
npx prisma migrate dev --name add_posts_system
```

4. **Update Zustand Store**
- Replace localStorage with API calls
- Keep optimistic updates for better UX
- Add loading and error states

**Files to Modify:**
- `packages/database/prisma/schema.prisma`
- `apps/api/src/routes/posts.ts` (create)
- `apps/api/src/routes/comments.ts` (create)
- `apps/api/src/services/post.service.ts` (create)
- `apps/api/src/services/comment.service.ts` (create)
- `apps/web/src/store/useStore.ts` (update)

---

### **Task 2: Posts System**
**Priority:** 🔴 HIGH

**Features to Implement:**

1. **Create Post**
   - Text posts with title + content
   - Image posts (upload to storage)
   - Link posts with preview
   - Tag selection
   - Community selection
   - Draft saving

2. **Edit Post**
   - Only author can edit
   - Show "edited" indicator
   - Edit history (optional)

3. **Delete Post**
   - Soft delete (mark as deleted)
   - Only author or moderator can delete
   - Show [deleted] placeholder

4. **Vote System**
   - Upvote/downvote toggle
   - Update score in real-time
   - Prevent double voting
   - Show user's vote state

5. **Save Post**
   - Save for later viewing
   - Saved posts page
   - Unsave functionality

6. **Hide Post**
   - Hide from feed
   - Hidden posts page
   - Unhide functionality

**API Endpoints:**
```typescript
// apps/api/src/routes/posts.ts
import { Router } from 'express';
import { auth } from '../middleware/auth';
import { postService } from '../services/post.service';

const router = Router();

router.post('/', auth, async (req, res) => {
  const { title, content, type, communityId, tags } = req.body;
  const post = await postService.createPost({
    title,
    content,
    type,
    authorId: req.userId!,
    communityId,
    tags
  });
  res.json(post);
});

router.get('/', async (req, res) => {
  const { community, sort, limit, offset } = req.query;
  const posts = await postService.getPosts({
    community: community as string,
    sort: sort as string,
    limit: Number(limit) || 20,
    offset: Number(offset) || 0
  });
  res.json(posts);
});

router.post('/:id/vote', auth, async (req, res) => {
  const { value } = req.body; // 1 or -1
  const result = await postService.votePost(
    req.params.id,
    req.userId!,
    value
  );
  res.json(result);
});
```

**Service Layer:**
```typescript
// apps/api/src/services/post.service.ts
import { prisma } from '@medthread/database';

export const postService = {
  async createPost(data: CreatePostInput) {
    return await prisma.post.create({
      data: {
        ...data,
        tags: data.tags || []
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            role: true
          }
        },
        community: true,
        _count: {
          select: {
            votes: true,
            comments: true
          }
        }
      }
    });
  },

  async votePost(postId: string, userId: string, value: number) {
    // Check if vote exists
    const existingVote = await prisma.vote.findUnique({
      where: {
        userId_postId: { userId, postId }
      }
    });

    if (existingVote) {
      if (existingVote.value === value) {
        // Remove vote (toggle off)
        await prisma.vote.delete({
          where: { id: existingVote.id }
        });
      } else {
        // Update vote
        await prisma.vote.update({
          where: { id: existingVote.id },
          data: { value }
        });
      }
    } else {
      // Create new vote
      await prisma.vote.create({
        data: { userId, postId, value }
      });
    }

    // Calculate new score
    const votes = await prisma.vote.groupBy({
      by: ['postId'],
      where: { postId },
      _sum: { value: true }
    });

    return {
      score: votes[0]?._sum.value || 0
    };
  }
};
```

---

### **Task 3: Communities System**
**Priority:** 🟡 MEDIUM

**Database Schema:**
```prisma
model Community {
  id          String   @id @default(cuid())
  name        String   @unique
  slug        String   @unique
  description String?  @db.Text
  icon        String?
  banner      String?
  createdById String
  createdBy   User     @relation("CommunityCreator", fields: [createdById], references: [id])
  createdAt   DateTime @default(now())
  
  posts       Post[]
  members     CommunityMember[]
  moderators  CommunityModerator[]
  
  @@index([slug])
}

model CommunityMember {
  id          String    @id @default(cuid())
  userId      String
  user        User      @relation(fields: [userId], references: [id])
  communityId String
  community   Community @relation(fields: [communityId], references: [id])
  joinedAt    DateTime  @default(now())
  
  @@unique([userId, communityId])
  @@index([communityId])
}

model CommunityModerator {
  id          String    @id @default(cuid())
  userId      String
  user        User      @relation(fields: [userId], references: [id])
  communityId String
  community   Community @relation(fields: [communityId], references: [id])
  permissions String[]  // ["posts", "comments", "members", "settings"]
  addedAt     DateTime  @default(now())
  
  @@unique([userId, communityId])
  @@index([communityId])
}
```

**Features:**
1. Create community (name, description, icon)
2. Join/leave community
3. Community feed (posts from that community)
4. Member list
5. Moderator actions (pin, remove posts)

---

### **Task 4: Comments System**
**Priority:** 🔴 HIGH

**Features:**
1. **Reply to Post** - Top-level comments
2. **Reply to Comment** - Nested replies (up to 10 levels)
3. **Edit Comment** - With "edited" indicator
4. **Delete Comment** - Soft delete with [deleted] placeholder
5. **Vote on Comments** - Upvote/downvote
6. **Collapse/Expand** - Collapse comment threads

**Recursive Comment Loading:**
```typescript
// apps/api/src/services/comment.service.ts
export const commentService = {
  async getCommentTree(postId: string) {
    const comments = await prisma.comment.findMany({
      where: { postId },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            role: true
          }
        },
        votes: true,
        _count: {
          select: { replies: true }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    // Build tree structure
    const commentMap = new Map();
    const rootComments = [];

    comments.forEach(comment => {
      commentMap.set(comment.id, { ...comment, replies: [] });
    });

    comments.forEach(comment => {
      if (comment.parentId) {
        const parent = commentMap.get(comment.parentId);
        if (parent) {
          parent.replies.push(commentMap.get(comment.id));
        }
      } else {
        rootComments.push(commentMap.get(comment.id));
      }
    });

    return rootComments;
  }
};
```

---

### **Task 16: Search & Discovery**
**Priority:** 🟡 MEDIUM

**Search Endpoints:**
```typescript
GET /api/v1/search?q=query&type=posts|users|communities
GET /api/v1/search/posts?q=query&community=slug
GET /api/v1/search/users?q=query&role=doctor
GET /api/v1/search/communities?q=query
```

**Implementation:**
```typescript
// Full-text search using Prisma
const posts = await prisma.post.findMany({
  where: {
    OR: [
      { title: { contains: query, mode: 'insensitive' } },
      { content: { contains: query, mode: 'insensitive' } },
      { tags: { has: query } }
    ]
  },
  include: {
    author: true,
    community: true,
    _count: { select: { votes: true, comments: true } }
  },
  orderBy: { createdAt: 'desc' },
  take: 20
});
```

**Features:**
1. Search posts by title, content, tags
2. Search users by username, specialty
3. Search communities by name, description
4. Search doctors by specialty, name
5. Autocomplete suggestions
6. Recent searches

---

### **Task 17: Filtering & Sorting**
**Priority:** 🟡 MEDIUM

**Sorting Algorithms (Already Implemented in Frontend):**
- Hot: `score / (hours + 2)^1.5`
- Rising: `score / (hours + 1)`
- Top: By score
- New: By date

**Server-Side Implementation:**
```typescript
// apps/api/src/services/post.service.ts
async getPosts(options: GetPostsOptions) {
  const { sort = 'hot', community, tags, limit = 20, offset = 0 } = options;

  let orderBy: any;
  
  switch (sort) {
    case 'new':
      orderBy = { createdAt: 'desc' };
      break;
    case 'top':
      orderBy = { votes: { _count: 'desc' } };
      break;
    case 'hot':
    case 'rising':
      // Calculate score on the fly
      // For better performance, use a computed column or cron job
      orderBy = { createdAt: 'desc' }; // Fallback
      break;
  }

  const posts = await prisma.post.findMany({
    where: {
      ...(community && { community: { slug: community } }),
      ...(tags && { tags: { hasSome: tags } }),
      isHidden: false
    },
    include: {
      author: true,
      community: true,
      votes: true,
      _count: { select: { comments: true } }
    },
    orderBy,
    take: limit,
    skip: offset
  });

  // Apply hot/rising algorithm if needed
  if (sort === 'hot' || sort === 'rising') {
    return this.applyHotAlgorithm(posts, sort);
  }

  return posts;
}
```

**Filters:**
1. By community
2. By tags
3. By specialty (medical)
4. By date range
5. By author type (doctor/patient)

---

### **Task 21: Karma System**
**Priority:** 🟢 LOW

**Database Schema:**
```prisma
model User {
  // ... existing fields
  postKarma    Int @default(0)
  commentKarma Int @default(0)
  totalKarma   Int @default(0)
}
```

**Karma Calculation:**
```typescript
// apps/api/src/services/karma.service.ts
export const karmaService = {
  async updateUserKarma(userId: string) {
    // Calculate post karma
    const postKarma = await prisma.vote.aggregate({
      where: {
        post: { authorId: userId }
      },
      _sum: { value: true }
    });

    // Calculate comment karma
    const commentKarma = await prisma.vote.aggregate({
      where: {
        comment: { authorId: userId }
      },
      _sum: { value: true }
    });

    const totalKarma = (postKarma._sum.value || 0) + (commentKarma._sum.value || 0);

    await prisma.user.update({
      where: { id: userId },
      data: {
        postKarma: postKarma._sum.value || 0,
        commentKarma: commentKarma._sum.value || 0,
        totalKarma
      }
    });

    return totalKarma;
  },

  async getLeaderboard(limit = 10) {
    return await prisma.user.findMany({
      where: { role: 'VERIFIED_DOCTOR' },
      orderBy: { totalKarma: 'desc' },
      take: limit,
      select: {
        id: true,
        username: true,
        totalKarma: true,
        postKarma: true,
        commentKarma: true
      }
    });
  }
};
```

**Features:**
1. Calculate karma from votes
2. Display on profile
3. Leaderboard page
4. Karma milestones/badges

---

### **Task 22: Awards System**
**Priority:** 🟢 LOW

**Database Schema:**
```prisma
model Award {
  id          String   @id @default(cuid())
  name        String
  description String
  icon        String
  cost        Int      // In coins
  createdAt   DateTime @default(now())
  
  given       PostAward[]
}

model PostAward {
  id        String   @id @default(cuid())
  postId    String
  post      Post     @relation(fields: [postId], references: [id])
  awardId   String
  award     Award    @relation(fields: [awardId], references: [id])
  givenById String
  givenBy   User     @relation("AwardsGiven", fields: [givenById], references: [id])
  givenAt   DateTime @default(now())
  
  @@index([postId])
}

model User {
  // ... existing fields
  coins Int @default(0)
  awardsGiven PostAward[] @relation("AwardsGiven")
}
```

**Features:**
1. Award types (Gold, Silver, Helpful, etc.)
2. Give award to post/comment
3. Award shop (buy coins)
4. Display awards on posts
5. Award notifications

---

## 🛠️ Implementation Order

### Phase 1: Foundation (Week 1)
1. ✅ Task 1: Database migration
2. ✅ Create API routes for posts
3. ✅ Create API routes for comments
4. ✅ Update Zustand store to use API

### Phase 2: Core Features (Week 2)
5. ✅ Task 2: Posts CRUD operations
6. ✅ Task 4: Comments system
7. ✅ Task 3: Communities basic features

### Phase 3: Enhancement (Week 3)
8. ✅ Task 16: Search functionality
9. ✅ Task 17: Filtering & sorting
10. ✅ Task 21: Karma system

### Phase 4: Polish (Week 4)
11. ✅ Task 22: Awards system
12. ✅ Testing & bug fixes
13. ✅ Performance optimization

---

## 📁 File Structure

```
apps/
├── api/
│   └── src/
│       ├── routes/
│       │   ├── posts.ts          ← Create
│       │   ├── comments.ts       ← Create
│       │   ├── communities.ts    ← Create
│       │   ├── search.ts         ← Create
│       │   └── awards.ts         ← Create
│       ├── services/
│       │   ├── post.service.ts   ← Create
│       │   ├── comment.service.ts ← Create
│       │   ├── community.service.ts ← Create
│       │   ├── karma.service.ts  ← Create
│       │   └── award.service.ts  ← Create
│       └── middleware/
│           └── moderator.ts      ← Create
└── web/
    └── src/
        ├── store/
        │   └── useStore.ts       ← Update
        ├── components/
        │   ├── PostCard.tsx      ← Update
        │   ├── PostFeed.tsx      ← Update
        │   ├── Comment.tsx       ← Update
        │   └── CommentSection.tsx ← Update
        └── app/
            ├── post/[id]/page.tsx ← Update
            ├── m/[community]/page.tsx ← Update
            └── search/page.tsx   ← Update

packages/
└── database/
    └── prisma/
        └── schema.prisma         ← Update
```

---

## 🧪 Testing Checklist

### Posts
- [ ] Create text post
- [ ] Create post with tags
- [ ] Edit own post
- [ ] Delete own post
- [ ] Upvote/downvote post
- [ ] Toggle vote (remove vote)
- [ ] Save post
- [ ] Hide post
- [ ] View post detail

### Comments
- [ ] Add top-level comment
- [ ] Reply to comment (nested)
- [ ] Edit own comment
- [ ] Delete own comment
- [ ] Vote on comment
- [ ] Collapse/expand thread
- [ ] Load more replies

### Communities
- [ ] Create community
- [ ] Join community
- [ ] Leave community
- [ ] Post in community
- [ ] View community feed
- [ ] Moderate posts (if moderator)

### Search
- [ ] Search posts
- [ ] Search users
- [ ] Search communities
- [ ] Filter by tags
- [ ] Sort results

### Karma
- [ ] Karma updates on vote
- [ ] View leaderboard
- [ ] Display on profile

---

## 🚨 Common Pitfalls

1. **N+1 Query Problem**
   - Always use `include` or `select` in Prisma
   - Batch load related data

2. **Race Conditions in Voting**
   - Use database transactions
   - Handle concurrent votes properly

3. **Nested Comments Performance**
   - Limit nesting depth (max 10 levels)
   - Paginate replies
   - Use "Load more" for deep threads

4. **Search Performance**
   - Add database indexes
   - Consider full-text search (PostgreSQL)
   - Cache popular searches

5. **Karma Calculation**
   - Don't recalculate on every request
   - Use background jobs or triggers
   - Cache karma values

---

## 📚 Resources

### Documentation
- [Prisma Docs](https://www.prisma.io/docs)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [Zustand](https://github.com/pmndrs/zustand)

### Existing Code References
- `apps/web/src/store/useStore.ts` - Current Zustand implementation
- `apps/web/src/components/PostFeed.tsx` - Sorting algorithms
- `apps/web/src/components/CommentSection.tsx` - Recursive comments
- `apps/api/src/services/auth.service.ts` - Service pattern example

### Database
- Current schema: `packages/database/prisma/schema.prisma`
- Migrations: `packages/database/prisma/migrations/`

---

## 💬 Communication

**When to Ping:**
- Blocked on database schema decisions
- Need clarification on business logic
- API design questions
- Performance concerns
- Ready for code review

**Daily Updates:**
- What you completed
- What you're working on
- Any blockers

---

## ✅ Definition of Done

A task is complete when:
1. ✅ Code is written and tested
2. ✅ API endpoints work end-to-end
3. ✅ Frontend components updated
4. ✅ Database migrations applied
5. ✅ No console errors
6. ✅ Manual testing passed
7. ✅ Code pushed to branch
8. ✅ Ready for review

---

## 🎯 Success Metrics

- Posts can be created, edited, deleted
- Votes persist across page refreshes
- Comments nest properly (up to 10 levels)
- Search returns relevant results in <500ms
- Karma updates within 1 minute of vote
- No data loss on page refresh

---

**Good luck! You've got this! 🚀**

*Ping anytime you need help or clarification.*
