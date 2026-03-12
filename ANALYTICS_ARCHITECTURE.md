# Analytics System Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (Next.js)                       │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Public     │  │   Doctor     │  │  Platform    │          │
│  │   Health     │  │ Performance  │  │   Metrics    │          │
│  │  Dashboard   │  │  Dashboard   │  │  Dashboard   │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                 │                  │                   │
│         └─────────────────┴──────────────────┘                   │
│                           │                                      │
│                  ┌────────▼────────┐                            │
│                  │ AnalyticsTracker│                            │
│                  │    Utility      │                            │
│                  └────────┬────────┘                            │
└───────────────────────────┼─────────────────────────────────────┘
                            │
                            │ HTTP/REST API
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                      Backend (Express.js)                        │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Health     │  │   Doctor     │  │  Platform    │          │
│  │  Analytics   │  │  Analytics   │  │  Analytics   │          │
│  │   Routes     │  │   Routes     │  │   Routes     │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                 │                  │                   │
│  ┌──────▼───────┐  ┌──────▼───────┐  ┌──────▼───────┐          │
│  │   Health     │  │   Doctor     │  │  Platform    │          │
│  │  Analytics   │  │  Analytics   │  │  Analytics   │          │
│  │   Service    │  │   Service    │  │   Service    │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                 │                  │                   │
│         └─────────────────┴──────────────────┘                   │
│                           │                                      │
│                  ┌────────▼────────┐                            │
│                  │  Prisma Client  │                            │
│                  └────────┬────────┘                            │
└───────────────────────────┼─────────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                    Database (PostgreSQL)                         │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Symptom     │  │   Health     │  │  Geographic  │          │
│  │   Report     │  │    Trend     │  │  HealthData  │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Doctor     │  │   Doctor     │  │   Patient    │          │
│  │ Performance  │  │   Rating     │  │   Outcome    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐                            │
│  │  Platform    │  │   Research   │                            │
│  │   Metrics    │  │   Dataset    │                            │
│  └──────────────┘  └──────────────┘                            │
└─────────────────────────────────────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                      Cron Jobs (node-cron)                       │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Daily (1 AM): Calculate Platform Metrics                │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Every 6 Hours: Calculate Health Trends                  │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Symptom Report Flow
```
Patient → SymptomReportForm → AnalyticsTracker.trackSymptomReport()
    ↓
POST /api/health-analytics/symptom-report
    ↓
HealthAnalyticsService.trackSymptomReport()
    ↓
Prisma → SymptomReport table
    ↓
Cron Job (every 6 hours) → Calculate trends
    ↓
HealthTrend table updated
```

### 2. Doctor Rating Flow
```
Patient → Rate Doctor Button → AnalyticsTracker.rateDoctor()
    ↓
POST /api/doctor-analytics/rate (with JWT)
    ↓
DoctorAnalyticsService.trackDoctorRating()
    ↓
Prisma → DoctorRating table
    ↓
Trigger: Update DoctorPerformance
    ↓
DoctorPerformance table updated
```

### 3. Dashboard Data Flow
```
User visits /analytics
    ↓
PublicHealthDashboard loads
    ↓
GET /api/health-analytics/trending
GET /api/health-analytics/geographic-alerts
    ↓
HealthAnalyticsService queries
    ↓
Prisma → HealthTrend, GeographicHealthData
    ↓
JSON response → Frontend
    ↓
React renders charts and cards
```

## Component Hierarchy

```
AnalyticsPage
├── Tabs
│   ├── PublicHealthDashboard
│   │   ├── Card (Trending Symptoms)
│   │   ├── Card (Geographic Alerts)
│   │   └── Card (Health Advisories)
│   │
│   ├── DoctorPerformanceDashboard
│   │   ├── Card (Leaderboard)
│   │   └── Grid (Performance Metrics)
│   │
│   └── PlatformMetricsDashboard
│       ├── Card (Peak Usage)
│       ├── Card (Bottlenecks)
│       └── Grid (Quick Stats)
```

## Service Layer Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  HealthAnalyticsService                      │
├─────────────────────────────────────────────────────────────┤
│  • trackSymptomReport()                                      │
│  • getTrendingSymptoms()                                     │
│  • getGeographicAlerts()                                     │
│  • generateHealthAdvisory()                                  │
│  • calculateHealthTrends()                                   │
│  • getSymptomPatterns()                                      │
│  • getTopHealthIssues()                                      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                 DoctorAnalyticsService                       │
├─────────────────────────────────────────────────────────────┤
│  • updateDoctorPerformance()                                 │
│  • calculateDoctorEngagement()                               │
│  • getTopDoctors()                                           │
│  • getDoctorGrowthMetrics()                                  │
│  • trackDoctorRating()                                       │
│  • getDoctorResponseTimes()                                  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                PlatformAnalyticsService                      │
├─────────────────────────────────────────────────────────────┤
│  • calculateDailyMetrics()                                   │
│  • getPeakUsageAnalytics()                                   │
│  • getResponseTimeMetrics()                                  │
│  • detectBottlenecks()                                       │
│  • getResourceRecommendations()                              │
└─────────────────────────────────────────────────────────────┘
```

## Database Schema Relationships

```
User (Doctor)
    ↓ 1:1
DoctorPerformance
    ↑ 1:N
DoctorRating
    ↑ N:1
User (Patient)

User (Patient)
    ↓ 1:N
SymptomReport
    ↓ aggregated
HealthTrend
    ↓ grouped by region
GeographicHealthData

User (Patient)
    ↓ 1:N
PatientOutcome
    ↑ N:1
User (Doctor)

Platform
    ↓ daily
PlatformMetrics
```

## API Route Structure

```
/api
├── /health-analytics
│   ├── POST   /symptom-report
│   ├── GET    /trending
│   ├── GET    /geographic-alerts
│   ├── GET    /advisory/:symptom
│   ├── GET    /patterns
│   └── GET    /top-issues
│
├── /doctor-analytics
│   ├── GET    /leaderboard
│   ├── GET    /performance/:doctorId
│   ├── POST   /rate
│   ├── GET    /growth (Admin)
│   └── GET    /response-times
│
└── /platform-analytics (All Admin)
    ├── GET    /peak-usage
    ├── GET    /response-times
    ├── GET    /bottlenecks
    ├── GET    /resource-recommendations
    └── POST   /calculate-daily
```

## Authentication Flow

```
Public Endpoints (No Auth)
    ↓
    No middleware
    ↓
    Direct to service

Authenticated Endpoints
    ↓
    authenticate middleware
    ↓
    JWT verification
    ↓
    req.userId set
    ↓
    Service layer

Admin Endpoints
    ↓
    authenticate middleware
    ↓
    requireRole('ADMIN') middleware
    ↓
    Role check
    ↓
    Service layer
```

## Cron Job Schedule

```
Time        | Job                      | Action
------------|--------------------------|---------------------------
Daily 1 AM  | Calculate Daily Metrics  | PlatformAnalyticsService
Every 6 hrs | Calculate Health Trends  | HealthAnalyticsService
Daily 9 AM  | Check Expiring Licenses  | CronJobsService
Hourly      | Appointment Reminders    | CronJobsService
Daily 12 AM | Auto-award CME Credits   | CronJobsService
```

## Technology Stack

```
Frontend
├── Next.js 14 (App Router)
├── React 18
├── TypeScript
├── Tailwind CSS
└── Lucide Icons

Backend
├── Express.js
├── TypeScript
├── Prisma ORM
├── JWT Authentication
├── node-cron
└── PostgreSQL

Infrastructure
├── PostgreSQL Database
├── Node.js Runtime
└── npm/pnpm Package Manager
```

## Security Layers

```
1. Network Layer
   └── HTTPS/TLS encryption

2. Application Layer
   ├── Rate limiting
   ├── Input sanitization
   ├── CORS configuration
   └── Helmet security headers

3. Authentication Layer
   ├── JWT tokens
   ├── Role-based access control
   └── Token expiration

4. Data Layer
   ├── Anonymized symptom reports
   ├── Aggregated geographic data
   └── Research dataset anonymization
```

## Performance Optimizations

```
Database
├── Indexes on frequently queried fields
├── Efficient Prisma queries
└── Connection pooling

API
├── Response caching
├── Pagination for large datasets
└── Async/await for non-blocking operations

Frontend
├── React component memoization
├── Lazy loading
└── Optimistic UI updates

Cron Jobs
├── Run during low-traffic hours
├── Batch processing
└── Error handling and retries
```

## Monitoring & Logging

```
Application Logs
├── API request/response logs
├── Error logs with stack traces
├── Cron job execution logs
└── Performance metrics

Analytics Tracking
├── API endpoint usage
├── Dashboard page views
├── Feature adoption rates
└── Error rates
```

## Scalability Considerations

```
Horizontal Scaling
├── Stateless API servers
├── Load balancer ready
└── Database connection pooling

Vertical Scaling
├── Database indexing
├── Query optimization
└── Caching strategies

Data Growth
├── Archival strategy for old data
├── Partitioning for large tables
└── Aggregation for historical data
```

---

This architecture supports:
- ✅ Real-time analytics
- ✅ Scalable data processing
- ✅ Secure access control
- ✅ Automated calculations
- ✅ Extensible design
