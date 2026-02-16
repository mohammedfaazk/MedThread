# Delete User - Quick Reference

## Delete Dr. Navin

```bash
cd apps/api
npx tsx src/scripts/delete-dr-navin.ts
```

## Delete Any User

```bash
cd apps/api
npx tsx src/scripts/delete-user.ts <username>
```

## What Gets Deleted

✅ User account
✅ All posts and comments
✅ All votes and awards
✅ All social connections
✅ All appointments and availabilities
✅ All messages and notifications
✅ All saved/hidden content

## Safety

- Transaction-based (all-or-nothing)
- 3-second delay before deletion
- Verification output
- No automatic rollback

## Backup First!

```bash
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql
```

## Cancel Deletion

Press `Ctrl+C` during the 3-second countdown

## Verify Deletion

```bash
npx prisma studio
# Search for username in User table
```

---

**Files Created:**
- `apps/api/src/scripts/delete-dr-navin.ts` - Delete Dr. Navin
- `apps/api/src/scripts/delete-user.ts` - Delete any user
- `DELETE_DR_NAVIN_INSTRUCTIONS.md` - Full instructions
- `DELETE_USER_QUICK_REFERENCE.md` - This file
