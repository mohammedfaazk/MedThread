# Complete Appointment Booking System Implementation

## Overview
Implemented a full-featured appointment booking system that allows patients to book appointments with verified doctors, doctors to approve/reject requests, and enables chat functionality after approval.

## Features Implemented

### 1. Patient Dashboard (`apps/web/src/app/dashboard/patient/page.tsx`)
- ✅ Fixed authentication using `useJWTAuth` instead of old `useUser`
- ✅ Displays upcoming appointments with status badges
- ✅ Shows appointment details (doctor, time, date, reason)
- ✅ Added "Book Appointment" button to navigate to booking page
- ✅ Chat button for approved appointments
- ✅ Proper API URL configuration

### 2. Doctor Dashboard (`apps/web/src/app/dashboard/doctor/page.tsx`)
- ✅ Fixed authentication using `useJWTAuth`
- ✅ Shows pending appointment requests in left column
- ✅ Approve/Reject buttons for each pending appointment
- ✅ Schedule availability management (middle column)
- ✅ Recent chats with patients (right column)
- ✅ Stats badges showing total appointments, pending count, messages
- ✅ Verification status banner for pending doctors
- ✅ Proper API URL configuration

### 3. Appointment Booking Page (`apps/web/src/app/appointments/page.tsx`) - NEW
- ✅ Lists all verified/approved doctors
- ✅ Search functionality by name or specialty
- ✅ Filter by specialty dropdown
- ✅ Doctor cards showing:
  - Name, specialty, sub-specialty
  - Years of experience
  - Hospital affiliation
  - Karma/rating
  - Verified badge
- ✅ Click doctor to view available time slots
- ✅ Booking panel on right side showing:
  - Selected doctor info
  - Available time slots (with default slots if none set)
  - Reason for visit textarea
  - Request appointment button
- ✅ Sends appointment request to doctor for approval

### 4. Backend API (`apps/api/src/routes/appointments.ts`)
- ✅ GET `/api/v1/appointments/doctors/:doctorId/availability` - Get doctor's available slots
- ✅ POST `/api/v1/appointments/availability` - Doctor sets availability
- ✅ POST `/api/v1/appointments/book` - Patient books appointment
- ✅ PUT `/api/v1/appointments/appointments/:id` - Doctor approves/rejects
- ✅ GET `/api/v1/appointments/appointments` - Get user's appointments
- ✅ Default time slots generation (weekdays 4pm-8pm, weekends 10am-7pm)
- ✅ Creates conversation when appointment is approved

## User Flow

### Patient Flow:
1. Patient logs in and goes to dashboard
2. Clicks "Book Appointment" button
3. Sees list of all verified doctors
4. Can search/filter doctors by specialty
5. Clicks on a doctor to see available time slots
6. Selects a time slot
7. Optionally adds reason for visit
8. Clicks "Request Appointment"
9. Request is sent to doctor (status: PENDING)
10. Patient sees appointment in dashboard with PENDING status
11. After doctor approves, status changes to APPROVED
12. Patient can now chat with doctor via consultation tab

### Doctor Flow:
1. Doctor logs in and goes to dashboard
2. Sees pending appointment requests in left column
3. Reviews patient info, time, and reason
4. Clicks "Approve" or "Reject"
5. If approved:
   - Appointment status changes to APPROVED
   - Conversation is automatically created
   - Doctor can chat with patient
6. Doctor can set availability in middle column:
   - Select day of week
   - Set start and end time
   - Click "Add Availability Slot"
7. Doctor sees recent chats in right column

## Default Availability
If a doctor hasn't set custom availability, the system provides default slots:
- **Weekdays (Mon-Fri)**: 4:00 PM - 8:00 PM (1-hour slots)
- **Weekends (Sat-Sun)**: 10:00 AM - 7:00 PM (1-hour slots)
- Generated for next 7 days

## Chat Integration
- When doctor approves appointment, a conversation is automatically created
- Both patient and doctor can access chat via:
  - Patient: Dashboard → Consultations button or chat icon on appointment
  - Doctor: Dashboard → Recent Chats or click on conversation
- Chat uses existing Socket.IO implementation

## Authentication
All components now use `useJWTAuth` from `JWTAuthContext.tsx`:
- Reads user data from localStorage
- No Supabase interference
- Proper role checking (PATIENT, DOCTOR, VERIFIED_DOCTOR, ADMIN)
- Doctor verification status checking

## API Configuration
- API URL: `http://localhost:3001` (configured in `.env`)
- All API calls use `NEXT_PUBLIC_API_URL` environment variable
- Fallback to localhost if not set

## Database Schema
Uses existing Prisma schema with:
- `Appointment` model with status (PENDING, APPROVED, REJECTED, COMPLETED, CANCELLED)
- `Availability` model for doctor time slots
- `Conversation` model linked to appointments
- `User` model with doctor verification status

## Files Modified/Created

### Created:
- `apps/web/src/app/appointments/page.tsx` - New booking page

### Modified:
- `apps/web/src/app/dashboard/patient/page.tsx` - Fixed auth, added booking button
- `apps/web/src/app/dashboard/doctor/page.tsx` - Fixed auth, added approve/reject buttons
- Both dashboards now use proper API URLs

## Testing Checklist

### Patient Side:
- [ ] Login as patient
- [ ] Dashboard loads correctly
- [ ] Click "Book Appointment"
- [ ] See list of verified doctors
- [ ] Search/filter works
- [ ] Click doctor to see slots
- [ ] Select slot and book
- [ ] See appointment in dashboard with PENDING status
- [ ] After doctor approves, status changes to APPROVED
- [ ] Can chat with doctor

### Doctor Side:
- [ ] Login as verified doctor
- [ ] Dashboard loads correctly
- [ ] See pending appointments
- [ ] Approve appointment
- [ ] See conversation created
- [ ] Can chat with patient
- [ ] Set availability slots
- [ ] Slots appear in booking page

### Admin Side:
- [ ] Login as admin
- [ ] Approve doctor verification
- [ ] Doctor appears in booking page

## Next Steps (Optional Enhancements)
1. Add appointment cancellation
2. Add appointment rescheduling
3. Add email/SMS notifications
4. Add appointment reminders
5. Add video call integration
6. Add prescription management
7. Add medical records upload
8. Add payment integration

## Environment Variables Required
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-key>
DATABASE_URL=<your-database-url>
```

## Running the Application
```bash
# Terminal 1: Start API server
cd apps/api
npm run dev

# Terminal 2: Start web app
cd apps/web
npm run dev
```

## Troubleshooting

### Patient dashboard loading forever:
- Check if user is logged in (localStorage has auth_token and user)
- Check if API server is running
- Check browser console for errors

### Doctors not showing in booking page:
- Ensure doctors are approved by admin
- Check API endpoint: GET /api/v1/doctor-verification/verified
- Check browser network tab

### Appointments not appearing:
- Check API endpoint: GET /api/v1/appointments/appointments
- Verify userId and role parameters
- Check database for appointment records

### Chat not working after approval:
- Verify conversation was created (check database)
- Check Socket.IO connection
- Verify both users have access to conversation

## Success Criteria
✅ Patient can view all verified doctors
✅ Patient can see doctor's available time slots
✅ Patient can book appointment with reason
✅ Doctor receives appointment request
✅ Doctor can approve/reject appointments
✅ After approval, both can chat via Socket.IO
✅ Doctor can set custom availability
✅ Default slots provided if no custom availability
✅ All features work end-to-end
