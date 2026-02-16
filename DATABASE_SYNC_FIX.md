# Database Sync Fix - isDraft Column Missing

## Error
```
PrismaClientKnownRequestError: Invalid `prisma.post.findMany()` invocation
The column `Post.isDraft` does not exist in the current database.
```

## Root Cause
The Prisma schema has the `isDraft` field defined in the `Post` model (line 176 in schema.prisma), but the database hasn't been updated to include this column.

## Solution

You need to sync your database with the Prisma schema. Choose ONE of the following methods:

### Method 1: Push Schema (Recommended for Development)
This is faster and doesn't create migration files.

```bash
# Navigate to the database package
cd packages/database

# Push the schema changes to the database
npx prisma db push

# Generate Prisma Client
npx prisma generate
```

### Method 2: Create and Run Migration (Recommended for Production)
This creates a migration file for version control.

```bash
# Navigate to the database package
cd packages/database

# Create a migration
npx prisma migrate dev --name add_isDraft_column

# This will automatically:
# 1. Create the migration file
# 2. Apply it to the database
# 3. Generate Prisma Client
```

### Method 3: Reset Database (Nuclear Option - DELETES ALL DATA)
Only use this if you're okay losing all data.

```bash
# Navigate to the database package
cd packages/database

# Reset and resync
npx prisma migrate reset

# Or if no migrations exist:
npx prisma db push --force-reset
```

## After Running the Fix

1. Restart your API server:
   ```bash
   cd apps/api
   npm run dev
   ```

2. The error should be gone and posts should load correctly.

## What isDraft Does

The `isDraft` field allows users to:
- Save posts as drafts (not published)
- Work on posts over time
- Publish drafts when ready

Related endpoints:
- `GET /api/v1/posts/drafts` - Get user's draft posts
- `POST /api/v1/posts/:id/publish` - Publish a draft post

## Verification

After applying the fix, verify the column exists:

```bash
# Connect to your database and check
# For PostgreSQL:
\d "Post"

# For MySQL:
DESCRIBE Post;

# For SQLite:
.schema Post
```

You should see `isDraft` listed as a Boolean column with default value `false`.

## Prevention

To avoid this in the future:
1. Always run `npx prisma db push` or `npx prisma migrate dev` after schema changes
2. Keep your database in sync with your schema
3. Use migrations for production deployments
4. Document schema changes in your team

## Related Files
- `packages/database/prisma/schema.prisma` - Schema definition (line 176)
- `apps/api/src/services/post.service.ts` - Uses isDraft field
- `apps/api/src/routes/posts.ts` - Draft-related endpoints
