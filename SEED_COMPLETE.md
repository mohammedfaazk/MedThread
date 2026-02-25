# Database Seeding Complete ✅

## Summary

Successfully seeded the database with test data for development and testing.

---

## 📊 Seeded Data

| Table | Rows | Description |
|-------|------|-------------|
| **User** | 21 | 1 admin, 5 doctors, 5 patients, 10 existing |
| **Community** | 5 | Medical specialties |
| **Post** | 3 | Sample posts |
| **Award** | 5 | Gold, Silver, Bronze, Helpful, Expert |
| **MedicalThread** | 3 | Patient medical questions |
| **CronJobSchedule** | 16 | Cron job configurations |

**Total Records:** 53 rows across all tables

---

## 🔑 Login Credentials

### Admin Account
```
Email: admin@medthread.com
Password: admin123
Role: ADMIN
```

### Doctor Accounts
```
Email: dr.smith@medthread.com
Password: doctor123
Specialty: Cardiology
Location: New York

Email: dr.johnson@medthread.com
Password: doctor123
Specialty: Pediatrics
Location: Los Angeles

Email: dr.williams@medthread.com
Password: doctor123
Specialty: Dermatology
Location: Chicago

Email: dr.brown@medthread.com
Password: doctor123
Specialty: Orthopedics
Location: Houston

Email: dr.davis@medthread.com
Password: doctor123
Specialty: Neurology
Location: Phoenix
```

### Patient Accounts
```
Email: john.doe@example.com
Password: patient123

Email: jane.smith@example.com
Password: patient123

Email: bob.wilson@example.com
Password: patient123

Email: alice.brown@example.com
Password: patient123

Email: charlie.davis@example.com
Password: patient123
```

---

## 🏥 Communities Created

1. **Cardiology** - Heart health and cardiovascular discussions
2. **Pediatrics** - Child health and development
3. **Dermatology** - Skin care and conditions
4. **General Health** - General health discussions
5. **Mental Health** - Mental wellness and support

---

## 🏆 Awards Available

1. **Gold** 🥇 - 500 coins, Tier 3
2. **Silver** 🥈 - 100 coins, Tier 2
3. **Bronze** 🥉 - 50 coins, Tier 1
4. **Helpful** 👍 - 25 coins, Tier 1
5. **Expert** 🎓 - 200 coins, Tier 2

---

## 📝 Sample Data

### Posts
- 3 sample posts created across different communities
- Ready for testing comments, votes, and interactions

### Medical Threads
- 3 medical consultation threads
- Ready for doctor replies and patient interactions

---

## 🔄 Re-running Seeds

### Core Tables Only (Safe)
```bash
cd apps/api
npx ts-node seed-core-only.ts
```

This script uses `upsert` so it's safe to run multiple times. It will:
- Skip existing users
- Skip existing communities
- Skip existing awards
- Create new posts and threads each time

### Full Feature Seed (Requires Feature Tables)
```bash
cd apps/api
npx ts-node seed-features-safe.ts
```

Note: This requires feature tables to exist (DoctorClinic, DoctorRating, etc.)

---

## 🧪 Testing the Seeded Data

### 1. Login as Admin
```bash
POST http://localhost:3001/api/auth/login
{
  "email": "admin@medthread.com",
  "password": "admin123"
}
```

### 2. Login as Doctor
```bash
POST http://localhost:3001/api/auth/login
{
  "email": "dr.smith@medthread.com",
  "password": "doctor123"
}
```

### 3. Login as Patient
```bash
POST http://localhost:3001/api/auth/login
{
  "email": "john.doe@example.com",
  "password": "patient123"
}
```

### 4. Get Communities
```bash
GET http://localhost:3001/api/v1/communities
```

### 5. Get Posts
```bash
GET http://localhost:3001/api/v1/posts
```

### 6. Get Medical Threads
```bash
GET http://localhost:3001/api/threads
```

---

## 📈 Next Steps

### Add More Data
1. **Comments** - Add comments to posts
2. **Replies** - Add doctor replies to medical threads
3. **Appointments** - Create appointments between patients and doctors
4. **Votes** - Add upvotes/downvotes to posts and comments
5. **Follows** - Create follow relationships
6. **Messages** - Add direct messages between users

### Test Features
1. **Authentication** - Test login/logout
2. **Posts** - Create, edit, delete posts
3. **Comments** - Add comments to posts
4. **Medical Threads** - Create threads and get doctor replies
5. **Appointments** - Book appointments with doctors
6. **Admin Panel** - Access admin dashboard
7. **Cron Jobs** - Trigger cron jobs manually

---

## 🔍 Verify Seeded Data

### Check User Count
```sql
SELECT role, COUNT(*) as count 
FROM "User" 
GROUP BY role;
```

Expected:
- ADMIN: 1
- DOCTOR: 5
- PATIENT: 5

### Check Communities
```sql
SELECT name, "displayName", "memberCount" 
FROM "Community";
```

### Check Posts
```sql
SELECT p.title, u.username, c.name as community
FROM "Post" p
JOIN "User" u ON p."authorId" = u.id
JOIN "Community" c ON p."communityId" = c.id;
```

### Check Medical Threads
```sql
SELECT mt.title, u.username as patient, mt.status
FROM "MedicalThread" mt
JOIN "User" u ON mt."patientId" = u.id;
```

---

## 🎯 Seed Script Details

### Script: `seed-core-only.ts`

**What it does:**
- Creates 1 admin user
- Creates 5 verified doctors with different specialties
- Creates 5 patient users
- Creates 5 medical communities
- Creates 3 sample posts
- Creates 5 award types
- Creates 3 medical threads

**Features:**
- Uses `upsert` to avoid duplicates
- Safe to run multiple times
- Only seeds Prisma schema tables
- Generates realistic test data
- Provides login credentials

**Time to run:** ~2-3 seconds

---

## ⚠️ Important Notes

1. **Passwords** - All test accounts use simple passwords (admin123, doctor123, patient123)
2. **Production** - DO NOT use this seed script in production
3. **Feature Tables** - Feature-specific tables (DoctorClinic, DoctorRating, etc.) are not seeded yet
4. **Email Verification** - All users are pre-verified for testing
5. **License Expiry** - Doctor licenses expire on 2025-12-31

---

## 🚀 Quick Start

1. **Seed the database:**
   ```bash
   cd apps/api
   npx ts-node seed-core-only.ts
   ```

2. **Start the API:**
   ```bash
   npm run dev
   ```

3. **Login as admin:**
   - Email: admin@medthread.com
   - Password: admin123

4. **Access admin panel:**
   - Navigate to: http://localhost:3000/admin

---

## 📝 Files

- `seed-core-only.ts` - Core tables seed script (✅ Working)
- `seed-features-safe.ts` - Feature tables seed script (⚠️ Requires feature tables)
- `seed-final.ts` - Alternative seed script
- `seed-all-features.ts` - Comprehensive seed script
- `list-actual-tables.ts` - Verify table data

---

**Status:** ✅ SEEDING COMPLETE  
**Total Records:** 53 rows  
**Ready for:** Development and Testing
