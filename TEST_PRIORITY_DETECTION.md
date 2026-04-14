# Test Priority Detection

## Quick Test Cases

### Test 1: Heart Attack (Should be HIGH)
```javascript
Title: "Heart Attack"
Content: "I think I'm having a heart attack"
Expected: HIGH priority (score: 90-100)
Keywords detected: "heart attack"
```

### Test 2: Severe Chest Pain (Should be HIGH)
```javascript
Title: "Severe Chest Pain and Shortness of Breath"
Content: "I've been experiencing severe chest pain for 2 hours with difficulty breathing"
Expected: HIGH priority (score: 90-100)
Keywords detected: "severe chest pain", "shortness of breath", "difficulty breathing"
```

### Test 3: Stroke Symptoms (Should be HIGH)
```javascript
Title: "Sudden Numbness and Confusion"
Content: "Sudden numbness on left side, slurred speech, confusion"
Expected: HIGH priority (score: 90-100)
Keywords detected: "sudden numbness", "stroke"
```

### Test 4: Persistent Fever (Should be MEDIUM)
```javascript
Title: "Fever for 3 Days"
Content: "I've had a fever of 101°F for 3 days, body aches"
Expected: MEDIUM priority (score: 50-69)
Keywords detected: "fever", "persistent"
```

### Test 5: Anxiety (Should be MEDIUM)
```javascript
Title: "Dealing with Anxiety"
Content: "I've been having panic attacks and anxiety for weeks"
Expected: MEDIUM priority (score: 40-69)
Keywords detected: "anxiety", "panic"
```

### Test 6: Vitamin Question (Should be LOW)
```javascript
Title: "Best Vitamin D Supplements?"
Content: "What are the best vitamin D supplements to take?"
Expected: LOW priority (score: 0-39)
Keywords detected: "vitamin", "supplement"
```

### Test 7: Exercise Advice (Should be LOW)
```javascript
Title: "Starting a Running Routine"
Content: "I want to start running, any tips for beginners?"
Expected: LOW priority (score: 0-39)
Keywords detected: "exercise", "running"
```

---

## Manual Testing via API

### Test Priority Detection:
```bash
# Create a test post with heart attack
curl -X POST http://localhost:3001/api/v1/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Heart Attack Emergency",
    "content": "I am experiencing severe chest pain and difficulty breathing",
    "communityId": "general"
  }'

# Check the response - should show HIGH priority
```

### Verify Priority Assignment:
```bash
# Get all posts and check priorities
curl http://localhost:3001/api/v1/posts | jq '.data[] | {
  title: .title,
  priority: .priority.priorityLevel,
  score: .priority.urgencyScore,
  symptoms: .priority.detectedSymptoms
}'
```

---

## Expected Results

### HIGH Priority Posts (🔴 Red Badge):
- Heart Attack
- Severe Chest Pain
- Difficulty Breathing
- Stroke Symptoms
- Seizure
- Unconscious
- Severe Bleeding
- Suicidal Thoughts
- Overdose
- Anaphylaxis

### MEDIUM Priority Posts (🟡 Amber Badge):
- Persistent Fever
- Chronic Pain
- Anxiety/Depression
- Infection
- Worsening Symptoms
- Persistent Cough

### LOW Priority Posts (🟢 Green Badge):
- Vitamin Questions
- Exercise Advice
- Diet Tips
- Sleep Hygiene
- Wellness Questions
- Cold/Flu (mild)

---

## Visual Verification

### In the UI:
1. HIGH priority posts should have:
   - 🔴 Red badge with "HIGH" label
   - Red left border (4px)
   - Appear at the top of the feed

2. MEDIUM priority posts should have:
   - 🟡 Amber badge with "MEDIUM" label
   - Amber left border (4px)
   - Appear in the middle

3. LOW priority posts should have:
   - 🟢 Green badge with "LOW" label
   - Green left border (4px)
   - Appear at the bottom

---

## Automated Test Script

Create a file `test-priorities.js`:

```javascript
const testCases = [
  { title: "Heart Attack", expected: "HIGH" },
  { title: "Severe Chest Pain Emergency", expected: "HIGH" },
  { title: "Difficulty Breathing", expected: "HIGH" },
  { title: "Stroke Symptoms", expected: "HIGH" },
  { title: "Persistent Fever for 3 Days", expected: "MEDIUM" },
  { title: "Chronic Back Pain", expected: "MEDIUM" },
  { title: "Anxiety and Depression", expected: "MEDIUM" },
  { title: "Best Vitamin D Supplements", expected: "LOW" },
  { title: "Running Tips for Beginners", expected: "LOW" },
  { title: "Sleep Hygiene Advice", expected: "LOW" },
];

async function testPriorities() {
  for (const test of testCases) {
    const response = await fetch('http://localhost:3001/api/v1/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN'
      },
      body: JSON.stringify({
        title: test.title,
        content: test.title,
        communityId: 'general'
      })
    });
    
    const data = await response.json();
    const actual = data.data.priority?.priorityLevel || 'NONE';
    const passed = actual === test.expected;
    
    console.log(`${passed ? '✅' : '❌'} "${test.title}"`);
    console.log(`   Expected: ${test.expected}, Got: ${actual}\n`);
  }
}

testPriorities();
```

Run with:
```bash
node test-priorities.js
```

---

## Success Criteria

✅ "Heart Attack" shows HIGH priority (🔴)
✅ "Chest Pain" shows HIGH priority (🔴)
✅ "Stroke" shows HIGH priority (🔴)
✅ "Fever" shows MEDIUM priority (🟡)
✅ "Anxiety" shows MEDIUM priority (🟡)
✅ "Vitamin" shows LOW priority (🟢)
✅ Posts are sorted: HIGH → MEDIUM → LOW
✅ Left borders match priority colors
✅ Badges show correct labels

---

## If Tests Fail

1. **Check Groq API Key** is set in `.env`
2. **Run the fix script**: `npx tsx src/scripts/fix-post-priorities.ts`
3. **Clear database** and recreate posts
4. **Check backend logs** for priority analysis errors
5. **Verify keywords** are in the TEXT_KEYWORDS object

---

**All tests passing = Priority system working correctly! 🎉**
