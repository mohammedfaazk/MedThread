# Database Connection Fix Guide

## Problem
The application is showing these errors:
1. `/trends` page: Internal server error
2. No posts are found
3. Verified doctors are not listed
4. Database error: "FATAL: Tenant or user not found"

## Root Cause
The Supabase database connection is failing. This could be due to:
1. **Database is paused** (most likely) - Supabase pauses inactive databases
2. **Incorrect credentials** - The connection string may have changed
3. **Network issues** - Firewall or network blocking the connection

## Solution Steps

### Step 1: Check Supabase Database Status
1. Go to https://supabase.com/dashboard
2. Log in to your account
3. Select your project: `lfjqtefsfhkzlzixleee`
4. Check if the database shows "Paused" status
5. If paused, click "Resume" or "Restore" button

### Step 2: Get Fresh Database Credentials
1. In Supabase Dashboard, go to **Settings** → **Database**
2. Scroll to **Connection String** section
3. Select **Connection pooling** mode
4. Copy the connection string (it should look like):
   ```
   postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:5432/postgres
   ```

### Step 3: Update Environment Files
Update both `.env` and `apps/api/.env` files with the new connection string:

```env
DATABASE_URL="postgresql://postgres.lfjqtefsfhkzlzixleee:[YOUR-PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:5432/postgres"
DIRECT_URL="postgresql://postgres.lfjqtefsfhkzlzixleee:[YOUR-PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:5432/postgres"
```

Replace `[YOUR-PASSWORD]` with your actual database password.

### Step 4: Restart the API Server
```bash
# Stop the current API server (Ctrl+C in the terminal)
# Then restart:
cd apps/api
npm run dev
```

### Step 5: Verify Connection
Check the API server logs for:
```
[Database] ✓ Connected successfully
```

If you see this, the database is connected!

## Testing the Fix

### Test 1: Check API Health
Open browser: http://localhost:3001/api/analytics/test

Should return:
```json
{
  "success": true,
  "message": "Analytics API is working!",
  "timestamp": "..."
}
```

### Test 2: Check Trends Page
Open browser: http://localhost:3000/trends

Should load without errors (may show "No data" if database is empty)

### Test 3: Check Posts
Open browser: http://localhost:3000

Should show posts if any exist in the database

## If Database is Empty

If the database is connected but empty, you need to seed data:

```bash
cd apps/api

# Seed basic data
npm run seed

# Or use the comprehensive seed script
npx tsx seed-comprehensive-analytics.ts
```

## Alternative: Use Local Database

If Supabase continues to have issues, you can use a local PostgreSQL database:

1. Install PostgreSQL locally
2. Create a database named `medthread`
3. Update `.env` files:
   ```env
   DATABASE_URL="postgresql://postgres:password@localhost:5432/medthread"
   DIRECT_URL="postgresql://postgres:password@localhost:5432/medthread"
   ```
4. Run migrations:
   ```bash
   cd packages/database
   npx prisma migrate dev
   ```
5. Seed data:
   ```bash
   cd apps/api
   npm run seed
   ```

## Current Status

✗ Database connection: FAILED
✗ Trends page: ERROR
✗ Posts: NOT LOADING
✗ Doctors: NOT LOADING

After following the steps above, all should be:
✓ Database connection: SUCCESS
✓ Trends page: WORKING
✓ Posts: LOADING
✓ Doctors: LOADING

## Quick Commands

```bash
# Check if API is running
curl http://localhost:3001/api/analytics/test

# Check database connection in API logs
# Look for: [Database] ✓ Connected successfully

# Restart API server
cd apps/api
npm run dev

# Restart Web server
cd apps/web
npm run dev
```

## Contact Support

If issues persist:
1. Check Supabase status page: https://status.supabase.com/
2. Review Supabase logs in dashboard
3. Check firewall/antivirus settings
4. Try connecting from a different network
