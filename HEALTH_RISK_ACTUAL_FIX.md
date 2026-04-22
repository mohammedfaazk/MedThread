# Health Risk Assessment - ACTUAL FIX

## 🔴 REAL PROBLEM FOUND

Your database connection pool is maxed out:
```
FATAL: MaxClientsInSessionMode: max clients reached
```

This is why:
1. The assessment form might submit but fail to save
2. Data disappears after restart
3. Graphs don't show

## 🔧 IMMEDIATE FIX

### Step 1: Close All Database Connections

Stop ALL running processes that might be using the database:

```bash
# Stop all npm processes
taskkill /F /IM node.exe

# Or manually close:
# - API server (Ctrl+C)
# - Web server (Ctrl+C)
# - Any test scripts running
# - Prisma Studio if open
```

### Step 2: Update Database Connection Settings

Edit `apps/api/.env`:

```env
# Change from Session mode to Transaction mode
DATABASE_URL="postgresql://postgres.lfjqtefsfhkzlzixleee:MedThread@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"

# Use direct connection for migrations
DIRECT_URL="postgresql://postgres.lfjqtefsfhkzlzixleee:MedThread@aws-0-ap-south-1.pooler.supabase.com:5432/postgres"
```

Key changes:
- Added `connection_limit=1` to prevent connection leaks
- Ensure `pgbouncer=true` is set for pooling

### Step 3: Restart Servers CLEANLY

```bash
# Terminal 1 - API
cd apps/api
npm run dev

# Terminal 2 - Web (wait for API to fully start)
cd apps/web
npm run dev
```

## 🧪 TEST IF IT'S WORKING NOW

### Quick Browser Test:

1. Open http://localhost:3000
2. Login as navin@example.com / password123
3. Go to Health Risk Assessment
4. Open Browser Console (F12)
5. Click "Start Assessment"
6. Fill ONLY required fields:
   - Age: 45
   - Gender: Male
   - Height: 175
   - Weight: 85
   - Smoking: Never
   - Alcohol: None
   - Activity: Moderate
7. Click through all steps and submit

### What to Look For in Console:

**SUCCESS:**
```
[Health Assessment] Submitting assessment...
[Health Assessment] Response status: 200
[Health Assessment] Success: {predictions: Array(4)}
```

**FAILURE:**
```
[Health Assessment] Error response: {error: "..."}
```

If you see the error, copy the EXACT error message and send it to me.

## 🔍 ALTERNATIVE: Check What's Actually Happening

### Option 1: Check Network Tab

1. Open Browser DevTools (F12)
2. Go to "Network" tab
3. Submit assessment
4. Look for request to `/api/health-risk/assess`
5. Click on it
6. Check "Response" tab
7. Send me the response

### Option 2: Check API Server Logs

Look at your API server terminal output when you submit the assessment. You should see:
```
POST /api/health-risk/assess
```

If you see an error there, send me that error.

## 🎯 MOST LIKELY ISSUES

### Issue 1: Database Connection Pool Exhausted
**Symptom:** "MaxClientsInSessionMode" error
**Fix:** Close all connections, add `connection_limit=1` to DATABASE_URL

### Issue 2: Route Not Registered
**Symptom:** 404 Not Found
**Fix:** Check `apps/api/src/index.ts` has:
```typescript
app.use('/api/health-risk', healthRiskRouter);
```

### Issue 3: Authentication Failing
**Symptom:** 401 Unauthorized
**Fix:** Check localStorage has `auth_token`

### Issue 4: Missing Health Profile
**Symptom:** Predictions save but don't show
**Fix:** User needs a PatientHealthProfile record

## 📋 SEND ME THIS INFO

To help you properly, I need:

1. **Exact error message** from browser console when submitting assessment
2. **API server logs** when you submit (copy the terminal output)
3. **Network tab response** for the `/api/health-risk/assess` request
4. **Does the form submit?** Or does it fail immediately?
5. **After submission, what do you see?** Empty page? Error? Loading forever?

## 🚀 IF STILL NOT WORKING

Try this minimal test:

1. Open browser console
2. Paste this code:
```javascript
// Test if API is reachable
fetch('http://localhost:3001/api/health-risk/predictions/YOUR_USER_ID', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('auth_token')
  }
})
.then(r => r.json())
.then(d => console.log('API Response:', d))
.catch(e => console.error('API Error:', e));
```

3. Replace `YOUR_USER_ID` with your actual user ID
4. Send me the output

## 💡 QUICK WIN: Use Existing Test Data

If you just want to see it working with test data:

```bash
cd apps/api
npx tsx apps/api/seed-health-risk-test-data.ts
```

Then refresh the health risk page - you should see predictions!

Let me create that seed script now...
