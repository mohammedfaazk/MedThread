@echo off
echo.
echo ========================================
echo MedThread Web App - Quick Restart
echo ========================================
echo.

echo Stopping Node processes...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

echo Cleaning build cache...
if exist .next rmdir /s /q .next
if exist .turbo rmdir /s /q .turbo

echo.
echo ========================================
echo Cleanup complete!
echo ========================================
echo.
echo Next step: npm run dev
echo Then open: http://localhost:3000
echo.
pause
