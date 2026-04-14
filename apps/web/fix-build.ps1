# MedThread Web - Build Fix Script
# Run this script to fix build cache issues

Write-Host "🔧 MedThread Build Fix Script" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Clean build cache
Write-Host "Step 1: Cleaning build cache..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item -Recurse -Force .next
    Write-Host "✅ Removed .next folder" -ForegroundColor Green
} else {
    Write-Host "ℹ️  .next folder not found (already clean)" -ForegroundColor Gray
}

# Step 2: Clean node modules cache
Write-Host ""
Write-Host "Step 2: Cleaning node modules cache..." -ForegroundColor Yellow
if (Test-Path "node_modules/.cache") {
    Remove-Item -Recurse -Force node_modules/.cache
    Write-Host "✅ Removed node_modules/.cache" -ForegroundColor Green
} else {
    Write-Host "ℹ️  node_modules/.cache not found" -ForegroundColor Gray
}

# Step 3: Verify dependencies
Write-Host ""
Write-Host "Step 3: Verifying dependencies..." -ForegroundColor Yellow
$packages = @("react-leaflet", "leaflet", "react-chartjs-2", "chart.js")
foreach ($package in $packages) {
    $installed = npm list $package 2>&1 | Select-String $package
    if ($installed) {
        Write-Host "✅ $package is installed" -ForegroundColor Green
    } else {
        Write-Host "❌ $package is missing - installing..." -ForegroundColor Red
        npm install $package
    }
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "✅ Build fix complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Run: npm run dev" -ForegroundColor White
Write-Host "2. Open: http://localhost:3000" -ForegroundColor White
Write-Host ""
