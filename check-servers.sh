#!/bin/bash

echo "🔍 Checking MedThread Servers..."
echo ""

# Check API Server
echo "1️⃣  Checking API Server (port 3001)..."
if curl -s http://localhost:3001/health > /dev/null 2>&1; then
    echo "   ✅ API Server is running"
    curl -s http://localhost:3001/health | jq .
else
    echo "   ❌ API Server is NOT running"
    echo "   → Start it with: cd apps/api && npm run dev"
fi

echo ""

# Check Web App
echo "2️⃣  Checking Web App (port 3000)..."
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "   ✅ Web App is running"
else
    echo "   ❌ Web App is NOT running"
    echo "   → Start it with: cd apps/web && npm run dev"
fi

echo ""

# Check if ports are in use
echo "3️⃣  Checking port usage..."
if command -v lsof > /dev/null 2>&1; then
    echo "   Port 3001: $(lsof -ti:3001 | wc -l) process(es)"
    echo "   Port 3000: $(lsof -ti:3000 | wc -l) process(es)"
elif command -v netstat > /dev/null 2>&1; then
    echo "   Port 3001: $(netstat -ano | grep :3001 | wc -l) connection(s)"
    echo "   Port 3000: $(netstat -ano | grep :3000 | wc -l) connection(s)"
else
    echo "   ⚠️  Cannot check ports (lsof/netstat not available)"
fi

echo ""
echo "📋 Summary:"
echo "   • API should be on: http://localhost:3001"
echo "   • Web should be on: http://localhost:3000"
echo "   • Admin dashboard: http://localhost:3000/admin/analytics"
echo ""
