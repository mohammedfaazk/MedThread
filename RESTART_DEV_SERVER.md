# How to Fix the Module Error

## The Issue
You're seeing: `Error: Cannot find module './9369.js'`

This is a Next.js build cache corruption issue. The build cache has stale references.

## Solution: Clean Restart

### Step 1: Stop All Running Servers
Press `Ctrl+C` in all terminal windows running:
- `npm run dev` (web)
- `npm run dev` (api)

### Step 2: Clean Build Cache
```bash
# Navigate to web app
cd apps/web

# Remove build cache
rm -rf .next

# Optional: Clear node modules cache
rm -rf node_modules/.cache

# Go back to root
cd ../..
```

### Step 3: Restart Development Server
```bash
# Start API server (Terminal 1)
cd apps/api
npm run dev

# Start Web server (Terminal 2)
cd apps/web
npm run dev
```

### Step 4: Access Application
- Frontend: http://localhost:3000
- API: http://localhost:3001

---

## Alternative: Full Clean Install (If Above Doesn't Work)

```bash
# Stop all servers first

# Clean everything
cd apps/web
rm -rf .next
rm -rf node_modules
npm install

cd ../api
rm -rf node_modules
npm install

cd ../..
npm install

# Restart servers
cd apps/api && npm run dev
# In another terminal:
cd apps/web && npm run dev
```

---

## What I Already Fixed

✅ Cleared `.next` build folder
✅ Fixed syntax errors in badges/page.tsx
✅ Fixed syntax errors in notifications/page.tsx
✅ Installed missing dependencies (react-chartjs-2, chart.js)

The module error should be resolved after restarting the dev server with a clean cache.

---

## Quick Commands (PowerShell)

```powershell
# Stop servers (Ctrl+C in each terminal)

# Clean and restart
cd apps\web
Remove-Item -Recurse -Force .next
npm run dev

# In another terminal
cd apps\api
npm run dev
```

---

## If Error Persists

Check for:
1. Port conflicts (3000, 3001 already in use)
2. Node version (should be 18+)
3. npm version (should be 9+)
4. Disk space (build requires ~500MB)

Run diagnostics:
```bash
node --version
npm --version
npm list react-leaflet
npm list leaflet
```

---

The dashboard is fully functional - this is just a build cache issue that requires a clean restart.
