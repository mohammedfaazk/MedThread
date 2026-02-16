# Delete Dr. Navin from Database - Instructions

## Overview
Two scripts have been created to delete Dr. Navin's records from the database:

1. **delete-dr-navin.ts** - Specifically searches for and deletes Dr. Navin
2. **delete-user.ts** - General script to delete any user by username

---

## Option 1: Delete Dr. Navin (Recommended)

This script automatically searches for Dr. Navin using multiple possible usernames and email patterns.

### Run the Script

```bash
# Navigate to API directory
cd apps/api

# Run the deletion script
npx tsx src/scripts/delete-dr-navin.ts
```

### What It Does

1. Searches for user with usernames: `navin`, `dr.navin`, `drnavin`, `dr_navin`
2. Also searches emails and usernames containing "navin"
3. Displays user details if found
4. Waits 3 seconds before proceeding
5. Deletes all associated data in this order:
   - Notifications
   - Reports
   - Messages (sent and received)
   - Blocks
   - Follows
   - Community memberships
   - Moderator roles
   - Hidden posts
   - Saved comments
   - Saved posts
   - Awards given
   - Votes
   - Comments
   - Posts
   - Availabilities
   - Appointments
   - Thread replies
   - Timeline events
   - Medical threads
   - User account
6. Uses transaction for safety (all-or-nothing)

---

## Option 2: Delete by Username

If you know the exact username, use the general script:

```bash
# Navigate to API directory
cd apps/api

# Run with specific username
npx tsx src/scripts/delete-user.ts <username>

# Examples:
npx tsx src/scripts/delete-user.ts navin
npx tsx src/scripts/delete-user.ts dr.navin
npx tsx src/scripts/delete-user.ts drnavin
```

---

## What Gets Deleted

### User Data
- User account
- Profile information
- Verification documents
- Settings and preferences

### Content
- All posts created
- All comments written
- All votes cast
- All awards given

### Social
- Followers and following
- Blocks (as blocker and blocked)
- Community memberships
- Moderator roles

### Medical
- Availabilities (if doctor)
- Appointments (as doctor or patient)
- Medical threads (if patient)
- Thread replies
- Timeline events

### Activity
- Saved posts
- Saved comments
- Hidden posts
- Notifications
- Reports filed
- Messages (sent and received)

---

## Safety Features

### Transaction-Based
- All deletions happen in a single transaction
- If any step fails, everything rolls back
- Database remains consistent

### Cascade Deletes
- Some deletions cascade automatically (e.g., awards on deleted posts)
- Script handles foreign key constraints properly

### Verification
- Shows user details before deletion
- 3-second delay to cancel if needed (Ctrl+C)
- Confirms successful deletion

---

## Expected Output

```
🔍 Looking for Dr. Navin...
✓ Found user: navin

📋 User Details:
   ID: clx1234567890
   Username: navin
   Email: navin@example.com
   Role: DOCTOR

⚠️  This will permanently delete this user and ALL associated data!
   Proceeding in 3 seconds...

🗑️  Starting deletion process...
   ✓ Deleted 15 notifications
   ✓ Deleted 0 reports
   ✓ Deleted 23 messages
   ✓ Deleted 0 blocks
   ✓ Deleted 5 follows
   ✓ Deleted 3 community memberships
   ✓ Deleted 0 moderator roles
   ✓ Deleted 0 hidden posts
   ✓ Deleted 0 saved comments
   ✓ Deleted 2 saved posts
   ✓ Deleted 1 awards given
   ✓ Deleted 45 votes
   ✓ Deleted 12 comments
   ✓ Deleted 8 posts
   ✓ Deleted 10 availabilities
   ✓ Deleted 5 appointments
   ✓ Deleted 3 thread replies
   ✓ Deleted 2 timeline events
   ✓ Deleted 0 medical threads
   ✓ Deleted user account

✅ Successfully deleted Dr. Navin (navin) and all associated data

🎉 Done!
```

---

## If User Not Found

```
🔍 Looking for Dr. Navin...
❌ Dr. Navin not found in database

Searched for usernames: navin, dr.navin, drnavin, dr_navin
Also searched emails and usernames containing "navin"

🎉 Done!
```

---

## Troubleshooting

### Script Won't Run
```bash
# Make sure you're in the API directory
cd apps/api

# Install tsx if needed
npm install -D tsx

# Try running with full path
npx tsx ./src/scripts/delete-dr-navin.ts
```

### Database Connection Error
```bash
# Check .env file exists
ls -la apps/api/.env

# Verify DATABASE_URL is set
cat apps/api/.env | grep DATABASE_URL

# Test database connection
npx prisma db pull
```

### Permission Denied
```bash
# Make script executable (Unix/Mac)
chmod +x src/scripts/delete-dr-navin.ts

# Or run with node directly
node --loader tsx src/scripts/delete-dr-navin.ts
```

### Transaction Timeout
If the deletion takes too long:
```bash
# Increase timeout in script or run in smaller batches
# Contact database admin if needed
```

---

## Manual Verification

After running the script, verify deletion:

```bash
# Check if user exists
npx prisma studio

# Or use SQL
psql $DATABASE_URL -c "SELECT * FROM \"User\" WHERE username LIKE '%navin%';"
```

---

## Rollback (If Needed)

⚠️ **WARNING**: There is NO automatic rollback after successful deletion!

If you need to restore:
1. Restore from database backup
2. Re-import user data if available
3. Contact database administrator

**Prevention**: Always backup database before running deletion scripts!

```bash
# Create backup before deletion
pg_dump $DATABASE_URL > backup_before_delete_$(date +%Y%m%d_%H%M%S).sql
```

---

## Alternative: Soft Delete

If you want to keep the data but deactivate the account:

```sql
-- Mark user as suspended instead of deleting
UPDATE "User" 
SET "isSuspended" = true, 
    "isShadowBanned" = true 
WHERE username = 'navin';
```

---

## Support

If you encounter issues:
1. Check database connection
2. Verify user exists
3. Check script permissions
4. Review error messages
5. Contact system administrator

---

**Created**: February 2026
**Status**: Ready to use
**Safety**: Transaction-based with verification
