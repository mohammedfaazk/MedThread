# Area-Wise Doctor Replies - System Architecture

## 🏗️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER LAYER                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────┐              ┌──────────────────┐        │
│  │   Patient View   │              │  Doctor Dashboard│        │
│  │                  │              │                  │        │
│  │ • View Replies   │              │ • Add Clinics    │        │
│  │ • Apply Filters  │              │ • Set Hours      │        │
│  │ • Get Directions │              │ • Availability   │        │
│  │ • See Distance   │              │ • Insurance      │        │
│  └────────┬─────────┘              └────────┬─────────┘        │
│           │                                  │                   │
└───────────┼──────────────────────────────────┼──────────────────┘
            │                                  │
            │         Geolocation API          │
            │         (Browser)                │
            │                                  │
┌───────────┼──────────────────────────────────┼──────────────────┐
│           │        FRONTEND LAYER            │                   │
├───────────┼──────────────────────────────────┼──────────────────┤
│           │                                  │                   │
│  ┌────────▼──────────┐            ┌─────────▼────────┐         │
│  │AreaWiseDoctorReplies│          │DoctorClinicMgmt  │         │
│  │                    │            │                  │         │
│  │ • Geolocation      │            │ • Clinic Forms   │         │
│  │ • Filter State     │            │ • Hours Editor   │         │
│  │ • Distance Display │            │ • Availability   │         │
│  │ • Badges           │            │ • Validation     │         │
│  └────────┬───────────┘            └─────────┬────────┘         │
│           │                                  │                   │
└───────────┼──────────────────────────────────┼──────────────────┘
            │                                  │
            │         HTTP/REST API            │
            │                                  │
┌───────────┼──────────────────────────────────┼──────────────────┐
│           │         API LAYER                │                   │
├───────────┼──────────────────────────────────┼──────────────────┤
│           │                                  │                   │
│  ┌────────▼──────────────────────────────────▼────────┐         │
│  │         doctor-location.routes.ts                  │         │
│  │                                                     │         │
│  │  GET  /posts/:id/replies/doctors                   │         │
│  │  POST /doctors/clinics                             │         │
│  │  PUT  /doctors/availability                        │         │
│  │  GET  /doctors/clinics                             │         │
│  └────────┬────────────────────────────────┬──────────┘         │
│           │                                │                     │
│  ┌────────▼────────┐            ┌─────────▼────────┐           │
│  │ Authentication  │            │  Authorization   │           │
│  │ Middleware      │            │  (Role Check)    │           │
│  └────────┬────────┘            └─────────┬────────┘           │
│           │                                │                     │
└───────────┼────────────────────────────────┼────────────────────┘
            │                                │
┌───────────┼────────────────────────────────┼────────────────────┐
│           │      SERVICE LAYER             │                     │
├───────────┼────────────────────────────────┼────────────────────┤
│           │                                │                     │
│  ┌────────▼────────┐            ┌─────────▼────────┐           │
│  │ LocationService │            │AvailabilityService│           │
│  │                 │            │                   │           │
│  │ • Haversine     │            │ • Clinic Status   │           │
│  │ • Distance Calc │            │ • Next Slot       │           │
│  │ • Validation    │            │ • Insurance Check │           │
│  │ • Formatting    │            │ • Hours Logic     │           │
│  │ • Batch Calc    │            │ • Exception Check │           │
│  └────────┬────────┘            └─────────┬────────┘           │
│           │                                │                     │
└───────────┼────────────────────────────────┼────────────────────┘
            │                                │
┌───────────┼────────────────────────────────┼────────────────────┐
│           │      DATABASE LAYER            │                     │
├───────────┼────────────────────────────────┼────────────────────┤
│           │                                │                     │
│  ┌────────▼────────────────────────────────▼────────┐           │
│  │         PostgreSQL + PostGIS                     │           │
│  │                                                   │           │
│  │  ┌──────────────┐  ┌──────────────┐            │           │
│  │  │ DoctorClinic │  │ClinicHours   │            │           │
│  │  │              │  │              │            │           │
│  │  │ • Spatial    │  │ • Day/Time   │            │           │
│  │  │ • GIST Index │  │ • Open/Close │            │           │
│  │  └──────────────┘  └──────────────┘            │           │
│  │                                                   │           │
│  │  ┌──────────────┐  ┌──────────────┐            │           │
│  │  │DoctorAvail   │  │DistanceCache │            │           │
│  │  │              │  │              │            │           │
│  │  │ • Flags      │  │ • TTL 5min   │            │           │
│  │  │ • Insurance  │  │ • Coordinates│            │           │
│  │  └──────────────┘  └──────────────┘            │           │
│  │                                                   │           │
│  │  ┌──────────────┐  ┌──────────────┐            │           │
│  │  │ClinicExcept  │  │ User (ext)   │            │           │
│  │  │              │  │              │            │           │
│  │  │ • Holidays   │  │ • Location   │            │           │
│  │  │ • Special    │  │ • Insurance  │            │           │
│  │  └──────────────┘  └──────────────┘            │           │
│  │                                                   │           │
│  └───────────────────────────────────────────────────┘           │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

## 🔄 Data Flow

### Patient Viewing Replies

```
1. Patient opens post
   ↓
2. Browser requests geolocation permission
   ↓
3. Frontend sends GET request with lat/lng
   ↓
4. API fetches doctor replies from database
   ↓
5. LocationService calculates distances
   ↓
6. AvailabilityService checks clinic status
   ↓
7. Results sorted by distance
   ↓
8. Filters applied (radius, telemedicine, etc.)
   ↓
9. Response sent to frontend
   ↓
10. Frontend displays replies with badges
```

### Doctor Adding Clinic

```
1. Doctor opens clinic management
   ↓
2. Fills clinic form
   ↓
3. Clicks "Use my current location"
   ↓
4. Browser provides coordinates
   ↓
5. Sets operating hours
   ↓
6. Submits form
   ↓
7. API validates authentication
   ↓
8. Checks doctor role
   ↓
9. Validates coordinates
   ↓
10. Inserts into DoctorClinic table
    ↓
11. Inserts clinic hours
    ↓
12. Returns success
    ↓
13. Frontend refreshes clinic list
```

## 🗄️ Database Schema

```
┌─────────────────────────────────────────────────────────────────┐
│                      DATABASE SCHEMA                             │
└─────────────────────────────────────────────────────────────────┘

User (Extended)
├── id (PK)
├── email
├── username
├── role
├── latitude ◄─────────┐
├── longitude          │ Spatial Index (GIST)
├── insurance_provider │
└── location_sharing   │
                       │
DoctorClinic           │
├── id (PK)            │
├── doctor_id (FK) ────┘
├── clinic_name
├── address
├── city
├── state
├── country
├── latitude ◄─────────┐
├── longitude          │ Spatial Index (GIST)
├── phone              │
└── is_primary         │
    │                  │
    ├─────────────────┐│
    │                 ││
ClinicHours           ││
├── id (PK)           ││
├── clinic_id (FK) ───┘│
├── day_of_week (0-6)  │
├── open_time          │
├── close_time         │
└── is_closed          │
    │                  │
    │                  │
ClinicException        │
├── id (PK)            │
├── clinic_id (FK) ────┘
├── exception_date
├── open_time
├── close_time
├── is_closed
└── reason

DoctorAvailability
├── id (PK)
├── doctor_id (FK) ────┐
├── telemedicine       │
├── in_person          │
├── emergency          │
├── insurance[] ◄──────┤ GIN Index
└── accepts_all        │
                       │
DistanceCache          │
├── id (PK)            │
├── patient_lat        │
├── patient_lng        │
├── doctor_id (FK) ────┘
├── clinic_id (FK)
├── distance_km
├── calculated_at
└── expires_at ◄────── Composite Index
```

## 🔐 Security Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      SECURITY LAYERS                             │
└─────────────────────────────────────────────────────────────────┘

Request
  │
  ├─► Rate Limiter (100 req/min)
  │
  ├─► Input Sanitization
  │
  ├─► Authentication Middleware
  │     ├─► JWT Token Validation
  │     └─► User Session Check
  │
  ├─► Authorization Middleware
  │     ├─► Role Check (Doctor/Patient)
  │     └─► Resource Ownership
  │
  ├─► Input Validation
  │     ├─► Coordinate Range Check
  │     ├─► Required Fields
  │     └─► Data Type Validation
  │
  ├─► Privacy Check
  │     ├─► Location Sharing Enabled?
  │     ├─► Context-Based Access
  │     └─► Data Sanitization
  │
  └─► Database Query
        ├─► Parameterized Queries
        ├─► SQL Injection Prevention
        └─► Spatial Index Usage
```

## 📊 Performance Optimization

```
┌─────────────────────────────────────────────────────────────────┐
│                   PERFORMANCE LAYERS                             │
└─────────────────────────────────────────────────────────────────┘

Request
  │
  ├─► Distance Cache Check (5min TTL)
  │     ├─► Cache Hit → Return Cached Distance
  │     └─► Cache Miss → Calculate & Store
  │
  ├─► Spatial Index Query (GIST)
  │     ├─► Fast Radius Filtering
  │     └─► Efficient Distance Calculation
  │
  ├─► Batch Operations
  │     ├─► Calculate Multiple Distances
  │     └─► Single Database Query
  │
  ├─► Pagination (20 per page)
  │     ├─► Limit Result Set
  │     └─► Reduce Data Transfer
  │
  └─► Response Compression
        ├─► GZIP Encoding
        └─► Reduced Bandwidth
```

## 🎨 Component Hierarchy

```
┌─────────────────────────────────────────────────────────────────┐
│                   FRONTEND COMPONENTS                            │
└─────────────────────────────────────────────────────────────────┘

AreaWiseDoctorReplies
├── GeolocationProvider
│   ├── Permission Request
│   └── Location State
│
├── FilterPanel
│   ├── RadiusFilter
│   ├── TelemedicineFilter
│   ├── InPersonFilter
│   ├── EmergencyFilter
│   └── InsuranceFilter
│
└── DoctorReplyList
    └── DoctorReplyCard (for each reply)
        ├── DoctorHeader
        │   ├── Avatar
        │   ├── Name
        │   ├── Specialty
        │   └── VerificationBadge
        │
        ├── ReplyContent
        │
        ├── AvailabilityBadges
        │   ├── TelemedicineBadge
        │   ├── InPersonBadge
        │   └── EmergencyBadge
        │
        ├── ClinicInfo
        │   ├── ClinicName
        │   ├── Address
        │   ├── DistanceBadge
        │   ├── ClinicStatus
        │   ├── Phone
        │   └── GetDirectionsButton
        │
        └── InsuranceInfo
            ├── ProviderList
            └── AcceptsAllBadge

DoctorClinicManagement
├── AvailabilitySettings
│   ├── TelemedicineToggle
│   ├── InPersonToggle
│   ├── EmergencyToggle
│   └── InsuranceInput
│
├── ClinicList
│   └── ClinicCard (for each clinic)
│       ├── ClinicDetails
│       ├── HoursDisplay
│       └── EditDeleteButtons
│
└── AddClinicForm
    ├── BasicInfo
    ├── LocationInput
    ├── HoursEditor
    └── SubmitButton
```

## 🔄 State Management

```
┌─────────────────────────────────────────────────────────────────┐
│                      STATE FLOW                                  │
└─────────────────────────────────────────────────────────────────┘

Component State
├── userLocation: { lat, lng } | null
├── locationPermission: 'prompt' | 'granted' | 'denied'
├── replies: DoctorReply[]
├── loading: boolean
├── error: string | null
├── filters: {
│   ├── radius: number | null
│   ├── telemedicine: boolean
│   ├── inPersonOnly: boolean
│   ├── emergency: boolean
│   └── insurance: string
│   }
└── pagination: {
    ├── page: number
    ├── limit: number
    ├── total: number
    └── totalPages: number
    }

State Updates
├── Location Granted → Fetch with coordinates
├── Filter Changed → Debounce → Refetch
├── Page Changed → Fetch next page
└── Error Occurred → Display error message
```

## 📱 Mobile Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                   MOBILE OPTIMIZATIONS                           │
└─────────────────────────────────────────────────────────────────┘

Responsive Design
├── Breakpoints
│   ├── Mobile: < 768px
│   ├── Tablet: 768px - 1024px
│   └── Desktop: > 1024px
│
├── Touch Optimizations
│   ├── Larger Touch Targets (44x44px)
│   ├── Swipe Gestures
│   └── Pull-to-Refresh
│
├── Performance
│   ├── Lazy Loading
│   ├── Image Optimization
│   ├── Reduced Data Transfer
│   └── Cached Geolocation
│
└── Native Integration
    ├── GPS API
    ├── Maps App
    └── Phone Dialer
```

---

**Architecture Version:** 1.0.0  
**Last Updated:** February 24, 2026  
**Status:** Production Ready ✅
