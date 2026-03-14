# Analytics Features - Where to Find Them

## Overview
This guide shows you where each of the 9 enhanced analytics features can be accessed in the MedThread platform.

---

## 1. Doctor Specialty Distribution (Pie Chart)
**Location**: Admin Panel → Analytics Dashboard

**How to Access**:
1. Login as an admin user
2. Navigate to `/admin/analytics`
3. View the "Doctor Specialty Distribution" chart in the top-left section

**What it shows**: Percentage breakdown of all doctors by their medical specialty

---

## 2. Community Activity Analysis
**Location**: Admin Panel → Analytics Dashboard

**How to Access**:
1. Login as an admin user
2. Navigate to `/admin/analytics`
3. View the "Community Activity Tiers" chart in the top-right section

**What it shows**: Communities categorized as Highly Active, Moderately Active, or Inactive

---

## 3. Real-Time Stats on Doctor Profiles
**Location**: Public Doctor Profile Pages

**How to Access**:
1. Visit any doctor's profile at `/u/{username}`
2. Scroll to the "Doctor Analytics Stats" section below the profile header

**What it shows**:
- Total posts made
- Total comments made
- Conversion count
- Cured patient count
- Clinic visit conversions
- Post-clinic cure count
- Portfolio score

**Updates**: Real-time without page refresh

---

## 4. Conversion Count Tracking
**Location**: Multiple places

**Where to see it**:
1. **Doctor Public Profile** (`/u/{username}`) - In the analytics stats section
2. **Admin Analytics Dashboard** (`/admin/analytics`) - In the top doctors list
3. **Admin Doctor Portfolio Deep-Dive** - Click "View Details" on any doctor

**What it tracks**: Comment click → Profile visit → Message button click

---

## 5. Post-Consultation Patient Feedback Loop
**Location**: Automated notifications (not a visible page)

**How it works**:
1. Patient completes a consultation with a doctor
2. System sends automated notification every 2 days
3. Patient receives popup/notification with 3 options:
   - ✅ Cured
   - 🔄 Not Yet (reschedules notification)
   - 🔀 Consult New Doctor

**Results visible in**:
- Doctor public profile stats
- Admin analytics dashboard
- Doctor portfolio deep-dive

---

## 6. Admin Doctor Portfolio Deep-Dive
**Location**: Admin Panel → Analytics Dashboard

**How to Access**:
1. Login as an admin user
2. Navigate to `/admin/analytics`
3. Scroll to "Top Performing Doctors" section
4. Click "View Details" button on any doctor

**What it shows**:
- Portfolio score
- Patients cured count
- Conversion count
- Clinic visit conversions
- Patient satisfaction breakdown (Cured / In Progress / Switched)
- Satisfaction rate percentage
- Top converting comments with conversion counts

---

## 7. Clinic Visit & Post-Clinic Cure Tracking
**Location**: Multiple places

**Where to see it**:
1. **Doctor Public Profile** (`/u/{username}`) - In the analytics stats section
   - "Clinic Visit Conversions" metric
   - "Post-Clinic Cure Count" metric

2. **Admin Analytics Dashboard** (`/admin/analytics`)
   - In the top doctors list
   - In the doctor portfolio deep-dive modal

**What it tracks**:
- Clinic Conversion Count: "Book Appointment" button clicks
- Post-Clinic Cure Count: Patients who selected "Cured" after clinic visit

---

## 8. Top Doctors Component (Regional & Global)
**Location**: Home Page Right Sidebar

**How to Access**:
1. Visit the home page (`/`)
2. Look at the right sidebar
3. Find the "Top Doctors" widget

**Features**:
- Toggle between "Regional" and "Global" views
- Regional: Filtered by patient's pincode
- Global: All doctors across all regions
- Ranked by cured patient count

**Displays**:
- Doctor name and specialty
- Cured patient count
- Conversion count
- Trust signals

---

## 9. Top Community Doctors
**Location**: Individual Community Pages

**How to Access**:
1. Visit any community page at `/m/{community}`
   - Example: `/m/cardiology`, `/m/dermatology`
2. Look at the right sidebar
3. Find the "Top Community Doctors" widget

**Features**:
- Auto-filtered by community specialty
- Shows only doctors matching the community's medical domain
- Ranked by cured patient count

**Example**:
- `/m/cardiology` → Shows only Cardiologists
- `/m/dermatology` → Shows only Dermatologists

---

## Quick Access Summary

### For Admins
- **Main Analytics Dashboard**: `/admin/analytics`
  - Doctor specialty distribution
  - Community activity tiers
  - Top performing doctors
  - Doctor portfolio deep-dive

### For Patients
- **Home Page** (`/`): Top doctors widget (regional/global toggle)
- **Community Pages** (`/m/{community}`): Top community doctors widget
- **Doctor Profiles** (`/u/{username}`): Real-time doctor stats

### For Doctors
- **Own Profile**: View your own analytics stats
- **Other Doctor Profiles**: Compare with peers

---

## API Endpoints Reference

All analytics data is available via REST API:

```
GET  /api/enhanced-analytics/doctor-specialty-distribution
GET  /api/enhanced-analytics/community-activity-tiers
GET  /api/enhanced-analytics/doctor-stats/:doctorId
POST /api/enhanced-analytics/track-conversion
POST /api/enhanced-analytics/patient-feedback
GET  /api/enhanced-analytics/doctor-portfolio/:doctorId
POST /api/enhanced-analytics/track-clinic-visit
GET  /api/enhanced-analytics/top-doctors
GET  /api/enhanced-analytics/top-community-doctors/:communityId
```

---

## Navigation Paths

### Admin Panel Navigation
```
Admin Panel (Sidebar)
├── Dashboard
├── Users
├── Posts
├── Comments
├── Reports
├── Analytics ← Click here for analytics dashboard
└── Audit Logs
```

### User Navigation
```
Home Page (/)
├── Right Sidebar
│   └── Top Doctors Widget (Regional/Global toggle)
│
Community Page (/m/{community})
├── Right Sidebar
│   └── Top Community Doctors Widget
│
Doctor Profile (/u/{username})
└── Doctor Analytics Stats Section
```

---

## Testing the Features

### Test as Admin
1. Login with admin credentials
2. Go to `/admin/analytics`
3. Verify all charts and data are loading
4. Click "View Details" on a doctor to see portfolio deep-dive

### Test as Patient
1. Login as a patient
2. Visit home page and check "Top Doctors" widget
3. Visit a community page (e.g., `/m/cardiology`)
4. Check "Top Community Doctors" widget
5. Visit a doctor profile and view their stats

### Test as Doctor
1. Login as a doctor
2. Visit your own profile at `/u/{your-username}`
3. View your analytics stats
4. Compare with other doctors' profiles

---

## Troubleshooting

### Analytics not showing?
- Ensure you're logged in
- Check that the API server is running on port 3001
- Verify database has been migrated with `npx prisma db push`
- Check browser console for errors

### No data in charts?
- Analytics require actual user activity to populate
- Use the seed script to generate test data
- Check that cron jobs are running for automated calculations

### Can't access admin analytics?
- Ensure your user role is set to "ADMIN" in the database
- Check localStorage for auth_token
- Verify admin middleware is working

---

**Last Updated**: March 14, 2026
**Status**: All features implemented and accessible ✅
