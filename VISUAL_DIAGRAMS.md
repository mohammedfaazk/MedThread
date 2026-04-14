# MedThread - Visual Diagrams for Presentation 📊

## 1. SYSTEM ARCHITECTURE DIAGRAM

```
┌─────────────────────────────────────────────────────────────┐
│                        USERS                                │
│  👤 Patients  |  👨‍⚕️ Doctors  |  👑 Admins                  │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────┴────────────────────────────────────────┐
│                   WEB APPLICATION                           │
│              Next.js 14 (Port 3000)                         │
│  • React 18 + TypeScript                                    │
│  • TailwindCSS + Framer Motion                              │
│  • Socket.io Client                                         │
│  • PWA with Offline Support                                 │
└────────────────────┬────────────────────────────────────────┘
                     │ REST API + WebSocket
┌────────────────────┴────────────────────────────────────────┐
│                   API SERVER                                │
│            Express.js (Port 3001)                           │
│  • JWT Authentication                                       │
│  • Socket.io Server                                         │
│  • Rate Limiting                                            │
│  • 12 Proprietary Algorithms                                │
└─────┬──────────────┬──────────────┬────────────────────────┘
      │              │              │
      ▼              ▼              ▼
┌──────────┐  ┌──────────┐  ┌──────────────┐
│ DATABASE │  │AI SERVICE│  │ FILE STORAGE │
│PostgreSQL│  │Port 3002 │  │  Cloudinary  │
│Port 5432 │  │Groq API  │  │   CDN        │
│          │  │OpenAI    │  │              │
│50+ Models│  │Whisper   │  │ Images/Files │
└──────────┘  └──────────┘  └──────────────┘
```

---

## 2. MULTI-MODAL AI DATA FLOW

```
                    👤 USER DATA
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
    ┌───────┐      ┌─────────┐      ┌────────┐
    │ TEXT  │      │  VOICE  │      │ IMAGES │
    │ Posts │      │ Messages│      │ Photos │
    │ Chats │      │ Calls   │      │ Scans  │
    └───┬───┘      └────┬────┘      └───┬────┘
        │               │                │
        ▼               ▼                ▼
    ┌───────┐      ┌─────────┐      ┌────────┐
    │BEHAVIOR│     │BIOMETRIC│      │RECORDS │
    │Typing  │     │Heart    │      │Symptoms│
    │Activity│     │Sleep    │      │Meds    │
    └───┬───┘      └────┬────┘      └───┬────┘
        │               │                │
        └───────┬───────┴────────┬───────┘
                │                │
                ▼                ▼
        ┌────────────────────────────┐
        │   MULTI-MODAL AI ENGINE    │
        │                            │
        │  • Pattern Recognition     │
        │  • Anomaly Detection       │
        │  • Trend Analysis          │
        │  • Risk Calculation        │
        └────────────┬───────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
        ▼                         ▼
┌──────────────┐          ┌──────────────┐
│  PREDICTIONS │          │   ALERTS     │
│              │          │              │
│ • Parkinson's│          │ • High Risk  │
│ • Alzheimer's│          │ • Urgent Care│
│ • Depression │          │ • Prevention │
│ • Diabetes   │          │ • Follow-up  │
│ • Heart Dis. │          │              │
└──────────────┘          └──────────────┘
```

---

## 3. SMART DOCTOR MATCHING FLOW

```
👤 PATIENT INPUT
"Need cardiologist for heart palpitations"
         │
         ▼
┌─────────────────────────────────┐
│   CRITERIA EXTRACTION           │
│ • Condition: Heart palpitations │
│ • Specialty: Cardiology         │
│ • Location: Mumbai              │
│ • Urgency: Normal               │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│   DOCTOR DATABASE QUERY         │
│ • 50 cardiologists in Mumbai    │
│ • All verified & active         │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│   SCORING ALGORITHM             │
│                                 │
│ For each doctor:                │
│ ├─ Specialization: 30 pts      │
│ ├─ Success Rate: 25 pts        │
│ ├─ Response Time: 15 pts       │
│ ├─ Satisfaction: 15 pts        │
│ ├─ Availability: 10 pts        │
│ └─ Language: 5 pts             │
│                                 │
│ Total: 0-100 points             │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│   RANKED RESULTS                │
│                                 │
│ 1. Dr. Sharma - 87/100         │
│    92% success, 15min response  │
│                                 │
│ 2. Dr. Patel - 82/100          │
│    88% success, 20min response  │
│                                 │
│ 3. Dr. Kumar - 78/100          │
│    85% success, 25min response  │
└────────────┬────────────────────┘
             │
             ▼
     👤 PATIENT SELECTS
```

---

## 4. POST PRIORITY TRIAGE FLOW

```
📝 PATIENT CREATES POST
"Severe chest pain for 2 hours, left arm numb"
         │
         ▼
┌─────────────────────────────────┐
│   SYMPTOM EXTRACTION            │
│ • chest pain (weight: 10)       │
│ • left arm numb (weight: 9)     │
│ • Duration: 2 hours             │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│   URGENCY CALCULATION           │
│                                 │
│ Base Score:                     │
│ (10 + 9) × 0.8 = 15.2          │
│                                 │
│ Context Boost:                  │
│ Age 65: +10                     │
│ Diabetes: +5                    │
│                                 │
│ LLM Analysis: +45               │
│                                 │
│ Total: 75.2                     │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│   PRIORITY ASSIGNMENT           │
│                                 │
│ Score: 75.2                     │
│ Priority: HIGH 🔴               │
│ Badge: URGENT                   │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│   DOCTOR FEED PLACEMENT         │
│                                 │
│ Position: TOP OF FEED           │
│ Notification: All cardiologists │
│ Alert: Emergency keywords       │
└─────────────────────────────────┘
```

---

## 5. OUTBREAK DETECTION FLOW

```
📊 SYMPTOM DATA COLLECTION
Multiple users report: fever + joint pain + rash
         │
         ▼
┌─────────────────────────────────┐
│   GEOGRAPHIC CLUSTERING         │
│                                 │
│ Mumbai:                         │
│ • Andheri: 8 cases              │
│ • Bandra: 5 cases               │
│ • Juhu: 4 cases                 │
│ Total: 17 cases                 │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│   PATTERN MATCHING              │
│                                 │
│ Symptom Cluster:                │
│ • Fever: 100%                   │
│ • Joint pain: 94%               │
│ • Rash: 82%                     │
│                                 │
│ Match: DENGUE (95% confidence)  │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│   GROWTH ANALYSIS               │
│                                 │
│ Previous Week: 6 cases          │
│ Current Week: 17 cases          │
│ Growth: 183%                    │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│   SEVERITY CLASSIFICATION       │
│                                 │
│ Cases: 17 (>15)                 │
│ Growth: 183% (>100%)            │
│ Severity: HIGH ⚠️               │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│   ALERT GENERATION              │
│                                 │
│ 🚨 Dengue Outbreak - Mumbai     │
│ • Notify health authorities     │
│ • Alert users in area           │
│ • Provide prevention tips       │
│ • Monitor for escalation        │
└─────────────────────────────────┘
```

---

## 6. USER JOURNEY MAP

### **Patient Journey**:
```
DISCOVERY → REGISTRATION → ONBOARDING → USAGE → RETENTION

1. DISCOVERY
   • Search "online doctor"
   • Social media ad
   • Friend referral
   
2. REGISTRATION
   • Sign up with email
   • Create profile
   • Health questionnaire
   
3. ONBOARDING
   • Platform tour
   • Feature highlights
   • First symptom check
   
4. USAGE
   • Post symptoms
   • Get AI analysis
   • Match with doctor
   • Consultation
   • Follow-up
   
5. RETENTION
   • Health tracking
   • Community engagement
   • Challenges
   • Success stories
```

### **Doctor Journey**:
```
DISCOVERY → APPLICATION → VERIFICATION → ONBOARDING → ACTIVE

1. DISCOVERY
   • Doctor referral
   • Professional network
   • Platform outreach
   
2. APPLICATION
   • Submit credentials
   • Upload documents
   • Profile creation
   
3. VERIFICATION
   • Document review
   • License validation
   • Background check
   • Approval (24-48 hrs)
   
4. ONBOARDING
   • Platform training
   • Dashboard tour
   • First consultation
   
5. ACTIVE
   • Daily consultations
   • Performance tracking
   • Reputation building
   • Continuous improvement
```

---

## 7. DATA FLOW DIAGRAM

```
USER INTERACTION
       │
       ▼
┌──────────────┐
│  FRONTEND    │
│  (Next.js)   │
└──────┬───────┘
       │ HTTP/WebSocket
       ▼
┌──────────────┐
│ API GATEWAY  │
│ (Express)    │
└──────┬───────┘
       │
   ┌───┴───┐
   │       │
   ▼       ▼
┌─────┐ ┌─────┐
│AUTH │ │RATE │
│     │ │LIMIT│
└──┬──┘ └──┬──┘
   │       │
   └───┬───┘
       │
       ▼
┌──────────────┐
│  BUSINESS    │
│   LOGIC      │
│ (Services)   │
└──────┬───────┘
       │
   ┌───┴────┬────────┬────────┐
   │        │        │        │
   ▼        ▼        ▼        ▼
┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐
│ DB  │ │ AI  │ │CACHE│ │FILE │
│     │ │     │ │     │ │     │
└─────┘ └─────┘ └─────┘ └─────┘
```

---

## 8. ALGORITHM COMPARISON CHART

```
ALGORITHM COMPLEXITY vs. IMPACT

Impact
  │
10│         ● Disease Detective
  │       ● Outbreak Detection
 8│     ● Smart Matching
  │   ● Risk Predictor
 6│ ● Post Triage
  │ ● Diet Planner
 4│ ● Spam Detection
  │ ● Karma System
 2│
  └─────────────────────────────
    2   4   6   8   10
         Complexity

● = MedThread Algorithm
Size = Development Time
```

---

## 9. COMPETITIVE POSITIONING MAP

```
INNOVATION vs. MARKET FIT

Innovation
  │
  │         MedThread ●
  │              
  │    
  │         
  │              WebMD ●
  │    Practo ●
  │         1mg ●
  │    
  └─────────────────────────────
         Market Fit

MedThread: High Innovation + High Market Fit
Competitors: Low Innovation + Medium Market Fit
```

---

## 10. FEATURE ADOPTION FUNNEL

```
USER ACQUISITION FUNNEL

100% │ ████████████████ 10,000 Visitors
     │
 60% │ ██████████       6,000 Sign-ups
     │
 40% │ ██████           4,000 Profile Complete
     │
 25% │ ████             2,500 First Consultation
     │
 15% │ ██               1,500 Active Users
     │
  5% │ █                  500 Premium Users
     └─────────────────────────────────────
```

---

## 11. REVENUE MODEL BREAKDOWN

```
REVENUE STREAMS (Projected Year 1)

Consultation Fees: 50%  ████████████████
Premium Features: 25%   ████████
API Access: 15%         ██████
Sponsored Content: 10%  ████

Total: $X Million ARR
```

---

## 12. TECHNOLOGY STACK LAYERS

```
┌─────────────────────────────────────┐
│         PRESENTATION LAYER          │
│  Next.js 14 • React 18 • Tailwind   │
└─────────────────┬───────────────────┘
                  │
┌─────────────────┴───────────────────┐
│         APPLICATION LAYER           │
│  Express.js • Socket.io • JWT       │
└─────────────────┬───────────────────┘
                  │
┌─────────────────┴───────────────────┐
│          BUSINESS LAYER             │
│  12 Algorithms • AI Services        │
└─────────────────┬───────────────────┘
                  │
┌─────────────────┴───────────────────┐
│           DATA LAYER                │
│  PostgreSQL • Prisma • Redis        │
└─────────────────────────────────────┘
```

---

## 13. SECURITY LAYERS

```
┌─────────────────────────────────────┐
│      APPLICATION SECURITY           │
│  • Input Validation                 │
│  • XSS Protection                   │
│  • CSRF Tokens                      │
└─────────────────┬───────────────────┘
                  │
┌─────────────────┴───────────────────┐
│      AUTHENTICATION                 │
│  • JWT Tokens                       │
│  • Password Hashing (bcrypt)        │
│  • 2FA Support                      │
└─────────────────┬───────────────────┘
                  │
┌─────────────────┴───────────────────┐
│      AUTHORIZATION                  │
│  • Role-Based Access (RBAC)         │
│  • Permission Checks                │
│  • Resource Ownership               │
└─────────────────┬───────────────────┘
                  │
┌─────────────────┴───────────────────┐
│      DATA PROTECTION                │
│  • Encryption at Rest               │
│  • Encryption in Transit (TLS)      │
│  • HIPAA Compliance                 │
└─────────────────┬───────────────────┘
                  │
┌─────────────────┴───────────────────┐
│      INFRASTRUCTURE                 │
│  • Firewall Rules                   │
│  • Rate Limiting                    │
│  • DDoS Protection                  │
└─────────────────────────────────────┘
```

---

## 14. REAL-TIME COMMUNICATION

```
SOCKET.IO EVENT FLOW

CLIENT                    SERVER
  │                         │
  ├─ connect ──────────────>│
  │<──── authenticated ─────┤
  │                         │
  ├─ message:send ─────────>│
  │                         ├─> Save to DB
  │                         ├─> Broadcast
  │<──── message:delivered ─┤
  │                         │
  │<──── typing:start ──────┤
  │                         │
  │<──── message:new ───────┤
  │                         │
  ├─ message:read ─────────>│
  │                         ├─> Update status
  │<──── read:confirmed ────┤
  │                         │
```

---

## 15. DEPLOYMENT ARCHITECTURE

```
┌─────────────────────────────────────┐
│          LOAD BALANCER              │
│         (Nginx/AWS ALB)             │
└────────┬────────────────┬───────────┘
         │                │
    ┌────┴────┐      ┌────┴────┐
    │ Web App │      │ Web App │
    │Instance1│      │Instance2│
    └────┬────┘      └────┬────┘
         │                │
         └────────┬───────┘
                  │
         ┌────────┴────────┐
         │   API Cluster   │
         │  (3 instances)  │
         └────────┬────────┘
                  │
    ┌─────────────┼─────────────┐
    │             │             │
    ▼             ▼             ▼
┌────────┐  ┌─────────┐  ┌──────────┐
│Database│  │AI Service│  │  Cache   │
│Primary │  │         │  │  Redis   │
└───┬────┘  └─────────┘  └──────────┘
    │
    ▼
┌────────┐
│Database│
│Replica │
└────────┘
```

---

**Use these diagrams in your presentation slides!** 📊
