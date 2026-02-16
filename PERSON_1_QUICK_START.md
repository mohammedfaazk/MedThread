# Person 1: Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Create Your Branch
```bash
git checkout -b feature/posts-communities
```

### Step 2: Update Database Schema
Add this to `packages/database/prisma/schema.prisma`:

```prisma
model Post {
  id          String    @id @default(cuid())
  type        PostType  @default(TEXT)
  title       String
  content     String?   @db.Text
  authorId    String
  author      User      @relation("UserPosts", fields: [authorId], references: [id])
  communityId String?
  community   Community? @relation(fields: [communityId], references: [id])
  tags        String[]