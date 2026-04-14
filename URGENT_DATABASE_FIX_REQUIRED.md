# 🚨 URGENT: Database Connection Required

## Current Status
❌ **Database is NOT connected**  
❌ `/trends` page shows internal server error  
❌ No posts are loading  
❌ Verified doctors are not listed  

## Root Cause
Your Supabase database is either:
1. **PAUSED** (most likely - Supabase pauses inactive databases after 7 days)
2. **Credentials changed** 
3. **Database deleted**

## ✅ IMMEDIATE FIX (5 minutes)

### Step 1: Go to Supabase Dashboard
1. Open: https://supabase.com/dashboard/projects
2. Find your project: `lfjqtefsfhkzlzixleee`
3. Click on it

### Step 2: Check Database Status
Look for a banner or status indicator that says:
- "Database Paused" or
- "Project Paused" or  
- "Inactive"

If you see this, click the **"Resume"** or **"Restore"** button.

### Step 3: Get Fresh Connection String
1. In your project, go to: **Settings** → **Database**
2. Scroll down to **Connection String** section
3. Select **"URI"** tab (not "Connection pooling")
4. Copy the connection string
5. It should look like:
   ```
   postgresql://postgres.lfjqtefsfhkzlzixleee:[YOUR-PASSWORD]@db.lfjqtefsfhkzlzixleee.supabase.co:5432/postgres
   ```

### Step 4: Update Your .env Files
Update these 3 files with the new connection string:

**File 1: `.env` (root)**
```env
DATABASE_URL="[paste your connection string here]"
DIRECT_URL="[paste your connection string here]"
```

**File 2: `apps/api/.env`**
```env
DATABASE_URL="[paste your connection string here]"
DIRECT_URL="[paste your connection string here]"
```

**File 3: `packages/database/.env`**
```env
DATABASE_URL="[paste your connection string here]"
DIRECT_URL="[paste your connection string here]"
```

### Step 5: Restart Servers
```bash
# Stop all running servers (Ctrl+C in terminals)

# Start API server
cd apps/api
npm run dev

# In another terminal, start web server
cd apps/web
npm run dev
```

### Step 6: Verify Connection
Run this command:
```bash
npx tsx apps/api/test-database-connection.ts
```

You should see:
```
✓ Connection successful!
✓ Users table: X records
✓ Posts table: X records
✓ Verified doctors: X records
```

## If Database is Empty (No Data)

After connecting, if you see 0 records, seed the database:

```bash
cd apps/api

# Create sample data
npx tsx seed-all-analytics-simple.ts

# Or use comprehensive seed
npx tsx seed-comprehensive-analytics.ts
```

## Test Your Fix

### Test 1: API Health
Open: http://localhost:3001/api/analytics/test

Should show:
```json
{
  "success": true,
  "message": "Analytics API is working!"
}
```

### Test 2: Trends Page
Open: http://localhost:3000/trends

Should load without errors

### Test 3: Home Page
Open: http://localhost:3000

Should show posts and verified doctors

## Alternative: Create New Database

If your database was deleted or you can't access it:

1. Create a new Supabase project
2. Get the new connection string
3. Update all .env files
4. Run migrations:
   ```bash
   cd packages/database
   npx prisma migrate deploy
   ```
5. Seed data:
   ```bash
   cd apps/api
   npm run seed
   ```

## Need Help?

Check these files for more details:
- `DATABASE_CONNECTION_FIX.md` - Detailed troubleshooting guide
- `apps/api/test-database-connection.ts` - Diagnostic script

## Quick Checklist

- [ ] Opened Supabase dashboard
- [ ] Checked if database is paused
- [ ] Resumed/restored database if paused
- [ ] Copied fresh connection string
- [ ] Updated all 3 .env files
- [ ] Restarted API server
- [ ] Restarted web server
- [ ] Ran diagnostic script
- [ ] Verified connection successful
- [ ] Seeded data if database empty
- [ ] Tested /trends page
- [ ] Tested home page for posts/doctors

---

**Current Database URL Format:**
```
postgresql://postgres.lfjqtefsfhkzlzixleee:MedthreadDev@db.lfjqtefsfhkzlzixleee.supabase.co:5432/postgres
```

**Note:** Replace `MedthreadDev` with your actual password from Supabase dashboard.
