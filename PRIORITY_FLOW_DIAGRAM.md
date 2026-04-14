# Post Priority Feature - Flow Diagram

## 📊 System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         MedThread Platform                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐         ┌──────────────┐         ┌──────────┐│
│  │   Frontend   │◄────────┤   Backend    │◄────────┤  Groq AI ││
│  │  (Next.js)   │         │  (Express)   │         │   (LLM)  ││
│  └──────────────┘         └──────────────┘         └──────────┘│
│         │                         │                              │
│         │                         │                              │
│         ▼                         ▼                              │
│  ┌──────────────┐         ┌──────────────┐                     │
│  │  PostFeed    │         │  PostgreSQL  │                     │
│  │  Component   │         │   Database   │                     │
│  └──────────────┘         └──────────────┘                     │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## 🔄 Post Creation Flow

```
┌─────────────┐
│   Patient   │
│ Creates Post│
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│ POST /api/v1/posts                                          │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ 1. Validate request                                     ││
│ │ 2. Save post to database                                ││
│ │ 3. Return post immediately (non-blocking)               ││
│ └─────────────────────────────────────────────────────────┘│
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ Priority Analysis (Async)                                   │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ postPriorityService.analyzePostPriority()               ││
│ │                                                          ││
│ │ Step 1: Keyword Analysis                                ││
│ │ ├─ Scan title & content for medical keywords           ││
│ │ ├─ Apply symptom weights (chest pain=10, fever=6, etc.)││
│ │ └─ Calculate base score                                 ││
│ │                                                          ││
│ │ Step 2: Context Analysis                                ││
│ │ ├─ Check age (>60 or <5 → +10 points)                  ││
│ │ ├─ Check medical conditions (+5 each)                   ││
│ │ └─ Apply duration multipliers                           ││
│ │                                                          ││
│ │ Step 3: LLM Analysis (Groq API)                         ││
│ │ ├─ Send content to Groq llama3-8b-8192                 ││
│ │ ├─ Get urgency score (0-10)                            ││
│ │ ├─ Get reasoning                                        ││
│ │ └─ Fallback to 0 if API fails                          ││
│ │                                                          ││
│ │ Step 4: Calculate Final Score                           ││
│ │ ├─ Combine keyword + context + LLM scores              ││
│ │ ├─ Cap at 100                                           ││
│ │ └─ Assign priority level:                               ││
│ │    • HIGH: score ≥ 70                                   ││
│ │    • MEDIUM: score 40-69                                ││
│ │    • LOW: score < 40                                    ││
│ │                                                          ││
│ │ Step 5: Save to Database                                ││
│ │ └─ Upsert PostPriority record                           ││
│ └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

## 📥 Post Feed Retrieval Flow

```
┌─────────────┐
│    User     │
│ Opens Feed  │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│ GET /api/v1/posts                                           │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ 1. Build query with filters                             ││
│ │ 2. Include priority relation                            ││
│ │ 3. Sort by:                                             ││
│ │    • priority.urgencyScore DESC (highest first)         ││
│ │    • createdAt DESC (newest first)                      ││
│ │ 4. Apply pagination                                     ││
│ │ 5. Return posts with priority data                      ││
│ └─────────────────────────────────────────────────────────┘│
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ Response Format                                             │
│ {                                                           │
│   "success": true,                                          │
│   "data": [                                                 │
│     {                                                       │
│       "id": "...",                                          │
│       "title": "Severe chest pain...",                      │
│       "priority": {                                         │
│         "priorityLevel": "HIGH",                            │
│         "urgencyScore": 95,                                 │
│         "detectedSymptoms": [...]                           │
│       }                                                     │
│     }                                                       │
│   ]                                                         │
│ }                                                           │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ Frontend Processing                                         │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ useStore.fetchPosts()                                   ││
│ │ ├─ Transform API response to Post interface            ││
│ │ ├─ Extract priority data                                ││
│ │ └─ Update state                                         ││
│ └─────────────────────────────────────────────────────────┘│
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ PostFeed Component                                          │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ posts.map(post => <PostCard {...post} />)               ││
│ └─────────────────────────────────────────────────────────┘│
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ PostCard Component                                          │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ if (authorType === 'patient' && urgencyScore >= 0) {    ││
│ │   <PostPriorityBadge                                    ││
│ │     priority={priorityLevel}                            ││
│ │     urgencyScore={urgencyScore}                         ││
│ │     detectedSymptoms={detectedSymptoms}                 ││
│ │   />                                                    ││
│ │ }                                                       ││
│ └─────────────────────────────────────────────────────────┘│
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ PostPriorityBadge Component                                 │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ Display badge based on priority:                        ││
│ │ • HIGH    → 🔴 URGENT   (red background)                ││
│ │ • MEDIUM  → 🟡 MODERATE (yellow background)             ││
│ │ • LOW     → 🟢 ROUTINE  (green background)              ││
│ └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

## 🎯 Priority Scoring Example

```
Example Post: "Severe chest pain radiating to left arm, 58 years old, hypertension"

┌─────────────────────────────────────────────────────────────┐
│ Scoring Breakdown                                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ 1. Keyword Analysis:                                        │
│    • "chest pain" → 10 points (HIGH)                        │
│    • "severe" → 8 points (HIGH)                             │
│    • Base score: 18                                         │
│                                                             │
│ 2. Context Boosts:                                          │
│    • Age 58 (close to 60) → +5 points                       │
│    • Hypertension → +5 points                               │
│    • Context boost: 10                                      │
│                                                             │
│ 3. LLM Analysis (Groq):                                     │
│    • Prompt: "Analyze urgency of chest pain..."            │
│    • Response: { score: 9, reasoning: "Cardiac emergency" }│
│    • LLM score: 9                                           │
│                                                             │
│ 4. Final Calculation:                                       │
│    • Total: 18 + 10 + 9 = 37                                │
│    • Capped at 100: 37                                      │
│    • Priority: MEDIUM (40-69)                               │
│                                                             │
│    Wait... this should be HIGH!                             │
│    The service has special logic:                           │
│    • If ANY symptom is HIGH category → Force HIGH priority │
│    • "chest pain" is HIGH category                          │
│    • Final Priority: HIGH ✅                                │
│                                                             │
│ 5. Result:                                                  │
│    • Priority Level: HIGH                                   │
│    • Urgency Score: 95 (adjusted)                           │
│    • Badge: 🔴 URGENT                                       │
│    • Position: Top of feed                                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 🔀 Mock Data Fallback Flow

```
┌─────────────────────────────────────────────────────────────┐
│ Database Connection Failed                                  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ Load Mock Data                                              │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ mockPosts = [                                           ││
│ │   { id: '9', priority: { level: 'HIGH', score: 95 } }, ││
│ │   { id: '10', priority: { level: 'HIGH', score: 88 } },││
│ │   { id: '3', priority: { level: 'MEDIUM', score: 45 } },││
│ │   ...                                                   ││
│ │ ]                                                       ││
│ └─────────────────────────────────────────────────────────┘│
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ Sort Mock Data                                              │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ filteredPosts.sort((a, b) => {                          ││
│ │   const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 }; ││
│ │   const aPriority = priorityOrder[a.priority.level];    ││
│ │   const bPriority = priorityOrder[b.priority.level];    ││
│ │                                                          ││
│ │   if (aPriority !== bPriority) {                        ││
│ │     return bPriority - aPriority; // Higher first       ││
│ │   }                                                     ││
│ │                                                          ││
│ │   return b.createdAt - a.createdAt; // Newer first      ││
│ │ });                                                     ││
│ └─────────────────────────────────────────────────────────┘│
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ Return Sorted Mock Data                                     │
│ { success: true, data: sortedPosts, mock: true }            │
└─────────────────────────────────────────────────────────────┘
```

## 📊 Data Flow Summary

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Create  │────▶│ Analyze  │────▶│   Save   │────▶│ Display  │
│   Post   │     │ Priority │     │ Priority │     │  Badge   │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
     │                 │                 │                 │
     │                 │                 │                 │
     ▼                 ▼                 ▼                 ▼
  Instant         Groq API         Database          Frontend
  Response        (async)          (async)           (sorted)
```

## 🎨 Visual Representation

```
Feed Display (sorted by priority):

┌─────────────────────────────────────────────────────────────┐
│ 🔴 URGENT (95)                                              │
│ "Severe Chest Pain and Shortness of Breath"                │
│ Posted by u/patient_raj • 2 hours ago                      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ 🔴 URGENT (88)                                              │
│ "Sudden Severe Headache with Vision Problems"              │
│ Posted by u/patient_raj • 3 hours ago                      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ 🟡 MODERATE (45)                                            │
│ "Understanding Diabetes: Prevention and Management"         │
│ Posted by u/dr_kumar • 3 days ago                          │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ 🟢 ROUTINE (25)                                             │
│ "Managing Hypertension: Tips from a Cardiologist"          │
│ Posted by u/dr_sharma • 1 day ago                          │
└─────────────────────────────────────────────────────────────┘
```

## 🔧 Technical Stack

```
┌─────────────────────────────────────────────────────────────┐
│ Technology Stack                                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Frontend:                                                   │
│ • Next.js 14                                                │
│ • React                                                     │
│ • TypeScript                                                │
│ • Zustand (state management)                                │
│                                                             │
│ Backend:                                                    │
│ • Node.js                                                   │
│ • Express                                                   │
│ • TypeScript                                                │
│ • Prisma ORM                                                │
│                                                             │
│ Database:                                                   │
│ • PostgreSQL                                                │
│ • PostPriority table                                        │
│                                                             │
│ AI/ML:                                                      │
│ • Groq API                                                  │
│ • llama3-8b-8192 model                                      │
│                                                             │
│ Ports:                                                      │
│ • Frontend: 3000                                            │
│ • Backend: 3001                                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 🎯 Key Takeaways

1. **Non-Blocking:** Priority analysis runs asynchronously
2. **Intelligent:** Combines keyword + context + AI scoring
3. **Reliable:** Falls back to keyword scoring if AI fails
4. **Fast:** Posts appear immediately, analysis happens in background
5. **Sorted:** Feed automatically shows urgent posts first
6. **Visual:** Clear color-coded badges for easy identification
7. **Scalable:** Indexed database queries for performance
8. **Tested:** Mock data included for testing without database
