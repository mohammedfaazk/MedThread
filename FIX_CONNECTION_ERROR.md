# Fix: ERR_CONNECTION_REFUSED Error

## The Error You're Seeing
```
Failed to load resource: net::ERR_CONNECTION_REFUSED
http://localhost:3001/api/admin-analytics/...
```

## Root Cause
The API server is not running on port 3001.

## ✅ SOLUTION: Start Both Servers

### Step 1: Start API Server
Open a terminal and run:
```bash
cd apps/api
npm run dev
```

**Wait for this message:**
```
🏥 MedThread API running on port 3001
```

### Step 2: Start Web App
Open a NEW terminal and run:
```bash
cd apps/web
npm run dev
```

**Wait for this message:**
```
▲ Next.js 14.x.x
- Local: http://localhost:3000
```

### Step 3: Open Browser
```
http://localhost:3000/admin/analytics
```

Login: `admin@medthread.com` / `Admin@123`

## Quick Check

Run this to verify servers are running:

**Windows:**
```bash
check-servers.bat
```

**Mac/Linux:**
```bash
chmod +x check-servers.sh
./check-servers.sh
```

Or manually check:
```bash
# Check API
curl http://localhost:3001/health

# Should return: {"status":"ok","timestamp":"..."}
```

## Common Issues & Fixes

### Issue 1: Port 3001 Already in Use

**Windows:**
```bash
# Find process using port 3001
netstat -ano | findstr :3001

# Kill the process (replace PID with actual number)
taskkill /PID <PID> /F
```

**Mac/Linux:**
```bash
# Find and kill process
lsof -ti:3001 | xargs kill -9
```

### Issue 2: Database Connection Error

Check your `apps/api/.env` file has:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/medthread"
JWT_SECRET="your-secret-key"
```

Make sure PostgreSQL is running.

### Issue 3: Missing Dependencies

```bash
# Install all dependencies
npm install

# Or in each app
cd apps/api && npm install
cd apps/web && npm install
```

### Issue 4: TypeScript Errors

```bash
cd apps/api
npx tsc --noEmit --skipLibCheck
```

Fix any errors shown.

## What You Should See

### API Terminal:
```
🏥 MedThread API running on port 3001
📊 Starting performance monitoring...
📧 Starting email queue worker...
⏰ Initializing cron jobs...
```

### Web Terminal:
```
▲ Next.js 14.x.x
- Local:        http://localhost:3000
- Environments: .env
✓ Ready in 3.2s
```

### Browser:
- ✅ Admin dashboard loads
- ✅ 12 charts display
- ✅ Green "Live" indicators
- ✅ No connection errors
- ✅ Data loads successfully

## Test the Fix

Once both servers are running:

1. **Open browser**: http://localhost:3000/admin/analytics
2. **Login**: admin@medthread.com / Admin@123
3. **Check console**: Should see "✅ Connected to real-time analytics"
4. **Verify charts**: All 12 charts should load with data
5. **Test live updates**: Login in another tab, see toast notification

## Still Not Working?

### Check Environment Variables

**apps/web/.env:**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

**apps/api/.env:**
```env
DATABASE_URL="postgresql://..."
JWT_SECRET="..."
PORT=3001
```

### Check Database

```bash
# Test database connection
cd apps/api
npx prisma db push
```

### Check Logs

Look at the terminal output for both servers. Any errors will be shown there.

### Restart Everything

```bash
# Kill all node processes
# Windows: taskkill /F /IM node.exe
# Mac/Linux: killall node

# Start fresh
cd apps/api && npm run dev
# In new terminal:
cd apps/web && npm run dev
```

## Success Checklist

- [ ] API server running on port 3001
- [ ] Web app running on port 3000
- [ ] Can access http://localhost:3001/health
- [ ] Can access http://localhost:3000
- [ ] Admin dashboard loads without errors
- [ ] All 12 charts display data
- [ ] Green "Live" indicators visible
- [ ] No ERR_CONNECTION_REFUSED errors

## Once Fixed

You'll see:
- 🟢 Live indicators on all charts
- 📊 Real-time data updates
- 🎉 Toast notifications on events
- 📈 All 12 analytics charts working
- ⚡ Fast, responsive dashboard

**Your complete analytics dashboard is ready!** 🚀
