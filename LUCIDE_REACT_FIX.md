# Lucide React Module Error - Quick Fix

## Error
```
Cannot find module './vendor-chunks/lucide-react.js'
```

## Cause
Next.js isn't properly bundling the `lucide-react` package in development mode.

## Solution

### Step 1: Stop Dev Server
Press `Ctrl+C` in your terminal to stop the dev server.

### Step 2: Update Next.js Config
I've already updated `apps/web/next.config.js` to include:
```javascript
transpilePackages: ['@medthread/ui', '@medthread/types', 'lucide-react'],
experimental: {
  optimizePackageImports: ['@medthread/ui', 'lucide-react']
}
```

### Step 3: Clean Build Cache
```bash
# Windows Command Prompt
cd apps\web
rmdir /s /q .next
cd ..\..

# Or PowerShell
Remove-Item -Recurse -Force apps\web\.next
```

### Step 4: Restart Dev Server
```bash
npm run dev
```

## Alternative: Quick Restart Script

Create a file `restart-web.bat`:
```batch
@echo off
echo Stopping servers...
taskkill /F /IM node.exe /T 2>nul
timeout /t 2 /nobreak >nul

echo Cleaning build cache...
if exist apps\web\.next rmdir /s /q apps\web\.next

echo Starting dev server...
npm run dev
```

Then just run:
```bash
restart-web.bat
```

## Why This Happens

Next.js uses webpack to bundle dependencies. Sometimes in development mode, it creates "vendor chunks" for large packages like `lucide-react`. The error occurs when:

1. The package isn't in `transpilePackages`
2. Build cache is stale
3. Webpack can't resolve the module path

## Prevention

The fix I applied should prevent this from happening again by:
- ✅ Adding `lucide-react` to `transpilePackages`
- ✅ Adding it to `optimizePackageImports`
- ✅ Ensuring proper module resolution

## If Error Persists

Try these additional steps:

### 1. Clear All Caches
```bash
# Stop server first!
Remove-Item -Recurse -Force apps\web\.next
Remove-Item -Recurse -Force apps\web\node_modules\.cache
Remove-Item -Recurse -Force node_modules\.cache
```

### 2. Reinstall Dependencies
```bash
npm install
```

### 3. Check Package.json
Ensure `lucide-react` is installed:
```bash
cd apps\web
npm list lucide-react
```

If not found:
```bash
npm install lucide-react
```

## Status
✅ Config updated
⏳ Waiting for you to restart dev server

After restarting, the error should be gone!
