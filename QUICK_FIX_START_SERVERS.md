# Quick Fix: Start Your Servers

## The Problem
You're seeing `ERR_CONNECTION_REFUSED` because the API server is not running on port 3001.

## Solution: Start Both Servers

### Terminal 1: Start API Server
```bash
cd apps/api
npm run dev
```

**Wait for**: `🏥 MedThread API running on port 3001`

### Terminal 2: Start Web App
```bash
cd apps/web
npm run dev
```

**Wait for**: `Ready on http://localhost:3000`

### Terminal 3: Open Browser
```
http://localhost:3000/admin/analytics
```

Login: `admin@medthread.com` / `Admin@123`

## Verify API is Running

Check if API is responding:
```bash
curl http://localhost:3001/health
```

Should return: `{"status":"ok","timestamp":"..."}`

## If API Won't Start

### Check if port 3001 is in use:
```bash
# Windows
netstat -ano | findstr :3001

# If something is using it, kill the process:
taskkill /PID <process-id> /F
```

### Check for errors:
Look at the terminal output when running `npm run dev` in apps/api

Common issues:
- Database connection error → Check DATABASE_URL in .env
- Port already in use → Kill the process or change port
- Missing dependencies → Run `npm install`

## Quick Test

Once both servers are running:

```bash
# Test API health
curl http://localhost:3001/health

# Test admin analytics (with token)
curl http://localhost:3001/api/admin-analytics/active-users?period=today \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Expected Output

### API Server Terminal:
```
🏥 MedThread API running on port 3001
📊 Starting performance monitoring...
📧 Starting email queue worker...
⏰ Initializing cron jobs...
```

### Web App Terminal:
```
▲ Next.js 14.x.x
- Local:        http://localhost:3000
- Ready in X.Xs
```

### Browser:
- Admin dashboard loads
- 12 charts appear
- Green "Live" indicators show
- No connection errors

## Still Having Issues?

1. **Check .env files exist**:
   - `apps/api/.env` (DATABASE_URL, JWT_SECRET)
   - `apps/web/.env` (NEXT_PUBLIC_API_URL=http://localhost:3001)

2. **Check database is running**:
   - PostgreSQL should be running
   - Connection string should be correct

3. **Check node_modules**:
   ```bash
   # In root directory
   npm install
   
   # Or in each app
   cd apps/api && npm install
   cd apps/web && npm install
   ```

4. **Check for TypeScript errors**:
   ```bash
   cd apps/api
   npx tsc --noEmit
   ```

## Once Everything is Running

You should see:
- ✅ API server on http://localhost:3001
- ✅ Web app on http://localhost:3000
- ✅ Admin dashboard loads without errors
- ✅ Charts display data
- ✅ Live indicators are green
- ✅ Real-time updates work

Now you can enjoy your complete analytics dashboard! 🎉
