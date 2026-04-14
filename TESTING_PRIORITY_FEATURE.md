# Testing the Post Priority Feature

## Quick Start

### 1. Start the Application

```bash
# From the root directory
npm run dev
```

This will start:
- Backend API on `http://localhost:3001`
- Frontend on `http://localhost:3000`

### 2. Test with Mock Data (Database Unavailable)

If the database is unavailable, the app will automatically use mock data which now includes priority fields.

**Expected Behavior:**
- Feed shows 10 posts sorted by priority
- 2 HIGH priority posts (🔴 URGENT) appear at the top
- 3 MEDIUM priority posts (🟡 MODERATE) in the middle
- 5 LOW priority posts (🟢 ROUTINE) at the bottom

**Mock Posts Order:**
1. 🔴 URGENT (95) - "Severe Chest Pain and Shortness of Breath"
2. 🔴 URGENT (88) - "Sudden Severe Headache with Vision Problems"
3. 🟡 MODERATE (45) - "Understanding Diabetes"
4. 🟡 MODERATE (42) - "My Journey with Anxiety"
5. 🟡 MODERATE (40) - "Childhood Vaccination Schedule"
6. 🟢 ROUTINE (25) - "Managing Hypertension"
7. 🟢 ROUTINE (20) - "Exercise and Heart Health"
8. 🟢 ROUTINE (18) - "Common Cold vs Flu"
9. 🟢 ROUTINE (15) - "Skin Care Routine"
10. 🟢 ROUTINE (12) - "Acne Treatment Options"

### 3. Test Post Creation with Priority Analysis

**Create a HIGH Priority Post:**

```bash
curl -X POST http://localhost:3001/api/v1/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Severe chest pain radiating to left arm",
    "content": "I am experiencing severe chest pain that started 30 minutes ago. The pain is radiating to my left arm and I am sweating profusely. I have a history of hypertension. Should I go to the ER?",
    "communityId": "cardiology",
    "tags": ["chest-pain", "emergency"]
  }'
```

**Expected Result:**
- Post is created immediately
- Priority analysis runs in background
- Post appears at top of feed with 🔴 URGENT badge
- Urgency score should be 70+ (HIGH priority)

**Create a MEDIUM Priority Post:**

```bash
curl -X POST http://localhost:3001/api/v1/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Persistent headache for 3 days",
    "content": "I have had a headache for the past 3 days. It is not severe but it is constant. I have tried over-the-counter pain relievers but they do not help much.",
    "communityId": "general",
    "tags": ["headache"]
  }'
```

**Expected Result:**
- Post is created immediately
- Priority analysis runs in background
- Post appears in middle of feed with 🟡 MODERATE badge
- Urgency score should be 40-69 (MEDIUM priority)

**Create a LOW Priority Post:**

```bash
curl -X POST http://localhost:3001/api/v1/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Tips for better sleep hygiene",
    "content": "I am looking for advice on how to improve my sleep quality. What are some good sleep hygiene practices?",
    "communityId": "general",
    "tags": ["sleep", "wellness"]
  }'
```

**Expected Result:**
- Post is created immediately
- Priority analysis runs in background
- Post appears at bottom of feed with 🟢 ROUTINE badge
- Urgency score should be <40 (LOW priority)

### 4. Verify Priority Sorting

**Test the GET endpoint:**

```bash
curl http://localhost:3001/api/v1/posts?limit=10
```

**Expected Response Structure:**

```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "title": "Severe chest pain...",
      "content": "...",
      "priority": {
        "priorityLevel": "HIGH",
        "urgencyScore": 95,
        "detectedSymptoms": [
          {
            "symptom": "chest pain",
            "weight": 10,
            "category": "HIGH"
          }
        ]
      },
      "createdAt": "2024-04-11T..."
    }
  ],
  "pagination": {...}
}
```

**Verify:**
- ✅ Posts are sorted by `urgencyScore` DESC
- ✅ HIGH priority posts appear first
- ✅ Each post has a `priority` object
- ✅ Priority includes `priorityLevel`, `urgencyScore`, and `detectedSymptoms`

### 5. Frontend Visual Testing

**Open the app in browser:**
```
http://localhost:3000
```

**Check the feed:**
1. ✅ Priority badges are visible on patient posts
2. ✅ HIGH priority posts show 🔴 URGENT badge
3. ✅ MEDIUM priority posts show 🟡 MODERATE badge
4. ✅ LOW priority posts show 🟢 ROUTINE badge
5. ✅ Posts are ordered by priority (urgent at top)
6. ✅ Urgency score is displayed in badge (optional)

**Check individual post:**
1. Click on a post to view details
2. ✅ Priority badge is visible
3. ✅ Detected symptoms are shown (if available)

### 6. Test Priority Analysis with Groq API

**Prerequisites:**
- Groq API key must be set in `apps/api/.env`
- Backend must be running

**Test Groq Integration:**

Create a post with complex medical content:

```bash
curl -X POST http://localhost:3001/api/v1/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Unusual symptoms - need advice",
    "content": "I have been feeling extremely tired for the past week. I also have occasional dizziness and my heart sometimes races for no reason. I am 65 years old and have diabetes. I am not sure if this is serious or just normal aging.",
    "communityId": "general",
    "tags": ["fatigue", "dizziness"]
  }'
```

**Expected Behavior:**
1. Post is created immediately
2. Groq API is called to analyze the content
3. LLM provides urgency score based on:
   - Age (65 = high risk)
   - Existing condition (diabetes)
   - Symptoms (fatigue, dizziness, heart racing)
4. Final urgency score combines keyword + LLM scores
5. Priority level is assigned based on final score

**Check Backend Logs:**
```
[PostPriority] Analyzing post: ...
[PostPriority] LLM score: X, reasoning: "..."
[PostPriority] Final urgency score: Y
```

**If Groq API Fails:**
- System falls back to keyword-only scoring
- No errors or crashes
- Log shows: `[PostPriority] LLM scoring failed, using 0`

### 7. Test Script

Run the automated test script:

```bash
node test-priority.js
```

**Expected Output:**
```
🧪 Testing Post Priority Feature...

1️⃣ Testing GET /api/v1/posts - Priority Sorting
✅ Fetched 10 posts
📊 Posts with priority data: 10/10

📋 Priority Distribution:
  1. 🔴 HIGH (Score: 95) - "Severe Chest Pain and Shortness of Breath - Need..."
  2. 🔴 HIGH (Score: 88) - "Sudden Severe Headache with Vision Problems..."
  3. 🟡 MEDIUM (Score: 45) - "Understanding Diabetes: Prevention and Management..."
  ...

✅ Posts are correctly sorted by priority

✅ All tests completed!
```

## Troubleshooting

### Issue: Priority badges not showing

**Check:**
1. Is the post from a patient? (Priority only shows for patient posts)
2. Does the post have priority data? (Check API response)
3. Is PostPriorityBadge component imported correctly?

**Solution:**
- Check browser console for errors
- Verify API response includes `priority` field
- Check PostCard component props

### Issue: Posts not sorted by priority

**Check:**
1. Is the database query using correct orderBy?
2. Is mock data sorted correctly?
3. Are priority values present in the data?

**Solution:**
- Check backend logs for query errors
- Verify `priority` relation is included in query
- Check mock data has priority fields

### Issue: Groq API not working

**Check:**
1. Is GROQ_API_KEY set in `.env`?
2. Is the API key valid?
3. Are there network issues?

**Solution:**
- Verify environment variable: `echo $GROQ_API_KEY`
- Check backend logs for Groq errors
- System will fall back to keyword scoring automatically

### Issue: Priority analysis not running

**Check:**
1. Is post creation successful?
2. Are there errors in backend logs?
3. Is postPriorityService imported correctly?

**Solution:**
- Check backend logs: `[API] Priority analysis failed: ...`
- Verify post-priority.service.ts is accessible
- Check database connection

## Success Criteria

✅ Posts are created successfully
✅ Priority analysis runs automatically (async)
✅ Posts are sorted by priority in feed
✅ Priority badges display correctly
✅ Groq API integration works (or falls back gracefully)
✅ Mock data includes priority fields
✅ No errors in console or logs
✅ Frontend displays priority badges with correct labels
✅ Urgent posts appear at top of feed

## Performance Notes

- Priority analysis is non-blocking (async)
- Post creation returns immediately
- Groq API calls have 150 token limit (fast response)
- Fallback to keyword scoring if LLM fails
- Database queries are indexed on urgencyScore
- Mock data is pre-sorted for fast loading

## Next Steps

After successful testing:
1. Monitor Groq API usage and costs
2. Fine-tune urgency score thresholds if needed
3. Add priority filter UI for users
4. Implement priority-based notifications
5. Add analytics for priority distribution
6. Consider bulk analysis for existing posts
