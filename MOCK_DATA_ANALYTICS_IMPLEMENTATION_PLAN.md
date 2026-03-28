# Mock Data & Analytics Implementation Plan

## Overview
This document outlines the implementation of comprehensive mock data population and advanced analytics features for MedThread.

## Implementation Status: IN PROGRESS

### Part 1: Mock Data Population ✅ STARTED

#### 1.1 Doctors (15 verified doctors) - IN PROGRESS
- ✅ Data structure defined
- 🔄 Seed script in progress
- Doctors list:
  1. Arjun Mehta – Cardiologist, Mumbai
  2. Priya Nair – Dermatologist, Chennai
  3. Rohan Sharma – Neurologist, Delhi
  4. Sneha Patel – Pediatrician, Ahmedabad
  5. Vikram Rao – Orthopedic Surgeon, Bangalore
  6. Deepa Krishnamurthy – Gynecologist, Hyderabad
  7. Aditya Joshi – Psychiatrist, Pune
  8. Meera Iyer – Endocrinologist, Chennai
  9. Karan Malhotra – Pulmonologist, Delhi
  10. Ananya Reddy – Ophthalmologist, Bangalore
  11. Suresh Nambiar – Gastroenterologist, Kochi
  12. Lakshmi Venkatesh – Rheumatologist, Chennai
  13. Nikhil Gupta – Oncologist, Mumbai
  14. Divya Srinivasan – Nephrologist, Hyderabad
  15. Rahul Bose – General Physician, Kolkata

#### 1.2 Patients (30 patients) - PLANNED
All patients with complete profiles across major Indian cities

#### 1.3 Communities (8 communities) - PLANNED
1. Heart Health Hub – Cardiology
2. Skin & Soul – Dermatology
3. MindMatters – Mental health
4. BabySteps – Pediatrics
5. BoneStrong – Orthopedics
6. SugarWatch – Diabetes
7. LungLife – Pulmonology
8. WomensWellness – Gynecology

#### 1.4 Posts (120+ posts) - PLANNED
- Minimum 15 posts per community
- 4-8 comments per post with nested replies
- Priority tags (HIGH/MEDIUM/LOW)
- Spread over last 6 months

#### 1.5 Chat Conversations (20 conversations) - PLANNED
- 12-25 messages per conversation
- Realistic clinical dialogues
- Timestamps spread over 2-4 weeks

### Part 2: Analytics - 5 Chart Type Toggle 📋 PLANNED

**Chart Types:**
1. Bar Chart
2. Line Chart
3. Pie Chart
4. Doughnut Chart
5. Radar Chart

**Features:**
- Chart type selector toolbar
- Smooth transition animations
- localStorage persistence
- Responsive design

### Part 3: Admin Dashboard Graphs (12 cards) 📋 PLANNED

1. Active Users (Real-time / Daily)
2. Offline Users
3. User Activity by Time of Day
4. Feature Usage by Patients
5. Patient Treatment Outcomes
6. Doctor Activity by Forum/Community
7. Dead Forums (Low Engagement)
8. New User Registrations Over Time
9. Post Priority Distribution
10. Appointment Conversion Rate
11. Report & Moderation Activity
12. Revenue Overview

### Part 4: Doctor Public Profile - Horizontal Scrollable Graphs 📋 PLANNED

**7 Graph Cards:**
1. Treatment Outcomes
2. Total Posts Over Time
3. Total Comments Over Time
4. Conversion Rate
5. Patients Cured Monthly
6. Clinic Visits
7. Portfolio Score History

**Features:**
- Horizontal scroll container
- Arrow navigation
- Snap scrolling
- Dot pagination
- KPI badges

### Part 5: Production-Readiness Requirements 📋 PLANNED

- ✅ Idempotent seed script
- ✅ Realistic timestamps
- ✅ Consistent relationships
- ✅ Chart library: Recharts (already integrated)
- ✅ Responsive design
- ✅ Loading states
- ✅ Empty states
- ✅ Accessibility (ARIA labels, colorblind-safe palette)
- ✅ Performance optimization
- ✅ Error handling

## File Structure

```
apps/api/src/scripts/
├── seed-comprehensive-mock-data.ts (main seed script)
└── seed-data/
    ├── doctors.ts (15 doctor profiles)
    ├── patients.ts (30 patient profiles)
    ├── communities.ts (8 communities)
    ├── posts.ts (120+ posts generator)
    └── conversations.ts (20 conversations generator)

apps/web/src/components/
├── analytics/
│   ├── ChartTypeToggle.tsx (5-type chart selector)
│   ├── AdminDashboardCharts.tsx (12 admin charts)
│   └── DoctorProfileCharts.tsx (7 doctor charts)
└── charts/
    ├── MultiTypeChart.tsx (universal chart component)
    └── ChartSkeleton.tsx (loading state)
```

## Next Steps

1. ✅ Create seed script structure
2. 🔄 Complete doctor data (13 remaining)
3. ⏳ Create patient data (30 profiles)
4. ⏳ Create community data with members
5. ⏳ Generate posts with comments
6. ⏳ Generate chat conversations
7. ⏳ Build chart components
8. ⏳ Implement admin dashboard
9. ⏳ Implement doctor profile charts
10. ⏳ Test and optimize

## Estimated Timeline

- Mock Data Seed Script: 4-6 hours
- Chart Components: 3-4 hours
- Admin Dashboard: 4-5 hours
- Doctor Profile: 2-3 hours
- Testing & Polish: 2-3 hours

**Total: 15-21 hours of development**

## Notes

- Using Recharts (already in package.json)
- Colorblind-safe palette: ["#2563EB","#16A34A","#DC2626","#D97706","#7C3AED"]
- All data marked with identifiable patterns for easy cleanup
- Timestamps use weighted random distribution (more recent = higher frequency)
