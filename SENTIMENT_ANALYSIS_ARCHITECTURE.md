# 🏗️ Sentiment Analysis Architecture

## System Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         PATIENT SUBMITS REVIEW                       │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Review Form                                                  │  │
│  │  ─────────────                                                │  │
│  │  Star Rating: ⭐⭐⭐⭐⭐ (5/5)                                  │  │
│  │  Text Review: "Dr. Smith was excellent! Very caring and      │  │
│  │               knowledgeable. Explained everything clearly."   │  │
│  │                                                                │  │
│  │  [Preview Sentiment] [Submit Review]                          │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      API ENDPOINT RECEIVES DATA                      │
│                                                                       │
│  POST /api/doctor-rating                                             │
│  {                                                                    │
│    doctorId: "doc_123",                                              │
│    rating: 5,                                                         │
│    feedback: "Dr. Smith was excellent! Very caring..."               │
│  }                                                                    │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    SAVE TO DATABASE (DoctorRating)                   │
│                                                                       │
│  ✅ Rating saved to database                                         │
│  ✅ Response sent to user immediately                                │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                  TRIGGER SENTIMENT ANALYSIS (Async)                  │
│                                                                       │
│  onDoctorRatingCreated(doctorId, reviewText, starRating)            │
│  ↓                                                                    │
│  Runs in background, doesn't block user response                     │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    SENTIMENT ANALYSIS SERVICE                        │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  1. Check if OpenAI API key exists                             │ │
│  │     ├─ YES → Use GPT-3.5 for AI analysis                       │ │
│  │     └─ NO  → Use rule-based keyword matching                   │ │
│  │                                                                  │ │
│  │  2. Analyze text:                                               │ │
│  │     "Dr. Smith was excellent! Very caring and knowledgeable."  │ │
│  │                                                                  │ │
│  │  3. Extract keywords:                                           │ │
│  │     Positive: ["excellent", "caring", "knowledgeable"]         │ │
│  │     Negative: []                                                │ │
│  │                                                                  │ │
│  │  4. Calculate sentiment score:                                  │ │
│  │     Score: +0.85 (very positive)                                │ │
│  │     Confidence: 0.92                                            │ │
│  │     Category: VERY_POSITIVE                                     │ │
│  └────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                  DOCTOR SENTIMENT SCORING SERVICE                    │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  1. Fetch all reviews for doctor:                              │ │
│  │     - 45 total reviews                                          │ │
│  │     - 32 with text feedback                                     │ │
│  │                                                                  │ │
│  │  2. Calculate traditional score:                                │ │
│  │     Average star rating: 4.2/5                                  │ │
│  │                                                                  │ │
│  │  3. Analyze all text reviews:                                   │ │
│  │     - Very Positive: 18 reviews                                 │ │
│  │     - Positive: 10 reviews                                      │ │
│  │     - Neutral: 3 reviews                                        │ │
│  │     - Negative: 1 review        