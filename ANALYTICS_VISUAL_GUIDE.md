# Analytics Features - Visual Guide

## Overview
The enhanced analytics system has been successfully implemented with 9 major features tracking doctor performance, patient outcomes, and community engagement.

## Where to Find Analytics

### 1. Admin Analytics Dashboard
**Location**: `/admin/analytics`
**Access**: Admin users only
**Features**:
- Doctor Specialty Distribution (Pie Chart)
- Community Activity Insights (Tier-based view)
- Top Performing Doctors (Ranked list with portfolio scores)
- Doctor Portfolio Deep-Dive (Modal with detailed stats)

**What You'll See**:
- Top 10 doctors ranked by portfolio score
- Patient cure rates and satisfaction metrics
- Conversion tracking (comment → appointment)
- Clinic visit conversions
- Post-clinic cure tracking
- Specialty distribution across all doctors
- Community activity tiers (Highly Active, Moderately Active, Inactive)

### 2. Doctor Profile Pages
**Location**: `/u/{username}` (for doctor accounts)
**Access**: Public
**Component**: `DoctorPublicStats`
**Features**:
- Portfolio score display
- Patient satisfaction metrics (Cured, In Progress, Switched Doctor)
- Total conversions from comments
- Clinic visit conversions
- Post-clinic cure count
- Satisfaction rate percentage

### 3. Community Pages
**Location**: `/m/{community}` (e.g., `/m/cardiology`)
**Access**: Public
**Component**: `TopDoctorsWidget` in RightSidebar
**Features**:
- Top 5 doctors in that specific specialty
- Portfolio scores
- Quick stats (cured count, conversions)
- Links to doctor profiles

### 4. Right Sidebar (Global)
**Location**: All pages with RightSidebar
**Access**: Public
**Component**: `TopDoctorsWidget`
**Features**:
- Top 5 doctors globally (all specialties)
- Portfolio scores and key metrics
- Quick access to doctor profiles

## Analytics Tracking Points

### Automatic Tracking
The system automatically tracks:
1. **Comment Conversions**: When patients book appointments after reading doctor comments
2. **Patient Feedback**: Post-appointment satisfaction surveys
3. **Clinic Visits**: When online consultations lead to in-person visits
4. **Post-Clinic Outcomes**: Patient status after clinic visits
5. **Community Activity**: Daily calculations of post/comment activity per community

### Manual Tracking Required
Some features require integration into existing components:
- Patient feedback modal after appointments (component created, needs integration)
- Comment conversion tracking in appointment booking flow
- Profile view tracking in doctor profile pages

## API Endpoints

All endpoints are prefixed with `/api/enhanced-analytics/`:

1. `GET /top-doctors` - Get top performing doctors (global or by specialty)
2. `GET /doctor-portfolio/:doctorId` - Get detailed doctor portfolio
3. `GET /doctor-specialty-distribution` - Get specialty distribution data
4. `GET /community-activity` - Get community activity tiers
5. `GET /comment-conversions/:doctorId` - Get comment conversion data
6. `POST /track-conversion` - Track a new comment conversion
7. `POST /submit-feedback` - Submit patient feedback
8. `GET /patient-feedback/:doctorId` - Get doctor's feedback summary
9. `POST /track-clinic-visit` - Track clinic visit conversion

## Database Models

### New Models Created:
1. **CommentConversion** - Tracks when comments lead to appointments
2. **PatientFeedback** - Stores post-appointment satisfaction data
3. **CommunityActivity** - Stores calculated community engagement metrics

### Enhanced Models:
1. **DoctorPerformance** - Added 9 new fields for comprehensive tracking

## Cron Jobs

Two automated jobs run daily:
1. **Feedback Notifications** (9:00 AM) - Sends feedback requests to patients
2. **Community Activity Calculation** (2:00 AM) - Updates activity tiers

## Testing the Features

### To Test Admin Dashboard:
1. Navigate to `http://localhost:3000/admin/analytics`
2. You should see:
   - Two charts (Specialty Distribution, Community Activity)
   - List of top doctors with detailed stats
   - Click "View Details" to see doctor portfolio modal

### To Test Doctor Profiles:
1. Navigate to any doctor's profile: `http://localhost:3000/u/{doctor-username}`
2. Look for the "Public Stats" section showing portfolio metrics

### To Test Community Pages:
1. Navigate to a community: `http://localhost:3000/m/cardiology`
2. Check the right sidebar for "Top Doctors in Cardiology"

### To Test Right Sidebar:
1. Navigate to any page with the sidebar
2. Look for "Top Doctors" widget showing global top performers

## Current Status

✅ **Completed**:
- Database schema with all models
- Backend services for all 9 features
- API routes with authentication
- Frontend components for analytics display
- Admin analytics dashboard
- Doctor profile stats
- Community-specific top doctors
- Global top doctors widget
- Cron jobs for automation
- Import errors fixed
- Recharts library installed
- Servers running successfully

⚠️ **Pending Integration**:
- Patient feedback modal integration into appointment flow
- Comment conversion tracking in booking process
- Analytics event tracking in existing components

## Next Steps

1. **Test the Analytics Dashboard**: Visit `/admin/analytics` to see all features
2. **Verify Data Display**: Check if charts and stats render correctly
3. **Add Sample Data**: Use the seed script if needed for testing
4. **Integrate Tracking**: Add tracking calls to appointment and comment components
5. **Test Cron Jobs**: Verify automated calculations are working

## Files Reference

### Frontend Components:
- `apps/web/src/app/admin/analytics/page.tsx` - Main dashboard
- `apps/web/src/components/analytics/DoctorSpecialtyChart.tsx` - Pie chart
- `apps/web/src/components/analytics/CommunityActivityInsights.tsx` - Activity tiers
- `apps/web/src/components/analytics/DoctorPublicStats.tsx` - Profile stats
- `apps/web/src/components/TopDoctorsWidget.tsx` - Sidebar widget
- `apps/web/src/components/PatientFeedbackModal.tsx` - Feedback form

### Backend Services:
- `apps/api/src/services/enhanced-analytics.service.ts` - Main service
- `apps/api/src/services/feedback-notification.service.ts` - Notifications
- `apps/api/src/routes/enhanced-analytics.ts` - API routes
- `apps/api/src/services/cron-jobs.service.ts` - Automated jobs

### Database:
- `packages/database/prisma/schema.prisma` - Schema definitions
- `packages/database/prisma/seed-analytics.ts` - Sample data seeder

## Support

For issues or questions:
1. Check server logs for errors
2. Verify database migrations are applied
3. Ensure authentication tokens are valid
4. Check API endpoint responses in browser DevTools
