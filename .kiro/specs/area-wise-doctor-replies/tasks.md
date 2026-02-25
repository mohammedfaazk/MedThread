# Area-Wise Doctor Replies - Implementation Tasks

## Phase 1: Database Schema and Models

### 1.1 Database Schema Setup
- [ ] 1.1.1 Create migration for User table location extensions
  - [ ] Add latitude, longitude columns
  - [ ] Add location_updated_at timestamp
  - [ ] Add insurance_provider column
  - [ ] Add location_sharing_enabled boolean
  - [ ] Create spatial index on user location

- [ ] 1.1.2 Create DoctorClinic table and migration
  - [ ] Define table structure with all fields
  - [ ] Add foreign key to User table
  - [ ] Create spatial index on clinic location
  - [ ] Create index on doctor_id
  - [ ] Add unique constraint for primary clinic per doctor

- [ ] 1.1.3 Create ClinicHours table and migration
  - [ ] Define table structure with day_of_week, times
  - [ ] Add foreign key to DoctorClinic
  - [ ] Add check constraint for day_of_week (0-6)
  - [ ] Create unique constraint on (clinic_id, day_of_week)
  - [ ] Create index on clinic_id

- [ ] 1.1.4 Create ClinicException table and migration
  - [ ] Define table structure for special hours/closures
  - [ ] Add foreign key to DoctorClinic
  - [ ] Create unique constraint on (clinic_id, exception_date)
  - [ ] Create composite index on clinic_id and exception_date

- [ ] 1.1.5 Create DoctorAvailability table and migration
  - [ ] Define table structure with availability flags
  - [ ] Add insurance_accepted array column
  - [ ] Add foreign key to User table
  - [ ] Create unique constraint on doctor_id
  - [ ] Create indexes on telemedicine_available and emergency_available
  - [ ] Create GIN index on insurance_accepted array

- [ ] 1.1.6 Create DistanceCache table and migration
  - [ ] Define table structure for caching distances
  - [ ] Add foreign keys to User and DoctorClinic
  - [ ] Create composite index on (patient_lat, patient_lng, doctor_id, clinic_id, expires_at)
  - [ ] Create index on expires_at for cleanup

- [ ] 1.1.7 Install and configure PostGIS extension
  - [ ] Add PostGIS extension to PostgreSQL
  - [ ] Verify spatial functions are available
  - [ ] Test spatial index creation

### 1.2 ORM Models (Prisma/TypeORM)
- [ ] 1.2.1 Update User model
  - [ ] Add location fields to schema
  - [ ] Add insurance_provider field
  - [ ] Add location_sharing_enabled field

- [ ] 1.2.2 Create DoctorClinic model
  - [ ] Define model with all fields
  - [ ] Add relations to User
  - [ ] Add relations to ClinicHours and ClinicException

- [ ] 1.2.3 Create ClinicHours model
  - [ ] Define model with time fields
  - [ ] Add relation to DoctorClinic

- [ ] 1.2.4 Create ClinicException model
  - [ ] Define model with exception fields
  - [ ] Add relation to DoctorClinic

- [ ] 1.2.5 Create DoctorAvailability model
  - [ ] Define model with availability flags
  - [ ] Add relation to User

- [ ] 1.2.6 Create DistanceCache model
  - [ ] Define model with cache fields
  - [ ] Add relations to User and DoctorClinic

- [ ] 1.2.7 Generate Prisma client / sync TypeORM
  - [ ] Run migration generation
  - [ ] Apply migrations to database
  - [ ] Verify all tables created correctly

## Phase 2: Backend Services

### 2.1 Location Service
- [ ] 2.1.1 Create LocationService class
  - [ ] Implement Haversine distance calculation
  - [ ] Add distance formatting (meters/kilometers)
  - [ ] Add coordinate validation
  - [ ] Add error handling for invalid coordinates

- [ ] 2.1.2 Implement distance caching
  - [ ] Create cache key generation function
  - [ ] Implement cache lookup logic
  - [ ] Implement cache storage with expiration (5 minutes)
  - [ ] Add cache cleanup for expired entries

- [ ] 2.1.3 Implement spatial queries with PostGIS
  - [ ] Create query for doctors within radius
  - [ ] Add distance calculation in query
  - [ ] Add sorting by distance
  - [ ] Optimize with spatial indexes

- [ ] 2.1.4 Add batch distance calculation
  - [ ] Implement parallel distance calculations
  - [ ] Add result caching for batch operations
  - [ ] Optimize for performance with large datasets

### 2.2 Availability Service
- [ ] 2.2.1 Create AvailabilityService class
  - [ ] Implement clinic status calculation
  - [ ] Add current time zone handling
  - [ ] Add exception date checking
  - [ ] Add regular hours checking

- [ ] 2.2.2 Implement clinic hours logic
  - [ ] Create function to check if clinic is open now
  - [ ] Create function to find next opening time
  - [ ] Handle edge cases (24-hour clinics, closed all week)
  - [ ] Add timezone conversion support

- [ ] 2.2.3 Implement next available slot calculation
  - [ ] Parse clinic hours for upcoming slots
  - [ ] Consider exception dates
  - [ ] Return formatted next available time
  - [ ] Cache results for performance

- [ ] 2.2.4 Add availability filtering
  - [ ] Filter by telemedicine availability
  - [ ] Filter by in-person availability
  - [ ] Filter by emergency availability
  - [ ] Filter by insurance accepted

### 2.3 Privacy Service
- [ ] 2.3.1 Create PrivacyService class
  - [ ] Implement location access control logic
  - [ ] Add context-based permission checking
  - [ ] Add role-based access control

- [ ] 2.3.2 Implement location data sanitization
  - [ ] Create function to sanitize clinic data
  - [ ] Remove precise coordinates for public views
  - [ ] Keep city/region for public profiles
  - [ ] Add logging for privacy access

- [ ] 2.3.3 Add patient location privacy controls
  - [ ] Check location_sharing_enabled flag
  - [ ] Prevent storage if sharing disabled
  - [ ] Add user preference management

### 2.4 Filter Service
- [ ] 2.4.1 Create FilterService class
  - [ ] Implement radius filtering
  - [ ] Implement telemedicine filtering
  - [ ] Implement insurance filtering
  - [ ] Implement emergency availability filtering

- [ ] 2.4.2 Add filter combination logic
  - [ ] Support multiple simultaneous filters
  - [ ] Optimize query building for filters
  - [ ] Add filter validation

- [ ] 2.4.3 Implement sorting logic
  - [ ] Sort by distance (when location available)
  - [ ] Sort alphabetically (fallback)
  - [ ] Sort by availability (secondary sort)

## Phase 3: API Endpoints

### 3.1 Doctor Replies Endpoint
- [ ] 3.1.1 Create GET /api/posts/:postId/replies/doctors endpoint
  - [ ] Add route handler
  - [ ] Parse query parameters (lat, lng, radius, filters)
  - [ ] Validate input parameters
  - [ ] Add authentication middleware

- [ ] 3.1.2 Implement reply fetching with location data
  - [ ] Query doctor replies for post
  - [ ] Join with clinic and availability data
  - [ ] Apply filters based on query params
  - [ ] Calculate distances if location provided

- [ ] 3.1.3 Add pagination support
  - [ ] Implement page and limit parameters
  - [ ] Calculate total pages
  - [ ] Return pagination metadata
  - [ ] Optimize for large result sets

- [ ] 3.1.4 Format response data
  - [ ] Structure doctor data with clinic info
  - [ ] Include availability information
  - [ ] Include clinic status
  - [ ] Apply privacy sanitization

- [ ] 3.1.5 Add error handling
  - [ ] Handle invalid coordinates
  - [ ] Handle database errors
  - [ ] Handle missing data gracefully
  - [ ] Return appropriate HTTP status codes

### 3.2 Clinic Management Endpoints
- [ ] 3.2.1 Create POST /api/doctors/clinics endpoint
  - [ ] Add route handler with authentication
  - [ ] Validate doctor role
  - [ ] Parse and validate request body
  - [ ] Validate coordinates

- [ ] 3.2.2 Implement clinic creation
  - [ ] Create DoctorClinic record
  - [ ] Create associated ClinicHours records
  - [ ] Handle primary clinic flag
  - [ ] Return created clinic data

- [ ] 3.2.3 Create PUT /api/doctors/clinics/:id endpoint
  - [ ] Add route handler with authentication
  - [ ] Verify clinic ownership
  - [ ] Update clinic information
  - [ ] Update clinic hours if provided

- [ ] 3.2.4 Create DELETE /api/doctors/clinics/:id endpoint
  - [ ] Add route handler with authentication
  - [ ] Verify clinic ownership
  - [ ] Prevent deletion of last clinic
  - [ ] Cascade delete hours and exceptions

- [ ] 3.2.5 Create GET /api/doctors/clinics endpoint
  - [ ] List all clinics for authenticated doctor
  - [ ] Include hours and exceptions
  - [ ] Return formatted data

### 3.3 Availability Management Endpoints
- [ ] 3.3.1 Create PUT /api/doctors/availability endpoint
  - [ ] Add route handler with authentication
  - [ ] Validate doctor role
  - [ ] Parse and validate request body
  - [ ] Validate insurance provider names

- [ ] 3.3.2 Implement availability update
  - [ ] Upsert DoctorAvailability record
  - [ ] Update all availability flags
  - [ ] Update insurance accepted list
  - [ ] Invalidate related caches

- [ ] 3.3.3 Create GET /api/doctors/availability endpoint
  - [ ] Fetch availability for authenticated doctor
  - [ ] Return formatted availability data
  - [ ] Include insurance list

### 3.4 Location Utility Endpoints
- [ ] 3.4.1 Create POST /api/location/calculate-distance endpoint
  - [ ] Add route handler
  - [ ] Parse coordinates from request
  - [ ] Validate coordinates
  - [ ] Calculate distance using Haversine

- [ ] 3.4.2 Add rate limiting
  - [ ] Implement rate limiter (100 requests/minute)
  - [ ] Add rate limit headers
  - [ ] Return 429 when limit exceeded

- [ ] 3.4.3 Create POST /api/location/geocode endpoint (optional)
  - [ ] Integrate with geocoding service
  - [ ] Convert address to coordinates
  - [ ] Cache geocoding results
  - [ ] Handle geocoding errors

## Phase 4: Frontend Components

### 4.1 Location Components
- [ ] 4.1.1 Create GeolocationProvider component
  - [ ] Request browser geolocation permission
  - [ ] Store location in context/state
  - [ ] Handle permission denied
  - [ ] Add manual location entry fallback

- [ ] 4.1.2 Create DistanceBadge component
  - [ ] Display formatted distance
  - [ ] Style based on distance (near/far)
  - [ ] Add tooltip with exact distance
  - [ ] Handle missing distance gracefully

- [ ] 4.1.3 Create LocationDisplay component
  - [ ] Show clinic address
  - [ ] Display city/region
  - [ ] Add "Get Directions" button
  - [ ] Open native maps on mobile

### 4.2 Availability Components
- [ ] 4.2.1 Create AvailabilityBadges component
  - [ ] Display "Telemedicine Available" badge
  - [ ] Display "In-Person Only" badge
  - [ ] Display "Emergency Availability" badge
  - [ ] Style badges with appropriate colors

- [ ] 4.2.2 Create ClinicStatusIndicator component
  - [ ] Show "Currently Open" status
  - [ ] Show "Opens at X" when closed
  - [ ] Display clinic hours
  - [ ] Add tooltip with full schedule

- [ ] 4.2.3 Create InsuranceBadge component
  - [ ] Display insurance providers accepted
  - [ ] Highlight patient's insurance if matched
  - [ ] Show "Most Insurance Accepted" badge
  - [ ] Add expandable list for many insurances

- [ ] 4.2.4 Create NextAvailableSlot component
  - [ ] Display next available appointment time
  - [ ] Format time in user's timezone
  - [ ] Add "Book Appointment" button (if integrated)
  - [ ] Handle no available slots

### 4.3 Filter Components
- [ ] 4.3.1 Create DoctorReplyFilters component
  - [ ] Add radius filter dropdown (1km, 5km, 10km, 25km, 50km)
  - [ ] Add telemedicine toggle filter
  - [ ] Add in-person only toggle filter
  - [ ] Add emergency availability toggle filter
  - [ ] Add insurance filter dropdown

- [ ] 4.3.2 Implement filter state management
  - [ ] Use React state or Redux for filters
  - [ ] Debounce filter changes
  - [ ] Update URL query params
  - [ ] Persist filters in session storage

- [ ] 4.3.3 Add filter reset functionality
  - [ ] Add "Clear All Filters" button
  - [ ] Reset to default state
  - [ ] Update UI accordingly

### 4.4 Doctor Reply List Components
- [ ] 4.4.1 Create AreaWiseDoctorReplies component
  - [ ] Fetch doctor replies with location data
  - [ ] Display loading state
  - [ ] Handle errors gracefully
  - [ ] Show empty state when no replies

- [ ] 4.4.2 Create DoctorReplyCard component
  - [ ] Display doctor information
  - [ ] Show reply content
  - [ ] Include DistanceBadge
  - [ ] Include AvailabilityBadges
  - [ ] Include ClinicStatusIndicator
  - [ ] Include InsuranceBadge
  - [ ] Include LocationDisplay

- [ ] 4.4.3 Implement pagination
  - [ ] Add pagination controls
  - [ ] Handle page changes
  - [ ] Update URL with page number
  - [ ] Scroll to top on page change

- [ ] 4.4.4 Add infinite scroll (alternative to pagination)
  - [ ] Detect scroll to bottom
  - [ ] Load next page automatically
  - [ ] Show loading indicator
  - [ ] Handle end of results

### 4.5 Doctor Profile Components
- [ ] 4.5.1 Create ClinicManagement component (doctor view)
  - [ ] List all doctor's clinics
  - [ ] Add "Add Clinic" button
  - [ ] Edit clinic information
  - [ ] Delete clinic with confirmation

- [ ] 4.5.2 Create ClinicForm component
  - [ ] Input fields for clinic details
  - [ ] Address autocomplete integration
  - [ ] Map picker for coordinates
  - [ ] Clinic hours editor (per day)
  - [ ] Primary clinic checkbox

- [ ] 4.5.3 Create ClinicHoursEditor component
  - [ ] Day-by-day time pickers
  - [ ] "Closed" checkbox per day
  - [ ] Validation for open/close times
  - [ ] Copy hours to multiple days

- [ ] 4.5.4 Create AvailabilitySettings component
  - [ ] Toggle for telemedicine availability
  - [ ] Toggle for in-person availability
  - [ ] Toggle for emergency availability
  - [ ] Multi-select for insurance providers
  - [ ] "Accepts all insurance" checkbox

## Phase 5: Integration and Testing

### 5.1 API Integration
- [ ] 5.1.1 Create API client functions
  - [ ] fetchDoctorRepliesWithLocation()
  - [ ] createClinic()
  - [ ] updateClinic()
  - [ ] deleteClinic()
  - [ ] updateAvailability()
  - [ ] calculateDistance()

- [ ] 5.1.2 Add error handling in API client
  - [ ] Handle network errors
  - [ ] Handle validation errors
  - [ ] Handle authentication errors
  - [ ] Show user-friendly error messages

- [ ] 5.1.3 Implement request caching
  - [ ] Cache doctor replies for 1 minute
  - [ ] Cache clinic data for 5 minutes
  - [ ] Invalidate cache on updates
  - [ ] Use React Query or SWR

### 5.2 Unit Tests
- [ ] 5.2.1 Test LocationService
  - [ ] Test Haversine distance calculation accuracy
  - [ ] Test distance formatting
  - [ ] Test coordinate validation
  - [ ] Test edge cases (poles, date line)

- [ ] 5.2.2 Test AvailabilityService
  - [ ] Test clinic status calculation
  - [ ] Test with various timezones
  - [ ] Test exception date handling
  - [ ] Test next available slot calculation

- [ ] 5.2.3 Test PrivacyService
  - [ ] Test access control logic
  - [ ] Test data sanitization
  - [ ] Test role-based permissions
  - [ ] Test context-based access

- [ ] 5.2.4 Test FilterService
  - [ ] Test radius filtering
  - [ ] Test multiple filter combinations
  - [ ] Test sorting logic
  - [ ] Test edge cases (no results)

### 5.3 Integration Tests
- [ ] 5.3.1 Test doctor replies endpoint
  - [ ] Test without location (alphabetical sort)
  - [ ] Test with location (distance sort)
  - [ ] Test with filters applied
  - [ ] Test pagination
  - [ ] Test authentication

- [ ] 5.3.2 Test clinic management endpoints
  - [ ] Test clinic creation
  - [ ] Test clinic update
  - [ ] Test clinic deletion
  - [ ] Test authorization (only owner can modify)

- [ ] 5.3.3 Test availability endpoints
  - [ ] Test availability update
  - [ ] Test availability retrieval
  - [ ] Test cache invalidation

- [ ] 5.3.4 Test spatial queries
  - [ ] Test PostGIS distance calculations
  - [ ] Test radius filtering with spatial index
  - [ ] Test performance with large datasets
  - [ ] Test query optimization

### 5.4 Frontend Tests
- [ ] 5.4.1 Test GeolocationProvider
  - [ ] Test permission request
  - [ ] Test permission granted
  - [ ] Test permission denied
  - [ ] Test fallback to manual entry

- [ ] 5.4.2 Test filter components
  - [ ] Test filter state changes
  - [ ] Test filter combinations
  - [ ] Test filter reset
  - [ ] Test URL param updates

- [ ] 5.4.3 Test doctor reply components
  - [ ] Test rendering with location data
  - [ ] Test rendering without location
  - [ ] Test badge display logic
  - [ ] Test pagination/infinite scroll

- [ ] 5.4.4 Test clinic management components
  - [ ] Test clinic form validation
  - [ ] Test clinic creation flow
  - [ ] Test clinic editing flow
  - [ ] Test clinic deletion flow

### 5.5 End-to-End Tests
- [ ] 5.5.1 Test patient viewing doctor replies
  - [ ] Grant location permission
  - [ ] View replies sorted by distance
  - [ ] Apply filters
  - [ ] View doctor details

- [ ] 5.5.2 Test doctor managing clinics
  - [ ] Login as doctor
  - [ ] Add new clinic
  - [ ] Set clinic hours
  - [ ] Update availability settings

- [ ] 5.5.3 Test privacy controls
  - [ ] Verify precise location only shown to patients
  - [ ] Verify public profile shows city only
  - [ ] Test location sharing toggle

## Phase 6: Performance Optimization

### 6.1 Database Optimization
- [ ] 6.1.1 Verify spatial indexes are used
  - [ ] Run EXPLAIN ANALYZE on spatial queries
  - [ ] Ensure GIST indexes are utilized
  - [ ] Optimize query plans

- [ ] 6.1.2 Add database connection pooling
  - [ ] Configure pool size
  - [ ] Monitor connection usage
  - [ ] Handle connection errors

- [ ] 6.1.3 Implement query result caching
  - [ ] Cache frequently accessed clinic data
  - [ ] Cache doctor availability data
  - [ ] Set appropriate TTL values

- [ ] 6.1.4 Add database read replicas (if needed)
  - [ ] Configure read replica
  - [ ] Route read queries to replica
  - [ ] Handle replication lag

### 6.2 API Optimization
- [ ] 6.2.1 Implement response caching
  - [ ] Add Cache-Control headers
  - [ ] Use ETags for conditional requests
  - [ ] Cache static clinic information

- [ ] 6.2.2 Add request compression
  - [ ] Enable gzip compression
  - [ ] Compress JSON responses
  - [ ] Optimize payload size

- [ ] 6.2.3 Implement rate limiting
  - [ ] Add rate limiter middleware
  - [ ] Set appropriate limits per endpoint
  - [ ] Return rate limit headers

- [ ] 6.2.4 Optimize distance calculations
  - [ ] Batch calculate distances
  - [ ] Use cache aggressively
  - [ ] Consider pre-calculating common routes

### 6.3 Frontend Optimization
- [ ] 6.3.1 Implement lazy loading
  - [ ] Lazy load doctor reply cards
  - [ ] Load images on demand
  - [ ] Use intersection observer

- [ ] 6.3.2 Add request debouncing
  - [ ] Debounce filter changes (300ms)
  - [ ] Debounce search input
  - [ ] Prevent duplicate requests

- [ ] 6.3.3 Optimize bundle size
  - [ ] Code split by route
  - [ ] Tree shake unused code
  - [ ] Minimize dependencies

- [ ] 6.3.4 Add service worker caching
  - [ ] Cache static assets
  - [ ] Cache API responses
  - [ ] Implement offline fallback

## Phase 7: Security and Privacy

### 7.1 Security Hardening
- [ ] 7.1.1 Add input validation
  - [ ] Validate coordinates range
  - [ ] Validate radius values
  - [ ] Sanitize text inputs
  - [ ] Prevent SQL injection

- [ ] 7.1.2 Implement rate limiting
  - [ ] Limit location requests
  - [ ] Limit distance calculations
  - [ ] Limit clinic updates
  - [ ] Add exponential backoff

- [ ] 7.1.3 Add authentication checks
  - [ ] Verify JWT tokens
  - [ ] Check role permissions
  - [ ] Validate resource ownership
  - [ ] Add CSRF protection

- [ ] 7.1.4 Implement audit logging
  - [ ] Log location access
  - [ ] Log clinic modifications
  - [ ] Log availability changes
  - [ ] Monitor suspicious activity

### 7.2 Privacy Compliance
- [ ] 7.2.1 Add GDPR compliance features
  - [ ] Allow users to export location data
  - [ ] Allow users to delete location data
  - [ ] Add consent management
  - [ ] Document data retention policies

- [ ] 7.2.2 Implement data anonymization
  - [ ] Anonymize location data in logs
  - [ ] Remove PII from error messages
  - [ ] Sanitize data in analytics

- [ ] 7.2.3 Add privacy policy updates
  - [ ] Document location data usage
  - [ ] Explain data sharing practices
  - [ ] Add opt-out instructions
  - [ ] Update terms of service

## Phase 8: Documentation and Deployment

### 8.1 Documentation
- [ ] 8.1.1 Write API documentation
  - [ ] Document all endpoints
  - [ ] Add request/response examples
  - [ ] Document error codes
  - [ ] Add authentication requirements

- [ ] 8.1.2 Write developer guide
  - [ ] Explain architecture
  - [ ] Document database schema
  - [ ] Explain distance calculations
  - [ ] Add troubleshooting guide

- [ ] 8.1.3 Write user guide
  - [ ] Explain location permissions
  - [ ] Document filter usage
  - [ ] Explain availability indicators
  - [ ] Add FAQ section

- [ ] 8.1.4 Create admin guide
  - [ ] Document clinic management
  - [ ] Explain availability settings
  - [ ] Add best practices
  - [ ] Include screenshots

### 8.2 Deployment Preparation
- [ ] 8.2.1 Set up environment variables
  - [ ] Configure database connection
  - [ ] Set cache TTL values
  - [ ] Configure rate limits
  - [ ] Set API keys (if using external services)

- [ ] 8.2.2 Run database migrations
  - [ ] Test migrations on staging
  - [ ] Backup production database
  - [ ] Run migrations on production
  - [ ] Verify data integrity

- [ ] 8.2.3 Deploy backend services
  - [ ] Build production bundle
  - [ ] Deploy to servers
  - [ ] Verify health checks
  - [ ] Monitor error logs

- [ ] 8.2.4 Deploy frontend application
  - [ ] Build production bundle
  - [ ] Deploy to CDN/hosting
  - [ ] Verify all features work
  - [ ] Test on multiple devices

### 8.3 Monitoring and Maintenance
- [ ] 8.3.1 Set up monitoring
  - [ ] Monitor API response times
  - [ ] Track error rates
  - [ ] Monitor database performance
  - [ ] Set up alerts

- [ ] 8.3.2 Add analytics
  - [ ] Track feature usage
  - [ ] Monitor filter usage
  - [ ] Track location permission grants
  - [ ] Analyze user behavior

- [ ] 8.3.3 Create maintenance tasks
  - [ ] Schedule cache cleanup
  - [ ] Schedule expired distance cache cleanup
  - [ ] Monitor spatial index health
  - [ ] Regular security audits

## Phase 9: Post-Launch Enhancements (Optional)

### 9.1 Advanced Features
- [ ] 9.1.1 Add appointment booking integration
  - [ ] Integrate with calendar system
  - [ ] Allow direct booking from replies
  - [ ] Send confirmation emails
  - [ ] Add reminders

- [ ] 9.1.2 Add real-time availability updates
  - [ ] Implement WebSocket connection
  - [ ] Push availability changes
  - [ ] Update UI in real-time
  - [ ] Handle connection drops

- [ ] 9.1.3 Add route optimization
  - [ ] Suggest optimal doctor based on route
  - [ ] Consider traffic conditions
  - [ ] Integrate with mapping services
  - [ ] Show estimated travel time

- [ ] 9.1.4 Add multi-language support
  - [ ] Translate clinic addresses
  - [ ] Localize distance units
  - [ ] Support RTL languages
  - [ ] Add language selector

### 9.2 Analytics and Insights
- [ ] 9.2.1 Add doctor analytics dashboard
  - [ ] Show reply views by location
  - [ ] Track patient inquiries
  - [ ] Analyze peak hours
  - [ ] Generate reports

- [ ] 9.2.2 Add patient insights
  - [ ] Show nearby doctors
  - [ ] Suggest doctors based on history
  - [ ] Track search patterns
  - [ ] Personalize recommendations

## Summary

**Total Tasks**: 200+
**Estimated Timeline**: 8-12 weeks
**Team Size**: 3-5 developers (1 backend, 1 frontend, 1 full-stack, 1 QA, 1 DevOps)

**Critical Path**:
1. Database schema (Phase 1) - 1 week
2. Backend services (Phase 2) - 2 weeks
3. API endpoints (Phase 3) - 2 weeks
4. Frontend components (Phase 4) - 3 weeks
5. Testing (Phase 5) - 2 weeks
6. Optimization & Security (Phase 6-7) - 1 week
7. Documentation & Deployment (Phase 8) - 1 week

**Dependencies**:
- PostGIS extension for PostgreSQL
- Geolocation API (browser-based)
- Redis for caching (recommended)
- Existing authentication system
- Existing comment/reply system
