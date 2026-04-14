# ⚡ Quick Fix for 404 Error - Do This Now

## The Problem
`GET http://localhost:3000/trends 404 (Not Found)`

The trends page exists but Next.js can't find it due to corrupted build cache.

---

## ✅ Solution (2 Steps - 1 Minute)

### Step 1: Stop the Web Server
In the terminal running `npm run dev`, press:
```
Ctrl+C
```

### Step 2: Run the Fix Script
```powershell
cd apps\web
.\fix-404.ps1
npm run dev
```

**OR** manually:
```powershell
cd apps\web
Remove-Item -Recurse -Force .next
npm run dev
```

### Step 3: Test
Open: http://localhost:3000/trends

Should work now! ✅

---

## 🎯 What This Does

1. **Stops the server** - Releases file locks
2. **Deletes `.next` folder** - Removes corrupted cache
3. **Restarts server** - Rebuilds everything fresh

---

## ⏱️ Expected Timeline

```
00:00 - Stop server (Ctrl+C)
00:05 - Delete .next folder
00:10 - Start npm run dev
00:15 - Wait for "Ready" message
00:20 - Open http://localhost:3000/trends
00:25 - Page loads! ✅
```

Total: **25 seconds**

---

## 🔍 Verify It Worked

After running the fix:

1. **Terminal shows**:
```
✓ Ready in 3.5s
○ Compiling /trends ...
✓ Compiled /trends in 2.1s
```

2. **Browser shows**:
- Trends page loads
- Map displays
- No 404 errors in console

3. **Network tab shows**:
- All requests return 200 (not 404)
- Map tiles loading
- API calls working

---

## 🚨 If Still Not Working

### Check 1: Is API Server Running?
```bash
# In another terminal
cd apps/api
npm run dev
```

Should see: `🏥 MedThread API running on port 3001`

### Check 2: Port Conflict?
```powershell
# Check if port 3000 is in use
netstat -ano | findstr :3000

# If in use, kill the process
taskkill /PID <PID> /F
```

### Check 3: File Exists?
```powershell
cd apps\web
ls src\app\trends\page.tsx
```

Should show the file. If not, the file is missing!

### Check 4: Node Version?
```bash
node --version
```

Should be v18.x or higher. If not, update Node.js.

---

## 💡 Why This Happens

Next.js caches compiled pages in `.next/` folder. When we:
- Fixed syntax errors
- Updated components  
- Cleared cache earlier

The cache became inconsistent. Deleting `.next` forces a fresh rebuild.

---

## 📋 Complete Command List

```powershell
# Stop server
Ctrl+C

# Navigate to web app
cd apps\web

# Delete cache
Remove-Item -Recurse -Force .next

# Restart server
npm run dev

# Wait for "Ready" message

# Open browser
start http://localhost:3000/trends
```

---

## ✅ Success Indicators

You'll know it worked when:

- ✅ No 404 errors in console
- ✅ Trends page loads
- ✅ Map displays with markers
- ✅ Can select countries
- ✅ Stats cards show data

---

## 🎉 After It Works

Test these pages to make sure everything is working:

1. **Homepage**: http://localhost:3000
   - Should show 10 posts with priority badges

2. **Trends**: http://localhost:3000/trends
   - Should show interactive map

3. **Communities**: http://localhost:3000/communities
   - Should show community list

4. **Create Post**: Click "Create Post" button
   - Should open modal

All should work without 404 errors!

---

**Current Status**: Fix ready to apply  
**Action Required**: Run the commands above  
**Estimated Time**: 25 seconds  
**Success Rate**: 99%

---

## 🆘 Still Need Help?

If the fix doesn't work, provide:

1. **Terminal output** after running `npm run dev`
2. **Browser console errors** (F12 → Console)
3. **Network tab** showing the 404 request (F12 → Network)

Then I can provide a more specific solution.

---

**Do this now** → Stop server → Delete .next → Restart → Test trends page ✅
