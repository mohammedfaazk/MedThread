# MedThread Dashboard - Troubleshooting Guide

## Current Issue: Module Not Found Error

### Error Message
```
Error: Cannot find module './9369.js'
```

### Root Cause
This is a **Next.js build cache corruption** issue. The `.next` folder contains stale module references from a previous build.

### ✅ What Has Been Fixed
1. ✅ Cleared `.next` build folder
2. ✅ Fixed syntax errors in `badges/page.tsx` (missing closing div)
3. ✅ Fixed syntax errors in `notifications/page.tsx` (missing closing div)
4. ✅ Installed missing dependencies:
   - `react-chartjs-2@5.3.1`
   - `chart.js@4.5.1`
   - `leaflet@1.9.4`
   - `react-leaflet@4.2.1`

---

## 🔧 Solution: Restart Development Server

### Quick Fix (Recommended)

**Step 1: Stop All Servers**
- Press `Ctrl+C` in all terminal windows

**Step 2: Restart Web Server**
```bash
cd apps/web
npm run dev
```

**Step 3: Restart API Server (in another terminal)**
```bash
cd apps/api
npm run dev
```

**Step 4: Access Application**
- Frontend: http://localhost:3000
- API: http://localhost:3001

### Using the Fix Script (PowerShell)

```powershell
cd apps/web
.\fix-build.ps1
npm run dev
```

---

## 🔍 Verification Steps

### 1. Check Dependencies
```bash
cd apps/web
npm list react-leaflet leaflet react-chartjs-2 chart.js
```

Expected output:
```
├── chart.js@4.5.1
├── leaflet@1.9.4
├── react-chartjs-2@5.3.1
└── react-leaflet@4.2.1
```

### 2. Check Build Folder
```bash
cd apps/web
ls .next
```

Should show fresh build files with recent timestamps.

### 3. Check Console Logs
After starting dev server, you should see:
```
✓ Ready in 3.5s
○ Compiling / ...
✓ Compiled / in 2.1s
```

No errors about missing modules.

---

## 🚨 If Error Persists

### Option 1: Full Clean Rebuild

```bash
# Stop all servers first (Ctrl+C)

cd apps/web
rm -rf .next
rm -rf node_modules
npm install
npm run dev
```

### Option 2: Check Port Conflicts

```bash
# Check if ports are in use
netstat -ano | findstr :3000
netstat -ano | findstr :3001

# Kill process if needed (replace PID)
taskkill /PID <process_id> /F
```

### Option 3: Check Node Version

```bash
node --version  # Should be 18.x or higher
npm --version   # Should be 9.x or higher
```

If versions are old:
```bash
# Update Node.js from https://nodejs.org
# Then update npm
npm install -g npm@latest
```

---

## 📊 Common Issues & Solutions

### Issue: "Port 3000 already in use"
**Solution:**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or use different port
PORT=3003 npm run dev
```

### Issue: "Cannot find module 'leaflet'"
**Solution:**
```bash
cd apps/web
npm install leaflet react-leaflet
```

### Issue: "Module not found: Can't resolve 'react-chartjs-2'"
**Solution:**
```bash
cd apps/web
npm install react-chartjs-2 chart.js
```

### Issue: Build takes too long
**Solution:**
```bash
# Increase Node memory
NODE_OPTIONS=--max-old-space-size=4096 npm run dev
```

### Issue: "ENOSPC: System limit for number of file watchers reached"
**Solution (Linux/WSL):**
```bash
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

---

## 🧪 Test After Fix

### 1. Homepage Test
- Navigate to http://localhost:3000
- Should see posts with priority badges
- Check for section headers (🔴 URGENT, 🟡 NEEDS ATTENTION, 🟢 GENERAL)

### 2. Trends Page Test
- Navigate to http://localhost:3000/trends
- Map should load without errors
- Hover over countries to see tooltips

### 3. Real-Time Test
- Open browser console (F12)
- Should see: `[PostFeed] Socket connected: <id>`
- No module errors

### 4. Create Post Test
- Login and create a new post
- Should appear in feed without refresh
- Priority should be detected automatically

---

## 📝 Build Logs to Check

### Successful Build
```
✓ Compiled successfully
✓ Ready in 3.5s
○ Compiling /trends ...
✓ Compiled /trends in 2.1s
```

### Failed Build (Module Error)
```
✖ Failed to compile
Error: Cannot find module './9369.js'
```

If you see the failed build, the `.next` folder needs to be cleared again.

---

## 🔄 Clean Slate Procedure

If nothing else works, follow this complete reset:

```bash
# 1. Stop all servers (Ctrl+C)

# 2. Clean web app
cd apps/web
rm -rf .next
rm -rf node_modules
rm package-lock.json

# 3. Clean API
cd ../api
rm -rf node_modules
rm package-lock.json

# 4. Clean root
cd ../..
rm -rf node_modules
rm package-lock.json

# 5. Reinstall everything
npm install

# 6. Install web dependencies
cd apps/web
npm install

# 7. Install API dependencies
cd ../api
npm install

# 8. Start servers
cd ../api
npm run dev

# In another terminal:
cd apps/web
npm run dev
```

This takes 5-10 minutes but guarantees a clean state.

---

## ✅ Success Indicators

After fixing, you should see:

1. **No console errors** in browser or terminal
2. **Green "Live" indicator** in post feed
3. **Priority badges** on all posts (🔴🟡🟢)
4. **Section headers** grouping posts
5. **Trends map** loading correctly
6. **Socket connection** logs in console

---

## 📞 Still Having Issues?

### Check These Files
1. `apps/web/src/app/trends/page.tsx` - Should have dynamic import
2. `apps/web/src/components/TrendsMap.tsx` - Should exist
3. `apps/web/src/app/trends/leaflet.css` - Should exist
4. `apps/web/package.json` - Should have all dependencies

### Verify File Structure
```
apps/web/
├── src/
│   ├── app/
│   │   ├── trends/
│   │   │   ├── page.tsx ✓
│   │   │   └── leaflet.css ✓
│   │   ├── badges/
│   │   │   └── page.tsx ✓ (fixed)
│   │   └── notifications/
│   │       └── page.tsx ✓ (fixed)
│   └── components/
│       ├── TrendsMap.tsx ✓
│       └── PostFeed.tsx ✓ (updated)
└── package.json ✓ (dependencies added)
```

### Get Diagnostics
```bash
cd apps/web
npm run build 2>&1 | tee build-log.txt
```

This creates a `build-log.txt` file with complete build output for debugging.

---

## 🎯 Expected Behavior After Fix

### Development Server
- Starts in < 5 seconds
- No module errors
- Hot reload works
- All pages accessible

### Application
- Homepage loads with posts
- Priority system working
- Real-time updates functional
- Trends map displays
- No console errors

### Performance
- Page load: < 3 seconds
- Socket connect: < 1 second
- API response: < 200ms
- Build time: < 30 seconds

---

**Last Updated**: April 11, 2026  
**Status**: All fixes applied, restart required  
**Estimated Fix Time**: 2-3 minutes (just restart)
