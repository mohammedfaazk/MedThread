# Fix: Trends Page 404 Error

## Problem
The `/trends` page is returning 404 even though the file exists at `apps/web/src/app/trends/page.tsx`.

This happens because:
1. Next.js build cache is corrupted
2. Dev server needs a clean restart
3. The page route isn't being recognized

## Solution: Complete Clean Restart

### Step 1: Stop All Servers
Press `Ctrl+C` in all terminal windows to stop:
- Web dev server
- API dev server

### Step 2: Clean Build Cache
```bash
cd apps/web
Remove-Item -Recurse -Force .next
```

### Step 3: Restart Web Server
```bash
cd apps/web
npm run dev
```

Wait for: `✓ Ready in X.Xs`

### Step 4: Test Trends Page
Open: http://localhost:3000/trends

Should now load without 404!

---

## Alternative: Full Clean Install

If the above doesn't work:

```bash
# Stop all servers (Ctrl+C)

# Clean web app
cd apps/web
Remove-Item -Recurse -Force .next
Remove-Item -Recurse -Force node_modules
npm install

# Restart
npm run dev
```

---

## Why This Happens

Next.js caches compiled pages in `.next/` folder. When we:
1. Fixed syntax errors
2. Updated components
3. Added new features

The cache became stale and needs to be cleared.

---

## Verification Steps

After restarting:

1. **Check Dev Server Output**
```
✓ Ready in 3.5s
○ Compiling /trends ...
✓ Compiled /trends in 2.1s
```

2. **Open Browser**
Navigate to: http://localhost:3000/trends

3. **Check Console**
Should see no 404 errors

4. **Verify Map Loads**
Interactive map should display

---

## If Still Getting 404

### Check File Exists
```bash
cd apps/web
ls src/app/trends/page.tsx
```

Should show: `src/app/trends/page.tsx`

### Check File Content
The file should start with:
```typescript
'use client';
import { useState, useEffect } from 'react';
```

### Check Dev Server Logs
Look for compilation errors in terminal

### Try Different Route
Test if other pages work:
- http://localhost:3000/ (homepage)
- http://localhost:3000/communities
- http://localhost:3000/badges

If those work but /trends doesn't, there's a specific issue with the trends page.

---

## Quick Fix Commands (PowerShell)

```powershell
# Stop servers (Ctrl+C in each terminal)

# Clean and restart
cd apps\web
Remove-Item -Recurse -Force .next
npm run dev

# Wait for "Ready" message, then open:
# http://localhost:3000/trends
```

---

## Expected Result

After fix:
- ✅ `/trends` page loads
- ✅ Map displays
- ✅ No 404 errors
- ✅ Country filter works
- ✅ Disease buttons work

---

**Status**: Solution provided  
**Action**: Clean restart required  
**Time**: 1-2 minutes
