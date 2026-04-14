# Debugging 404 Error - MedThread Dashboard

## Common 404 Causes & Solutions

### 1. API Server Not Running
**Symptom**: API calls to `http://localhost:3001` fail with 404

**Check**:
```bash
# Is API server running?
curl http://localhost:3001/health
```

**Solution**:
```bash
cd apps/api
npm run dev
```

Expected output: `{"status":"ok","timestamp":"..."}`

---

### 2. Missing Static Assets
**Symptom**: Images, CSS, or JS files return 404

**Common Missing Files**:
- `/logo.png`
- `/favicon.ico`
- Leaflet marker images
- User avatars

**Solution for Leaflet Markers**:
Leaflet needs marker images. Add to `apps/web/public/`:

```bash
# Create public folder if missing
mkdir -p apps/web/public

# Leaflet will look for these:
# - marker-icon.png
# - marker-icon-2x.png
# - marker-shadow.png
```

Or add to `apps/web/src/app/trends/page.tsx`:
```typescript
import L from 'leaflet';
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});
```

---

### 3. API Endpoint Doesn't Exist
**Symptom**: Specific API route returns 404

**Check which endpoint**:
Open browser DevTools → Network tab → Look for red 404 requests

**Common Missing Endpoints**:
- `/api/v1/posts` - Should exist ✓
- `/api/v1/comments` - Should exist ✓
- `/api/v1/communities` - Should exist ✓
- `/api/analytics/symptom-heatmap` - Check if route exists

**Solution**:
Check if route is registered in `apps/api/src/index.ts`

---

### 4. Environment Variable Issues
**Symptom**: API calls go to wrong URL

**Check**:
```bash
# In apps/web/.env.local
echo $NEXT_PUBLIC_API_URL
```

**Solution**:
Create `apps/web/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

Restart web server after creating.

---

### 5. CORS Issues (Looks Like 404)
**Symptom**: API calls fail, console shows CORS error

**Check**: Browser console for CORS messages

**Solution**: Already configured in `apps/api/src/index.ts`:
```typescript
app.use(cors({
  origin: ['http://localhost:3000', ...],
  credentials: true,
}));
```

---

## Quick Diagnostic Steps

### Step 1: Check API Server
```bash
# Terminal 1
cd apps/api
npm run dev

# Should see:
# 🏥 MedThread API running on port 3001
```

### Step 2: Test API Health
```bash
curl http://localhost:3001/health
# Should return: {"status":"ok",...}
```

### Step 3: Test Posts Endpoint
```bash
curl http://localhost:3001/api/v1/posts
# Should return: {"success":true,"data":[...],"mock":true}
```

### Step 4: Check Web Server
```bash
# Terminal 2
cd apps/web
npm run dev

# Should see:
# ✓ Ready in 3.5s
# ○ Compiling / ...
```

### Step 5: Open Browser DevTools
1. Press F12
2. Go to Network tab
3. Refresh page
4. Look for red (404) requests
5. Click on failed request to see URL

---

## Specific 404 Scenarios

### Scenario A: `/api/v1/posts` returns 404
**Cause**: API server not running or route not registered

**Fix**:
```bash
cd apps/api
npm run dev
```

### Scenario B: Leaflet marker images 404
**Cause**: Leaflet default icons not found

**Fix**: Add to `TrendsMap.tsx`:
```typescript
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});
```

### Scenario C: User avatar images 404
**Cause**: Using dicebear API or local images that don't exist

**Fix**: Already using dicebear CDN in mock data:
```typescript
avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=priya"
```

This should work. If not, check internet connection.

### Scenario D: `/logo.png` or `/favicon.ico` 404
**Cause**: Missing public assets

**Fix**:
```bash
# Add placeholder files
cd apps/web/public
# Add logo.png and favicon.ico
```

Or ignore these - they're not critical.

---

## How to Find the Exact 404

### Method 1: Browser DevTools
1. Open page with error
2. Press F12
3. Go to Network tab
4. Refresh page (Ctrl+R)
5. Look for red items
6. Click on red item
7. See full URL in Headers tab

### Method 2: Console Logs
Look in browser console for:
```
GET http://localhost:3001/api/... 404 (Not Found)
Failed to load resource: the server responded with a status of 404
```

### Method 3: Check API Terminal
API server logs all requests:
```
GET /api/v1/posts 200 45ms
GET /api/v1/unknown 404 2ms  ← This is the problem
```

---

## Most Likely Causes (In Order)

1. **API server not running** (90% of cases)
   - Solution: `cd apps/api && npm run dev`

2. **Leaflet marker images** (5% of cases)
   - Solution: Add CDN URLs (see Scenario B above)

3. **Wrong API URL** (3% of cases)
   - Solution: Check `NEXT_PUBLIC_API_URL` env var

4. **Missing route** (2% of cases)
   - Solution: Check route is registered in `apps/api/src/index.ts`

---

## Quick Fix Script

```bash
# Stop all servers (Ctrl+C)

# Start API server
cd apps/api
npm run dev &

# Wait 3 seconds
sleep 3

# Test API
curl http://localhost:3001/health

# Start web server
cd ../web
npm run dev
```

---

## Still Getting 404?

### Provide This Information:
1. **Exact URL that's failing** (from Network tab)
2. **Which page you're on** (e.g., homepage, /trends)
3. **API server status** (running or not?)
4. **Console error messages** (full text)
5. **API terminal output** (any errors?)

### Example Report:
```
URL: http://localhost:3001/api/v1/posts
Page: Homepage (http://localhost:3000)
API Status: Running on port 3001
Console Error: "Failed to load resource: 404"
API Log: "GET /api/v1/posts 404 2ms"
```

With this info, I can provide an exact fix.

---

## Temporary Workaround

If API is having issues, the app should fall back to mock data automatically:

```typescript
// In posts.routes.ts
catch (error) {
  // Falls back to mockPosts
  return res.json({ success: true, data: mockPosts, mock: true });
}
```

So even with API issues, you should see the 10 mock posts on the homepage.

---

**Next Step**: Please check your browser's Network tab (F12 → Network) and tell me which specific URL is returning 404. That will help me give you the exact fix.
