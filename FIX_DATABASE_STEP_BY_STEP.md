# How to Fix Database Connection - Step by Step Guide 🔧

## Step 1: Get New Supabase Credentials (5 minutes)

### Option A: If You Have Access to Supabase Dashboard

1. **Open your browser** and go to: https://supabase.com/dashboard

2. **Login** to your Supabase account

3. **Find your MedThread project** in the list and click on it

4. **Go to Settings**:
   - Look for the gear icon ⚙️ in the left sidebar
   - Click on "Settings"

5. **Click on "Database"** in the Settings menu

6. **Find "Connection String" section**:
   - Look for a section called "Connection String" or "Connection Pooling"
   - You'll see different connection string options

7. **Select "Connection pooling" mode** (this is for Prisma)
   - Click on the dropdown that says "Session mode" or "Transaction mode"
   - Select "Session mode" or look for the one that says "Use connection pooling"

8. **Copy the connection string**:
   - It will look like this:
   ```
   postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true
   ```
   - Click the "Copy" button next to it

9. **IMPORTANT**: Replace `[YOUR-PASSWORD]` with your actual database password
   - If you don't remember your password, click "Reset Database Password" button
   - Copy the new password they give you
   - Replace `[YOUR-PASSWORD]` in the connection string with this new password

### Option B: If You Don't Have Access to Supabase

You have two choices:

**Choice 1**: Ask the person who created the Supabase project to:
- Go to Supabase Dashboard → Settings → Database
- Copy the Connection Pooling string
- Send it to you

**Choice 2**: Create a new Supabase project (FREE):
1. Go to https://supabase.com
2. Sign up for free account
3. Create new project (takes 2 minutes)
4. Follow Option A above to get credentials
5. You'll need to run database migrations and seed data (I can help with this)

---

## Step 2: Update .env File (2 minutes)

1. **Open the file**: `apps/api/.env`
   - You can see it's already open in your editor

2. **Find this line**:
   ```env
   DATABASE_URL="postgresql://postgres.lfjqtefsfhkzlzixleee:MedthreadDev@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
   ```

3. **Replace it** with your new connection string from Step 1:
   ```env
   DATABASE_URL="[paste your new connection string here]"
   ```

4. **Also update DIRECT_URL** (same connection string but without `?pgbouncer=true`):
   ```env
   DIRECT_URL="[paste your new connection string but remove ?pgbouncer=true from the end]"
   ```

5. **Save the file** (Ctrl+S or Cmd+S)

### Example of what it should look like:
```env
DATABASE_URL="postgresql://postgres.abcdefghijk:MyNewPassword123@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.abcdefghijk:MyNewPassword123@aws-1-ap-south-1.pooler.supabase.com:6543/postgres"
```

---

## Step 3: Wait for Circuit Breaker Reset (5-10 minutes)

**Why?** Supabase blocked your connection due to too many failed attempts. This block automatically resets after 5-10 minutes.

**What to do:**
1. Set a timer for 10 minutes
2. Take a break ☕
3. Come back after 10 minutes

**Optional**: You can check if it's reset by running:
```bash
npx tsx check-admin-credentials.ts
```
(Run this from the `apps/api` folder)

If you see "Circuit breaker open" error, wait a bit longer.
If you see "Database connection successful", you're good to go!

---

## Step 4: Restart API Server (1 minute)

### Method 1: Using Kiro (Easiest)
Just tell me: "restart the API server" and I'll do it for you.

### Method 2: Manual Restart

1. **Find the terminal** where the API server is running
   - It's the one showing logs like "Authentication failed..."

2. **Stop the server**:
   - Press `Ctrl+C` in that terminal
   - Wait for it to stop completely

3. **Start it again**:
   ```bash
   npm run dev
   ```

4. **Wait for it to start** (about 5-10 seconds)
   - You should see: "Server running on port 3001"

---

## Step 5: Test if Everything Works (2 minutes)

### Test 1: Check Database Connection
```bash
npx tsx check-admin-credentials.ts
```

**Expected output:**
```
✅ Database connection successful
✅ Admin user found: admin@medthread.com
✅ Password hash exists
```

If you see this, database is working! 🎉

### Test 2: Try Login

1. Open your browser: http://localhost:3000/login

2. Try logging in with:
   ```
   Email: admin@medthread.com
   Password: Admin@123
   ```

3. **If login works**: 🎉 SUCCESS! Everything is fixed!

4. **If login fails**: Check the error message:
   - "Invalid email or password" = Password might be wrong in database
   - "Server error" = Database still not connected
   - Tell me the error and I'll help fix it

---

## Quick Troubleshooting

### Problem: "Circuit breaker still open"
**Solution**: Wait another 5 minutes and try again

### Problem: "Authentication failed" (after updating credentials)
**Solution**: 
- Double-check you copied the FULL connection string
- Make sure you replaced [YOUR-PASSWORD] with actual password
- Make sure there are no extra spaces or quotes

### Problem: "Cannot find module"
**Solution**: 
- Make sure you're in the `apps/api` folder
- Run: `npm install`

### Problem: Login says "Invalid email or password"
**Solution**: 
- Database is connected but user data might be missing
- Tell me and I'll help you seed the database with users

---

## Summary Checklist

- [ ] Step 1: Got new Supabase credentials
- [ ] Step 2: Updated `apps/api/.env` file
- [ ] Step 3: Waited 10 minutes for circuit breaker reset
- [ ] Step 4: Restarted API server
- [ ] Step 5: Tested database connection (✅ success)
- [ ] Step 6: Tested login (✅ works)

---

## Need Help?

Just tell me:
- "I'm stuck on Step X" - I'll help you with that specific step
- "Show me my current .env" - I'll show you what's in the file
- "Restart the API server" - I'll restart it for you
- "Test the database" - I'll run the test for you

**Once you complete these steps, your app will be fully functional!** 🚀
