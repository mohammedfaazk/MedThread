# 🎯 Doctor Sentiment Scoring System - Implementation Complete

## Overview

Enhanced the doctor scoring algorithm to include **sentiment analysis** of patient review text, not just star ratings. This provides a more comprehensive and accurate assessment of doctor performance.

## What Changed

### Before
- Doctor scores were based ONLY on numerical ratings (0-5 stars)
- Text reviews were stored but NOT analyzed
- `helpfulnessScore` = average of star ratings

### After
- Doctor scores now combine **star ratings (70%) + sentiment analysis (30%)**
- Text reviews are analyzed using AI/NLP to extract sentiment
- `helpfulnessScore` = weighted combination of both metrics

## Architecture

### 1. Sentiment Analysis Service
**File**: `apps/api/src/services/sentiment-analysis.service.ts`

Features:
- AI-based sentiment analysis using GPT-3.5 (when OpenAI API key available)
- Rule-based fallback with medical-specific keywords
- Returns sentiment score (-1 to 1), confidence, and category
- Batch processing for multiple reviews
- Medical context-aware (understands doctor-patient terminology)

```typescript
interface SentimentResult {
  score: number; // -1 (very negative) to 1 (very positive)
  confidence: number; // 0 to 1
  category: 'VERY_POSITIVE' | 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' | 'VERY_NEGATIVE';
  keywords: {
    positive: string[];
    negative: string[];
  };
}
```

### 2. Doctor Sentiment Scoring Service
**File**: `apps/api/src/services/doctor-sentiment-scoring.service.ts`

Features:
- Calculates enhanced scores combining ratings + sentiment
- Analyzes both `DoctorRating` and `PatientFeedback` tables
- Updates `DoctorPerformance.helpfulnessScore` with combined score
- Provides detailed sentiment breakdown
- Batch update capability for all doctors

```typescript
interface EnhancedDoctorScore {
  doctorId: string;
  traditionalScore: number; // 0-5 (star rating)
  sentimentScore: number; // -1 to 1
  combinedScore: number; // 0-5 (weighted: 70% stars + 30% sentiment)
  totalReviews: number;
  reviewsWithText: number;
  sentimentBreakdown: {
    veryPositive: number;
    positive: number;
    neutral: number;
    negative: number;
    veryNegative: number;
  };
  confidence: number;
  lastUpdated: Date;
}
```

### 3. API Routes
**File**: `apps/api/src/routes/doctor-sentiment.routes.ts`

Endpoints:
- `GET /api/doctor-sentiment/:doctorId/score` - Get enhanced score
- `GET /api/doctor-sentiment/:doctorId/detailed` - Get detailed breakdown
- `POST /api/doctor-sentiment/:doctorId/update` - Manually trigger update
- `POST /api/doctor-sentiment/analyze-review` - Preview sentiment before submission
- `POST /api/doctor-sentiment/batch-update` - Update all doctors (admin only)

### 4. Automatic Hooks
**File**: `apps/api/src/hooks/review-sentiment-hook.ts`

Automatically updates doctor scores when:
- New `DoctorRating` is created
- New `PatientFeedback` is created
- Can be run as cron job for batch updates

### 5. Smart Doctor Matching Integration
**File**: `apps/api/src/services/smart-doctor-matching.service.ts`

Updated the satisfaction score calculation to use sentiment-enhanced scores:
```typescript
// Now uses combined score (stars + sentiment)
const score = (performance.helpfulnessScore / 5) * 15;
```

## Scoring Formula

### Combined Score Calculation
```
Combined Score (0-5) = (Traditional Rating × 0.7) + (Sentiment Score × 0.3)

Where:
- Traditional Rating = Average of star ratings (0-5)
- Sentiment Score = Converted from -1 to 1 scale to 0-5 scale
  - Sentiment -1 → 0 stars
  - Sentiment 0 → 2.5 stars
  - Sentiment +1 → 5 stars
```

### Example
```
Doctor has:
- Average star rating: 4.2/5
- Sentiment analysis: +0.6 (positive)

Sentiment on 5-scale = ((0.6 + 1) / 2) × 5 = 4.0

Combined Score = (4.2 × 0.7) + (4.0 × 0.3)
               = 2.94 + 1.20
               = 4.14/5
```

## Sentiment Analysis Keywords

### Positive Keywords (Medical Context)
- Expertise: excellent, knowledgeable, expert, skilled, experienced
- Care: caring, compassionate, empathetic, kind, patient, understanding
- Communication: helpful, thorough, detailed, clear, explained well
- Outcomes: cured, healed, better, improved, recovered, relief
- Trust: recommend, trust, confident, comfortable, satisfied
- Responsiveness: attentive, listened, responsive, prompt, quick

### Negative Keywords (Medical Context)
- Quality: terrible, awful, horrible, worst, bad, poor
- Behavior: rude, dismissive, arrogant, unprofessional, careless
- Attention: rushed, hurried, didn't listen, ignored, dismissed
- Competence: misdiagnosed, wrong, mistake, error, incompetent
- Effectiveness: waste, useless, ineffective, didn't help, no improvement
- Accessibility: long wait, delayed, late, unavailable, unresponsive

## Usage

### 1. Update All Doctor Scores (One-time)
```bash
cd apps/api
npx ts-node scripts/update-doctor-sentiment-scores.ts
```

### 2. Automatic Updates (Recommended)
Integrate hooks in your rating creation endpoints:

```typescript
import { onDoctorRatingCreated } from './hooks/review-sentiment-hook';

// After creating a rating
await prisma.doctorRating.create({ data: ratingData });
await onDoctorRatingCreated(doctorId, reviewText, starRating);
```

### 3. Manual API Calls
```bash
# Get enhanced score
curl http://localhost:3001/api/doctor-sentiment/:doctorId/score

# Get detailed breakdown
curl http://localhost:3001/api/doctor-sentiment/:doctorId/detailed

# Update specific doctor (requires auth)
curl -X POST http://localhost:3001/api/doctor-sentiment/:doctorId/update \
  -H "Authorization: Bearer YOUR_TOKEN"

# Batch update all doctors (admin only)
curl -X POST http://localhost:3001/api/doctor-sentiment/batch-update \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

### 4. Preview Sentiment (Before Submission)
```typescript
// In your review form
const response = await fetch('/api/doctor-sentiment/analyze-review', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ text: reviewText })
});

const sentiment = await response.json();
// Show user: "Your review sentiment: Positive (0.75)"
```

## Configuration

### OpenAI API Key (Optional but Recommended)
Add to `.env`:
```
OPENAI_API_KEY=sk-...
```

- With API key: Uses GPT-3.5 for accurate sentiment analysis
- Without API key: Falls back to rule-based keyword matching

### Adjust Weights
In `doctor-sentiment-scoring.service.ts`, modify:
```typescript
// Current: 70% stars, 30% sentiment
const combinedScore = (traditionalScore * 0.7) + (sentimentOn5Scale * 0.3);

// More weight to sentiment:
const combinedScore = (traditionalScore * 0.5) + (sentimentOn5Scale * 0.5);
```

## Database Impact

### Tables Used
- `DoctorRating` - Read `rating`, `feedback`, `helpfulness`, `communication`, `expertise`
- `PatientFeedback` - Read `rating`, `feedback`, `communicationRating`, etc.
- `DoctorPerformance` - Update `helpfulnessScore`, `totalRatings`

### No Schema Changes Required
The implementation uses existing tables and fields. The `helpfulnessScore` field now stores the combined score instead of just the average rating.

## Performance Considerations

### Batch Processing
- Processes reviews in parallel using `Promise.all()`
- Efficient for doctors with many reviews

### Caching
Consider adding caching for:
- Sentiment analysis results (store in database)
- Enhanced scores (refresh periodically)

### Rate Limiting
OpenAI API calls are rate-limited. For high-volume:
- Use batch processing during off-peak hours
- Implement request queuing
- Consider upgrading OpenAI plan

## Benefits

### 1. More Accurate Scores
- Captures nuance that star ratings miss
- Identifies doctors with great bedside manner vs. just technical skills
- Detects issues even when star rating is average

### 2. Better Doctor Matching
- Smart matching algorithm now considers sentiment
- Patients get matched with doctors who have positive feedback
- Reduces mismatches and improves satisfaction

### 3. Actionable Insights
- Doctors can see sentiment breakdown
- Identify areas for improvement (communication, empathy, etc.)
- Track sentiment trends over time

### 4. Fraud Detection
- Detects fake reviews (generic positive text with 5 stars)
- Identifies review manipulation patterns
- Flags suspicious sentiment-rating mismatches

## Example Output

```json
{
  "doctorId": "doc_123",
  "traditionalScore": 4.2,
  "sentimentScore": 0.65,
  "combinedScore": 4.24,
  "totalReviews": 45,
  "reviewsWithText": 32,
  "sentimentBreakdown": {
    "veryPositive": 18,
    "positive": 10,
    "neutral": 3,
    "negative": 1,
    "veryNegative": 0
  },
  "confidence": 0.82,
  "lastUpdated": "2026-04-19T10:30:00Z"
}
```

## Future Enhancements

### 1. Aspect-Based Sentiment
Analyze specific aspects:
- Bedside manner sentiment
- Technical expertise sentiment
- Communication sentiment
- Wait time sentiment

### 2. Temporal Analysis
- Track sentiment trends over time
- Detect improving/declining performance
- Seasonal patterns

### 3. Comparative Analysis
- Compare doctor's sentiment to specialty average
- Identify top performers by sentiment
- Benchmark against competitors

### 4. Multi-language Support
- Analyze reviews in multiple languages
- Regional sentiment patterns
- Cultural context awareness

### 5. Real-time Alerts
- Notify doctors of negative sentiment
- Alert admins to concerning patterns
- Trigger intervention workflows

## Testing

### Unit Tests
```bash
cd apps/api
npm test sentiment-analysis.service.test.ts
npm test doctor-sentiment-scoring.service.test.ts
```

### Integration Tests
```bash
npm test doctor-sentiment.routes.test.ts
```

### Manual Testing
1. Create test reviews with various sentiments
2. Run sentiment analysis
3. Verify scores are calculated correctly
4. Check smart matching uses new scores

## Monitoring

### Logs to Watch
```
[SentimentAnalysis] AI analysis failed, falling back to rule-based
[DoctorSentimentScoring] Updated score for doctor X
[ReviewSentimentHook] New review for doctor Y, analyzing sentiment
```

### Metrics to Track
- Average sentiment score across all doctors
- Percentage of reviews with text
- Sentiment analysis success rate
- API response times
- OpenAI API usage/costs

## Support

For issues or questions:
1. Check logs for error messages
2. Verify OpenAI API key is valid
3. Ensure database has review data
4. Test with sample reviews first

## Summary

✅ Sentiment analysis service created
✅ Doctor scoring service enhanced
✅ API routes added
✅ Automatic hooks implemented
✅ Smart matching updated
✅ Documentation complete
✅ Scripts for batch updates ready

The doctor scoring system now provides a more comprehensive and accurate assessment by combining traditional star ratings with AI-powered sentiment analysis of patient reviews.
