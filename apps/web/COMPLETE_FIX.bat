@echo off
echo.
echo ========================================
echo MedThread - Complete Fix Script
echo ========================================
echo.

echo Step 1: Stopping all Node processes...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 3 /nobreak >nul
echo Done!

echo.
echo Step 2: Cleaning build caches...
if exist .next rmdir /s /q .next
if exist .turbo rmdir /s /q .turbo
if exist node_modules\.cache rmdir /s /q node_modules\.cache
echo Done!

echo.
echo ========================================
echo Cleanup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Run: npm run dev
echo 2. Wait for "Ready" message
echo 3. Open: http://localhost:3000/trends
echo.
echo Press any key to start dev server...
pause >nul

echo.
echo Starting dev server...
npm run dev
