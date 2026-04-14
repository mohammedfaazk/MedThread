# How to Fix Post Priorities

## Problem
Posts like "Heart Attack" are showing as LOW priority when they should be HIGH priority. This is a critical medical safety issue.

## Root Cause
Existing posts in the database were created before the priority system was implemented, or the priority analysis failed/wasn't run.

---

## Solution 1: Fix Individual Posts (UI Method)

### For Post Authors:
1. Navigate to your post
2. Click the three-dot menu (⋮) in the top right
3. Click "Fix Priority"
4. Confirm the re-analysis
5. The post will be re-analyzed and priority updated

### Result:
- "Heart Attack" → HIGH priority (score: 90-100)
- "Chest Pain" → HIGH priority (score: 90-100)
- "Persistent Fever" → MEDIUM priority (score: 50-69)
- "Vitamin D Question" → LOW priority (score: 0-39)

---

## Solution 2: Bulk Fix All Posts (API Method)

### Using the API Endpoint:

```bash
# Fix a specific post
curl -X POST http://localhost:3001/api/fix-priorities/post/POST_ID \
  -H "Authorization: Bearer YOUR_TOKEN"

# Bulk fix all posts (admin only)
curl -X POST http://localhost:3001/api/fix-priorities/bulk \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"limit": 100}'

# Get priority statistics
curl http://localhost:3001/api/fix-priorities/stats
```

---

## Solution 3: Run the Fix Script (Backend Method)

### Step 1: Navigate to API directory
```bash
cd apps/api
```

### Step 2: Run the fix script
```bash
npx tsx src/scripts/fix-post-priorities.ts
```

### What it does:
- Scans all posts in the database
- Identifies posts with HIGH priority keywords but wrong priority
- Re-analyzes using the priority service
- Updates the database with correct priorities
- Shows detailed output of what was fixed

### Example Output:
```
🔍 Starting priority fix for all posts...

📊 Found 50 posts to analyze

🚨 FIXING: "Heart Attack"
   Current: LOW (score: 15)
   New: HIGH (score: 95)
   Detected: heart attack, chest pain, emergency

🚨 FIXING: "Severe Chest Pain - Need Help"
   Current: MEDIUM (score: 45)
   New: HIGH (score: 92)
   Detected: severe chest pain, difficulty breathing

✅ OK: "Vitamin D Supplements" - LOW (18)
✅ OK: "Persistent Fever" - MEDIUM (58)

============================================================
✅ Fixed/Analyzed: 15 posts
❌ Errors: 0 posts
📊 Total: 50 posts
============================================================

✨ Priority fix complete!
```

---

## Updated Priority Keywords

### HIGH Priority (Score 70-100) - LIFE-THREATENING
- heart attack, cardiac arrest, myocardial infarction
- chest pain, crushing chest pain, radiating pain
- difficulty breathing, shortness of breath, can't breathe
- stroke, seizure, unconscious, unresponsive
- severe bleeding, severe injury, major trauma
- suicidal thoughts, overdose, poisoning
- anaphylaxis, severe allergic reaction
- choking, not breathing
- severe abdominal pain, severe burns

### MEDIUM Priority (Score 40-69) - URGENT
- persistent fever, high fever
- persistent cough, worsening symptoms
- chronic pain, back pain, joint pain
- anxiety, depression, panic attacks
- infection, vomiting, bleeding
- dizziness, nausea, swelling
- urinary problems, memory problems

### LOW Priority (Score 0-39) - ROUTINE
- cold, cough, runny nose, sneezing
- mild headache, tiredness, stress
- vitamin questions, supplement advice
- diet, exercise, fitness questions
- sleep hygiene, wellness, prevention

---

## Verification

### Check if priorities are correct:

1. **Via UI**: Navigate to the home feed
   - HIGH priority posts (🔴 red badge) should be at the top
   - Posts should have red/amber/green left borders
   - "Heart Attack" should show HIGH priority

2. **Via API**: 
```bash
curl http://localhost:3001/api/v1/posts | jq '.data[] | {title, priority: .priority.priorityLevel, score: .priority.urgencyScore}'
```

3. **Via Database**:
```sql
SELECT 
  p.title,
  pp.priorityLevel,
  pp.urgencyScore,
  pp.detectedSymptoms
FROM Post p
LEFT JOIN PostPriority pp ON p.id = pp.postId
ORDER BY 
  CASE pp.priorityLevel 
    WHEN 'HIGH' THEN 0 
    WHEN 'MEDIUM' THEN 1 
    WHEN 'LOW' THEN 2 
    ELSE 3 
  END,
  pp.urgencyScore DESC;
```

---

## Prevention: Ensure New Posts Get Correct Priority

The system is now configured to automatically assign correct priorities to new posts:

1. **On Post Creation**: Priority is analyzed immediately using Groq API
2. **Keyword Fallback**: If Groq fails, uses keyword matching
3. **Socket Emission**: New posts are broadcast with correct priority
4. **Real-time Update**: All users see the post at correct position

### Test it:
1. Create a new post with title "Severe Chest Pain Emergency"
2. It should immediately show HIGH priority (🔴 red badge)
3. It should appear at the top of the feed
4. Other users should see it instantly via socket.io

---

## Troubleshooting

### Priority still wrong after fix?

1. **Check Groq API Key**:
```bash
# In apps/api/.env
GROQ_API_KEY=your_key_here
```

2. **Check backend logs**:
```bash
cd apps/api
npm run dev
# Look for: [API] Priority analysis complete
```

3. **Manually trigger re-analysis**:
```bash
curl -X POST http://localhost:3001/api/fix-priorities/post/POST_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Posts not sorting correctly?

1. **Clear browser cache** and refresh
2. **Check API response**:
```bash
curl http://localhost:3001/api/v1/posts
# Verify posts are sorted: HIGH → MEDIUM → LOW
```

3. **Check frontend console** for errors

### "Fix Priority" button not working?

1. Make sure you're logged in
2. Make sure you're the post author
3. Check browser console for errors
4. Verify the API endpoint is accessible

---

## Summary

✅ **Updated priority keywords** to include more emergency terms
✅ **Created fix script** to bulk update all posts
✅ **Added API endpoints** for manual priority fixes
✅ **Added UI button** for post authors to fix their posts
✅ **Improved detection** for heart attack, stroke, and other emergencies

**Critical posts like "Heart Attack" will now correctly show as HIGH priority! 🚨**
