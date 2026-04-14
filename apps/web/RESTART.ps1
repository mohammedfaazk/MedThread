# Complete Restart Script for MedThread Web App
# This will fix all 404 errors

Write-Host ""
Write-Host "🔄 MedThread Complete Restart" -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Kill any running Node processes
Write-Host "Step 1: Stopping all Node processes..." -ForegroundColor Yellow
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2
Write-Host "✅ Processes stopped" -ForegroundColor Green

# Step 2: Clean all caches
Write-Host ""
Write-Host "Step 2: Cleaning build caches..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item -Recurse -Force .next
    Write-Host "✅ Removed .next" -ForegroundColor Green
}
if (Test-Path ".turbo") {
    Remove-Item -Recurse -Force .turbo
    Write-Host "✅ Removed .turbo" -ForegroundColor Green
}
if (Test-Path "node_modules/.cache") {
    Remove-Item -Recurse -Force node_modules/.cache
    Write-Host "✅ Removed node_modules/.cache" -ForegroundColor Green
}

# Step 3: Verify package.json exists
Write-Host ""
Write-Host "Step 3: Verifying project structure..." -ForegroundColor Yellow
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: package.json not found!" -ForegroundColor Red
    Write-Host "   Make sure you're in apps/web directory" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ Project structure OK" -ForegroundColor Green

# Step 4: Check Node version
Write-Host ""
Write-Host "Step 4: Checking Node.js version..." -ForegroundColor Yellow
$nodeVersion = node --version
Write-Host "   Node version: $nodeVersion" -ForegroundColor Gray
if ($nodeVersion -match "v(\d+)\.") {
    $majorVersion = [int]$matches[1]
    if ($majorVersion -lt 18) {
        Write-Host "⚠️  Warning: Node.js 18+ recommended (you have $nodeVersion)" -ForegroundColor Yellow
    } else {
        Write-Host "✅ Node version OK" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "==============================" -ForegroundColor Cyan
Write-Host "✅ Cleanup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next step: Start the dev server" -ForegroundColor Cyan
Write-Host "Run: npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Then open: http://localhost:3000" -ForegroundColor White
Write-Host ""
