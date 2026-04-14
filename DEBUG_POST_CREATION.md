# Debug Post Creation Issue

## Quick Diagnosis Steps

### 1. Check if API Server is Running
```bash
# In apps/api directory
npm run dev
```

The server should start on `http://localhost:3001`

### 2. Run the Test Script
```bash
cd apps/api
npx tsx test-post-creation.ts
```

This will test the entire post creation flow and show you exactly where it fails.

### 3. Check Browser Console

Open browser DevTools (F12) and look for:
- Network tab: Check the actual request/response
- Console tab: Look for error messages

### 4. Common Issues & Solutions

#### Issue: "Community is required"
**Cause**: No community selected or communities didn't load
**Solution**: 
```bash
# Check if communities exist in database
cd apps/api
npx prisma studio
# Navigate to Community table
# If empty, run: npm run seed
```

#### Issue: "Unauthorized" or 401 error
**Cause**: Token expired or invalid
**Solution**: Log out and log back in

#### Issue: "Cannot connect to server"
**Cause**: API server not running
**Solution**: Start the API server (see step 1)

#### Issue: Database connection error
**Cause**: Supabase connection string invalid
**Solution**: Check `.env` file in `apps/api`:
```env
DATABASE_URL="your-supabase-connection-string"
```

### 5. Check API Logs

When you try to create a post, the API should log:
```
[API] Creating post with data: { ... }
[API] User ID: xxx
[API] Community ID: xxx
[API] Post created successfully: xxx
```

If you don't see these logs, the request isn't reaching the API.

### 6. Manual API Test with curl

```bash
# Get token first
TOKEN="your-auth-token-from-localStorage"

# Get communities
curl http://localhost:3001/api/v1/communities

# Create post
curl -X POST http://localhost:3001/api/v1/posts \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Post",
    "content": "Test content",
    "communityId": "your-community-id",
    "type": "TEXT"
  }'
```

### 7. Check Database

```bash
cd apps/api
npx prisma studio
```

Check:
- **User table**: Does your user exist?
- **Community table**: Are there communities?
- **Post table**: Are posts being created?

## What I Fixed

### Backend Changes:
1. Added validation for required fields
2. Added community existence check
3. Accept all post fields (type, isNSFW, etc.)
4. Better error messages
5. Added debug logging

### Frontend Changes:
1. Better error handling
2. Check if communities loaded
3. Show specific error messages

## Next Steps

1. **Restart API server** (important - changes won't apply until restart)
2. **Clear browser cache** and refresh
3. **Try creating a post** again
4. **Check console logs** in both browser and API server
5. **Run test script** to verify API works

## If Still Not Working

Please provide:
1. API server console output
2. Browser console errors
3. Network tab request/response
4. Result of running `test-post-creation.ts`

This will help identify the exact issue.
