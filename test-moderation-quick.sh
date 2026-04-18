#!/bin/bash
# Quick test of the moderation activity endpoint
# Note: You need to be logged in as admin and have a valid token

echo "🧪 Testing moderation activity endpoint..."
echo ""
echo "📍 Endpoint: http://localhost:3001/api/admin-analytics/moderation-activity?weeks=12"
echo ""
echo "⚠️  Note: You need to provide an admin auth token"
echo ""
echo "To test manually:"
echo "1. Login to your app as admin"
echo "2. Open browser DevTools (F12)"
echo "3. Go to Console tab"
echo "4. Run this command:"
echo ""
echo "fetch('http://localhost:3001/api/admin-analytics/moderation-activity?weeks=12', {"
echo "  headers: { 'Authorization': 'Bearer ' + localStorage.getItem('auth_token') }"
echo "}).then(r => r.json()).then(console.log)"
echo ""
echo "✅ If successful, you should see data with 12 weeks of reports"
