# Database Connection Issue - Supabase Unreachable

## Problem
Cannot reach Supabase database at `db.lfjqtefsfhkzlzixleee.supabase.co:5432`

## Possible Causes

### 1. Supabase Service Down
- Supabase might be experiencing an outage
- Check: https://status.supabase.com/

### 2. Network/Firewall Issue
- Your network might be blocking port 5432
- Corporate firewall or VPN might be interfering

### 3. Supabase Project Paused
- Free tier projects pause after inactivity
- Need to wake up the project

### 4. Connection String Issue
- Database URL might be incorrect
- Credentials might have expired

## Quick Fixes to Try

### Option 1: Wake Up Supabase Project
1. Go to https://supabase.com/dashboard
2. Log in to your account
3. Find project: lfjqtefsfhkzlzixleee
4. Click on it to wake it up
5. Wait 30 seconds for it to start

### Option 2: Check Supabase Status
1. Visit: https://status.supabase.com/
2. Check if there are any ongoing incidents
3. If yes, wait for resolution

### Option 3: Regenerate Connection String
1. Go to Supabase Dashboard
2. Project Settings → Database
3. Copy the connection string
4. Update `apps/api/.env`:
   ```
   DATABASE_URL="your-new-connection-string"
   ```

### Option 4: Check Network
```powershell
# Test if port 5432 is accessible
Test-NetConnection -ComputerName db.lfjqtefsfhkzlzixleee.supabase.co -Port 5432

# If this fails, try:
# 1. Disable VPN
# 2. Try different network
# 3. Check firewall settings
```

### Option 5: Use Connection Pooler
Supabase provides a connection pooler for better reliability:

1. Go to Supabase Dashboard → Database Settings
2. Find "Connection Pooling" section
3. Copy the pooler connection string
4. Update `.env`:
   ```
   DATABASE_URL="postgresql://postgres.lfjqtefsfhkzlzixleee:password@aws-0-ap-south-1.pooler.supabase.com:6543/postgres"
   ```

## Current Status

### What's Working:
- ✅ API server is running
- ✅ Web app is running
- ✅ Code is correct

### What's NOT Working:
- ❌ Database connection
- ❌ Cannot fetch posts
- ❌ Cannot create posts
- ❌ All database operations failing

## Immediate Action Required

**You need to:**
1. Check if Supabase project is paused
2. Wake it up from the dashboard
3. Wait for it to become active
4. Restart the API server

## Alternative: Local Database

If Supabase continues to have issues, you can switch to a local PostgreSQL:

1. Install PostgreSQL locally
2. Create a database
3. Update `.env`:
   ```
   DATABASE_URL="postgresql://postgres:password@localhost:5432/medthread"
   ```
4. Run migrations:
   ```
   cd apps/api
   npx prisma migrate deploy
   npx prisma generate
   ```

## Monitoring

To check if database is back online:
```bash
cd apps/api
npx prisma db pull
```

If this succeeds, the database is accessible.

## Next Steps

1. **Check Supabase Dashboard** - Most likely the project is paused
2. **Wake up the project** - Click on it in the dashboard
3. **Wait 30-60 seconds** - For the database to start
4. **Restart API server** - Once database is up
5. **Test connection** - Try creating a post

## Contact

If issue persists:
- Check Supabase status page
- Contact Supabase support
- Consider upgrading to paid tier (no auto-pause)

---

**Current Error:**
```
Can't reach database server at `db.lfjqtefsfhkzlzixleee.supabase.co:5432`
```

This is a **connectivity issue**, not a code issue. Everything else is working perfectly!
