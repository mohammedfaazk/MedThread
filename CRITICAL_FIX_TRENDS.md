# CRITICAL: Trends Page 404 - Real Fix

## The Real Problem

The error `GET http://localhost:3000/trends 404` with repeated `setTimeout` calls suggests:

1. **Dev server isn't compiling the page** - Next.js can't find/compile `/trends`
2. **Build error is being hidden** - Check terminal for compilation errors
3. **Route conflict** - Multiple page files might exist

## ✅ SOLUTION: Complete Reset

### Step 1: STOP Everything
```bash
# Press Ctrl+C in ALL terminals
# Make sure NOTHING is running
```

### Step 2: Check for Compilation Errors
```bash
cd apps/web

# Try to build (this will show errors)
npm run build
```

Look for errors mentioning `trends` or `TrendsMap`.

### Step 3: If Build Fails

Check these common issues:

#### Issue A: Missing Import
```typescript
// In TrendsMap.tsx, make sure L is imported
import L from 'leaflet';
```

#### Issue B: Duplicate Page Files
```bash
# Check for multiple page files
ls src/app/trends/page*.tsx
```

Should only see `page.tsx`. If you see `page-minimal.tsx` or others, that's the problem.

#### Issue C: CSS Import Error
```typescript
// In page.tsx, check this line:
import './leaflet.css';
```

Make sure `leaflet.css` exists in the same folder.

### Step 4: Clean Everything
```powershell
cd apps\web

# Delete ALL cache
Remove-Item -Recurse -Force .next
Remove-Item -Recurse -Force .turbo
Remove-Item -Recurse -Force node_modules\.cache

# Reinstall dependencies
npm install

# Try build again
npm run build
```

### Step 5: If Build Succeeds
```bash
npm run dev
```

Then test: http://localhost:3000/trends

---

## Alternative: Use Working Trends Page

If the current trends page has issues, we can use a simpler version:

### Option 1: Rename to Disable
```powershell
cd apps\web\src\app\trends
Rename-Item page.tsx page.tsx.backup
Rename-Item page-minimal.tsx page.tsx
```

### Option 2: Create Simple Version
```powershell
cd apps\web\src\app\trends
# Delete current page.tsx
Remove-Item page.tsx
```

Then create new `page.tsx`:
```typescript
'use client';

export default function TrendsPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Global Health Trends</h1>
      <p>Trends page is being rebuilt...</p>
      <a href="/" className="text-blue-600 hover:underline">
        ← Back to Homepage
      </a>
    </div>
  );
}
```

This will at least stop the 404 error.

---

## Debug: Check What's Actually Happening

### In Terminal (where npm run dev is running):
Look for these messages:

**Good**:
```
✓ Compiled /trends in 2.1s
```

**Bad**:
```
✖ Failed to compile
./src/app/trends/page.tsx
Module not found: Can't resolve...
```

### In Browser Console:
The `check @ trends:5` error suggests something is polling the page.

**Check**:
1. Disable all browser extensions
2. Try incognito mode
3. Clear browser cache (Ctrl+Shift+Delete)

---

## Nuclear Option: Skip Trends Page

If nothing works, we can disable the trends page temporarily:

```powershell
cd apps\web\src\app
Rename-Item trends trends.disabled
```

This removes the route entirely. The rest of the app will work fine.

---

## What to Check RIGHT NOW

1. **Is dev server actually running?**
   ```bash
   # Check if process exists
   netstat -ano | findstr :3000
   ```

2. **Are there compilation errors?**
   - Look at the terminal running `npm run dev`
   - Any red error messages?

3. **Can you access homepage?**
   - Try: http://localhost:3000
   - If this also 404s, the dev server isn't running

4. **Try a different page**
   - Try: http://localhost:3000/communities
   - If this works, it's specific to /trends

---

## Most Likely Cause

Based on the error pattern, I suspect:

**The dev server crashed or isn't compiling the trends page**

### Fix:
1. Stop dev server (Ctrl+C)
2. Delete .next folder
3. Start dev server
4. Watch terminal for compilation messages
5. Look for errors about trends/TrendsMap

---

## Report Back

Please provide:

1. **Terminal output** when you run `npm run dev`
   - Copy the last 20 lines

2. **Does homepage work?**
   - http://localhost:3000 - Yes/No?

3. **Build output**:
   ```bash
   cd apps/web
   npm run build 2>&1 | Select-Object -Last 30
   ```

4. **File check**:
   ```bash
   ls src/app/trends/
   ```

With this info, I can give you the exact fix.

---

**Action**: Check terminal for errors, try build command, report back
