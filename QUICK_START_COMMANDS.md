# Quick Start Commands

## 🚀 Get Started in 3 Steps

### Step 1: Seed the Database (1 minute)
```bash
cd MedThread
tsx apps/api/src/scripts/comprehensive-seed.ts
```

### Step 2: Start the Servers (2 terminals)
```bash
# Terminal 1: API Server
cd apps/api
npm run dev

# Terminal 2: Web Server (in a new terminal)
cd apps/web
npm run dev
```

### Step 3: Access the Application
- **Web App:** http://localhost:3000
- **API:** http://localhost:5000
- **Admin Analytics:** http://localhost:3000/admin/analytics

## 🔑 Login Credentials

### Mock Doctors
```
Email: arjun_mehta@medthread-mock.com
Password: Doctor@123

All 15 doctors:
- arjun_mehta@medthread-mock.com (Cardiologist, Mumbai)
- priya_nair@medthread-mock.com (Dermatologist, Chennai)
- rohan_sharma@medthread-mock.com (Neurologist, Delhi)
- sneha_patel@medthread-mock.com (Pediatrician, Ahmedabad)
- vikram_rao@medthread-mock.com (Orthopedic Surgeon, Bangalore)
- deepa_krishnamurthy@medthread-mock.com (Gynecologist, Hyderabad)
- aditya_joshi@medthread-mock.com (Psychiatrist, Pune)
- meera_iyer@medthread-mock.com (Endocrinologist, Chennai)
- karan_malhotra@medthread-mock.com (Pulmonologist, Delhi)
- ananya_reddy@medthread-mock.com (Ophthalmologist, Bangalore)
- suresh_nambiar@medthread-mock.com (Gastroenterologist, Kochi)
- lakshmi_venkatesh@medthread-mock.com (Rheumatologist, Chennai)
- nikhil_gupta@medthread-mock.com (Oncologist, Mumbai)
- divya_srinivasan@medthread-mock.com (Nephrologist, Hyderabad)
- rahul_bose@medthread-mock.com (General Physician, Kolkata)
```

### Mock Patients
```
Email: amit_sharma@medthread-mock.com
Password: Patient@123

All 30 patients available with format:
{firstname}_{lastname}@medthread-mock.com
```

## 📊 Test the Features

### 1. Admin Analytics Dashboard
```
URL: http://localhost:3000/admin/analytics
Login: Use admin credentials
Features:
- 12 interactive charts
- Period selector (Today / 7 Days / 30 Days)
- Chart type switching (Bar, Line, Pie, Doughnut, Radar)
- Responsive design
```

### 2. Doctor Profile Charts
```
URL: http://localhost:3000/u/arjun_mehta
Features:
- 7 performance charts
- Horizontal scrolling
- Arrow navigation
- Dot pagination
- Chart type switching
```

### 3. Test API Endpoints
```bash
# Active Users
curl http://localhost:5000/api/admin-analytics/active-users?period=today

# User Activity by Time
curl http://localhost:5000/api/admin-analytics/user-activity-time?days=7

# Treatment Outcomes
curl http://localhost:5000/api/admin-analytics/treatment-outcomes

# Doctor Treatment Outcomes (replace {doctorId} with actual ID)
curl http://localhost:5000/api/doctor-public-analytics/{doctorId}/treatment-outcomes
```

## 🧹 Cleanup (Optional)

To remove all mock data:
```bash
tsx apps/api/src/scripts/cleanup-mock-data.ts
```

## 🔧 Troubleshooting

### Issue: Port already in use
```bash
# Kill process on port 5000 (API)
npx kill-port 5000

# Kill process on port 3000 (Web)
npx kill-port 3000
```

### Issue: Database connection error
```bash
# Check if PostgreSQL is running
# Verify DATABASE_URL in .env file
# Run Prisma generate
npx prisma generate
```

### Issue: Module not found
```bash
# Install dependencies
npm install

# Or in specific workspace
cd apps/api && npm install
cd apps/web && npm install
```

## 📈 What to Expect

### After Seeding:
- ✅ 15 verified doctors
- ✅ 30 patients
- ✅ 8 communities with 20+ members each
- ✅ 120+ posts with realistic content
- ✅ 20 doctor-patient conversations
- ✅ Patient feedback and outcomes
- ✅ All data timestamped realistically

### Admin Dashboard:
- ✅ 12 charts showing various metrics
- ✅ Real-time data from mock users
- ✅ Interactive chart type switching
- ✅ Period filtering
- ✅ Responsive design

### Doctor Profiles:
- ✅ 7 performance charts per doctor
- ✅ Treatment outcomes
- ✅ Activity metrics
- ✅ Conversion rates
- ✅ Portfolio scores

## 🎯 Quick Tests

### Test 1: Verify Seed Data
```bash
# Check if doctors exist
# Login to any doctor account
# Navigate to profile
# Should see complete profile with data
```

### Test 2: Test Admin Dashboard
```bash
# Login as admin
# Navigate to /admin/analytics
# All 12 charts should load
# Try switching chart types
# Try changing time periods
```

### Test 3: Test Doctor Profile
```bash
# Navigate to /u/arjun_mehta
# Should see 7 performance charts
# Try horizontal scrolling
# Try arrow navigation
# Try switching chart types
```

## 📚 Documentation

- `IMPLEMENTATION_FULLY_COMPLETE.md` - Complete implementation details
- `MOCK_DATA_ANALYTICS_README.md` - Comprehensive README
- `FINAL_INTEGRATION_GUIDE.md` - Integration guide
- `QUICK_START_COMMANDS.md` - This file

## ✅ Success Checklist

- [ ] Seed script completed successfully
- [ ] API server running on port 5000
- [ ] Web server running on port 3000
- [ ] Can login with mock credentials
- [ ] Admin dashboard loads all charts
- [ ] Doctor profile shows performance charts
- [ ] Chart type switching works
- [ ] Horizontal scrolling works
- [ ] Mobile responsive design works

## 🎉 You're All Set!

Everything is ready to use. Enjoy exploring the comprehensive mock data and analytics system!

---

**Need Help?** Check the documentation files or review the implementation summary.
