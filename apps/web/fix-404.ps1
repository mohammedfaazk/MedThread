# MedThread - Fix 404 Errors Script
# This script cleans the build cache and restarts the dev server

Write-Host ""
Write-Host "🔧 MedThread 404 Fix Script" -ForegroundColor Cyan
Write-Host "============================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: Not in apps/web directory" -ForegroundColor Red
    Write-Host "Please run: cd apps\web" -ForegroundColor Yellow
    exit 1
}

# Step 1: Clean .next folder
Write-Host "Step 1: Cleaning build cache..." -ForegroundColor Yellow
if (Test-Path ".next") {
    try {
        Remove-Item -Recurse -Force .next -ErrorAction Stop
        Write-Host "✅ Removed .next folder" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  Could not remove .next folder (may be in use)" -ForegroundColor Yellow
        Write-Host "   Please stop the dev server first (Ctrl+C)" -ForegroundColor Yellow
        exit 1
    }
} else {
    Write-Host "ℹ️  .next folder not found (already clean)" -ForegroundColor Gray
}

# Step 2: Clean node_modules cache (optional)
Write-Host ""
Write-Host "Step 2: Cleaning node_modules cache..." -ForegroundColor Yellow
if (Test-Path "node_modules/.cache") {
    Remove-Item -Recurse -Force node_modules/.cache -ErrorAction SilentlyContinue
    Write-Host "✅ Removed node_modules/.cache" -ForegroundColor Green
} else {
    Write-Host "ℹ️  node_modules/.cache not found" -ForegroundColor Gray
}

# Step 3: Verify critical files
Write-Host ""
Write-Host "Step 3: Verifying critical files..." -ForegroundColor Yellow

$criticalFiles = @(
    "src/app/trends/page.tsx",
    "src/components/TrendsMap.tsx",
    "src/app/trends/leaflet.css",
    "src/components/PostFeed.tsx"
)

$allFilesExist = $true
foreach ($file in $criticalFiles) {
    if (Test-Path $file) {
        Write-Host "✅ $file exists" -ForegroundColor Green
    } else {
        Write-Host "❌ $file missing!" -ForegroundColor Red
        $allFilesExist = $false
    }
}

if (-not $allFilesExist) {
    Write-Host ""
    Write-Host "⚠️  Some critical files are missing!" -ForegroundColor Red
    Write-Host "   The application may not work correctly." -ForegroundColor Yellow
    exit 1
}

# Step 4: Check dependencies
Write-Host ""
Write-Host "Step 4: Checking dependencies..." -ForegroundColor Yellow

$requiredPackages = @("react-leaflet", "leaflet", "react-chartjs-2", "chart.js")
$missingPackages = @()

foreach ($package in $requiredPackages) {
    $check = npm list $package 2>&1 | Select-String $package
    if ($check) {
        Write-Host "✅ $package installed" -ForegroundColor Green
    } else {
        Write-Host "❌ $package missing" -ForegroundColor Red
        $missingPackages += $package
    }
}

if ($missingPackages.Count -gt 0) {
    Write-Host ""
    Write-Host "Installing missing packages..." -ForegroundColor Yellow
    npm install $missingPackages
}

# Summary
Write-Host ""
Write-Host "============================" -ForegroundColor Cyan
Write-Host "✅ Fix complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Run: npm run dev" -ForegroundColor White
Write-Host "2. Wait for 'Ready' message" -ForegroundColor White
Write-Host "3. Open: http://localhost:3000/trends" -ForegroundColor White
Write-Host ""
Write-Host "If you still see 404 errors:" -ForegroundColor Yellow
Write-Host "- Make sure API server is running (cd apps/api && npm run dev)" -ForegroundColor Gray
Write-Host "- Try hard refresh in browser (Ctrl+Shift+R)" -ForegroundColor Gray
Write-Host "- Check browser console for specific error messages" -ForegroundColor Gray
Write-Host ""
