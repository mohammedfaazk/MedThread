# Area-Wise Doctor Replies - Design Document

## 1. System Architecture

### 1.1 High-Level Architecture

```
┌─────────────────┐
│   Web Client    │
│  (React/Next)   │
└────────┬────────┘
         │
         ├─ Geolocation API (Browser)
         │
         ▼
┌─────────────────┐
│   API Layer     │
│  (Express/NestJS)│
└────────┬────────┘
         │
         ├─ Distance Calculation Service
         ├─ Availability Service
         ├─ Cache Layer (Redis)
         │
         ▼
┌─────────────────┐
│   Database      │
│  (PostgreSQL +  │
│    PostGIS)     │
└─────────────────┘
```

### 1.2 Component Breakdown

- **Location Service**: Handles geolocation, distance calculations, and spatial queries
- **Availability Service**: Manages clinic hours, appointment slots, and emergency availability
- **Filter Service**: Processes filter criteria and applies sorting logic
- **Cache Service**: Caches distance calculations and frequently accessed data
- **Privacy Service**: Enforces location data access controls

## 2. Database Schema Changes

### 2.1 User Model Extensions

```sql
-- Add location fields to User table
ALTER TABLE "User" 
ADD COLUMN latitude DECIMAL(10, 8),
ADD COLUMN longitude DECIMAL(11, 8),
ADD COLUMN location_updated_at TIMESTAMP,
ADD COLUMN insurance_provider VARCHAR(255),
ADD COLUMN location_sharing_enabled BOOLEAN DEFAULT false;

-- Create spatial index for user locations
CREATE INDEX idx_user_location ON "User" USING GIST (
  ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
```

### 2.2 Doctor Profile Extensions

```sql
-- Create DoctorClinic table for multiple clinic locations
CREATE TABLE "DoctorClinic" (
  id SERIAL PRIMARY KEY,
  doctor_id INTEGER NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  clinic_name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100),
  country VARCHAR(100) NOT NULL,
  postal_code VARCHAR(20),
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  phone VARCHAR(50),
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create spatial index for clinic locations
CREATE INDEX idx_clinic_location ON "DoctorClinic" USING GIST (
  ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
);

-- Create index for doctor lookups
CREATE INDEX idx_clinic_doctor ON "DoctorClinic"(doctor_id);

-- Create ClinicHours table
CREATE TABLE "ClinicHours" (
  id SERIAL PRIMARY KEY,
  clinic_id INTEGER NOT NULL REFERENCES "DoctorClinic"(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday, 6=Saturday
  open_time TIME NOT NULL,
  close_time TIME NOT NULL,
  is_closed BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(clinic_id, day_of_week)
);

-- Create index for clinic hours lookups
CREATE INDEX idx_clinic_hours_clinic ON "ClinicHours"(clinic_id);

-- Create ClinicException table for special hours/closures
CREATE TABLE "ClinicException" (
  id SERIAL PRIMARY KEY,
  clinic_id INTEGER NOT NULL REFERENCES "DoctorClinic"(id) ON DELETE CASCADE,
  exception_date DATE NOT NULL,
  open_time TIME,
  close_time TIME,
  is_closed BOOLEAN DEFAULT true,
  reason VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(clinic_id, exception_date)
);

-- Create index for exception lookups
CREATE INDEX idx_clinic_exception_clinic_date ON "ClinicException"(clinic_id, exception_date);

-- Create DoctorAvailability table
CREATE TABLE "DoctorAvailability" (
  id SERIAL PRIMARY KEY,
  doctor_id INTEGER NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  telemedicine_available BOOLEAN DEFAULT false,
  in_person_available BOOLEAN DEFAULT true,
  emergency_available BOOLEAN DEFAULT false,
  insurance_accepted TEXT[], -- Array of insurance provider names
  accepts_all_insurance BOOLEAN DEFAULT false,
  average_wait_time_minutes INTEGER,
  next_available_slot TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(doctor_id)
);

-- Create index for availability lookups
CREATE INDEX idx_doctor_availability_doctor ON "DoctorAvailability"(doctor_id);
CREATE INDEX idx_doctor_availability_telemedicine ON "DoctorAvailability"(telemedicine_available);
CREATE INDEX idx_doctor_availability_emergency ON "DoctorAvailability"(emergency_available);

-- Create index for insurance searches (GIN index for array)
CREATE INDEX idx_doctor_availability_insurance ON "DoctorAvailability" USING GIN (insurance_accepted);
```

### 2.3 Distance Cache Table

```sql
-- Create table to cache distance calculations
CREATE TABLE "DistanceCache" (
  id SERIAL PRIMARY KEY,
  patient_lat DECIMAL(10, 8) NOT NULL,
  patient_lng DECIMAL(11, 8) NOT NULL,
  doctor_id INTEGER NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  clinic_id INTEGER NOT NULL REFERENCES "DoctorClinic"(id) ON DELETE CASCADE,
  distance_km DECIMAL(10, 2) NOT NULL,
  calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL
);

-- Create composite index for cache lookups
CREATE INDEX idx_distance_cache_lookup ON "DistanceCache"(
  patient_lat, patient_lng, doctor_id, clinic_id, expires_at
);

-- Create index for cleanup of expired entries
CREATE INDEX idx_distance_cache_expires ON "DistanceCache"(expires_at);
```

## 3. API Design

### 3.1 Get Doctor Replies with Location Data

```typescript
GET /api/posts/:postId/replies/doctors

Query Parameters:
- lat: number (optional) - Patient latitude
- lng: number (optional) - Patient longitude
- radius: number (optional) - Filter radius in km (1, 5, 10, 25, 50)
- telemedicine: boolean (optional) - Filter for telemedicine availability
- inPersonOnly: boolean (optional) - Filter for in-person only
- emergency: boolean (optional) - Filter for emergency availability
- insurance: string (optional) - Filter by insurance provider
- page: number (default: 1)
- limit: number (default: 20, max: 50)

Response:
{
  success: true,
  data: {
    replies: [
      {
        id: number,
        content: string,
        createdAt: string,
        doctor: {
          id: number,
          name: string,
          specialization: string,
          avatar: string,
          clinic: {
            id: number,
            name: string,
            address: string,
            city: string,
            latitude: number,
            longitude: number,
            phone: string,
            distance?: {
              km: number,
              formatted: string
            }
          },
          availability: {
            telemedicineAvailable: boolean,
            inPersonAvailable: boolean,
            emergencyAvailable: boolean,
            insuranceAccepted: string[],
            acceptsAllInsurance: boolean,
            nextAvailableSlot: string | null
          },
          clinicStatus: {
            isOpen: boolean,
            opensAt: string | null,
            closesAt: string | null
          }
        }
      }
    ],
    pagination: {
      page: number,
      limit: number,
      total: number,
      totalPages: number
    }
  }
}
```

### 3.2 Update Doctor Clinic Information

```typescript
POST /api/doctors/clinics

Request Body:
{
  clinicName: string,
  address: string,
  city: string,
  state?: string,
  country: string,
  postalCode?: string,
  latitude: number,
  longitude: number,
  phone?: string,
  isPrimary: boolean,
  hours: [
    {
      dayOfWeek: number, // 0-6
      openTime: string, // "09:00"
      closeTime: string, // "17:00"
      isClosed: boolean
    }
  ]
}

Response:
{
  success: true,
  data: {
    clinic: {
      id: number,
      clinicName: string,
      address: string,
      // ... other fields
    }
  }
}
```

### 3.3 Update Doctor Availability

```typescript
PUT /api/doctors/availability

Request Body:
{
  telemedicineAvailable: boolean,
  inPersonAvailable: boolean,
  emergencyAvailable: boolean,
  insuranceAccepted: string[],
  acceptsAllInsurance: boolean,
  averageWaitTimeMinutes?: number,
  nextAvailableSlot?: string
}

Response:
{
  success: true,
  data: {
    availability: {
      // ... updated availability data
    }
  }
}
```

### 3.4 Calculate Distance

```typescript
POST /api/location/calculate-distance

Request Body:
{
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number
}

Response:
{
  success: true,
  data: {
    distanceKm: number,
    formatted: string
  }
}
```

## 4. Core Algorithms

### 4.1 Haversine Distance Formula

```typescript
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
    Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 100) / 100; // Round to 2 decimal places
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)}m`;
  }
  return `${km.toFixed(1)}km`;
}
```

### 4.2 Clinic Status Calculation

```typescript
interface ClinicStatus {
  isOpen: boolean;
  opensAt: string | null;
  closesAt: string | null;
}

function getClinicStatus(
  hours: ClinicHours[],
  exceptions: ClinicException[],
  timezone: string = 'UTC'
): ClinicStatus {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const currentTime = now.toTimeString().slice(0, 5); // "HH:MM"
  const currentDate = now.toISOString().slice(0, 10); // "YYYY-MM-DD"
  
  // Check for exceptions first
  const exception = exceptions.find(e => e.exception_date === currentDate);
  if (exception) {
    if (exception.is_closed) {
      return { isOpen: false, opensAt: null, closesAt: null };
    }
    return {
      isOpen: currentTime >= exception.open_time && currentTime < exception.close_time,
      opensAt: exception.open_time,
      closesAt: exception.close_time
    };
  }
  
  // Check regular hours
  const todayHours = hours.find(h => h.day_of_week === dayOfWeek);
  if (!todayHours || todayHours.is_closed) {
    // Find next opening day
    const nextOpen = findNextOpenDay(hours, dayOfWeek);
    return { isOpen: false, opensAt: nextOpen, closesAt: null };
  }
  
  const isOpen = currentTime >= todayHours.open_time && currentTime < todayHours.close_time;
  
  return {
    isOpen,
    opensAt: todayHours.open_time,
    closesAt: todayHours.close_time
  };
}

function findNextOpenDay(hours: ClinicHours[], currentDay: number): string | null {
  for (let i = 1; i <= 7; i++) {
    const nextDay = (currentDay + i) % 7;
    const dayHours = hours.find(h => h.day_of_week === nextDay && !h.is_closed);
    if (dayHours) {
      const daysUntil = i;
      const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][nextDay];
      return `${dayName} at ${dayHours.open_time}`;
    }
  }
  return null;
}
```

### 4.3 Spatial Query with PostGIS

```sql
-- Find doctors within radius, sorted by distance
SELECT 
  u.id,
  u.name,
  dc.clinic_name,
  dc.address,
  dc.latitude,
  dc.longitude,
  ST_Distance(
    ST_SetSRID(ST_MakePoint(dc.longitude, dc.latitude), 4326)::geography,
    ST_SetSRID(ST_MakePoint($patientLng, $patientLat), 4326)::geography
  ) / 1000 AS distance_km
FROM "User" u
INNER JOIN "DoctorClinic" dc ON u.id = dc.doctor_id
WHERE u.role = 'DOCTOR'
  AND ST_DWithin(
    ST_SetSRID(ST_MakePoint(dc.longitude, dc.latitude), 4326)::geography,
    ST_SetSRID(ST_MakePoint($patientLng, $patientLat), 4326)::geography,
    $radiusMeters
  )
ORDER BY distance_km ASC
LIMIT $limit OFFSET $offset;
```

## 5. Caching Strategy

### 5.1 Distance Cache

- Cache distance calculations for 5 minutes
- Key format: `distance:{patientLat}:{patientLng}:{doctorId}:{clinicId}`
- Use Redis for fast lookups
- Implement automatic cleanup of expired entries

### 5.2 Clinic Status Cache

- Cache clinic status for 1 minute
- Key format: `clinic_status:{clinicId}`
- Invalidate on clinic hours update

### 5.3 Doctor Availability Cache

- Cache availability data for 5 minutes
- Key format: `doctor_availability:{doctorId}`
- Invalidate on availability update

## 6. Privacy and Security

### 6.1 Location Data Access Control

```typescript
function canAccessPreciseLocation(
  viewer: User,
  doctor: User,
  context: 'reply' | 'profile'
): boolean {
  // Only authenticated patients viewing replies can see precise location
  if (context === 'reply' && viewer.role === 'PATIENT') {
    return true;
  }
  
  // Public profile views only show city/region
  if (context === 'profile') {
    return false;
  }
  
  return false;
}

function sanitizeLocationData(
  clinic: DoctorClinic,
  canAccessPrecise: boolean
): Partial<DoctorClinic> {
  if (canAccessPrecise) {
    return clinic;
  }
  
  // Return only city-level information
  return {
    id: clinic.id,
    clinic_name: clinic.clinic_name,
    city: clinic.city,
    state: clinic.state,
    country: clinic.country,
    // Omit precise coordinates and address
  };
}
```

### 6.2 Rate Limiting

- Limit distance calculation requests to 100 per minute per user
- Limit location updates to 10 per hour per doctor
- Implement exponential backoff for failed geolocation requests

## 7. Correctness Properties

### 7.1 Distance Calculation Properties

**Property 7.1.1**: Distance symmetry
```
∀ point1, point2: calculateDistance(point1, point2) = calculateDistance(point2, point1)
```

**Property 7.1.2**: Distance non-negativity
```
∀ point1, point2: calculateDistance(point1, point2) ≥ 0
```

**Property 7.1.3**: Distance identity
```
∀ point: calculateDistance(point, point) = 0
```

**Property 7.1.4**: Distance bounds
```
∀ point1, point2: calculateDistance(point1, point2) ≤ 20037.5 km (half Earth's circumference)
```

### 7.2 Sorting Properties

**Property 7.2.1**: Proximity ordering
```
∀ patient, doctors: 
  WITH location permissions granted
  THEN doctors[i].distance ≤ doctors[i+1].distance for all i
```

**Property 7.2.2**: Filter consistency
```
∀ filters applied:
  ALL returned doctors MUST satisfy ALL active filter criteria
```

### 7.3 Availability Properties

**Property 7.3.1**: Clinic status consistency
```
∀ clinic, time:
  IF exception exists for date THEN use exception hours
  ELSE use regular hours for day_of_week
```

**Property 7.3.2**: Emergency availability visibility
```
∀ doctor:
  IF emergency_available = true
  THEN emergency indicator MUST be displayed with high priority
```

### 7.4 Privacy Properties

**Property 7.4.1**: Location access control
```
∀ viewer, doctor, context:
  IF context = 'profile' AND viewer ≠ doctor
  THEN precise_location MUST NOT be exposed
```

**Property 7.4.2**: Patient location privacy
```
∀ patient:
  IF location_sharing_enabled = false
  THEN patient.latitude AND patient.longitude MUST be NULL
```

### 7.5 Cache Properties

**Property 7.5.1**: Cache expiration
```
∀ cached_entry:
  IF current_time > expires_at
  THEN entry MUST be recalculated or removed
```

**Property 7.5.2**: Cache invalidation
```
∀ doctor_data_update:
  WHEN availability OR clinic_hours updated
  THEN related cache entries MUST be invalidated
```

### 7.6 Data Integrity Properties

**Property 7.6.1**: Coordinate validity
```
∀ location:
  latitude MUST be in range [-90, 90]
  AND longitude MUST be in range [-180, 180]
```

**Property 7.6.2**: Clinic hours validity
```
∀ clinic_hours:
  open_time < close_time
  AND day_of_week IN [0, 6]
```

**Property 7.6.3**: Primary clinic uniqueness
```
∀ doctor:
  COUNT(clinics WHERE is_primary = true) ≤ 1
```

## 8. Performance Considerations

### 8.1 Query Optimization

- Use spatial indexes (GIST) for all location-based queries
- Implement query result caching for frequently accessed data
- Use database connection pooling
- Implement pagination for large result sets

### 8.2 Frontend Optimization

- Lazy load doctor details as user scrolls
- Debounce filter changes to reduce API calls
- Cache geolocation results in browser storage
- Use optimistic UI updates for better perceived performance

### 8.3 Scalability

- Implement horizontal scaling for API servers
- Use read replicas for location queries
- Consider CDN for static clinic information
- Implement request queuing for distance calculations

## 9. Error Handling

### 9.1 Geolocation Errors

- Handle permission denied gracefully
- Provide fallback to manual location entry
- Show helpful error messages
- Degrade to region-based sorting

### 9.2 Database Errors

- Implement retry logic for transient failures
- Log errors for monitoring
- Return partial results when possible
- Provide user-friendly error messages

## 10. Testing Strategy

### 10.1 Unit Tests

- Distance calculation accuracy
- Clinic status determination
- Filter logic
- Privacy access control

### 10.2 Integration Tests

- API endpoint responses
- Database queries with spatial data
- Cache behavior
- Filter combinations

### 10.3 Performance Tests

- Load testing with 1000+ concurrent users
- Distance calculation performance
- Spatial query performance
- Cache hit rates

### 10.4 Security Tests

- Location data access control
- Privacy settings enforcement
- Rate limiting effectiveness
- Input validation
