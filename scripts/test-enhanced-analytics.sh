#!/bin/bash

# Enhanced Analytics Testing Script
# This script helps test the new analytics features

API_URL="${API_URL:-http://localhost:3001}"
TOKEN="${AUTH_TOKEN:-}"

echo "🧪 Enhanced Analytics Testing Script"
echo "===================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Doctor Specialty Distribution
echo -e "${YELLOW}Test 1: Doctor Specialty Distribution${NC}"
response=$(curl -s "$API_URL/api/enhanced-analytics/doctor-specialty-distribution")
if echo "$response" | grep -q "success"; then
    echo -e "${GREEN}✓ Doctor specialty distribution endpoint working${NC}"
    echo "$response" | jq '.data.distribution[0:3]' 2>/dev/null || echo "$response"
else
    echo -e "${RED}✗ Doctor specialty distribution endpoint failed${NC}"
    echo "$response"
fi
echo ""

# Test 2: Community Activity
echo -e "${YELLOW}Test 2: Community Activity Analysis${NC}"
response=$(curl -s "$API_URL/api/enhanced-analytics/community-activity")
if echo "$response" | grep -q "success"; then
    echo -e "${GREEN}✓ Community activity endpoint working${NC}"
    echo "$response" | jq '.data[0:2]' 2>/dev/null || echo "$response"
else
    echo -e "${RED}✗ Community activity endpoint failed${NC}"
    echo "$response"
fi
echo ""

# Test 3: Top Doctors
echo -e "${YELLOW}Test 3: Top Doctors${NC}"
response=$(curl -s "$API_URL/api/enhanced-analytics/top-doctors?limit=5")
if echo "$response" | grep -q "success"; then
    echo -e "${GREEN}✓ Top doctors endpoint working${NC}"
    echo "$response" | jq '.data[0:3]' 2>/dev/null || echo "$response"
else
    echo -e "${RED}✗ Top doctors endpoint failed${NC}"
    echo "$response"
fi
echo ""

# Test 4: Top Doctors by Specialty
echo -e "${YELLOW}Test 4: Top Doctors by Specialty (Cardiology)${NC}"
response=$(curl -s "$API_URL/api/enhanced-analytics/top-doctors?specialty=Cardiology&limit=5")
if echo "$response" | grep -q "success"; then
    echo -e "${GREEN}✓ Top doctors by specialty endpoint working${NC}"
    echo "$response" | jq '.data[0:2]' 2>/dev/null || echo "$response"
else
    echo -e "${RED}✗ Top doctors by specialty endpoint failed${NC}"
    echo "$response"
fi
echo ""

# Test 5: Doctor Stats (requires doctor ID)
if [ -n "$DOCTOR_ID" ]; then
    echo -e "${YELLOW}Test 5: Doctor Stats (ID: $DOCTOR_ID)${NC}"
    response=$(curl -s "$API_URL/api/enhanced-analytics/doctor-stats/$DOCTOR_ID")
    if echo "$response" | grep -q "success"; then
        echo -e "${GREEN}✓ Doctor stats endpoint working${NC}"
        echo "$response" | jq '.data' 2>/dev/null || echo "$response"
    else
        echo -e "${RED}✗ Doctor stats endpoint failed${NC}"
        echo "$response"
    fi
    echo ""
else
    echo -e "${YELLOW}Test 5: Doctor Stats${NC}"
    echo -e "${YELLOW}⚠ Skipped (set DOCTOR_ID environment variable to test)${NC}"
    echo ""
fi

# Test 6: Track Conversion (requires auth)
if [ -n "$TOKEN" ] && [ -n "$COMMENT_ID" ] && [ -n "$DOCTOR_ID" ] && [ -n "$POST_ID" ]; then
    echo -e "${YELLOW}Test 6: Track Conversion${NC}"
    response=$(curl -s -X POST "$API_URL/api/enhanced-analytics/track-conversion" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $TOKEN" \
        -d "{\"commentId\":\"$COMMENT_ID\",\"doctorId\":\"$DOCTOR_ID\",\"postId\":\"$POST_ID\",\"action\":\"profile_visit\"}")
    if echo "$response" | grep -q "success"; then
        echo -e "${GREEN}✓ Track conversion endpoint working${NC}"
        echo "$response" | jq '.' 2>/dev/null || echo "$response"
    else
        echo -e "${RED}✗ Track conversion endpoint failed${NC}"
        echo "$response"
    fi
    echo ""
else
    echo -e "${YELLOW}Test 6: Track Conversion${NC}"
    echo -e "${YELLOW}⚠ Skipped (requires AUTH_TOKEN, COMMENT_ID, DOCTOR_ID, POST_ID)${NC}"
    echo ""
fi

# Test 7: Patient Feedback (requires auth)
if [ -n "$TOKEN" ] && [ -n "$DOCTOR_ID" ]; then
    echo -e "${YELLOW}Test 7: Patient Feedback${NC}"
    response=$(curl -s -X POST "$API_URL/api/enhanced-analytics/patient-feedback" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $TOKEN" \
        -d "{\"doctorId\":\"$DOCTOR_ID\",\"status\":\"NOT_YET\"}")
    if echo "$response" | grep -q "success"; then
        echo -e "${GREEN}✓ Patient feedback endpoint working${NC}"
        echo "$response" | jq '.' 2>/dev/null || echo "$response"
    else
        echo -e "${RED}✗ Patient feedback endpoint failed${NC}"
        echo "$response"
    fi
    echo ""
else
    echo -e "${YELLOW}Test 7: Patient Feedback${NC}"
    echo -e "${YELLOW}⚠ Skipped (requires AUTH_TOKEN and DOCTOR_ID)${NC}"
    echo ""
fi

# Test 8: Check Feedback Needed (requires auth)
if [ -n "$TOKEN" ]; then
    echo -e "${YELLOW}Test 8: Check Feedback Needed${NC}"
    response=$(curl -s "$API_URL/api/enhanced-analytics/check-feedback-needed" \
        -H "Authorization: Bearer $TOKEN")
    if echo "$response" | grep -q "success"; then
        echo -e "${GREEN}✓ Check feedback needed endpoint working${NC}"
        echo "$response" | jq '.' 2>/dev/null || echo "$response"
    else
        echo -e "${RED}✗ Check feedback needed endpoint failed${NC}"
        echo "$response"
    fi
    echo ""
else
    echo -e "${YELLOW}Test 8: Check Feedback Needed${NC}"
    echo -e "${YELLOW}⚠ Skipped (requires AUTH_TOKEN)${NC}"
    echo ""
fi

# Test 9: Doctor Portfolio (requires auth and admin role)
if [ -n "$TOKEN" ] && [ -n "$DOCTOR_ID" ]; then
    echo -e "${YELLOW}Test 9: Doctor Portfolio (Admin)${NC}"
    response=$(curl -s "$API_URL/api/enhanced-analytics/doctor-portfolio/$DOCTOR_ID" \
        -H "Authorization: Bearer $TOKEN")
    if echo "$response" | grep -q "success"; then
        echo -e "${GREEN}✓ Doctor portfolio endpoint working${NC}"
        echo "$response" | jq '.data.performance' 2>/dev/null || echo "$response"
    else
        echo -e "${RED}✗ Doctor portfolio endpoint failed (may require admin role)${NC}"
        echo "$response"
    fi
    echo ""
else
    echo -e "${YELLOW}Test 9: Doctor Portfolio${NC}"
    echo -e "${YELLOW}⚠ Skipped (requires AUTH_TOKEN and DOCTOR_ID, must be admin)${NC}"
    echo ""
fi

echo ""
echo "===================================="
echo "Testing Complete!"
echo ""
echo "Usage:"
echo "  Basic tests (no auth):"
echo "    ./scripts/test-enhanced-analytics.sh"
echo ""
echo "  With authentication:"
echo "    AUTH_TOKEN=your_token DOCTOR_ID=doctor_id ./scripts/test-enhanced-analytics.sh"
echo ""
echo "  Full test with all parameters:"
echo "    AUTH_TOKEN=token DOCTOR_ID=id COMMENT_ID=cid POST_ID=pid ./scripts/test-enhanced-analytics.sh"
echo ""
