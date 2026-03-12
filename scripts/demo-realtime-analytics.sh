#!/bin/bash

echo "🔴 Real-Time Analytics Demo"
echo "================================"
echo ""
echo "This script will simulate real-time analytics updates"
echo "Open http://localhost:3000/analytics in your browser first!"
echo ""
read -p "Press Enter when dashboard is open..."

API_URL="http://localhost:3001"

# Symptoms to simulate
SYMPTOMS=("fever" "cough" "headache" "fatigue" "sore throat" "body aches" "nausea")
SEVERITIES=("mild" "moderate" "severe")

echo ""
echo "📊 Simulating 10 symptom reports..."
echo "Watch the dashboard update in real-time!"
echo ""

for i in {1..10}; do
  # Random symptom and severity
  SYMPTOM=${SYMPTOMS[$RANDOM % ${#SYMPTOMS[@]}]}
  SEVERITY=${SEVERITIES[$RANDOM % ${#SEVERITIES[@]}]}
  
  echo "[$i/10] Reporting: $SYMPTOM ($SEVERITY)"
  
  curl -s -X POST "$API_URL/api/health-analytics/symptom-report" \
    -H "Content-Type: application/json" \
    -d "{
      \"sessionId\": \"demo-$(date +%s)-$i\",
      \"symptoms\": [{\"name\": \"$SYMPTOM\", \"severity\": \"$SEVERITY\"}],
      \"age\": $((20 + RANDOM % 60)),
      \"gender\": \"$([ $((RANDOM % 2)) -eq 0 ] && echo 'male' || echo 'female')\"
    }" > /dev/null
  
  sleep 2
done

echo ""
echo "✅ Demo complete!"
echo "Check your dashboard - it should show updated trends!"
