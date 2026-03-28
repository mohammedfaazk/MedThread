@echo off
echo 🔍 Checking MedThread Servers...
echo.

echo 1️⃣  Checking API Server (port 3001)...
curl -s http://localhost:3001/health >nul 2>&1
if %errorlevel% equ 0 (
    echo    ✅ API Server is running
    curl -s http://localhost:3001/health
) else (
    echo    ❌ API Server is NOT running
    echo    → Start it with: cd apps\api ^&^& npm run dev
)

echo.

echo 2️⃣  Checking Web App (port 3000)...
curl -s http://localhost:3000 >nul 2>&1
if %errorlevel% equ 0 (
    echo    ✅ Web App is running
) else (
    echo    ❌ Web App is NOT running
    echo    → Start it with: cd apps\web ^&^& npm run dev
)

echo.

echo 3️⃣  Checking port usage...
netstat -ano | findstr :3001 >nul 2>&1
if %errorlevel% equ 0 (
    echo    Port 3001: IN USE
) else (
    echo    Port 3001: FREE
)

netstat -ano | findstr :3000 >nul 2>&1
if %errorlevel% equ 0 (
    echo    Port 3000: IN USE
) else (
    echo    Port 3000: FREE
)

echo.
echo 📋 Summary:
echo    • API should be on: http://localhost:3001
echo    • Web should be on: http://localhost:3000
echo    • Admin dashboard: http://localhost:3000/admin/analytics
echo.

pause
