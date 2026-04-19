# 🚀 Sentiment Analysis Quick Start Guide

## What is This?

Your doctor scoring system now analyzes the **text content** of patient reviews using AI, not just star ratings. This gives you more accurate doctor scores.

## Quick Setup (3 Steps)

### 1. Add OpenAI API Key (Optional but Recommended)

Add to `apps/api/.env`:
```bash
OPENAI_API_KEY=sk-your-key-here
```

Without this, it falls back to keyword-based analysis (still works, just less accurate).

### 2. Update Existing Doctor Scores

Run once to analyze all existing reviews:
```bash
cd apps/api
npx ts-node scripts/update-doctor-sentiment-scores.ts
```

This will:
- Analyze all existing patient reviews
- Calculate sentiment scores
- Update doctor performance scores
- Show progress for each doctor

### 3. Integrate into Your Code

Add this line after creating a new rating:

```typescript
import { onDoctorRatingCreated } from './hooks/review-sentiment-hook';

// After creating rating
await prisma.doctorRating.create({ data: ratingData });
await onDoctorRatingCreated(doctorId, reviewText, starRating); // ← Add this
```

That's it! Scores will update automatically.

## API Endpoints

### Get Doctor Score
```bash
GET /api/doctor-sentiment/:doctorId/score
```

Response:
```json
{
  "score": 4.24,
  "outOf": 5,
  "totalReviews": 45,
  "sentimentSummary": "87% positive feedback from 32 reviews",
  "breakdown": {
    "stars": 4.2,
    "sentiment": "Positive"
  }
}
```

### Preview Sentiment (Before Submission)
```bash
POST /api/doctor-sentiment/analyze-review
Content-Type: application/json

{
  "text": "Dr. Smith was very caring and explained everything clearly."
}
```

Response:
```json
{
  "score": 0.75,
  "confidence": 0.85,
  "category": "POSITIVE",
  "keywords": {
    "positive": ["caring", "explained", "clearly"],
    "negative": []
  }
}
```

### Update All Doctors (Admin Only)
```bash
POST /api/doctor-sentiment/batch-update
Authorization: Bearer ADMIN_TOKEN
```

## How It Works

### Scoring Formula
```
Final Score = (Star Rating × 70%) + (Sentiment × 30%)
```

### Example
```
Doctor has:
- Star rating: 4.2/5
- Review: "Excellent doctor, very knowledgeable and caring"
- Sentiment: +0.8 (very positive)

Sentiment on 5-scale = ((0.8 + 1) / 2) × 5 = 4.5

Final Score = (4.2 × 0.7) + (4.5 × 0.3) = 4.29/5
```

### What Gets Analyzed

✅ Positive signals:
- "excellent", "caring", "knowledgeable", "helpful"
- "cured", "improved", "better", "relief"
- "recommend", "trust", "professional"

❌ Negative signals:
- "rude", "dismissive", "rushed", "careless"
- "misdiagnosed", "wrong", "didn't help"
- "long wait", "unresponsive", "expensive"

## Frontend Integration

### Show Score on Doctor Profile
```typescript
const response = await fetch(`/api/doctor-sentiment/${doctorId}/score`);
const { score, sentimentSummary } = await response.json();

// Display:
// ⭐ 4.24/5 (45 reviews)
// 87% positive feedback from 32 reviews
```

### Preview Sentiment in Review Form
```typescript
const handleReviewChange = async (text: string) => {
  const response = await fetch('/api/doctor-sentiment/analyze-review', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  });
  
  const sentiment = await response.json();
  
  // Show user: "Your review sentiment: Positive 👍"
  setSentimentPreview(sentiment.category);
};
```

## Maintenance

### Daily Updates (Recommended)
Add to your cron jobs:

```typescript
import { batchUpdateAllDoctorScores } from './hooks/review-sentiment-hook';

// Run daily at 2 AM
cron.schedule('0 2 * * *', async () => {
  await batchUpdateAllDoctorScores();
});
```

### Manual Update for Specific Doctor
```bash
curl -X POST http://localhost:3001/api/doctor-sentiment/:doctorId/update \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Troubleshooting

### Scores Not Updating?
1. Check if OpenAI API key is valid
2. Verify reviews have text content (not just stars)
3. Check logs for errors: `[SentimentAnalysis]` or `[DoctorSentimentScoring]`

### Sentiment Seems Wrong?
- AI analysis requires OpenAI API key
- Without it, uses keyword matching (less accurate)
- Medical terminology might need custom keywords

### Performance Issues?
- Batch updates run in background
- Consider caching scores
- Limit OpenAI API calls during peak hours

## Cost Estimate

### OpenAI API Usage
- ~$0.002 per review analysis (GPT-3.5)
- 1000 reviews = ~$2
- Monthly cost depends on review volume

### Without OpenAI
- Free (uses keyword matching)
- Slightly less accurate
- No API costs

## Benefits

✅ More accurate doctor scores
✅ Captures nuance beyond star ratings
✅ Better doctor-patient matching
✅ Identifies specific strengths/weaknesses
✅ Detects fake reviews
✅ Actionable insights for doctors

## Next Steps

1. ✅ Run initial score update
2. ✅ Integrate into rating endpoints
3. ✅ Add to doctor profile UI
4. ✅ Set up daily cron job
5. ✅ Monitor logs and metrics

## Support

Questions? Check:
- Full documentation: `DOCTOR_SENTIMENT_SCORING_IMPLEMENTATION.md`
- Code examples: `apps/api/src/examples/rating-with-sentiment-example.ts`
- Logs: Search for `[SentimentAnalysis]` or `[DoctorSentimentScoring]`

---

**Ready to go!** Your doctor scoring system is now powered by AI sentiment analysis. 🎉
